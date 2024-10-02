npx hardhat orderProduct --manufacturer $MANUFACTURER_ADDRESS --retailer $RETAILER_ADDRESS --product "Gatorade" --network nil
npx hardhat getProducts --manufacturer $MANUFACTURER_ADDRESS --network nil

# OR

nil wallet send-tokens $RETAILER_ADDRESS 5000000
nil wallet send-message $RETAILER_ADDRESS orderProduct $MANUFACTURER_ADDRESS new-product --abi ./scripts/Retailer.abi --fee-credit 2000000 
nil contract call-readonly $MANUFACTURER_ADDRESS getProducts --abi ./scripts/Manufacturer.abi 