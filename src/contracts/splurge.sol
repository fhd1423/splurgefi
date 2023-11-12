// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IZeroExSwap, IWETH, SplurgeOrderStruct, ZeroExSwapStruct} from "./Interfaces.sol";

error badSignature(SplurgeOrderStruct, bytes);
error tradesCompleted(SplurgeOrderStruct, uint256);
error mustIncludeWETH(address, address);
error tradeExpired(SplurgeOrderStruct, uint256);
error notEnoughBalanceToWithdraw(uint256, uint256);
error feeTransferFailed(uint256, uint256);

contract Splurge is ReentrancyGuard {
    IZeroExSwap public swapRouter;
    address public swapRouterAddy;
    IWETH internal wETH;
    address internal wethAddress;
    mapping(address => mapping(address => uint256)) public tokenBalances;
    mapping(bytes => uint256) public tranchesCompleted;

    constructor(address _swapRouter, address _wethAddress) {
        swapRouter = IZeroExSwap(_swapRouter);
        swapRouterAddy = _swapRouter;
        wethAddress = _wethAddress;
        wETH = IWETH(_wethAddress);
    }

    function verifyExecuteTrade(
        SplurgeOrderStruct memory order,
        bytes memory signature,
        ZeroExSwapStruct memory swapCallData
    ) public {
        bytes memory concatenatedOrderBytesBeforeHash = abi.encode(
            order.inputTokenAddy,
            order.outputTokenAddy,
            order.recipient,
            order.amount,
            order.tranches,
            order.deadline,
            order.salt
        );

        if (
            verifyTrade(concatenatedOrderBytesBeforeHash, signature) !=
            order.recipient
        ) revert badSignature(order, signature);

        if (tranchesCompleted[signature] >= order.tranches)
            revert tradesCompleted(order, tranchesCompleted[signature]);

        if (
            !(order.inputTokenAddy == wethAddress ||
                order.outputTokenAddy == wethAddress)
        ) revert mustIncludeWETH(order.inputTokenAddy, order.outputTokenAddy);

        if (order.deadline < block.timestamp)
            revert tradeExpired(order, block.timestamp);

        executeTrade(order, swapCallData);
        tranchesCompleted[signature] += 1;
    }

    function executeTrade(
        SplurgeOrderStruct memory order,
        ZeroExSwapStruct memory swapCallData
    ) public nonReentrant returns (uint256) {
        IERC20 input = IERC20(order.inputTokenAddy);

        uint256 tranche = order.amount / order.tranches;
        input.transferFrom(order.recipient, address(this), tranche);
        if (order.inputTokenAddy == wethAddress) feeToSender();

        // approve infinite only if needed
        if (input.allowance(address(this), swapRouterAddy) < order.amount)
            input.approve(swapRouterAddy, type(uint256).max);

        uint256 outputAmount = swapRouter.transformERC20(
            swapCallData.inputToken,
            swapCallData.outputToken,
            swapCallData.inputTokenAmount,
            swapCallData.minOutputTokenAmount,
            swapCallData.transformations
        );

        if (order.outputTokenAddy == wethAddress) feeToSender();

        tokenBalances[order.recipient][order.outputTokenAddy] += outputAmount;
        return outputAmount;
    }

    function withdrawBalances(
        address[] calldata tokensToWithdraw,
        uint256[] calldata amounts
    ) public nonReentrant {
        for (uint8 i = 0; i < tokensToWithdraw.length; i++) {
            IERC20 token = IERC20(tokensToWithdraw[i]);

            if (tokenBalances[msg.sender][tokensToWithdraw[i]] < amounts[i])
                revert notEnoughBalanceToWithdraw(
                    tokenBalances[msg.sender][tokensToWithdraw[i]],
                    amounts[i]
                );

            token.transfer(msg.sender, amounts[i]);
            // solhint-disable-next-line reentrancy
            tokenBalances[msg.sender][tokensToWithdraw[i]] -= amounts[i];
        }
    }

    function verifyTrade(
        bytes memory message,
        bytes memory signature
    ) public pure returns (address) {
        bytes32 hashedMessage = keccak256(abi.encodePacked(message));
        return ECDSA.recover(hashedMessage, signature);
    }

    function feeToSender() private {
        uint256 balance = wETH.balanceOf(address(this));

        uint256 fee = (balance * 5) / 1000;

        wETH.withdraw(fee);
        (bool success, ) = payable(msg.sender).call{value: fee}("");
        if (!success) revert feeTransferFailed(balance, fee);
    }

    receive() external payable {}

    fallback() external payable {}
}
