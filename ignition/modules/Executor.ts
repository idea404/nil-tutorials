import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const ExecutorModule = buildModule("ExecutorModule", (m) => {
  const executor = m.contract("Executor");

  return { executor };
});

export default ExecutorModule;
