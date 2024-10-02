const { encodeFunctionData } = require("viem");
const {
    Faucet,
    HttpTransport,
    LocalECDSAKeySigner,
    PublicClient,
    WalletV1,
    bytesToHex,
    convertEthToWei,
    generateRandomPrivateKey,
    hexToBigInt,
    waitTillCompleted,
} = require("@nilfoundation/niljs");
const dotenv = require("dotenv");

require("dotenv").config();

async function main() {
    console.log("process.env.NIL_RPC_ENDPOINT", process.env.NIL_RPC_ENDPOINT);
    const client = new PublicClient({
        transport: new HttpTransport({
            endpoint: process.env.NIL_RPC_ENDPOINT,
        }),
        shardId: 1,
    });

    console.log("Creating faucet");
    const faucet = new Faucet(client);

    console.log("Creating signer");
    const signer = new LocalECDSAKeySigner({
        privateKey: generateRandomPrivateKey(),
    });

    console.log("Getting public key");
    const pubkey = await signer.getPublicKey();

    console.log("Creating wallet");
    const wallet = new WalletV1({
        pubkey: pubkey,
        salt: 100n,
        shardId: 1,
        client,
        signer,
    });

    console.log("Getting wallet address");
    const walletAddress = wallet.getAddressHex();

    console.log("Withdrawing funds from faucet");
    const faucetHash = await faucet.withdrawToWithRetry(walletAddress, convertEthToWei(0.1));

    console.log("Waiting for faucet to complete");
    await waitTillCompleted(client, 1, faucetHash); // removed bytesToHex

    console.log("Deploying wallet");
    await wallet.selfDeploy(true);
    // biome-ignore lint/nursery/noConsole: <explanation>
    console.log("Wallet deployed successfully");
    // biome-ignore lint/nursery/noConsole: <explanation>
    console.log("walletAddress", walletAddress);

    console.log("Setting currency name");
    const hashMessage = await wallet.sendMessage({
        to: walletAddress,
        feeCredit: 1_000_000n * 10n,
        value: 0n,
        data: encodeFunctionData({
            abi: WalletV1.abi,
            functionName: "setCurrencyName",
            args: ["MY_TOKEN"],
        }),
    });

    console.log("Waiting for setCurrencyName to complete");
    await waitTillCompleted(client, 1, hashMessage);

    console.log("Minting tokens");
    const hashMessage2 = await wallet.sendMessage({
        to: walletAddress,
        feeCredit: 1_000_000n * 10n,
        value: 0n,
        data: encodeFunctionData({
            abi: WalletV1.abi,
            functionName: "mintCurrency",
            args: [100_000_000n],
        }),
    });

    console.log("Waiting for mintCurrency to complete");
    await waitTillCompleted(client, 1, hashMessage2);

    const n = hexToBigInt(walletAddress);

    console.log("Fetching tokens");
    const tokens = await client.getCurrencies(walletAddress, "latest");
    // biome-ignore lint/nursery/noConsole: <explanation>
    console.log("tokens", tokens);

    console.log("Calculating another address");
    const anotherAddress = WalletV1.calculateWalletAddress({
        pubKey: pubkey,
        shardId: 2,
        salt: 200n,
    });

    console.log("Sending tokens");
    const sendHash = await wallet.sendMessage({
        to: anotherAddress,
        value: 10_000_000n,
        feeCredit: 100_000n * 10n,
        tokens: [
            {
                id: n,
                amount: 100_00n,
            },
        ],
    });

    console.log("Waiting for sendMessage to complete");
    await waitTillCompleted(client, 1, sendHash);

    console.log("Fetching tokens for another address");
    const anotherTokens = await client.getCurrencies(bytesToHex(anotherAddress), "latest");

    // biome-ignore lint/nursery/noConsole: <explanation>
    console.log("anotherTokens", anotherTokens);
}

main();
