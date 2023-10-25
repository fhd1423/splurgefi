// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import "forge-std/console.sol";

contract splurge {
    address public swapRouter;
    mapping(address => mapping(address => uint)) tokenBalances;

    constructor(address _swapRouter) {
        // 0x router address
        swapRouter = _swapRouter;
    }

    function executeTrade(
        address inputTokenAddy,
        address outputTokenAddy,
        address user,
        uint amount,
        bytes memory swapCallData,
        bytes memory signature
    ) public {
        bytes memory concatenatedBytes = abi.encodePacked(
            abi.encodePacked(inputTokenAddy),
            abi.encodePacked(outputTokenAddy)
        );

        (uint8 v, bytes32 r, bytes32 s) = splitSignature(signature);
        require(verifyTrade(concatenatedBytes, v, r, s) == user);

        IERC20 input = IERC20(inputTokenAddy);
        IERC20 output = IERC20(outputTokenAddy);

        // user approves our contract
        input.transferFrom(user, address(this), amount);
        input.approve(swapRouter, amount);

        uint initialBalance = output.balanceOf(address(this));

        (bool success, ) = swapRouter.call(swapCallData);
        uint afterBalance = output.balanceOf(address(this));
        uint amountChange = afterBalance - initialBalance;

        require(success && amountChange > 0, "swap call failed");

        tokenBalances[user][outputTokenAddy] += amountChange;
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

    function splitSignature(
        bytes memory sig
    ) public pure returns (uint8 v, bytes32 r, bytes32 s) {
        require(sig.length == 65, "invalid signature length");

        assembly {
            // first 32 bytes, after the length prefix.
            r := mload(add(sig, 32))
            // second 32 bytes.
            s := mload(add(sig, 64))
            // final byte (first byte of the next 32 bytes).
            v := byte(0, mload(add(sig, 96)))
        }

        return (v, r, s);
    }

    function verifyTrade(
        bytes memory message,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public pure returns (address) {
        bytes32 hashedMessage = keccak256(abi.encodePacked(message));
        return ECDSA.recover(hashedMessage, v, r, s);
    }
}
