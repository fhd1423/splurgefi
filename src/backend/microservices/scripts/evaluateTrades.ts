import { Address } from 'viem';

import { supabase } from '../utils/client';
import { encodeInput } from '../utils/encodingFunctions';
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
        allMeanPrices.reduce((acc: any, val: any) => acc + Number(val), 0) /
        allMeanPrices.length;

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

setInterval(updateTrades, 15000);
