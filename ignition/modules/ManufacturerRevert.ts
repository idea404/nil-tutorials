import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import * as dotenv from "dotenv";

dotenv.config();

module.exports = buildModule("ManufacturerRevert", (m: any) => {

    const pubkey = process.env.WALLET_ADDR;
    const retailerContractAddress = "0x0001aa76C8b3321F6c01B211F46b89e0ba2D60f0";

    const manufacturerRevert = m.contract("ManufacturerRevert", [pubkey, retailerContractAddress]);

    return { manufacturerRevert };
});