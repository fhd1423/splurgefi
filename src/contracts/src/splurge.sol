// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

/** 
 @author SplurgeFi
 @title Splurge
 @notice This contract serves as the settlement executor for Splurge Automated Trades(https://www.splurgefi.xyz/). Executions are triggered by keeper bot. 
*/

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { ECDSA } from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import { IZeroExSwap, IWETH, SplurgeOrderStruct, ZeroExSwapStruct, badSignature, tooManyTranches, tradesCompleted, mustIncludeWETH, tradeExpired, timeNotSatisfied } from "./Interfaces.sol";

contract Splurge {
    event TradeEvent(bytes signature, uint256 amountReceieved);

    IWETH constant wETH = IWETH(0x82aF49447D8a07e3bd95BD0d56f35241523fBab1);
    IZeroExSwap constant swapRouter =
        IZeroExSwap(0xDef1C0ded9bec7F1a1670819833240f027b25EfF);

    mapping(bytes => uint256) public lastCompletedTrade;
    mapping(bytes => uint256) public tranchesCompleted;
    address public owner;
    uint256 public tradeGasLimit = 4000000;

    modifier onlyOwner() {
        //solhint-disable-next-line
        require(msg.sender == owner, "Not deployer");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /** 
        @notice verifies if 'order' is authenticated by trader and authorized to trade as per conditions
        @param order automation conditions of trade
        @param signature trader signature of 'order'
        @param swapCallData call data to execute with ZeroEx(0x) Protocol contract for trade
    */
    function verifyExecuteTrade(
        SplurgeOrderStruct memory order,
        bytes memory signature,
        ZeroExSwapStruct memory swapCallData
    ) public onlyOwner {
        //@AUDIT Need to verify the message from signature == order
        if (getSigner(order, signature) != order.recipient)
            revert badSignature(order, signature);

        if (tranchesCompleted[signature] >= order.tranches)
            revert tradesCompleted(order, tranchesCompleted[signature]);

        if (
            !(order.inputTokenAddy == address(wETH) ||
                order.outputTokenAddy == address(wETH))
        ) revert mustIncludeWETH(order.inputTokenAddy, order.outputTokenAddy);

        if (order.deadline < block.timestamp)
            revert tradeExpired(order, block.timestamp);

        if (order.timeBwTrade > block.timestamp - lastCompletedTrade[signature])
            revert timeNotSatisfied(order, block.timestamp);

        if (order.tranches > 50) revert tooManyTranches(order);

        executeTrade(order, swapCallData, signature);
        tranchesCompleted[signature] += 1;
        lastCompletedTrade[signature] = block.timestamp;
    }

    function executeTrade(
        SplurgeOrderStruct memory order,
        ZeroExSwapStruct memory swapCallData,
        bytes memory signature
    ) private returns (uint256) {
        IERC20 input = IERC20(order.inputTokenAddy);
        IERC20 output = IERC20(order.outputTokenAddy);

        uint256 tranche = order.amount / order.tranches; //? Precision errors
        input.transferFrom(order.recipient, address(this), tranche);

        if (order.inputTokenAddy == address(wETH)) {
            tranche = takeFees(tranche);
        }

        // approve infinite only if needed
        // ? Infinite allowance for inputToken always occurs
        if (input.allowance(address(this), address(swapRouter)) < order.amount)
            input.approve(address(swapRouter), type(uint256).max);

        uint256 outputAmount = swapRouter.transformERC20(
            order.inputTokenAddy,
            order.outputTokenAddy,
            tranche,
            swapCallData.minOutputTokenAmount,
            swapCallData.transformations
        );

        if (order.outputTokenAddy == address(wETH)) {
            outputAmount = takeFees(outputAmount);
        }

        output.transfer(order.recipient, outputAmount);

        emit TradeEvent(signature, outputAmount);
        return outputAmount;
    }

    //@AUDIT arithmetic overflow/underflow posed by fuzz test
    /** 
        @notice calculates the WETH amount after fee - 0.15%
        @param amount the trade amount determined by order.amount / order.tranches
    */
    function takeFees(uint256 amount) public view returns (uint256) {
        uint256 gasPaid = tradeGasLimit * tx.gasprice;
        uint256 afterGas = amount - gasPaid;
        uint256 afterFee = (afterGas * 9985) / 10000;
        return afterFee;
    }

    /** 
        @notice withdraws contracts WETH balance to contract owner. Only callable by owner.
    */
    function claimFees() public onlyOwner {
        wETH.withdraw(wETH.balanceOf(address(this)));
        payable(owner).transfer(address(this).balance);
    }

    function getSigner(
        SplurgeOrderStruct memory order,
        bytes memory _signature
    ) private view returns (address) {
        // EIP721 domain type
        string memory name = "Splurge Finance";
        string memory version = "1";
        uint256 chainId = 42161;
        address verifyingContract = address(this);

        // stringified types
        string
            memory domainType = "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)";
        string
            memory messageType = "conditionalOrder(address inputTokenAddress,address outputTokenAddress,address recipient,uint256 amount,uint256 tranches,uint256 percentChange,uint256 priceAvg,uint256 deadline,uint256 timeBwTrade,bytes32 salt)";

        // hash to prevent signature collision
        bytes32 domainSeperator = keccak256(
            abi.encode(
                keccak256(abi.encodePacked(domainType)),
                keccak256(abi.encodePacked(name)),
                keccak256(abi.encodePacked(version)),
                chainId,
                verifyingContract
            )
        );

        // hash typed data
        bytes32 hash = keccak256(
            abi.encodePacked(
                "\x19\x01", // backslash is needed to escape the character
                domainSeperator,
                keccak256(
                    abi.encode(keccak256(abi.encodePacked(messageType)), order)
                )
            )
        );
        return ECDSA.recover(hash, _signature);
    }

    receive() external payable {}

    fallback() external payable {}
}
