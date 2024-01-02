// SPDX-License-Identifier: UNLICENSED
/*

pragma solidity ^0.8.13;

import { Test } from "forge-std/Test.sol";
import { Splurge } from "../src/splurge.sol";
import { MockToken } from "./mocks/MockToken.sol";


// import { Strings } from "@openzeppelin/contracts/utils/Strings.sol";
// import { Transformation } from "../src/Interfaces.sol";

contract SplurgeTest is Test {
    Splurge public splurgeContract;
    MockToken public token;
    address private owner;
    uint256 private ownerPrivateKey;
    uint256 private spenderPrivateKey;
    uint256 private realPrivateKey;
    uint256 private tradeGasLimit;

    function setUp() public {
        splurgeContract = new Splurge();
        tradeGasLimit = 4000000;
        // token = new MockToken();
        // ownerPrivateKey = 0xA11CE;
        // owner = vm.addr(ownerPrivateKey);
        // realPrivateKey = 0xd9ed762bc42f7913160dffd48b19c3d55bb3c76e2fadabda232e386fb43fd0f6;
    }
*/
    //solhint-disable-next-line
    // function testFuzz_TakeFees(uint256 amount) public {
    //     uint256 postFeeAmount = splurgeContract.takeFees(amount);
    //     uint256 gasPaid = tradeGasLimit * tx.gasprice;
    //     uint256 afterGas = amount - gasPaid;
    //     uint256 expectedFee = (afterGas * 9985) / 10000;
    //     assertTrue(postFeeAmount == expectedFee);
    // }

    // function test_getSigner() public view {
    //     (uint8 v, bytes32 r, bytes32 s) = vm.sign(
    //         ownerPrivateKey,
    //         keccak256(abi.encodePacked("hi"))
    //     );

    //     bytes memory signature = joinSignature(v, r, s);

    //     //require(splurgeContract.verifyTrade("hi", signature) == owner);
    // }

    // function testVerifyTradeDetails() public view {
    //     address inputTokenAddy = 0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889; // wmatic
    //     address outputTokenAddy = 0xa0a6c157871A9F38253234BBfD2B8D79F9e9FCDC; // token1
    //     address recipient = 0x8839278A75dc8249BC0C713A710aaEBD0FEE6750;
    //     string memory orderType = "buy";
    //     uint amount = 10000;
    //     uint tranches = 6;
    //     uint percentChange = 15;
    //     uint priceAvg = 4;
    //     uint deadline = 1730016559; // date in 2024
    //     uint timeBwTrade = 100;
    //     uint slippage = 1;
    //     uint salt = 1;

    //     SplurgeOrderStruct memory order = SplurgeOrderStruct(
    //         inputTokenAddy,
    //         outputTokenAddy,
    //         recipient,
    //         // orderType,
    //         amount,
    //         tranches,
    //         percentChange,
    //         priceAvg,
    //         deadline,
    //         timeBwTrade,
    //         slippage,
    //         salt
    //     );

    //     bytes memory concatenatedOrderBytesBeforeHash = abi.encode(
    //         order.inputTokenAddy,
    //         order.outputTokenAddy,
    //         order.recipient,
    //         // order.orderType,
    //         order.amount,
    //         order.tranches,
    //         order.percentChange,
    //         order.priceAvg,
    //         order.deadline,
    //         order.timeBwTrade,
    //         order.slippage,
    //         order.salt
    //     );

    //     (uint8 v, bytes32 r, bytes32 s) = vm.sign(
    //         realPrivateKey,
    //         keccak256(abi.encodePacked(concatenatedOrderBytesBeforeHash))
    //     );

    //     bytes memory signature = joinSignature(v, r, s);
    //     console.logBytes(signature);

    //     require(
    //         splurgeContract.verifyTrade(
    //             concatenatedOrderBytesBeforeHash,
    //             signature
    //         ) == recipient
    //     );
    // }

    // function testPrepareVerifyTrade() public {
    //     address inputTokenAddy = vm.addr(0x11);
    //     address outputTokenAddy = vm.addr(0x22);
    //     address recipient = owner;
    //     uint amount = 100000;
    //     uint deadline = 1730016559; // date in 2024
    //     uint8 salt = 1;
    //     uint8 tranches = 6;
    //     SplurgeOrderStruct memory order = SplurgeOrderStruct(
    //         inputTokenAddy,
    //         outputTokenAddy,
    //         recipient,
    //         amount,
    //         tranches,
    //         deadline,
    //         salt
    //     );

    //     bytes memory concatenatedOrderBytesBeforeHash = abi.encode(
    //         order.inputTokenAddy,
    //         order.outputTokenAddy,
    //         order.recipient,
    //         order.amount,
    //         order.tranches,
    //         order.deadline,
    //         order.salt
    //     );

    //     (uint8 v, bytes32 r, bytes32 s) = vm.sign(
    //         ownerPrivateKey,
    //         keccak256(abi.encodePacked(concatenatedOrderBytesBeforeHash))
    //     );

    //     bytes memory signature = joinSignature(v, r, s);

    //     vm.expectRevert();

    //     // Create a Transformation instance
    //     Transformation memory transformation1 = Transformation({
    //         deploymentNonce: 0, // replace 0 with your desired nonce
    //         data: new bytes(0) // replace with your desired data
    //     });

    //     // Create an array of Transformations
    //     Transformation[] memory transformationsArray = new Transformation[](1);
    //     transformationsArray[0] = transformation1;

    //     // Use the array in ZeroExSwapStruct
    //     ZeroExSwapStruct memory zeroExSwap = ZeroExSwapStruct({
    //         inputToken: vm.addr(0),
    //         outputToken: vm.addr(0),
    //         inputTokenAmount: 0,
    //         minOutputTokenAmount: 0,
    //         transformations: transformationsArray
    //     });

    //     // this will revert since its not a real contract anyways, have to mock it somehow
    //     splurgeContract.verifyExecuteTrade(order, signature, zeroExSwap);
    // }

    //Utility
    // function joinSignature(
    //     uint8 v,
    //     bytes32 r,
    //     bytes32 s
    // ) public pure returns (bytes memory) {
    //     bytes memory sig = new bytes(65);
    //     assembly {
    //         mstore(add(sig, 32), r)
    //         mstore(add(sig, 64), s)
    //     }
    //     sig[64] = bytes1(v);
    //     return sig;
    // }
//}