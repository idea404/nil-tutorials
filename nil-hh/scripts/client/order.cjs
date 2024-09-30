const { PublicClient, HttpTransport, WalletV1, Faucet, waitTillCompleted, LocalECDSAKeySigner } = require("@nilfoundation/niljs");
const { encodeFunctionData } = require("viem");
const dotenv = require("dotenv");
const RETAILER_ABI = require("../../artifacts/contracts/Retailer.sol/Retailer.json").abi;

dotenv.config();

async function orderProduct(rpcUrl, walletPrivateKey, retailerAddress, manufacturerAddress) {
    try {
        const client = new PublicClient({
            transport: new HttpTransport({
                endpoint: rpcUrl,
            }),
            shardId: 1,
        });
        const faucet = new Faucet(client);
        const signer = new LocalECDSAKeySigner({
            privateKey: walletPrivateKey,
        });
        const wallet = new WalletV1({
            pubkey: await signer.getPublicKey(),
            salt: 100n,
            shardId: 1,
            client,
            signer,
        });

        console.log("Funding retailer");
        const hashFunds = await faucet.withdrawToWithRetry(retailerAddress, 5_000_000n);
        await waitTillCompleted(client, 1, hashFunds);

        console.log("Ordering product");
        const hashProduct = await wallet.sendMessage({
            to: retailerAddress,
            data: encodeFunctionData({
                abi: RETAILER_ABI,
                functionName: "orderProduct",
                args: [manufacturerAddress, "another-product"],
            }),
            feeCredit: 3_000_000n,
        });
        const productReceipts = await waitTillCompleted(client, 1, hashProduct);
        console.log("Product ordered successfully:", productReceipts);
    } catch (error) {
        console.error("Error ordering product:", error);
    }
}

// Example usage
const rpcUrl = process.env.NIL_RPC_ENDPOINT;
const walletPrivateKey = process.env.PRIVATE_KEY;
const retailerAddress = "0x0001aa76C8b3321F6c01B211F46b89e0ba2D60f0";
const manufacturerAddress = "0x00024FDAa1Ee4FDe1BE24228Ae85D9154a60A071";

orderProduct(rpcUrl, walletPrivateKey, retailerAddress, manufacturerAddress);
