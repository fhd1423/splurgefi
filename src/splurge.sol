// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import 'forge-std/console.sol';

contract splurge {
    address public swapRouter;
    mapping(address => mapping(address => uint)) tokenBalances;

    constructor(address _swapRouter) {
        // 0x router address
        swapRouter = _swapRouter;
    }

    function executeTrade(address inputTokenAddy, address outputTokenAddy, address user, uint amount, bytes memory swapCallData /*, bytes memory signature*/) public {
        IERC20 token = IERC20(inputTokenAddy);
        // user approves our contract
        token.transferFrom(user, address(this), amount);
        uint initialBalance = token.balanceOf(address(this));
        token.approve(swapRouter, amount);

        (bool success,) = swapRouter.call(swapCallData);
        uint afterBalance = token.balanceOf(address(this));
        uint amountChange = afterBalance - initialBalance;

        require(success && amountChange > 0, "swap call failed");
       //(bool success, bytes memory returnData) = swapRouter.call(swapCallData);
       // uint outputAmount = abi.decode(returnData, (uint256));

        tokenBalances[user][outputTokenAddy] += amountChange;
    }
    
    function withdrawBalances(address[] calldata tokensToWithdraw, uint[] calldata amounts) public {
        for(uint i = 0; i < tokensToWithdraw.length; i++){
            IERC20 token = IERC20(tokensToWithdraw[i]);
            require(tokenBalances[msg.sender][tokensToWithdraw[i]] >= amounts[i]);
            token.transfer(msg.sender, amounts[i]);
            tokenBalances[msg.sender][tokensToWithdraw[i]] -= amounts[i];
        }
        
    }
    


    function verifyTrade(bytes memory message, uint8 v, bytes32 r, bytes32 s) public pure returns (address){ 
        bytes32 hashedMessage = keccak256(abi.encodePacked(message));
        return ECDSA.recover(hashedMessage, v, r, s);
    } 
}
