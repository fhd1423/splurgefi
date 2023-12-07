#!/bin/bash
source .env

DeployerTags="--private-key $PRIVATE_KEY --rpc-url $RPC_URL"

#deploy splurge // swaprouter // weth // gelato executor
splurgeDeployment=$(forge create src/contracts/splurge.sol:Splurge --constructor-args 0xDef1C0ded9bec7F1a1670819833240f027b25EfF 0x82aF49447D8a07e3bd95BD0d56f35241523fBab1 0xB067AabAcA41112E9f060786E08c55ad2EaaCc2A $DeployerTags --verify --etherscan-api-key YS7YS943N4358NK6AQJ411JAWCBQZXD4QA)
splurgeContract=$(echo "$splurgeDeployment" | awk -F": " '/Deployed to:/ {print $2}')
echo splurge: $splurgeContract
