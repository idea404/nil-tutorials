const { encodeFunctionData, decodeFunctionResult } = require("viem");
const { PublicClient, HttpTransport } = require("@nilfoundation/niljs");
const dotenv = require("dotenv");

dotenv.config();

const MANUFACTURER_ABI = [
    {
        inputs: [
            {
                internalType: "bytes",
                name: "pubkeyOne",
                type: "bytes",
            },
            {
                internalType: "address",
                name: "_retailerContractAddress",
                type: "address",
            },
        ],
        stateMutability: "payable",
        type: "constructor",
    },
    {
        inputs: [
            {
                internalType: "string",
                name: "productName",
                type: "string",
            },
        ],
        name: "createProduct",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "getProducts",
        outputs: [
            {
                internalType: "uint256[]",
                name: "",
                type: "uint256[]",
            },
            {
                internalType: "string[]",
                name: "",
                type: "string[]",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "nextProductId",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        name: "products",
        outputs: [
            {
                internalType: "uint256",
                name: "id",
                type: "uint256",
            },
            {
                internalType: "string",
                name: "name",
                type: "string",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "hash",
                type: "uint256",
            },
            {
                internalType: "bytes",
                name: "signature",
                type: "bytes",
            },
        ],
        name: "verifyExternal",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        stateMutability: "payable",
        type: "receive",
    },
];

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
