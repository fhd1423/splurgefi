// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.13;

import {Test} from "forge-std/Test.sol";
import "../src/splurge.sol";
import "./mocks/mockToken.sol";
import "forge-std/console.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

contract splurgeTest is Test {
    splurge public splurgeContract;
    mockToken public token;
    address internal owner;
    uint256 internal ownerPrivateKey;
    uint256 internal spenderPrivateKey;
    uint256 internal realPrivateKey;

    function setUp() public {
        splurgeContract = new splurge(
            0xDef1C0ded9bec7F1a1670819833240f027b25EfF
        );
        token = new mockToken();
        ownerPrivateKey = 0xA11CE;
        owner = vm.addr(ownerPrivateKey);
        realPrivateKey = 0xd9ed762bc42f7913160dffd48b19c3d55bb3c76e2fadabda232e386fb43fd0f6;
    }

    function testTransfer() public {
        token.approve(address(this), 1e18);
        token.transferFrom(
            address(this),
            address(0x5cbDB794b3B36dF58A7Ce6C1a552F117F061103b),
            1e18
        );
        require(
            token.balanceOf(0x5cbDB794b3B36dF58A7Ce6C1a552F117F061103b) == 1e18
        );
    }

    function testVerify() public view {
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(
            ownerPrivateKey,
            keccak256(abi.encodePacked("hi"))
        );

        bytes memory signature = joinSignature(v, r, s);

        require(splurgeContract.verifyTrade("hi", signature) == owner);
    }

    function testVerifyTradeDetails() public view {
        address inputTokenAddy = vm.addr(0x11);
        address outputTokenAddy = vm.addr(0x22);
        address recipient = vm.addr(0x33);
        uint amount = 100000;
        uint deadline = 1730016559; // date in 2024
        orderStruct memory order = orderStruct(
            inputTokenAddy,
            outputTokenAddy,
            recipient,
            amount,
            deadline
        );

        bytes memory concatenatedOrderBytesBeforeHash = abi.encode(
            order.inputTokenAddy,
            order.outputTokenAddy,
            order.recipient,
            order.amount,
            order.deadline
        );

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(
            ownerPrivateKey,
            keccak256(abi.encodePacked(concatenatedOrderBytesBeforeHash))
        );

        bytes memory signature = joinSignature(v, r, s);

        require(
            splurgeContract.verifyTrade(
                concatenatedOrderBytesBeforeHash,
                signature
            ) == owner
        );
    }

    function testPrepareVerifyTrade() public {
        address inputTokenAddy = vm.addr(0x11);
        address outputTokenAddy = vm.addr(0x22);
        address recipient = owner;
        uint amount = 100000;
        uint deadline = 1730016559; // date in 2024
        orderStruct memory order = orderStruct(
            inputTokenAddy,
            outputTokenAddy,
            recipient,
            amount,
            deadline
        );

        bytes memory concatenatedOrderBytesBeforeHash = abi.encode(
            order.inputTokenAddy,
            order.outputTokenAddy,
            order.recipient,
            order.amount,
            order.deadline
        );

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(
            ownerPrivateKey,
            keccak256(abi.encodePacked(concatenatedOrderBytesBeforeHash))
        );

        bytes memory signature = joinSignature(v, r, s);

        vm.expectRevert();
        splurgeContract.prepareVerifyTrade(order, signature, "test");
    }

    // using the test below to generate the data for performing a real tx
    /*
    function testPrepareVerifyTradeStuff() public {
        address inputTokenAddy = 0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889; // wmatic
        address outputTokenAddy = 0xa0a6c157871A9F38253234BBfD2B8D79F9e9FCDC; // token1
        address recipient = 0x8839278A75dc8249BC0C713A710aaEBD0FEE6750;
        uint amount = 20000000000000000;
        uint deadline = 1730016559; // date in 2024
        orderStruct memory order = orderStruct(
            inputTokenAddy,
            outputTokenAddy,
            recipient,
            amount,
            deadline
        );

        bytes memory concatenatedOrderBytesBeforeHash = abi.encode(
            order.inputTokenAddy,
            order.outputTokenAddy,
            order.recipient,
            order.amount,
            order.deadline
        );

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(
            realPrivateKey,
            keccak256(abi.encodePacked(concatenatedOrderBytesBeforeHash))
        );

        bytes memory signature = joinSignature(v, r, s);
        console.logBytes(signature);

        vm.expectRevert();
        splurgeContract.prepareVerifyTrade(order, signature, "test");
    }
*/
    function joinSignature(
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public pure returns (bytes memory) {
        bytes memory sig = new bytes(65);
        assembly {
            mstore(add(sig, 32), r)
            mstore(add(sig, 64), s)
        }
        sig[64] = bytes1(v);
        return sig;
    }
}
