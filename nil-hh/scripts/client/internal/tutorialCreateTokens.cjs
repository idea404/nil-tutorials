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
const dotenv = require("dotenv");

dotenv.config();

const RPC_ENDPOINT = process.env.NIL_RPC_ENDPOINT;
console.log(`🔗 RPC Endpoint: ${RPC_ENDPOINT}`);

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
        console.log("🪙 Minting tokens for wallet one...");
        const hashMessage = await wallet.mintCurrency(100_000_000n);
        await waitTillCompleted(client, 1, hashMessage);
        console.log("✅ Tokens minted for wallet one.");
    }

    {
        console.log("🪙 Minting tokens for wallet two...");
        const hashMessage = await walletTwo.mintCurrency(50_000_000n);
        await waitTillCompleted(client, 1, hashMessage);
        console.log("✅ Tokens minted for wallet two.");
    }

    {
        console.log("Fetching tokens for wallet one");
        const tokens = await client.getCurrencies(walletAddress, "latest");
        console.log("💰 Tokens in wallet one:", tokens);

        console.log("Fetching tokens for wallet two");
        const tokensTwo = await client.getCurrencies(walletTwoAddress, "latest");
        console.log("💰 Tokens in wallet two:", tokensTwo);
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
                    amount: 100_000n,
                },
            ],
        });
        console.log(`🚀 Message sent: ${transferMessage}`);
        await waitTillCompleted(client, 1, transferMessage);
        console.log("✅ Tokens transferred from wallet two to wallet one.");
    }

    const tokens = await client.getCurrencies(walletAddress, "latest");
    console.log("💰 Tokens in wallet one:", tokens);
}

main();
