#!/bin/bash
source .env

DeployerTags="--private-key $PRIVATE_KEY --rpc-url $RPC_URL"

splurgeDeployment=$(forge create src/contracts/splurge.sol:Splurge  --legacy $DeployerTags --verify --etherscan-api-key YS7YS943N4358NK6AQJ411JAWCBQZXD4QA)
splurgeContract=$(echo "$splurgeDeployment" | awk -F": " '/Deployed to:/ {print $2}')
echo splurge: $splurgeContract
