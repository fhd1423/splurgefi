// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

contract splurge {

    address public swapRouter; 

    constructor(address _swapRouter) {
        // 0x router address
        swapRouter = _swapRouter;
    }
}
