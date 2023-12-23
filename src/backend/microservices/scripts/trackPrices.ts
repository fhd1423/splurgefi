import { config } from 'dotenv';
import axios, { AxiosResponse } from 'axios';
import { supabase } from '../utils/client';

config();

const apiUrl: string = 'https://api.geckoterminal.com/api/v2';
const WETH_ADDRESS = '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1';

// Get Requested Pairs & recent PriceQueue from "Pairs" Table
const getPairs = async () => {
  const { data: Pairs, error } = await supabase.from('Pairs').select('*');
  return Pairs;
};

// Construct PriceQueue
const updatePriceData = async () => {
  const pairs = await getPairs();
  if (!pairs) return;

  let pairString = [WETH_ADDRESS];
  const pairList = pairs.map((pair) => [pair.path.split('-')[1]]);
  pairString.push(pairList.join(','));

  const isInInterval = checkTime();
  interface PairPrices {
    [key: string]: number; // Assuming the value is a number. Adjust the type as necessary.
  }
  let pairPrices: PairPrices = {};

  try {
    const response = await axios.get(
      `${apiUrl}/simple/networks/arbitrum/token_price/${pairString}`,
    );
    let prices = response.data.data.attributes.token_prices;
    const ethPrice = prices[`${WETH_ADDRESS.toLowerCase()}`];

    for (let pair of pairList) {
      pairPrices[`${WETH_ADDRESS}-${pair}`] =
        (0.01 * Number(ethPrice)) /
        Number(prices[`${String(pair).toLowerCase()}`]);
    }
  } catch (e) {
    console.log(e);
  }
  if (isInInterval) {
    for (let pair of pairs) {
      const current_price = pairPrices[pair.path];
      let priceArr = [];
      try {
        priceArr = pair['5min_avg']['close_prices'];
      } catch (e) {
        // first time inserting
      }
      if (priceArr.length == 10) priceArr.shift(); // remove oldest price
      priceArr.push(pairPrices[pair.path]); // push new price

      const upsertData = {
        path: pair.path,
        ['current_price']: current_price,
        ['5min_avg']: { close_prices: priceArr },
        updated_at: new Date(),
      };

      let { data, error } = await supabase.from('Pairs').upsert([upsertData]);
      if (error) console.log('Error:', error);
    }
  } else {
    for (let pair of pairs) {
      const current_price = pairPrices[pair.path];
      const upsertData = {
        path: pair.path,
        ['current_price']: current_price,
        updated_at: new Date(),
      };

      let { data, error } = await supabase.from('Pairs').upsert([upsertData]);
      if (error) console.log('Error:', error);
    }
  }
};

function checkTime() {
  const now = new Date();
  const minutes = now.getUTCMinutes();
  const seconds = now.getUTCSeconds();

  const isWithinGracePeriod = (targetSeconds: number) =>
    Math.abs(seconds - targetSeconds) <= 5;

  const withinPeriod = isWithinGracePeriod(0);
  const is5Minutes = minutes % 5 === 0 && withinPeriod;

  if (is5Minutes) return true;
}

// must be called at a 10 second interval in order to fit the grace period of 5 seconds
function getNextIntervalTime() {
  const now = new Date();
  const seconds = now.getSeconds();
  const milliseconds = now.getMilliseconds();

  // Calculate how many milliseconds to next 10-second mark
  const secondsToNextInterval = 10 - (seconds % 10);
  const millisecondsToWait = secondsToNextInterval * 1000 - milliseconds;

  return millisecondsToWait;
}

async function executePeriodically() {
  await updatePriceData();
  setTimeout(executePeriodically, getNextIntervalTime()); // Schedule the next execution
}

console.log('Continuous evaluation loop started');
// wait till a 10 second interval, then continue calling every 10 seconds
const waitTime = getNextIntervalTime();
setTimeout(executePeriodically, waitTime);
