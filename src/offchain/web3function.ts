import { Web3Function, Web3FunctionContext } from "@gelatonetwork/web3-functions-sdk";
import { Contract } from "@ethersproject/contracts";
import ky from "ky";
import axios from "axios";

const ORACLE_ABI = [
  "function lastUpdated() external view returns(uint256)",
  "function updatePrice(uint256)",
];

const apiKey = "0631b1fa-5205-42d3-89ef-c4e8ea3538fe";

// Sample target price and tokenPair (need to upload pairs to firebase and check through that here)
const targetPrice = 3000;
const tokenPair = {
  input: "0xbcdCB26fFec1bE5991FA4b5aF5B2BbC878965Db1",
  output: "0xFA75399b5ce8C0299B0434E0D1bcFDFd8fF8a755",
};

async function fetchPrice(pair: { input: string; output: string }): Promise<number> {
  const url = `https://mumbai.api.0x.org/swap/v1/quote?buyToken=${pair.output}&sellToken=${pair.input}&sellAmount=100000`;
  const headers = { "0x-api-key": apiKey };
  const response = await axios.get(url, { headers });
  return parseFloat(response.data.price);
}

Web3Function.onRun(async (context: Web3FunctionContext) => {
  try {

    const { userArgs, multiChainProvider } = context;
    const provider = multiChainProvider.default();

    // Note - need to update oracle address once we launch smart contract
    // const oracleAddress = "0x71B9B0F6C999CBbB0FeF9c92B80D54e4973214da";
    const oracle = new Contract(userArgs.oracle, ORACLE_ABI, provider);

    const currentPrice = await fetchPrice(tokenPair);
    console.log(`Current price: ${currentPrice}`);

    if (currentPrice >= targetPrice) {
      // If the current price hits the target, update the oracle
      console.log(`Target price reached! Updating oracle...`);

      // Need to update based on our contract payload function
      return {
        canExec: true,
        callData: [
          {
            to: userArgs.oracle,
            data: oracle.interface.encodeFunctionData("updatePrice", [Math.floor(currentPrice * 100)]), // Convert to cents or your desired format
          },
        ],
      };
    } else {
      return { canExec: false, message: `Target price not reached` };
    }
  } catch (error) {
    console.error("Error:", error);
    if (error instanceof Error) {
      return { canExec: false, message: `Error encountered: ${error.message}` };
    } else {
      return { canExec: false, message: `An unknown error occurred` };
    }
  }
});
