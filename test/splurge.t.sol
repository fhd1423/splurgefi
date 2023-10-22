// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.13;

import {Test} from "forge-std/Test.sol";
import '../src/splurge.sol';
import './mocks/mockToken.sol';
import 'forge-std/console.sol';
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";


contract splurgeTest is Test {
    
    splurge public splurgeContract;
    mockToken public token;
    address internal owner;
    uint256 internal ownerPrivateKey;
    uint256 internal spenderPrivateKey;

    function setUp() public {
        splurgeContract = new splurge(0xDef1C0ded9bec7F1a1670819833240f027b25EfF);
        token = new mockToken();
    }

    function testTransfer() public {
        token.approve(address(this), 1e18);
        token.transferFrom(address(this), address(0x5cbDB794b3B36dF58A7Ce6C1a552F117F061103b), 1e18);
        require(token.balanceOf(0x5cbDB794b3B36dF58A7Ce6C1a552F117F061103b) == 1e18);
    }


    function testVerify() public {
        ownerPrivateKey = 0xA11CE;
        owner = vm.addr(ownerPrivateKey);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(ownerPrivateKey, keccak256(abi.encodePacked('hi')));

        require(splurgeContract.verifyTrade('hi', v, r, s) == owner);
    }
    



}
