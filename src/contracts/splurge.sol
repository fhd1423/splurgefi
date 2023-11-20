// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { ECDSA } from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { IZeroExSwap, IWETH, SplurgeOrderStruct, ZeroExSwapStruct, badSignature, tradesCompleted, mustIncludeWETH, tradeExpired, notEnoughBalanceToWithdraw, feeTransferFailed } from "./Interfaces.sol";

contract Splurge is ReentrancyGuard {
    IZeroExSwap public swapRouter;
    IWETH internal wETH;
    mapping(address => mapping(address => uint256)) public tokenBalances;
    mapping(bytes => uint256) public tranchesCompleted;

    //Can index/search by trade w/ signature
    event TradeEvent(address indexed _from, bytes32 indexed _signature);

    constructor(address _swapRouter, address _wethAddress) {
        swapRouter = IZeroExSwap(_swapRouter);
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
            order.orderType,
            order.amount,
            order.tranches,
            order.percentChange,
            order.priceAvg,
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
            !(order.inputTokenAddy == address(wETH) ||
                order.outputTokenAddy == address(wETH))
        ) revert mustIncludeWETH(order.inputTokenAddy, order.outputTokenAddy);

        if (order.deadline < block.timestamp)
            revert tradeExpired(order, block.timestamp);

        executeTrade(order, swapCallData);
        tranchesCompleted[signature] += 1;
    }

    function executeTrade(
        SplurgeOrderStruct memory order,
        ZeroExSwapStruct memory swapCallData
    ) private nonReentrant returns (uint256) {
        IERC20 input = IERC20(order.inputTokenAddy);
        IERC20 output = IERC20(order.outputTokenAddy);

        uint256 tranche = order.amount / order.tranches;
        input.transferFrom(order.recipient, address(this), tranche);
        if (order.inputTokenAddy == address(wETH)) {
            tranche = feeToSender();
        }

        // approve infinite only if needed
        if (input.allowance(address(this), address(swapRouter)) < order.amount)
            input.approve(address(swapRouter), type(uint256).max);

        uint256 outputAmount = swapRouter.transformERC20(
            order.inputTokenAddy,
            order.outputTokenAddy,
            tranche,
            swapCallData.minOutputTokenAmount,
            swapCallData.transformations
        );

        if (order.outputTokenAddy == address(wETH)) {
            outputAmount = feeToSender();
        }

        output.transfer(order.recipient, outputAmount);

        emit TradeEvent(msg.sender, order.signature);
        return outputAmount;
    }

    function verifyTrade(
        bytes memory message,
        bytes memory signature
    ) public pure returns (address) {
        bytes32 hashedMessage = keccak256(abi.encodePacked(message));
        return ECDSA.recover(hashedMessage, signature);
    }

    function feeToSender() private returns (uint256) {
        uint256 balance = wETH.balanceOf(address(this));

        uint256 fee = (balance * 5) / 1000;

        wETH.withdraw(fee);
        (bool success, ) = payable(msg.sender).call{ value: fee }("");
        if (!success) revert feeTransferFailed(balance, fee);
        return balance - fee;
    }

    receive() external payable {}

    fallback() external payable {}
}
