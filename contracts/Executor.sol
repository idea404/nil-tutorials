// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title Executor
 * @dev Executes a computation with variable iterations and complexity to simulate gas consumption.
 */
contract Executor {
    /**
     * @dev Performs a computation with the given number of iterations and complexity.
     * @param iterations The number of times to repeat the computation.
     * @param complexity A factor that affects the computation's complexity and gas consumption.
     * @return result The final result of the computation.
     */
    function executeComputation(uint256 iterations, uint256 complexity) public pure returns (uint256) {
        uint256 result = 0;

        for (uint256 i = 0; i < iterations; i++) {
            // Perform a simple computation that can be repeated
            result += complexity * (i + 1);

            // Add some branching to increase gas consumption
            if (complexity % 2 == 0) {
                result *= 2;
            } else {
                result /= 2;
            }
        }

        return result;
    }
}
