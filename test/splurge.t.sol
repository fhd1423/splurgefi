// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.13;

import {Test, console2} from "forge-std/Test.sol";
import '../src/splurge.sol';
import './mocks/mockToken.sol';

contract splurgeTest is Test {
    
    splurge public splurgeContract;
    mockToken public token;

    function setUp() public {
        splurgeContract = new splurge(0xDef1C0ded9bec7F1a1670819833240f027b25EfF);
        token = new mockToken();
    }

    function testTransfer() public {
        token.approve(address(this), 1e18);
        token.transferFrom(address(this), address(0x5cbDB794b3B36dF58A7Ce6C1a552F117F061103b), 1e18);
        require(token.balanceOf(0x5cbDB794b3B36dF58A7Ce6C1a552F117F061103b) == 1e18);
    }



}
