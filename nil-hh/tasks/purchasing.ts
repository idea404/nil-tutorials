import { task } from "hardhat/config";

task("orderProduct", "Orders a product")
  .addParam("retailer", "The address of the Retailer contract")
  .addParam("manufacturer", "The address of the Manufacturer contract")
  .addParam("product", "The name of the product")
  .setAction(async (taskArgs, hre) => {
    const Retailer = await hre.ethers.getContractFactory("Retailer");
    const retailer = Retailer.attach(taskArgs.retailer);

    console.log("Ordering the product...");
    const setterTx = await retailer.orderProduct(taskArgs.manufacturer, taskArgs.product);
    await setterTx.wait(0);
  });

task("getProducts", "Gets the current products")
  .addParam("manufacturer", "The address of the Manufacturer contract")
  .setAction(async (taskArgs, hre) => {
    const Manufacturer = await hre.ethers.getContractFactory("Manufacturer");
    const manufacturer = Manufacturer.attach(taskArgs.manufacturer);

    console.log("Getting products..");
    const products = await manufacturer.getProducts();

    console.log(products);

  });
