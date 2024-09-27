import { Faucet, PublicClient, HttpTransport, waitTillCompleted, WalletV1, LocalECDSAKeySigner } from "@nilfoundation/niljs";
import * as dotenv from "dotenv";

dotenv.config();

const client = new PublicClient({
  transport: new HttpTransport({
    endpoint: process.env.NIL_RPC_ENDPOINT as string,
  }),
  shardId: 1,
});

const faucet = new Faucet(client);

const wallet = new WalletV1({
  pubkey: process.env.WALLET_ADDR as `0x${string}`,
  salt: 100n,
  shardId: 1,
  client,
  signer: new LocalECDSAKeySigner({
    privateKey: process.env.PRIVATE_KEY as `0x${string}`,
  }),
});

const hashFunds = await faucet.withdrawToWithRetry(
  "0x0001da3cE39CF81b52ad5d745EE2EB10cb7bd1dC",
  5_000_000n,
);

await waitTillCompleted(client, 1, hashFunds);

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