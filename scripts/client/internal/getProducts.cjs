const { encodeFunctionData, decodeFunctionResult } = require("viem");
const { PublicClient, HttpTransport } = require("@nilfoundation/niljs");
const MANUFACTURER_ABI = require("../../../artifacts/contracts/Manufacturer.sol/Manufacturer.json").abi;
const dotenv = require("dotenv");

dotenv.config();

async function getProducts(rpcUrl, manufacturerAddress) {
    try {
        const client = new PublicClient({
            transport: new HttpTransport({
                endpoint: rpcUrl,
            }),
            shardId: 2,
        });

        const resultsCall = await client.call(
            {
                from: manufacturerAddress,
                to: manufacturerAddress,
                data: encodeFunctionData({
                    abi: MANUFACTURER_ABI,
                    functionName: "getProducts",
                    args: [],
                }),
            },
            "latest"
        );

        // Log the raw response data
        console.log("Raw response data:", resultsCall);

        const decodedResults = decodeFunctionResult({
            abi: MANUFACTURER_ABI,
            functionName: "getProducts",
            data: resultsCall.data,
        });

        console.log("getProducts", decodedResults);
    } catch (error) {
        console.error("Error getting products:", error);
    }
}

// Example usage
const rpcUrl = process.env.NIL_RPC_ENDPOINT;
console.log(rpcUrl);
const manufacturerAddress = "0x00024FDAa1Ee4FDe1BE24228Ae85D9154a60A071";

getProducts(rpcUrl, manufacturerAddress);
