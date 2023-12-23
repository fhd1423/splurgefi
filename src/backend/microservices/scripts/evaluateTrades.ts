import axios from 'axios';
import { supabase } from '../utils/client';
import {
  encodeInput,
  simulateTrade,
  SwapDataStruct,
} from '../utils/encodingFunctions';

const activateAction = async (id: number) => {
  try {
    await axios.post(
      'https://api.tenderly.co/api/v1/actions/6122a3e2-5cbd-43c4-bd10-08e88a504cdf/webhook',
      { id },
      {
        headers: {
          'x-access-key': 'P0pOKtbaCwV2JffMLFpbdls3SowlmIj8',
        },
      },
    );
  } catch (e) {
    console.log('Error with web3action');
  }
};

const insertCalldata = async (calldata: string, id: number) => {
  await supabase
    .from('Trades')
    .update({
      ready: true,
      zero_x_call_data: calldata,
    })
    .eq('id', id);
};

const markFailedSimulation = async (id: number, count: number) => {
  await supabase
    .from('Trades')
    .update({
      failedSimulation: count,
    })
    .eq('id', id);
};

//Get Requested Pairs & recent PriceQueue from "Pairs" Table
const getPairs = async () => {
  let { data: Pairs, error } = await supabase.from('Pairs').select('*');
  return Pairs;
};

const getSortedTrades = async (path: string) => {
  let { data: Trades, error } = await supabase
    .from('Trades')
    .select('*')
    .eq('ready', 'false')
    .eq('complete', 'false')
    .eq('pair', path)
    .lte('failedSimulation', 5)
    .is('tradeStopped', false);

  if (error) console.log(error);
  return Trades;
};

const interateThroughTrades = async (
  trades: any[],
  pair: any,
  inverse = false,
) => {
  trades.forEach(async (trade) => {
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
    const current_time = parseInt((new Date().getTime() / 1000).toFixed(0));

    const lastBatchTime = trade.lastExecuted;
    const timeBetweenBatches = trade.order.timeBwTrade;
    let currentOutput = pair['current_price'];

    if (inverse) {
      movingAveragePrice = 1 / movingAveragePrice;
      currentOutput = 1 / currentOutput;
    }

    if (timeBetweenBatches <= current_time - lastBatchTime) {
      let buyOutputOver =
        ((100 + Number(trade.order.percentChange)) / 100) * movingAveragePrice;

      console.log(
        `trade ${trade.id} is outputting ${currentOutput} currently and targeting ${buyOutputOver}`,
      );
      if (currentOutput >= buyOutputOver) {
        const callData = await encodeInput(
          trade.order as SwapDataStruct,
          trade.signature,
        );
        if (await simulateTrade(callData)) {
          await insertCalldata(callData, trade.id);
          await activateAction(trade.id);
        } else {
          console.log(`trade simulation failed for trade ${trade.id}`);
          await markFailedSimulation(trade.id, trade.failedSimulation + 1);
        }
      }
    }
  });
};

const updateTrades = async () => {
  let pairs = await getPairs();
  if (!pairs) return;

  pairs.forEach(async (pair) => {
    // check regular pair
    let regularTrades = await getSortedTrades(pair.path);

    if (regularTrades && regularTrades.length > 0) {
      interateThroughTrades(regularTrades, pair);
    }

    const inversePath = `${pair.path.split('-')[1]}-${pair.path.split('-')[0]}`;
    let inverseTrades = await getSortedTrades(inversePath);

    if (inverseTrades && inverseTrades.length > 0) {
      interateThroughTrades(inverseTrades, pair, true);
    }
  });
};

console.log('Continuous evaluation loop started');
setInterval(updateTrades, 5000);
