import axios from 'axios';
import * as dotenv from 'dotenv';
import { Address, encodeFunctionData, decodeFunctionData } from 'viem';
import { account } from '../utils/config';
import splurgeAbi from '../utils/splurgeAbi';
import ExAbi from '../utils/zeroexabi';
dotenv.config();

type TransformERC20 = [
  string, // First address
  string, // Second address
  bigint, // First big integer
  bigint, // Second big integer
  Array<{
    deploymentNonce: number;
    data: string;
  }>,
];
const WETH = '0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889'; //wmatic for now

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
  slippage: number;
  salt: number;
}) => {
  try {
    const signature = await account.signTypedData({
      domain: {
        name: 'Splurge Finance',
        version: '1',
        chainId: 1,
        verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC', //CHANGE: to Splurge Addy
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
          { name: 'slippage', type: 'uint256' },
          { name: 'salt', type: 'uint256' },
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
        slippage: BigInt(data.slippage),
        salt: BigInt(data.salt),
      },
    });
    return signature;
  } catch (e) {
    console.log(e);
  }
};

function getDeconstructedCalldata(calldata: { data: any }): object {
  const typedArgs = decodeFunctionData({
    abi: ExAbi,
    data: calldata.data,
  }).args as TransformERC20;

  const object = typedArgs[4].map(({ deploymentNonce, data }) => [
    deploymentNonce,
    data,
  ]);

  return [typedArgs[3], object]; // (uint256,(uint32, bytes)[])
}

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
  trancheToSell: number,
) {
  const res = await fetchQuote(
    {
      input: inputTokenAddress,
      output: outputTokenAddress,
      amount: String(trancheToSell),
    },
    '0631b1fa-5205-42d3-89ef-c4e8ea3538fe',
    'https://mumbai.api.0x.org/swap/v1/quote?',
  );

  let result = await getDeconstructedCalldata(res);
  return result;
}

const encodeInput = async (SwapData: {
  inputTokenAddress: Address;
  outputTokenAddress: Address;
  recipient: Address;
  amount: number;
  tranches: number;
  percentChange: number;
  priceAvg: number;
  deadline: number;
  timeBwTrade: number;
  slippage: number;
  salt: number;
}) => {
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
    BigInt(SwapData.slippage), // slippage
    BigInt(SwapData.salt), // salt
  ];

  let trancheToSell = Math.floor(SwapData.amount / SwapData.tranches);
  if (SwapData.inputTokenAddress == WETH) {
    trancheToSell = Math.floor(trancheToSell * 0.995);
  }
  const zeroExSwapStruct = await generateZeroExStruct(
    SwapData.inputTokenAddress,
    SwapData.outputTokenAddress,
    trancheToSell,
  );

  const signature = await generateSignature(SwapData);

  const data = encodeFunctionData({
    abi: splurgeAbi,
    functionName: 'verifyExecuteTrade',
    args: [splurgeOrderStruct, signature, zeroExSwapStruct],
  });

  return data;
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
    slippage: number;
    salt: number;
  },
  splurgeContract: Address,
) => {
  // assuming environment variables TENDERLY_USER, TENDERLY_PROJECT and TENDERLY_ACCESS_KEY are set
  // https://docs.tenderly.co/other/platform-access/how-to-find-the-project-slug-username-and-organization-name
  // https://docs.tenderly.co/other/platform-access/how-to-generate-api-access-tokens
  const { TENDERLY_USER, TENDERLY_PROJECT, TENDERLY_ACCESS_KEY } = process.env;

  const encodedInput = await encodeInput(data);

  const resp = await axios.post(
    `https://api.tenderly.co/api/v1/account/${TENDERLY_USER}/project/${TENDERLY_PROJECT}/simulate`,
    {
      save: true,
      save_if_fails: true,
      simulation_type: 'quick',
      network_id: '80001',
      from: '0x8839278a75dc8249bc0c713a710aaebd0fee6750',
      to: splurgeContract,
      input: encodedInput,
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

  const transaction = resp.data.transaction;
  const logs = resp.data.transaction.transaction_info.logs;
  if (logs)
    console.log(
      `Successful transaction: hash: ${transaction.hash} block number: ${transaction.block_number}`,
    );
  else {
    console.log(`Transaction failed`);
  }
};

async function main(splurgeContract: Address) {
  executeTrade(
    {
      inputTokenAddress: '0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889',
      outputTokenAddress: '0xa0a6c157871A9F38253234BBfD2B8D79F9e9FCDC',
      recipient: '0x8839278a75dc8249bc0c713a710aaebd0fee6750', // recipient
      amount: 10000, // amount
      tranches: 6, // tranches
      percentChange: 15, // percent change
      priceAvg: 4, // priceAvg
      deadline: 1730016559, // deadline
      timeBwTrade: 100, // time between trades
      slippage: 1,
      salt: 1,
    },
    splurgeContract,
  );
}

const splurgeContract = process.argv[2];
main(splurgeContract as Address);
