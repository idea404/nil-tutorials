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

    console.log("🔧 Deploying wallet...");
    await wallet.selfDeploy(true);
    console.log("✅ Wallet deployed.");

    {
        console.log("📝 Setting currency name to 'MY_TOKEN'...");
        const hashMessage = await wallet.setCurrencyName("MY_TOKEN");
        await waitTillCompleted(client, 1, hashMessage);
        console.log("✅ Currency name set to 'MY_TOKEN'.");
    }

    {
        console.log("🪙 Minting 100,000,000 tokens...");
        const hashMessage = await wallet.mintCurrency(100_000_000n);
        await waitTillCompleted(client, 1, hashMessage);
        console.log("✅ 100,000,000 tokens minted.");
    }

    console.log("📊 Fetching tokens...");
    const tokens = await client.getCurrencies(walletAddress, "latest");
    console.log("📦 Tokens:", tokens);
}

main();
