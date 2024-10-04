const {
    PublicClient,
    HttpTransport,
    Faucet,
    WalletV1,
    LocalECDSAKeySigner,
    waitTillCompleted,
    convertEthToWei,
    generateRandomPrivateKey,
} = require("@nilfoundation/niljs");
const { encodeFunctionData } = require("viem");
const dotenv = require("dotenv");
const assert = require("assert");

dotenv.config();

const RPC_ENDPOINT = process.env.NIL_RPC_ENDPOINT;
console.log(`🔗 RPC Endpoint: ${RPC_ENDPOINT}`);

const DELEGATOR_ADDRESS = "0x000100F59907CcA1537563B15f28EB716aa05028";
const DELEGATOR_ABI = [
    {
        inputs: [
            {
                internalType: "address",
                name: "executorAddress",
                type: "address",
            },
        ],
        stateMutability: "nonpayable",
        type: "constructor",
    },
    {
        inputs: [],
        name: "EXECUTOR_ADDRESS",
        outputs: [
            {
                internalType: "address",
                name: "",
                type: "address",
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
        name: "callSuccess",
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
        inputs: [],
        name: "delegatePayEqually",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "delegatePayFixed",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "delegatePayWithBalance",
        outputs: [],
        stateMutability: "payable",
        type: "function",
    },
    {
        inputs: [],
        name: "delegatePayWithPercent",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "resetCallSuccess",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint64",
                name: "index",
                type: "uint64",
            },
        ],
        name: "setCallSuccess",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        stateMutability: "payable",
        type: "receive",
    },
];

async function testDelegatorMethods() {
    const client = new PublicClient({
        transport: new HttpTransport({
            endpoint: RPC_ENDPOINT,
        }),
        shardId: 1,
    });

    const faucet = new Faucet(client);

    const signer = new LocalECDSAKeySigner({
        privateKey: generateRandomPrivateKey(),
    });

    const pubkey = await signer.getPublicKey();
    const wallet = new WalletV1({
        pubkey: pubkey,
        salt: BigInt(Math.floor(Math.random() * 10000)),
        shardId: 1,
        client,
        signer,
    });

    const walletAddress = wallet.getAddressHex();
    console.log(`🏦 Wallet Address: ${walletAddress}`);

    console.log("💸 Withdrawing funds from Faucet...");
    const faucetHash = await faucet.withdrawToWithRetry(walletAddress, convertEthToWei(5));
    await waitTillCompleted(client, 1, faucetHash);
    console.log("✅ Withdrawal completed.");

    await wallet.selfDeploy(true);

    console.log("💸 Sending ETH to delegator...");
    const tx = await wallet.sendMessage({
        to: DELEGATOR_ADDRESS,
        value: convertEthToWei(0.005),
        feeCredit: 1_000_000n,
    });
    const receipt = await waitTillCompleted(client, 1, tx);
    console.log(`ETH sent to delegator: ${receipt[0].status}`);

    const methods = [
        { name: "delegatePayWithBalance",   value: convertEthToWei(0.0025), feeCredit: 1_200_000n },
        { name: "delegatePayFixed",         value: 0n,                      feeCredit: 3_200_000n },
        { name: "delegatePayWithPercent",   value: 0n,                      feeCredit: 3_200_000n },
        { name: "delegatePayEqually",       value: 0n,                      feeCredit: 3_200_000n },
    ];

    for (const method of methods) {
        console.log(`🧪 Testing ${method.name}...`);

        console.log(`   Resetting call success status...`);
        const resetTx = await wallet.sendMessage({
            to: DELEGATOR_ADDRESS,
            data: encodeFunctionData({
                abi: DELEGATOR_ABI,
                functionName: "resetCallSuccess",
            }),
            feeCredit: 1_000_000n,
        });
        const resetReceipt = await waitTillCompleted(client, 1, resetTx);
        console.log(`   Call success status reset: ${resetReceipt.map((r) => r.status)}`);

        const tx = await wallet.sendMessage({
            to: DELEGATOR_ADDRESS,
            refundTo: walletAddress,
            value: method.value,
            feeCredit: method.feeCredit,
            data: encodeFunctionData({
                abi: DELEGATOR_ABI,
                functionName: method.name,
            }),
        });
        const receipt = await waitTillCompleted(client, 1, tx);
        console.log(`   ${method.name} transaction completed.`);
        console.log(`   Receipt: ${receipt.map((r) => r.status)}`);

        console.log(`   Waiting for a few blocks to ensure the async calls have been processed...`);
        await new Promise((resolve) => setTimeout(resolve, 30000)); // 30 seconds

        console.log(`   Checking if the first call was successful...`);
        const success0 = await client.call(
            {
                to: DELEGATOR_ADDRESS,
                data: encodeFunctionData({
                    abi: DELEGATOR_ABI,
                    functionName: "callSuccess",
                    args: [1],
                }),
            },
            "latest"
        );
        const isSuccess0 = success0.data === "0x0000000000000000000000000000000000000000000000000000000000000001";
        console.log(`   First call success: ${isSuccess0}`);

        console.log(`   Checking if the second call was successful...`);
        const success1 = await client.call(
            {
                to: DELEGATOR_ADDRESS,
                blockNumber: "latest",
                data: encodeFunctionData({
                    abi: DELEGATOR_ABI,
                    functionName: "callSuccess",
                    args: [1],
                }),
            },
            "latest"
        );
        const isSuccess1 = success1.data === "0x0000000000000000000000000000000000000000000000000000000000000001";
        console.log(`   Second call success: ${isSuccess1}`);

        assert(isSuccess0, `${method.name}: First call should be successful`);
        assert(isSuccess1, `${method.name}: Second call should be successful`);

        console.log(`✅ ${method.name} test passed.`);
    }

    console.log("✅ All tests passed successfully!");
}

testDelegatorMethods();
