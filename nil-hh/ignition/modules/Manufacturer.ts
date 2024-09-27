import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import * as dotenv from "dotenv";

dotenv.config();

module.exports = buildModule("Manufacturer", (m: any) => {

    const pubkey = process.env.WALLET_ADDR;
    const retailerContractAddress = "0x0001da3cE39CF81b52ad5d745EE2EB10cb7bd1dC";

    const manufacturer = m.contract("Manufacturer", [pubkey, retailerContractAddress]);

    return { manufacturer };
});