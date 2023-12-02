const axios = require('axios');
import { Address, decodeFunctionData, encodeFunctionData } from 'viem';
import ExAbi from '../utils/zeroexabi';
import splurgeAbi from '../utils/splurgeAbi';

import { supabase } from '../utils/client';

const WETH = '0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889'; //wmatic for now

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

type SwapDataStruct = {
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
) {
  const res = await fetchQuote(
    {
      input: inputTokenAddress,
      output: outputTokenAddress,
      amount: String(swap_tranche),
    },
    '0631b1fa-5205-42d3-89ef-c4e8ea3538fe',
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
    BigInt(SwapData.slippage), // slippage
    BigInt(SwapData.salt), // salt
  ];

  let swap_tranche = Math.floor(SwapData.amount / SwapData.tranches);
  //TAKE FEE
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

//Get Requested Pairs & recent PriceQueue from "Pairs" Table
const getPairs = async () => {
  let { data: Pairs, error } = await supabase.from('Pairs').select('*');
  return Pairs;
};

const updateTrades = async () => {
  let pairs = await getPairs();
  if (!pairs) return;

  for (let pair of pairs) {
    let { data: Trades, error } = await supabase
      .from('Trades')
      .select('*')
      .eq('ready', 'false')
      .eq('complete', 'false')
      .eq('pair', pair.path);
    if (!Trades) return;

    let currentOutput = pair['current_price'];

    for (let trade of Trades) {
      let xChangeRate_modifier = 1;
      if (trade.order.outputTokenAddress == WETH) {
        xChangeRate_modifier = -1;
      }
      let allMeanPrices;
      try {
        allMeanPrices = pair[`${trade.order.priceAvg}min_avg`]['close_prices'];
      } catch (e) {
        console.log(`error with ${pair}`);
        break;
      }
      if (!allMeanPrices || allMeanPrices.length == 0) {
        console.log(`error with ${pair}`);
        break;
      }
      let movingAveragePrice =
        allMeanPrices.reduce(
          (acc: any, val: any) =>
            acc + Number(Math.pow(val, xChangeRate_modifier)),
          0,
        ) / allMeanPrices.length;

      const current_time = new Date().getTime(); // UNIX timestamp
      const mostRecentBatch = Object.keys(trade.batch_timings).length;
      const lastBatchTime = trade.batch_timings[mostRecentBatch.toString()];
      const timeBetweenBatches = trade.time_bw_batches;

      // Get swap call data
      const callData = await encodeInput(
        trade.order as SwapDataStruct,
        trade.signature,
      );

      // Only mark trade as ready if time between batches is satisfied
      if (timeBetweenBatches >= current_time - lastBatchTime) {
        let buyOutputOver =
          ((100 + Number(trade.order.percentChange)) / 100) *
          movingAveragePrice;
        if (currentOutput >= buyOutputOver) {
          const { data, error } = await supabase
            .from('Trades')
            .update({
              ready: true,
              zero_x_call_data: callData,
            })
            .eq('id', trade.id)
            .select();
          console.log(data || error);
        }
      }
    }
  }
};

console.log('Continuous evaluation loop started');
if (process.argv[2]) setInterval(updateTrades, 15000);
