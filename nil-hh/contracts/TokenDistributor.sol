// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@nilfoundation/smart-contracts/contracts/Nil.sol";

/**
 * @title TokenDistributor
 * @dev Distributes multiple types of tokens equally among a list of recipients.
 */
contract TokenDistributor {
    constructor() {}

    /**
     * @dev Distributes the specified tokens equally among the provided recipients.
     *
     * @param tokens An array of tokens and their respective amounts to distribute.
     * @param recipients An array of recipient addresses.
     */
    function distributeTokens(Nil.Token[] calldata tokens, address[] calldata recipients) external {
        uint256 numRecipients = recipients.length;
        require(numRecipients > 0, "TokenDistributor: No recipients provided");

        // Calculate the share for each recipient for each token
        Nil.Token[] memory tokensToSend = new Nil.Token[](tokens.length);
        for (uint256 i = 0; i < tokens.length; i++) {
            uint256 share = tokens[i].amount / numRecipients;
            require(share > 0, "TokenDistributor: Token amount too low for distribution");
            tokensToSend[i] = Nil.Token(tokens[i].id, share);
        }

        // Distribute tokens to each recipient
        for (uint256 j = 0; j < numRecipients; j++) {
            Nil.syncCall(
                recipients[j],
                gasleft(),
                0,
                tokensToSend,
                ""
            );
        }
    }

    /**
     * @dev Allows the contract to receive tokens.
     */
    receive() external payable {}
}