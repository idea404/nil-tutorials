import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

module.exports = buildModule("Retailer", (m: any) => {
    const retailer = m.contract("Retailer");

    return { retailer };
});