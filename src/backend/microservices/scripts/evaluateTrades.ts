import { Address } from 'viem';

import { supabase } from '../utils/client';
import { encodeInput } from '../utils/encodingFunctions';

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
  salt: Address;
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
    let Trades;
    // check regular pair
    let { data, error } = await supabase
      .from('Trades')
      .select('*')
      .eq('ready', 'false')
      .eq('complete', 'false')
      .eq('pair', pair.path);

    Trades = data;

    if (!Trades || Trades.length == 0) {
      // check inverse of pair
      pair = `${pair.path.split('-')[1]}-${pair.path.split('-')[0]}`;
      let { data, error } = await supabase
        .from('Trades')
        .select('*')
        .eq('ready', 'false')
        .eq('complete', 'false')
        .eq('pair', pair);

      if (!data || data.length == 0) {
        console.log('no trades to execute');
        return;
      }
      Trades = data;
    }

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

      const current_time = parseInt((new Date().getTime() / 1000).toFixed(0));

      const lastBatchTime = trade.lastExecuted;
      const timeBetweenBatches = trade.order.timeBwTrade;

      // Get swap call data
      const callData = await encodeInput(
        trade.order as SwapDataStruct,
        trade.signature,
      );

      console.log(
        `There are ${
          -1 * current_time - lastBatchTime - timeBetweenBatches
        } seconds until trade ${trade.id} executes.`,
      );

      // Only mark trade as ready if time between batches is satisfied
      if (timeBetweenBatches <= current_time - lastBatchTime) {
        console.log('time between trade is satisfied');
        let buyOutputOver =
          ((100 + Number(trade.order.percentChange)) / 100) *
          movingAveragePrice;
        if (currentOutput >= buyOutputOver) {
          console.log(
            `percent change satisfied, currentOutput is ${currentOutput} and minimum is ${buyOutputOver}`,
          );
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
