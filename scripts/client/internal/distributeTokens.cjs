const {
    PublicClient,
    HttpTransport,
    Faucet,
    WalletV1,
    LocalECDSAKeySigner,
    waitTillCompleted,
    convertEthToWei,
    generateRandomPrivateKey,
    hexToBigInt,
} = require("@nilfoundation/niljs");
const { encodeFunctionData } = require("viem");
const dotenv = require("dotenv");
dotenv.config();

const RPC_ENDPOINT = process.env.NIL_RPC_ENDPOINT;
const DISTRIBUTOR_CONTRACT_ADDRESS = "0x00018bEf6813fDe19465BBf406Fa0dC99Fd96464";
const DISTRIBUTOR_ABI = [
    {
        inputs: [],
        stateMutability: "nonpayable",
        type: "constructor",
    },
    {
        inputs: [
            {
                components: [
                    {
                        internalType: "uint256",
                        name: "id",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "amount",
                        type: "uint256",
                    },
                ],
                internalType: "struct Nil.Token",
                name: "token",
                type: "tuple",
            },
            {
                internalType: "address[]",
                name: "recipients",
                type: "address[]",
            },
        ],
        name: "distributeToken",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                components: [
                    {
                        internalType: "uint256",
                        name: "id",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "amount",
                        type: "uint256",
                    },
                ],
                internalType: "struct Nil.Token[]",
                name: "tokens",
                type: "tuple[]",
            },
            {
                internalType: "address[]",
                name: "recipients",
                type: "address[]",
            },
        ],
        name: "distributeTokens",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        stateMutability: "payable",
        type: "receive",
    },
];

async function main() {
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
    const faucetHash = await faucet.withdrawToWithRetry(walletAddress, convertEthToWei(1));
    await waitTillCompleted(client, 1, faucetHash);
    console.log("✅ Withdrawal completed.");

    const destWalletAddress = "0x000195a3df14758364b9fb06e3c17a30965e0ca4";
    const destWalletAddressTwo = "0x0001cd2c9877ede2b4cb88b4c09b642a8bc02272";

    const tokensPre = await client.getCurrencies(DISTRIBUTOR_CONTRACT_ADDRESS, "latest");
    console.log("💰 Tokens in contract:", tokensPre);

    console.log("💸 Distributing tokens from contract to wallet four and wallet five...");
    const distributeMessage = await wallet.sendMessage({
        to: DISTRIBUTOR_CONTRACT_ADDRESS,
        data: encodeFunctionData({
            abi: DISTRIBUTOR_ABI,
            functionName: "distributeToken",
            args: [
                {
                    id: hexToBigInt("0x10078d1e4ffe94590b73de3f439fbb84e0b7c"),
                    amount: 10_000n,
                },
                [destWalletAddress, destWalletAddressTwo],
            ],
        }),
        feeCredit: 10_000_000n,
    });
    console.log(`🚀 Message sent: ${distributeMessage}`);
    await waitTillCompleted(client, 1, distributeMessage);
    console.log("✅ Tokens distributed from contract to two wallets.");

    const tokens = await client.getCurrencies(destWalletAddress, "latest");
    console.log("💰 Tokens in wallet one:", tokens);

    const tokensTwo = await client.getCurrencies(destWalletAddressTwo, "latest");
    console.log("💰 Tokens in wallet two:", tokensTwo);
}

main();
