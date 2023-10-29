// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

struct OrderStruct {
    address inputTokenAddy;
    address outputTokenAddy;
    address recipient; // the user we are executing the trade for
    uint256 amount;
    uint8 tranches;
    uint256 deadline; // when the order expires
    uint8 salt; // random number
}

interface IWETH is IERC20 {
    function withdraw(uint256 wad) external;
}

contract Splurge is ReentrancyGuard {
    address public swapRouter;
    IWETH internal wETH;
    address internal wethAddress;
    mapping(address => mapping(address => uint256)) public tokenBalances;
    mapping(bytes => uint256) public tranchesCompleted;

    constructor(address _swapRouter, address _wethAddress) {
        // 0x router address
        swapRouter = _swapRouter;
        // wmatic for testing purposes
        wethAddress = _wethAddress;
        wETH = IWETH(_wethAddress);
    }

    function prepareVerifyTrade(
        OrderStruct memory order,
        bytes memory signature,
        bytes memory swapCallData
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

        require(
            verifyTrade(concatenatedOrderBytesBeforeHash, signature) ==
                order.recipient,
            "sig didnt match"
        );
        executeTrade(order, signature, swapCallData);
    }

    function executeTrade(
        OrderStruct memory order,
        bytes memory signature,
        bytes memory swapCallData
    ) public nonReentrant returns (bool) {
        IERC20 input = IERC20(order.inputTokenAddy);
        IERC20 output = IERC20(order.outputTokenAddy);
        require(order.deadline < block.timestamp, "trade expired");
        require(
            order.inputTokenAddy == wethAddress ||
                order.outputTokenAddy == wethAddress,
            "trade path must include wETH"
        );

        require(
            tranchesCompleted[signature] < order.tranches,
            "tranches completed already"
        );

        uint256 tranche = order.amount / order.tranches;
        input.transferFrom(order.recipient, address(this), tranche);
        if (order.inputTokenAddy == wethAddress) unwrapAndPay();

        // @todo optimize this, maybe only need to approve once
        input.approve(swapRouter, tranche);

        uint256 initialBalance = output.balanceOf(address(this));

        (bool success, ) = swapRouter.call(swapCallData);
        // refund on fail
        if (!success) {
            input.transfer(order.recipient, tranche);
            return false;
        }
        uint256 afterBalance = output.balanceOf(address(this));
        uint256 amountChange = afterBalance - initialBalance;

        if (order.outputTokenAddy == wethAddress) {
            require(amountChange > 1e16, "not enough for fee");
            amountChange -= 1e16;
            unwrapAndPay();
        }

        require(success && amountChange > 0, "swap call failed");

        tokenBalances[order.recipient][order.outputTokenAddy] += amountChange;
        tranchesCompleted[signature] += 1;
        return true;
    }

    function withdrawBalances(
        address[] calldata tokensToWithdraw,
        uint256[] calldata amounts
    ) public nonReentrant {
        for (uint8 i = 0; i < tokensToWithdraw.length; i++) {
            IERC20 token = IERC20(tokensToWithdraw[i]);
            require(
                tokenBalances[msg.sender][tokensToWithdraw[i]] >= amounts[i],
                "cant withdraw above balance"
            );
            token.transfer(msg.sender, amounts[i]);
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

    function unwrapAndPay() private {
        require(
            wETH.balanceOf(address(this)) > 1e16,
            "must have enough for tx fee"
        ); // 0.01 eth
        wETH.withdraw(1e16);
        payable(msg.sender).transfer(1e16);
    }

    receive() external payable {}

    fallback() external payable {}
}
