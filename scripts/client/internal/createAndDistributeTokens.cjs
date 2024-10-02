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
console.log(`🔗 RPC Endpoint: ${RPC_ENDPOINT}`);

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

    await wallet.selfDeploy(true);

    const walletTwo = new WalletV1({
        pubkey: pubkey,
        salt: BigInt(Math.floor(Math.random() * 10000)),
        shardId: 1,
        client,
        signer,
    });

    const walletTwoAddress = walletTwo.getAddressHex();
    console.log(`🏦 Wallet Two Address: ${walletTwoAddress}`);

    console.log("💸 Withdrawing funds from Faucet...");
    const faucetTwoHash = await faucet.withdrawToWithRetry(walletTwoAddress, convertEthToWei(1));
    await waitTillCompleted(client, 1, faucetTwoHash);
    console.log("✅ Withdrawal completed.");

    await walletTwo.selfDeploy(true);

    const walletThree = new WalletV1({
        pubkey: pubkey,
        salt: BigInt(Math.floor(Math.random() * 10000)),
        shardId: 1,
        client,
        signer,
    });

    const walletThreeAddress = walletThree.getAddressHex();
    console.log(`🏦 Wallet Two Address: ${walletThreeAddress}`);

    console.log("💸 Withdrawing funds from Faucet...");
    const faucetThreeHash = await faucet.withdrawToWithRetry(walletThreeAddress, convertEthToWei(1));
    await waitTillCompleted(client, 1, faucetThreeHash);
    console.log("✅ Withdrawal completed.");

    await walletThree.selfDeploy(true);

    {
        console.log("🔧 Setting currency name for wallet one...");
        const hashMessage = await wallet.setCurrencyName("MY_TOKEN");
        await waitTillCompleted(client, 1, hashMessage);
        console.log("✅ Currency name set for wallet one.");
    }

    {
        console.log("🔧 Setting currency name for wallet two...");
        const hashMessage = await walletTwo.setCurrencyName("ANOTHER_TOKEN");
        await waitTillCompleted(client, 1, hashMessage);
        console.log("✅ Currency name set for wallet two.");
    }

    {
        console.log("🔧 Setting currency name for wallet three...");
        const hashMessage = await walletThree.setCurrencyName("THIRD_TOKEN");
        await waitTillCompleted(client, 1, hashMessage);
        console.log("✅ Currency name set for wallet three.");
    }

    {
        console.log("🪙 Minting tokens for wallet one...");
        const hashMessage = await wallet.mintCurrency(100_000_000n);
        await waitTillCompleted(client, 1, hashMessage);
        console.log("✅ Tokens minted for wallet one.");
    }

    {
        console.log("🪙 Minting tokens for wallet two...");
        const hashMessage = await walletTwo.mintCurrency(80_000_000n);
        await waitTillCompleted(client, 1, hashMessage);
        console.log("✅ Tokens minted for wallet two.");
    }

    {
        console.log("🪙 Minting tokens for wallet three...");
        const hashMessage = await walletThree.mintCurrency(60_000_000n);
        await waitTillCompleted(client, 1, hashMessage);
        console.log("✅ Tokens minted for wallet three.");
    }

    {
        console.log("Fetching tokens for wallet one");
        const tokens = await client.getCurrencies(walletAddress, "latest");
        console.log("💰 Tokens in wallet one:", tokens);

        console.log("Fetching tokens for wallet two");
        const tokensTwo = await client.getCurrencies(walletTwoAddress, "latest");
        console.log("💰 Tokens in wallet two:", tokensTwo);

        console.log("Fetching tokens for wallet three");
        const tokensThree = await client.getCurrencies(walletThreeAddress, "latest");
        console.log("💰 Tokens in wallet three:", tokensThree);
    }

    {
        console.log("💸 Transferring tokens from wallet two to wallet one...");
        const transferMessage = await walletTwo.sendMessage({
            to: walletAddress,
            value: 10_000_000n,
            feeCredit: 100_000n * 10n,
            tokens: [
                {
                    id: hexToBigInt(walletTwoAddress),
                    amount: 800_000n,
                },
            ],
        });
        console.log(`🚀 Message sent: ${transferMessage}`);
        await waitTillCompleted(client, 1, transferMessage);
        console.log("✅ Tokens transferred from wallet two to wallet one.");
    }

    {
        console.log("💸 Transferring tokens from wallet three to wallet one...");
        const transferMessage = await walletThree.sendMessage({
            to: walletAddress,
            value: 10_000_000n,
            feeCredit: 100_000n * 10n,
            tokens: [
                {
                    id: hexToBigInt(walletThreeAddress),
                    amount: 600_000n,
                },
            ],
        });
        console.log(`🚀 Message sent: ${transferMessage}`);
        await waitTillCompleted(client, 1, transferMessage);
        console.log("✅ Tokens transferred from wallet three to wallet one.");
    }

    const tokens = await client.getCurrencies(walletAddress, "latest");
    console.log("💰 Tokens in wallet one:", tokens);

    const walletFour = new WalletV1({
        pubkey: pubkey,
        salt: BigInt(Math.floor(Math.random() * 10000)),
        shardId: 1,
        client,
        signer,
    });

    const walletFive = new WalletV1({
        pubkey: pubkey,
        salt: BigInt(Math.floor(Math.random() * 10000)),
        shardId: 1,
        client,
        signer,
    });

    {
        console.log("💸 Transferring tokens from wallet one to contract...");
        const transferMessage = await wallet.sendMessage({
            to: DISTRIBUTOR_CONTRACT_ADDRESS,
            value: 1_000_000n,
            feeCredit: 100_000n * 10n,
            tokens: [
                {
                    id: hexToBigInt(walletAddress),
                    amount: 100_000n,
                },
                {
                    id: hexToBigInt(walletTwoAddress),
                    amount: 80_000n,
                },
                {
                    id: hexToBigInt(walletThreeAddress),
                    amount: 60_000n,
                },
            ],
        });
        console.log(`🚀 Message sent: ${transferMessage}`);
        await waitTillCompleted(client, 1, transferMessage);
        console.log("✅ Tokens transferred from wallet three to wallet one.");

        const tokens = await client.getCurrencies(DISTRIBUTOR_CONTRACT_ADDRESS, "latest");
        console.log("💰 Tokens in contract:", tokens);
    }

    {
        console.log("💸 Distributing tokens from contract to wallet four and wallet five...");
        const distributeMessage = await wallet.sendMessage({
            to: DISTRIBUTOR_CONTRACT_ADDRESS,
            data: encodeFunctionData({
                abi: DISTRIBUTOR_ABI,
                functionName: "distributeToken",
                args: [
                    {
                        id: hexToBigInt(walletAddress),
                        amount: 10_000n,
                    },
                    [walletFour.getAddressHex(), walletFive.getAddressHex()],
                ],
            }),
            feeCredit: 3_000_000n,
        });
        console.log(`🚀 Message sent: ${distributeMessage}`);
        await waitTillCompleted(client, 1, distributeMessage);
        console.log("✅ Tokens distributed from contract to wallet four and wallet five.");

        const tokens = await client.getCurrencies(walletFour.getAddressHex(), "latest");
        console.log("💰 Tokens in wallet four:", tokens);

        const tokensTwo = await client.getCurrencies(walletFive.getAddressHex(), "latest");
        console.log("💰 Tokens in wallet five:", tokensTwo);
    }
}

main();
