// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

struct SplurgeOrderStruct {
    address inputTokenAddy;
    address outputTokenAddy;
    address recipient; // the user we are executing the trade for
    uint256 amount;
    uint8 tranches;
    uint256 deadline; // when the order expires
    uint8 salt; // random number
}

struct Transformation {
    uint32 deploymentNonce;
    bytes data;
}

struct ZeroExSwapStruct {
    address inputToken;
    address outputToken;
    uint256 inputTokenAmount;
    uint256 minOutputTokenAmount;
    Transformation[] transformations;
}

interface IWETH is IERC20 {
    function withdraw(uint256 wad) external;
}

interface IZeroExSwap {
    function transformERC20(
        address inputToken,
        address outputToken,
        uint256 inputTokenAmount,
        uint256 minOutputTokenAmount,
        Transformation[] memory transformations
    ) external returns (uint256 outputTokenAmount);
}