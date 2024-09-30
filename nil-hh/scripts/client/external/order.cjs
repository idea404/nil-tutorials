const { ExternalMessageEnvelope, hexToBytes, bytesToHex, waitTillCompleted } = require("@nilfoundation/niljs");
const { encodeFunctionData } = require("viem");
const { PublicClient, HttpTransport } = require("@nilfoundation/niljs");
const RETAILER_ABI = require("../../../artifacts/contracts/Retailer.sol/Retailer.json").abi;
const dotenv = require("dotenv");

dotenv.config();

async function main() {
    const rpcUrl = process.env.NIL_RPC_ENDPOINT;
    const walletPrivateKey = process.env.PRIVATE_KEY;
    const retailerAddress = "0x0001aa76C8b3321F6c01B211F46b89e0ba2D60f0";
    const manufacturerAddress = "0x00024FDAa1Ee4FDe1BE24228Ae85D9154a60A071";

    const client = new PublicClient({
        transport: new HttpTransport({
            endpoint: rpcUrl,
        }),
        shardId: 1,
    });

    console.log("Ordering product...");
    const orderMessage = new ExternalMessageEnvelope({
        isDeploy: false,
        to: hexToBytes(retailerAddress),
        chainId: 0,
        data: hexToBytes(
            encodeFunctionData({
                abi: RETAILER_ABI,
                functionName: "orderProduct",
                args: [manufacturerAddress, "another-external-product"],
            })
        ),
        authData: new Uint8Array(0),
        seqno: await client.getMessageCount(retailerAddress),
    });

    console.log("Encoded order message:", orderMessage);
    const encodedOrderMessage = orderMessage.encode();

    let success = false;
    let orderMessageHash;

    while (!success) {
        try {
            console.log("Sending order message...");
            orderMessageHash = await client.sendRawMessage(bytesToHex(encodedOrderMessage));
            success = true;
        } catch (error) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
    }

    console.log("Order message sent successfully:", orderMessageHash);
    const orderReceipts = await waitTillCompleted(client, 1, orderMessageHash);

    console.log("Product ordered successfully:", orderReceipts);
}

main().catch(console.error);
