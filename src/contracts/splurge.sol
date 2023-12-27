// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { ECDSA } from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import { IZeroExSwap, IWETH, SplurgeOrderStruct, ZeroExSwapStruct, badSignature, tooManyTranches, tradesCompleted, mustIncludeWETH, tradeExpired, timeNotSatisfied } from "./Interfaces.sol";

contract Splurge {
    IZeroExSwap public swapRouter;
    IWETH internal wETH;
    mapping(bytes => uint256) public lastCompletedTrade;
    mapping(bytes => uint256) public tranchesCompleted;
    address public deployer;
    address public executor;
    event TradeEvent(bytes signature);

    uint256 public tradeGasLimit = 4000000;

    modifier onlyExecutorOrDeployer() {
        //solhint-disable-next-line
        require(
            msg.sender == executor || msg.sender == deployer,
            "Not executor or deployer"
        );
        _;
    }

    constructor(address _swapRouter, address _wethAddress, address _executor) {
        swapRouter = IZeroExSwap(_swapRouter);
        wETH = IWETH(_wethAddress);
        deployer = msg.sender;
        executor = _executor;
    }

    function verifyExecuteTrade(
        SplurgeOrderStruct memory order,
        bytes memory signature,
        ZeroExSwapStruct memory swapCallData
    ) public onlyExecutorOrDeployer {
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

        uint256 tranche = order.amount / order.tranches;
        input.transferFrom(order.recipient, address(this), tranche);

        if (order.inputTokenAddy == address(wETH)) {
            tranche = takeFees(tranche);
        }

        // approve infinite only if needed
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

        emit TradeEvent(signature);
        return outputAmount;
    }

    function takeFees(uint256 amount) public view returns (uint256) {
        uint256 gasPaid = tradeGasLimit * tx.gasprice;
        uint256 afterGas = amount - gasPaid;
        uint256 afterFee = (afterGas * 9985) / 10000;
        return afterFee;
    }

    function claimFees() public onlyExecutorOrDeployer {
        wETH.withdraw(wETH.balanceOf(address(this)));
        payable(deployer).transfer(address(this).balance);
    }

    function getSigner(
        SplurgeOrderStruct memory order,
        bytes memory _signature
    ) public view returns (address) {
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
