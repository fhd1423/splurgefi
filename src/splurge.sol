// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract splurge {
    address public swapRouter;

    constructor(address _swapRouter) {
        // 0x router address
        swapRouter = _swapRouter;
    }

    function executeTrade(address inputTokenAddy, address user, uint amount, bytes calldata swapCallData) public {
        IERC20 token = IERC20(inputTokenAddy);
        token.transferFrom(user, address(this), amount);
        require(token.balanceOf(address(this)) == amount);
        token.approve(swapRouter, amount);

       (bool success, ) = swapRouter.call(swapCallData);
        require(success, "SWAP_CALL_FAILED");
    }


}
