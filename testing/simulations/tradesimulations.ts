import axios from 'axios';
import * as dotenv from 'dotenv';
import { Address, decodeFunctionData, encodeFunctionData } from 'viem';
import {
  SwapDataStruct,
  TransformERC20,
} from '../../src/backend/microservices/utils/encodingFunctions';
import splurgeAbi from '../../src/backend/microservices/utils/splurgeAbi';
import { viemClient } from '../../src/backend/microservices/utils/viemclient';
import ExAbi from '../../src/backend/microservices/utils/zeroexabi';
import { generateRandomSalt } from '../../src/frontend/helpers/utils';
import { account } from '../utils/config';

dotenv.config();

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
) {
  const res = await fetchQuote(
    {
      input: inputTokenAddress,
      output: outputTokenAddress,
      amount: String(swap_tranche),
    },
    '3ea7b5b1-299e-4f0b-894e-b5b1356c592b',
    'https://mumbai.api.0x.org/swap/v1/quote?',
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
  if (
    SwapData.inputTokenAddress == '0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889' // for test
  ) {
    let gasFee = Number(await viemClient.getGasPrice()) * 4000000; // gasPrice * gasLimit
    swap_tranche -= gasFee;
    swap_tranche = swap_tranche * 0.9985; // take fee
  }
  const zeroExSwapStruct = await generateZeroExStruct(
    SwapData.inputTokenAddress,
    SwapData.outputTokenAddress,
    swap_tranche,
  );

  const data = encodeFunctionData({
    abi: splurgeAbi,
    functionName: 'verifyExecuteTrade',
    args: [splurgeOrderStruct, signature, zeroExSwapStruct],
  });

  return data;
};

const generateSignature = async (data: {
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
}) => {
  try {
    const signature = await account.signTypedData({
      domain: {
        name: 'Splurge Finance',
        version: '1',
        chainId: 42161,
        verifyingContract: splurgeContract as Address, //CHANGE: to Splurge Addy
      },
      types: {
        conditionalOrder: [
          { name: 'inputTokenAddress', type: 'address' },
          { name: 'outputTokenAddress', type: 'address' },
          { name: 'recipient', type: 'address' },
          { name: 'amount', type: 'uint256' },
          { name: 'tranches', type: 'uint256' },
          { name: 'percentChange', type: 'uint256' },
          { name: 'priceAvg', type: 'uint256' },
          { name: 'deadline', type: 'uint256' },
          { name: 'timeBwTrade', type: 'uint256' },
          { name: 'salt', type: 'bytes32' },
        ],
      },
      primaryType: 'conditionalOrder',
      message: {
        inputTokenAddress: data.inputTokenAddress, // WETH
        outputTokenAddress: data.outputTokenAddress, // GROK
        recipient: data.recipient,
        amount: BigInt(data.amount), // Input token scaled(18 decimal places)
        tranches: BigInt(data.tranches),
        percentChange: BigInt(data.percentChange),
        priceAvg: BigInt(data.priceAvg),
        deadline: BigInt(data.deadline),
        timeBwTrade: BigInt(data.timeBwTrade),
        salt: data.salt,
      },
    });
    return signature;
  } catch (e) {
    console.log(e);
  }
};

const executeTrade = async (
  data: {
    inputTokenAddress: Address; // inputTokenAddy
    outputTokenAddress: Address; // outputTokenAddy
    recipient: Address; // recipient
    amount: number; // amount
    tranches: number; // tranches
    percentChange: number; // percent change
    priceAvg: number; // priceAvg
    deadline: number; // deadline
    timeBwTrade: number; // time between trades
    salt: Address;
  },
  splurgeContract: Address,
) => {
  // assuming environment variables TENDERLY_USER, TENDERLY_PROJECT and TENDERLY_ACCESS_KEY are set
  // https://docs.tenderly.co/other/platform-access/how-to-find-the-project-slug-username-and-organization-name
  // https://docs.tenderly.co/other/platform-access/how-to-generate-api-access-tokens
  const { TENDERLY_USER, TENDERLY_PROJECT, TENDERLY_ACCESS_KEY } = process.env;

  const signature = await generateSignature(data);
  if (!signature) {
    console.log('error generating signature');
    return;
  }
  const encodedInput = await encodeInput(data, signature);

  const resp = await axios.post(
    `https://api.tenderly.co/api/v1/account/${TENDERLY_USER}/project/${TENDERLY_PROJECT}/simulate`,
    {
      save: true,
      save_if_fails: true,
      simulation_type: 'quick',
      network_id: '80001', // polygon mumbai
      from: '0x8839278a75dc8249bc0c713a710aaebd0fee6750',
      to: splurgeContract,
      input: encodedInput,
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
    throw new Error(`Transaction failed`);
  }
  console.log(
    `Successful transaction: hash: ${transaction.hash} block number: ${transaction.block_number}`,
  );
};

async function main(splurgeContract: Address) {
  executeTrade(
    {
      inputTokenAddress: '0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889',
      outputTokenAddress: '0xa0a6c157871A9F38253234BBfD2B8D79F9e9FCDC',
      recipient: '0x8839278a75dc8249bc0c713a710aaebd0fee6750', // recipient
      amount: 300000000000000000, // amount
      tranches: 6, // tranches
      percentChange: 15, // percent change
      priceAvg: 4, // priceAvg
      deadline: 1730016559, // deadline
      timeBwTrade: 100, // time between trades
      salt: generateRandomSalt() as Address,
    },
    splurgeContract,
  );
}

const splurgeContract = process.argv[2];
main(splurgeContract as Address);

//test
