Automated batch trading with EIP-712 Signatures based on price deviations, settled through the 0x Protocol. 

## Database:
Supabase stores price data and pending orders.

## Price Feeds: 
Docker containers running in GCP to capture prices from DexScreener and CoinGeckoTerminal.

## Trade Execution:
Tenderly for transaction simulation before each trade in order to not waste gas, and Tenderly Web3Actions hosts the actual execution logic.

## CI/CD:
Github Actions automatically deploy a new contract to polygon testnet, approve tokens for trade through the contract and then a test signature and corresponding transaction is simulated.
