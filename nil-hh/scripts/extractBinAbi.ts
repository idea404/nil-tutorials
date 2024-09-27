import fs from 'fs';
import path from 'path';

// Path to the compiled contract JSON file
const compiledContractPath = path.resolve(__dirname, '../artifacts/contracts/Manufacturer.sol/Manufacturer.json');

// Read the compiled contract JSON file
const compiledContract = JSON.parse(fs.readFileSync(compiledContractPath, 'utf8'));

// Extract the .bin and .abi data
const bin = compiledContract.bytecode;
const abi = compiledContract.abi;

// Write the .bin and .abi data to separate files
fs.writeFileSync(path.resolve(__dirname, 'Manufacturer.bin'), bin);
fs.writeFileSync(path.resolve(__dirname, 'Manufacturer.abi'), JSON.stringify(abi, null, 2));

console.log('Manufacturer.bin and Manufacturer.abi files have been created.');