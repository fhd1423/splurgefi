// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import "forge-std/console.sol";

struct orderStruct {
    address inputTokenAddy;
    address outputTokenAddy;
    address recipient; // the user we are executing the trade for
    uint amount;
    uint deadline; // when the order expires
}

contract splurge {
    address public swapRouter;
    mapping(address => mapping(address => uint)) tokenBalances;

    constructor(address _swapRouter) {
        // 0x router address
        swapRouter = _swapRouter;
    }

    function prepareVerifyTrade(
        orderStruct memory order,
        bytes memory signature,
        bytes memory swapCallData
    ) public {
        bytes memory concatenatedOrderBytesBeforeHash = abi.encode(
            order.inputTokenAddy,
            order.outputTokenAddy,
            order.recipient,
            order.amount,
            order.deadline
        );

        require(
            verifyTrade(concatenatedOrderBytesBeforeHash, signature) ==
                order.recipient
        );
        // executeTrade(order, swapCallData);
    }

    function executeTrade(
        orderStruct memory order,
        bytes memory swapCallData
    ) public returns (bool) {
        IERC20 input = IERC20(order.inputTokenAddy);
        IERC20 output = IERC20(order.outputTokenAddy);

        // user approves our contract
        input.transferFrom(order.recipient, address(this), order.amount);
        input.approve(swapRouter, order.amount);

        uint initialBalance = output.balanceOf(address(this));

        (bool success, ) = swapRouter.call(swapCallData);
        uint afterBalance = output.balanceOf(address(this));
        uint amountChange = afterBalance - initialBalance;

        require(success && amountChange > 0, "swap call failed");

        tokenBalances[order.recipient][order.outputTokenAddy] += amountChange;
        return true;
    }

    function withdrawBalances(
        address[] calldata tokensToWithdraw,
        uint[] calldata amounts
    ) public {
        for (uint i = 0; i < tokensToWithdraw.length; i++) {
            IERC20 token = IERC20(tokensToWithdraw[i]);
            require(
                tokenBalances[msg.sender][tokensToWithdraw[i]] >= amounts[i]
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
}
