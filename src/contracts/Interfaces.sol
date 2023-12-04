// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

error badSignature(SplurgeOrderStruct, bytes);
error tradesCompleted(SplurgeOrderStruct, uint256);
error mustIncludeWETH(address, address);
error tradeExpired(SplurgeOrderStruct, uint256);
error notEnoughBalanceToWithdraw(uint256, uint256);
error feeTransferFailed(uint256, uint256);

struct SplurgeOrderStruct {
    address inputTokenAddy;
    address outputTokenAddy;
    address recipient; // the user we are executing the trade for
    // string orderType;
    uint256 amount;
    uint256 tranches;
    uint256 percentChange;
    uint256 priceAvg;
    uint256 deadline; // when the order expires
    uint256 timeBwTrade;
    uint256 salt; // random number
}

struct Transformation {
    uint32 deploymentNonce;
    bytes data;
}

struct ZeroExSwapStruct {
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
