
const { encodeFunctionData } = require("viem");
const { PublicClient, HttpTransport } = require("@nilfoundation/niljs");
const RETAILER_ABI = require("../../../artifacts/contracts/Retailer.sol/Retailer.json").abi;
const dotenv = require("dotenv");

dotenv.config();

/**
 * Estimates the gas required to call the `orderProduct` method in the Retailer contract.
 */
async function estimateGasForOrderProduct() {
    try {
        const rpcUrl = process.env.NIL_RPC_ENDPOINT;
        const retailerAddress = "0x0001aa76C8b3321F6c01B211F46b89e0ba2D60f0";
        const manufacturerAddress = "0x00024FDAa1Ee4FDe1BE24228Ae85D9154a60A071";

        const client = new PublicClient({
            transport: new HttpTransport({
                endpoint: rpcUrl,
            }),
            shardId: 1,
        });

        // Encode the function data for `orderProduct`
        const data = encodeFunctionData({
            abi: RETAILER_ABI,
            functionName: "orderProduct",
            args: [manufacturerAddress, "another-external-product"],
        });

        // Create the transaction object
        const transaction = {
            from: retailerAddress,
            to: retailerAddress,
            data: data,
        };

        // Estimate the gas required for the transaction
        const estimatedGas = await client.estimateGasLimit(transaction);

        console.log("Estimated Gas for orderProduct:", estimatedGas.toLocaleString("en-US"));
    } catch (error) {
        console.error("Error estimating gas for orderProduct:", error);
    }
}

// Execute the estimation
estimateGasForOrderProduct();
