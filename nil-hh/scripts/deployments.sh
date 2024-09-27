export PUBKEY=0x02c9afdd454bbcce3eaf37f18a7a1042f2837d4c575b86220caa137620131fabfc
export RETAILER_ADDRESS=0x000123abe3c69d21682a646fabbba784051dd2d2
 
nil wallet deploy ./scripts/Retailer.bin --abi ./scripts/Retailer.abi --salt 1 
nil wallet deploy ./scripts/Manufacturer.bin $PUBKEY $RETAILER_ADDRESS --abi ./scripts/Manufacturer.abi --shard-id 2 --salt 1 

# OR

npx hardhat ignition deploy ./ignition/modules/Retailer.ts --network nil
npx hardhat ignition deploy ./ignition/modules/Manufacturer.ts --network nil