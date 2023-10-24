#!/bin/bash
# Load environment variables from .env file
source .env

tags="--private-key $PRIVATE_KEY --rpc-url $RPC_URL"
uniswap=0xc36442b4a4522e871399cd717abdd847ab11fe88
maxInteger=115792089237316195423570985008687907853269984665640564039457584007913129639935
myAddress=0xBb6AeaBdf61Ca96e80Aa239bA8cC7e436862E596

addresses=(
)

# deploy two tokens
outputFirstTokenDeployment=$(forge create src/MockToken.sol:token1 --private-key $PRIVATE_KEY --rpc-url $RPC_URL)
outputSecondTokenDeployment=$(forge create src/MockToken.sol:token2 --private-key $PRIVATE_KEY --rpc-url $RPC_URL)
contract1=$(echo "$outputFirstTokenDeployment" | awk -F": " '/Deployed to:/ {print $2}')
contract2=$(echo "$outputSecondTokenDeployment" | awk -F": " '/Deployed to:/ {print $2}')
echo "contract 1:" $contract1
echo "contract 2:" $contract2

# approve uniswap to spend both tokens
cast send $contract1 "approve(address, uint256)" $uniswap $maxInteger $tags
cast send $contract2 "approve(address, uint256)" $uniswap $maxInteger $tags


# createAndInit=$(cast abi-encode "createAndInitializePoolIfNecessary(address, address, uint24, uint160)" $contract1 $contract2 10000 79228162514264337593543950336)
# mint=$(cast abi-encode "mint((address,address,uint24,int24,int24,uint256,uint256,uint256,uint256,address,uint256))" "($contract1,$contract2,10000,-887200,887200,999999999999999999999,999999999999999999999,997509336107632903022,997496867163000166582,$myAddress,1798171591)")

# mint an LP for the new tokens
cast send $uniswap "createAndInitializePoolIfNecessary(address, address, uint24, uint160)" $contract1 $contract2 10000 79228162514264337593543950336 $tags
cast send $uniswap "mint((address,address,uint24,int24,int24,uint256,uint256,uint256,uint256,address,uint256))" "($contract1,$contract2,10000,-887200,887200,999999999999999999999,999999999999999999999,997509336107632903022,997496867163000166582,$myAddress,1798171591)" $tags
