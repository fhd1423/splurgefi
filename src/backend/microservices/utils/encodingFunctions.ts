const axios = require('axios');
import { Address, decodeFunctionData, encodeFunctionData } from 'viem';
import ExAbi from '../utils/zeroexabi';
import splurgeAbi from '../utils/splurgeAbi';

const WETH = '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1'; //wmatic for now

export type TransformERC20 = [
  string, // First address
  string, // Second address
  bigint, // First big integer
  bigint, // Second big integer
  Array<{
    deploymentNonce: number;
    data: string;
  }>,
];

export type SwapDataStruct = {
  inputTokenAddress: Address;
  outputTokenAddress: Address;
  recipient: Address;
  amount: number;
  tranches: number;
  percentChange: number;
  priceAvg: number;
  deadline: number;
  timeBwTrade: number;
  salt: Address;
};
async function fetchQuote(
  pair: {
    input: string;
    output: string;
    amount: string;
  },
  apiKey: string,
  apiUrl: string,
) {
  const url = `${apiUrl}buyToken=${pair.output}&sellToken=${pair.input}&sellAmount=${pair.amount}`;
  const headers = { '0x-api-key': apiKey };
  const response = await axios.get(url, { headers });

  return response.data;
}

async function generateZeroExStruct(
  inputTokenAddress: Address,
  outputTokenAddress: Address,
  swap_tranche: number,
  test: boolean,
) {
  const res = await fetchQuote(
    {
      input: inputTokenAddress,
      output: outputTokenAddress,
      amount: String(swap_tranche),
    },
    '47e88863-d00f-4e4f-bfe0-10b124369789',
    test
      ? 'https://mumbai.api.0x.org/swap/v1/quote?'
      : 'https://arbitrum.api.0x.org/swap/v1/quote?',
  );

  const typedArgs = decodeFunctionData({
    abi: ExAbi,
    data: res.data,
  }).args as TransformERC20;

  const object = typedArgs[4].map(({ deploymentNonce, data }) => [
    deploymentNonce,
    data,
  ]);

  return [typedArgs[3], object]; // (uint256,(uint32, bytes)[])
}

export const encodeInput = async (
  SwapData: SwapDataStruct,
  signature: string,
  test?: boolean,
) => {
  const splurgeOrderStruct = [
    SwapData.inputTokenAddress, // inputTokenAddy
    SwapData.outputTokenAddress, // outputTokenAddy
    SwapData.recipient, // recipient
    BigInt(SwapData.amount), // amount
    BigInt(SwapData.tranches), // tranches
    BigInt(SwapData.percentChange), // percent change
    BigInt(SwapData.priceAvg), // priceAvg
    BigInt(SwapData.deadline), // deadline
    BigInt(SwapData.timeBwTrade), // time between trades
    SwapData.salt, // salt
  ];
  console.log('calling quote');

  let swap_tranche = Math.floor(SwapData.amount / SwapData.tranches);
  if (
    SwapData.inputTokenAddress == WETH ||
    SwapData.inputTokenAddress == '0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889' // for test
  ) {
    swap_tranche = Math.floor(swap_tranche * 0.995);
  }
  const zeroExSwapStruct = await generateZeroExStruct(
    SwapData.inputTokenAddress,
    SwapData.outputTokenAddress,
    swap_tranche,
    test || false,
  );

  const data = encodeFunctionData({
    abi: splurgeAbi,
    functionName: 'verifyExecuteTrade',
    args: [splurgeOrderStruct, signature, zeroExSwapStruct],
  });

  return data;
};

export const simulateTrade = async (calldata: any) => {
  const TENDERLY_USER = 'fhd';
  const TENDERLY_PROJECT = 'fhd';
  const TENDERLY_ACCESS_KEY = 'P0pOKtbaCwV2JffMLFpbdls3SowlmIj8';
  const resp = await axios.post(
    `https://api.tenderly.co/api/v1/account/${TENDERLY_USER}/project/${TENDERLY_PROJECT}/simulate`,
    {
      save: true,
      save_if_fails: true,
      simulation_type: 'quick',
      network_id: '42161',
      from: '0xB067AabAcA41112E9f060786E08c55ad2EaaCc2A', // TODO: change to deployer only
      to: process.env.SPLURGE_ADDRESS,
      input: calldata,
      gas: 8000000,
      gas_price: 0,
      value: 0,
    },
    {
      headers: {
        'X-Access-Key': TENDERLY_ACCESS_KEY as string,
      },
    },
  );
  const logs = resp.data.transaction.transaction_info.logs;
  if (logs) return true;
  else {
    return false;
  }
};
