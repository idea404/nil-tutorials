import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

module.exports = buildModule("TokenDistributor", (m: any) => {
    const tokenDistributor = m.contract("TokenDistributor");

    return { tokenDistributor };
});