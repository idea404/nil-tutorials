// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@nilfoundation/smart-contracts/contracts/Nil.sol";

/**
 * @title Delegator
 * @dev Manages delegation of computations to an executor contract using various payment methods.
 */
contract Delegator is NilBase {
    using Nil for address;

    address public EXECUTOR_ADDRESS;
    bool[] public callSuccess = [false, false];

    /**
     * @dev Constructor to set the executor address.
     * @param executorAddress The address of the executor contract.
     */
    constructor(address executorAddress) {
        EXECUTOR_ADDRESS = executorAddress;
    }

    /**
     * @dev Delegates computation using the contract's balance for payment.
     * Requires a minimum of 2,800,000 wei.
     */
    function delegatePayWithBalance() public payable { // min 2_800_000 wei
        callSuccess = [false, false];
        Nil.asyncCall(
            EXECUTOR_ADDRESS,
            address(this),      // refundTo
            address(0),         // bounceTo
            1_000_000,          // feeCredit, (gasPrice = 10) * (expected gas = 100_000)
            Nil.FORWARD_NONE,   // forwardKind -- use this.balance
            false,              // deploy
            0,                  // msg.value
            abi.encodeWithSignature("executeComputation(uint256,uint256,address,uint64)", 50, 10, address(this), 0)
        );
        Nil.asyncCall(
            EXECUTOR_ADDRESS,
            address(this),
            address(0),
            1_800_000,
            Nil.FORWARD_NONE,
            false,
            0,
            abi.encodeWithSignature("executeComputation(uint256,uint256,address,uint64)", 100, 50, address(this), 1)
        );
    }

    /**
     * @dev Delegates computation using a fixed payment amount.
     * Requires a minimum of 2,800,000 wei.
     */
    function delegatePayFixed() public { // min 2_800_000 wei
        callSuccess = [false, false];
        Nil.asyncCall(
            EXECUTOR_ADDRESS,
            address(this),
            address(0),
            1_000_000,
            Nil.FORWARD_VALUE,      // forwardKind -- use value from feeCredit
            false,
            0,
            abi.encodeWithSignature("executeComputation(uint256,uint256,address,uint64)", 50, 10, address(this), 0)
        );
        Nil.asyncCall(
            EXECUTOR_ADDRESS,
            address(this),
            address(0),
            1_800_000,
            Nil.FORWARD_VALUE,
            false,
            0,
            abi.encodeWithSignature("executeComputation(uint256,uint256,address,uint64)", 100, 50, address(this), 1)
        );
    }

    /**
     * @dev Delegates computation using a percentage-based payment.
     * Requires a minimum of 2,800,000 wei.
     */
    function delegatePayWithPercent() public {
        callSuccess = [false, false];
        Nil.asyncCall(
            EXECUTOR_ADDRESS,
            address(this),
            address(0),
            33,
            Nil.FORWARD_PERCENTAGE,  // forwardKind -- use pct value from feeCredit
            false,
            0,
            abi.encodeWithSignature("executeComputation(uint256,uint256,address,uint64)", 50, 10, address(this), 0)
        );
        Nil.asyncCall(
            EXECUTOR_ADDRESS,
            address(this),
            address(0),
            67,
            Nil.FORWARD_PERCENTAGE,
            false,
            0,
            abi.encodeWithSignature("executeComputation(uint256,uint256,address,uint64)", 100, 50, address(this), 1)
        );
    }

    /**
     * @dev Delegates computation with equal payment distribution.
     * Requires a minimum of 2,800,000 wei.
     */
    function delegatePayEqually() public {
        callSuccess = [false, false];
        Nil.asyncCall(
            EXECUTOR_ADDRESS,
            address(this),
            address(0),
            0,
            Nil.FORWARD_REMAINING,  // forwardKind -- use remaining gas from feeCredit
            false,
            0,
            abi.encodeWithSignature("executeComputation(uint256,uint256,address,uint64)", 50, 10, address(this), 0)
        );
        Nil.asyncCall(
            EXECUTOR_ADDRESS,
            address(0),
            0,
            abi.encodeWithSignature("executeComputation(uint256,uint256,address,uint64)", 100, 50, address(this), 1)
        );
    }

    /**
     * @dev Sets the success status of a specific call.
     * @param index The index of the call to update.
     */
    function setCallSuccess(uint64 index) external {
        callSuccess[index] = true;
    }

    /**
     * @dev Resets the success status of all calls.
     */
    function resetCallSuccess() external {
        callSuccess = [false, false];
    }

    /**
     * @dev Allows the contract to receive tokens.
     */
    receive() external payable {}
}