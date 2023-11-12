#!/bin/bash
# Load environment variables from .env file
source .env

DeployerTags="--private-key $PRIVATE_KEY --rpc-url $RPC_URL"
TraderTags="--private-key $PRIVATE_KEY_TRADER --rpc-url $RPC_URL"

uniswap=0xc36442b4a4522e871399cd717abdd847ab11fe88
maxInteger=115792089237316195423570985008687907853269984665640564039457584007913129639935
deployerAddress=0xBb6AeaBdf61Ca96e80Aa239bA8cC7e436862E596
traderAddress=0xBb6AeaBdf61Ca96e80Aa239bA8cC7e436862E596
#traderAddress=0x8839278A75dc8249BC0C713A710aaEBD0FEE6750


#deploy splurge
splurgeDeployment=$(forge create src/contracts/splurge.sol:Splurge --constructor-args 0xf471d32cb40837bf24529fcf17418fc1a4807626 0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889 $DeployerTags --verify --etherscan-api-key 7CZYAQD27GJ9MZF6Y8NAQYWRKMV7E8N5SS)
splurgeContract=$(echo "$splurgeDeployment" | awk -F": " '/Deployed to:/ {print $2}')

# deploy two tokens
outputFirstTokenDeployment=$(forge create src/MockToken.sol:token1 $DeployerTags)
outputSecondTokenDeployment=$(forge create src/MockToken.sol:token2 $DeployerTags)
contract1=$(echo "$outputFirstTokenDeployment" | awk -F": " '/Deployed to:/ {print $2}')
contract2=$(echo "$outputSecondTokenDeployment" | awk -F": " '/Deployed to:/ {print $2}')

echo splurge: $splurgeContract
echo contract 1: $contract1
echo contract 2: $contract2

# approve uniswap to spend both tokens
cast send $contract1 "approve(address, uint256)" $uniswap $maxInteger $DeployerTags
cast send $contract2 "approve(address, uint256)" $uniswap $maxInteger $DeployerTags

# send token1 to trader
cast send $contract1 "transfer(address, uint256)" $traderAddress 1000000000000000000000 $DeployerTags

# trader must approve our contract to trade for them
cast send $contract1 "approve(address, uint256)" $splurgeContract 1000000000000000000000 $TraderTags

# createAndInit=$(cast abi-encode "createAndInitializePoolIfNecessary(address, address, uint24, uint160)" $contract1 $contract2 10000 79228162514264337593543950336)
# mint=$(cast abi-encode "mint((address,address,uint24,int24,int24,uint256,uint256,uint256,uint256,address,uint256))" "($contract1,$contract2,10000,-887200,887200,999999999999999999999,999999999999999999999,997509336107632903022,997496867163000166582,$myAddress,1798171591)")

# mint an LP for the new tokens
cast send $uniswap "createAndInitializePoolIfNecessary(address, address, uint24, uint160)" $contract1 $contract2 10000 79228162514264337593543950336 $DeployerTags
cast send $uniswap "mint((address,address,uint24,int24,int24,uint256,uint256,uint256,uint256,address,uint256))" "($contract1,$contract2,10000,-887200,887200,999999999999999999999,999999999999999999999,997509336107632903022,997496867163000166582,$deployerAddress,1798171591)" $DeployerTags
