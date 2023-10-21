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

    function testExecuteTrade() public {
        token.approve(address(this), 10000e18);
    }


}
