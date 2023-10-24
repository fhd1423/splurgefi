#!/bin/bash
# Load environment variables from .env file
source .env

addresses=(
)

outputFirstTokenDeployment=$(forge create src/MockToken.sol:token1 --private-key $PRIVATE_KEY --rpc-url $RPC_URL)
outputSecondTokenDeployment=$(forge create src/MockToken.sol:token2 --private-key $PRIVATE_KEY --rpc-url $RPC_URL)
contract1=$(echo "$outputFirstTokenDeployment" | awk -F": " '/Deployed to:/ {print $2}')
contract2=$(echo "$outputSecondTokenDeployment" | awk -F": " '/Deployed to:/ {print $2}')




for address in "${addresses[@]}"; do
    echo "Sending to address: $address"
    cast send $contract1 "transfer(address, uint256)" $address 900000000000000000000 --private-key $PRIVATE_KEY --rpc-url $RPC_URL
    cast send $contract2 "transfer(address, uint256)" $address 900000000000000000000 --private-key $PRIVATE_KEY --rpc-url $RPC_URL
    # cast send $address --value 0.04ether --private-key $PRIVATE_KEY --rpc-url $RPC_URL
done
