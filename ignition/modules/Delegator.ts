import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const DelegatorModule = buildModule("DelegatorModule", (m) => {
  const delegator = m.contract("Delegator", ["0x0001AE5D6f28fa0Eff5BC2626FD3a9BaB37498Fa"]);

  return { delegator };
});

export default DelegatorModule;
