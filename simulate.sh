#!/bin/bash
# Load environment variables from .env file
source .env

traderAddress=0xBb6AeaBdf61Ca96e80Aa239bA8cC7e436862E596
DeployerTags="--private-key $PRIVATE_KEY --rpc-url $RPC_URL"
TraderTags="--private-key $PRIVATE_KEY_TRADER --rpc-url $RPC_URL"

#deploy splurge
splurgeDeployment=$(forge create src/contracts/splurge.sol:Splurge --constructor-args 0xf471d32cb40837bf24529fcf17418fc1a4807626 0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889 $DeployerTags --verify --etherscan-api-key 7CZYAQD27GJ9MZF6Y8NAQYWRKMV7E8N5SS)
splurgeContract=$(echo "$splurgeDeployment" | awk -F": " '/Deployed to:/ {print $2}')
echo splurge: $splurgeContract

# trader must approve our contract to trade their weth
cast send 0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889 "approve(address, uint256)" $splurgeContract 1000000000000000000000 $TraderTags

bun testing/simulations/tradesimulations.ts $splurgeContract