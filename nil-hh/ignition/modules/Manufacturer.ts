import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import * as dotenv from "dotenv";

dotenv.config();

module.exports = buildModule("Manufacturer", (m: any) => {

    const pubkey = process.env.WALLET_ADDR;
    const retailerContractAddress = "0x000123abe3c69d21682a646fabbba784051dd2d2";

    const manufacturer = m.contract("Manufacturer", [pubkey, retailerContractAddress]);

    return { manufacturer };
});