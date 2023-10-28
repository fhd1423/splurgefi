import { Web3Function, Web3FunctionContext } from "@gelatonetwork/web3-functions-sdk";
import { Contract } from "@ethersproject/contracts";
import axios from "axios"; 

const ORACLE_ABI = [
  "function prepareVerifyTrade(orderStruct memory order, bytes memory signature, bytes memory swapCallData) public"
];

const apiKey = "0631b1fa-5205-42d3-89ef-c4e8ea3538fe";

const targetPrice = 3000; 
const tokenPair = {
  input: "0xbcdCB26fFec1bE5991FA4b5aF5B2BbC878965Db1",
  output: "0xFA75399b5ce8C0299B0434E0D1bcFDFd8fF8a755",
};

// Sample order data and signatures (these will need actual values)
const order = {
    inputTokenAddy: "0xInputTokenAddress",
    outputTokenAddy: "0xOutputTokenAddress",
    recipient: "0xRecipientAddress",
    amount: 1000, // Placeholder
    deadline: Date.now() + 24*60*60*1000 // Placeholder: 24 hours from now
};
const signature = "0x..."; // Placeholder
const swapCallData = "0x..."; // Placeholder

async function fetchPrice(pair: { input: string; output: string }): Promise<number> {
  const url = `https://mumbai.api.0x.org/swap/v1/quote?buyToken=${pair.output}&sellToken=${pair.input}&sellAmount=100000`;
  const headers = { "0x-api-key": apiKey };
  const response = await axios.get(url, { headers });
  return parseFloat(response.data.price);
}

Web3Function.onRun(async (context: Web3FunctionContext) => {
  try {
    const { multiChainProvider } = context;
    const provider = multiChainProvider.default();
    const oracleAddress = "0x71B9B0F6C999CBbB0FeF9c92B80D54e4973214da";
    const oracle = new Contract(oracleAddress, ORACLE_ABI, provider);

    const currentPrice = await fetchPrice(tokenPair);
    console.log(`Current price: ${currentPrice}`);

    if (currentPrice >= targetPrice) {
      console.log(`Target price reached! Calling prepareVerifyTrade...`);
      const encodedFunctionData = oracle.interface.encodeFunctionData(
          'prepareVerifyTrade', 
          [order, signature, swapCallData]
      );

      return {
        canExec: true,
        callData: [
          {
            to: oracleAddress,
            data: encodedFunctionData
          }
        ]
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
