import axios from 'axios';
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

  pairs.forEach(async (pair) => {
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

    Trades.forEach(async (trade) => {
      try {
        pair[`${trade.order.priceAvg}min_avg`]['close_prices'];
      } catch (e) {
        console.log(
          'moving average doesnt exist yet',
          `${trade.order.priceAvg}min_avg`,
        );
        return;
      }
      const allMeanPrices =
        pair[`${trade.order.priceAvg}min_avg`]['close_prices'];

      let movingAveragePrice =
        allMeanPrices.reduce((acc: any, val: any) => acc + Number(val), 0) /
        allMeanPrices.length;

      if (allMeanPrices.length != 10) {
        console.log(
          `moving average ${trade.order.priceAvg}min_avg not full of data yet`,
        );
        return;
      }

      if (inverse) {
        movingAveragePrice = 1 / movingAveragePrice;
        currentOutput = 1 / currentOutput;
      }

      const current_time = parseInt((new Date().getTime() / 1000).toFixed(0));

      const lastBatchTime = trade.lastExecuted;
      const timeBetweenBatches = trade.order.timeBwTrade;

      if (timeBetweenBatches <= current_time - lastBatchTime) {
        // console.log('time between trade is satisfied for', trade.id);
        let buyOutputOver =
          ((100 + Number(trade.order.percentChange)) / 100) *
          movingAveragePrice;

        console.log(
          `trade ${trade.id} is outputting ${currentOutput} currently and targeting ${buyOutputOver}`,
        );
        if (currentOutput >= buyOutputOver) {
          // Get swap call data
          const callData = await encodeInput(
            trade.order as SwapDataStruct,
            trade.signature,
          );
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
            else {
              try {
                axios.post(
                  'https://api.tenderly.co/api/v1/actions/6122a3e2-5cbd-43c4-bd10-08e88a504cdf/webhook',
                  { id: trade.id },
                  {
                    headers: {
                      'x-access-key': 'P0pOKtbaCwV2JffMLFpbdls3SowlmIj8',
                    },
                  },
                );
              } catch (e) {
                console.log('Error with web3action');
              }
            }
          } else {
            console.log(`trade simulation failed for trade ${trade.id}`);
          }
        }
      }
    });
  });
};

console.log('Continuous evaluation loop started');

setInterval(updateTrades, 15000);
