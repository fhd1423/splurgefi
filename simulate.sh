#!/bin/bash
# Load environment variables from .env file
source .env

traderAddress=0xBb6AeaBdf61Ca96e80Aa239bA8cC7e436862E596
DeployerTags="--private-key $PRIVATE_KEY --rpc-url https://polygon-mumbai.g.alchemy.com/v2/9Lgo55iX-WyUfLGeAL5fy5YIFf1hu--B"
TraderTags="--private-key $PRIVATE_KEY_TRADER --rpc-url https://polygon-mumbai.g.alchemy.com/v2/9Lgo55iX-WyUfLGeAL5fy5YIFf1hu--B"

#deploy splurge
splurgeDeployment=$(forge create src/contracts/src/splurge.sol:Splurge --constructor-args 0xf471d32cb40837bf24529fcf17418fc1a4807626 0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889 0x8839278a75dc8249bc0c713a710aaebd0fee6750 $DeployerTags --verify --etherscan-api-key 7CZYAQD27GJ9MZF6Y8NAQYWRKMV7E8N5SS) # arbi: YS7YS943N4358NK6AQJ411JAWCBQZXD4QA
splurgeContract=$(echo "$splurgeDeployment" | awk -F": " '/Deployed to:/ {print $2}')
echo splurge: $splurgeContract

# trader must approve our contract to trade their weth
cast send 0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889 "approve(address, uint256)" $splurgeContract 1000000000000000000000 $TraderTags

ts-node testing/simulations/tradesimulations.ts $splurgeContract