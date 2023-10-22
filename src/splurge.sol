// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract splurge {
    address public swapRouter;
    mapping(address => mapping(address => uint)) tokenBalances;

    constructor(address _swapRouter) {
        // 0x router address
        swapRouter = _swapRouter;
    }

    function executeTrade(address inputTokenAddy, address outputTokenAddy, address user, uint amount, bytes calldata swapCallData) public {
        IERC20 token = IERC20(inputTokenAddy);
        token.transferFrom(user, address(this), amount);
        require(token.balanceOf(address(this)) == amount, "didnt send properly");
        token.approve(swapRouter, amount);

       (bool success, bytes memory returnData) = swapRouter.call(swapCallData);
        require(success, "swap call failed");

        uint outputAmount = abi.decode(returnData, (uint256));
        tokenBalances[user][outputTokenAddy] += outputAmount;
    }

    function withdrawBalances(address[] calldata tokensToWithdraw, uint[] calldata amounts) public {
        for(uint i = 0; i < tokensToWithdraw.length; i++){
            IERC20 token = IERC20(tokensToWithdraw[i]);
            require(tokenBalances[msg.sender][tokensToWithdraw[i]] >= amounts[i]);
            token.transferFrom(address(this), msg.sender, amounts[i]);
            tokenBalances[msg.sender][tokensToWithdraw[i]] -= amounts[i];
        }
    }


}
