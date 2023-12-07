import { supabase } from '../utils/client';
import {
  encodeInput,
  simulateTrade,
  SwapDataStruct,
} from '../utils/encodingFunctions';

//Get Requested Pairs & recent PriceQueue from "Pairs" Table
const getPairs = async () => {
  let { data: Pairs, error } = await supabase.from('Pairs').select('*');
  return Pairs;
};

const getSortedTrades = async (path: string) => {
  let { data: Pairs, error } = await supabase
    .from('Trades')
    .select('*')
    .eq('ready', 'false')
    .eq('complete', 'false')
    .eq('pair', path);

  if (error) console.log(error);
  return Pairs;
};

const updateTrades = async () => {
  let pairs = await getPairs();
  if (!pairs) return;

  for (let pair of pairs) {
    let Trades;
    let inverse = false;

    // check regular pair
    Trades = await getSortedTrades(pair.path);

    if (!Trades || Trades.length == 0) {
      // check inverse of pair
      const path = `${pair.path.split('-')[1]}-${pair.path.split('-')[0]}`;
      Trades = await getSortedTrades(path);

      if (!Trades || Trades.length == 0) {
        return;
      }
      inverse = true;
    }

    let currentOutput = pair['current_price'];

    for (let trade of Trades) {
      const allMeanPrices =
        pair[`${trade.order.priceAvg}min_avg`]['close_prices'];

      let movingAveragePrice =
        allMeanPrices.reduce((acc: any, val: any) => acc + Number(val), 0) /
        allMeanPrices.length;

      if (inverse) {
        movingAveragePrice = 1 / movingAveragePrice;
        currentOutput = 1 / currentOutput;
      }

      const current_time = parseInt((new Date().getTime() / 1000).toFixed(0));

      const lastBatchTime = trade.lastExecuted;
      const timeBetweenBatches = trade.order.timeBwTrade;

      // Get swap call data
      const callData = await encodeInput(
        trade.order as SwapDataStruct,
        trade.signature,
      );

      if (timeBetweenBatches <= current_time - lastBatchTime) {
        console.log('time between trade is satisfied for', trade.id);
        let buyOutputOver =
          ((100 + Number(trade.order.percentChange)) / 100) *
          movingAveragePrice;
        if (currentOutput >= buyOutputOver) {
          if (await simulateTrade(callData)) {
            const { data, error } = await supabase
              .from('Trades')
              .update({
                ready: true,
                zero_x_call_data: callData,
              })
              .eq('id', trade.id)
              .select();
            if (error)
              console.log('error pushing calldata for trade ${trade.id}');
            else
              console.log(
                `trade ${trade.id} is ready, currentOutput is ${currentOutput} and minimum is ${buyOutputOver}`,
              );
          } else {
            console.log(`trade simulation failed for trade ${trade.id}`);
          }
        }
      }
    }
  }
};

console.log('Continuous evaluation loop started');

setInterval(updateTrades, 15000);
