// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "lib/v3-periphery/contracts/libraries/TransferHelper.sol";

contract splurge {

    address public swapRouter; 

    constructor(address _swapRouter) {
        // 0x router address
        swapRouter = _swapRouter;
    }
}
