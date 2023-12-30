const axios = require('axios');
import { Address, decodeFunctionData, encodeFunctionData } from 'viem';
import ExAbi from '../utils/zeroexabi';
import splurgeAbi from '../utils/splurgeAbi';
import { viemClient } from './viemclient';

const WETH = '0x82af49447d8a07e3bd95bd0d56f35241523fbab1'; // production weth: arbitrum currently

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
  let response = await axios.get(url, { headers });

  return response.data;
}

async function generateZeroExStruct(
  inputTokenAddress: Address,
  outputTokenAddress: Address,
  swap_tranche: number,
) {
  console.log('quoting swap for', swap_tranche);
  const res = await fetchQuote(
    {
      input: inputTokenAddress,
      output: outputTokenAddress,
      amount: String(swap_tranche),
    },
    '3ea7b5b1-299e-4f0b-894e-b5b1356c592b',
    'https://arbitrum.api.0x.org/swap/v1/quote?',
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
  if (SwapData.inputTokenAddress == WETH) {
    let gasFee = Number(await viemClient.getGasPrice()) * 4000000; // gasPrice * gasLimit
    swap_tranche -= gasFee;
    swap_tranche = swap_tranche * 0.9985; // take fee
  }
  let zeroExSwapStruct;
  try {
    zeroExSwapStruct = await generateZeroExStruct(
      SwapData.inputTokenAddress,
      SwapData.outputTokenAddress,
      swap_tranche,
    );
  } catch (e) {
    return null;
  }

  const data = encodeFunctionData({
    abi: splurgeAbi,
    functionName: 'verifyExecuteTrade',
    args: [splurgeOrderStruct, signature, zeroExSwapStruct],
  });

  return data;
};

export const simulateTrade = async (calldata: any) => {
  try {
    const TENDERLY_USER = 'fhd';
    const TENDERLY_PROJECT = 'fhd';
    const TENDERLY_ACCESS_KEY = 'P0pOKtbaCwV2JffMLFpbdls3SowlmIj8';
    const resp = await axios.post(
      `https://api.tenderly.co/api/v1/account/${TENDERLY_USER}/project/${TENDERLY_PROJECT}/simulate`,
      {
        save: true,
        save_if_fails: true,
        simulation_type: 'quick',
        network_id: '42161', // prod: arbitrum
        from: '0xBb6AeaBdf61Ca96e80Aa239bA8cC7e436862E596', // TODO: change to deployer only
        to: process.env.SPLURGE_ADDRESS, // 0xFA1a9623054154EF25F782f04411B39A40f01880
        input: calldata,
        gas: 8000000,
        gas_price: Number(await viemClient.getGasPrice()),
        value: 0,
      },
      {
        headers: {
          'X-Access-Key': TENDERLY_ACCESS_KEY as string,
        },
      },
    );
    const transaction = resp.data.transaction;
    const error = transaction.error_message;
    if (error) {
      return false;
    }
    return true;
  } catch (e) {
    console.log('error simulating trade');
    return false;
  }
};
