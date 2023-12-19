import { config } from 'dotenv';
import axios, { AxiosResponse } from 'axios';
import { supabase } from '../utils/client';

config();

const apiUrl: string = 'https://apiv5.paraswap.io/prices/';

// Get Requested Pairs & recent PriceQueue from "Pairs" Table
const getPairs = async () => {
  const { data: Pairs, error } = await supabase.from('Pairs').select('*');
  return Pairs;
};

// Construct PriceQueue
const updatePriceData = async () => {
  const pairs = await getPairs();

  if (pairs) {
    const intervals = checkTime();
    for (let i = 0; i < pairs.length; i++) {
      const pair = pairs[i];
      const splitPair = pair.path.split('-');
      const srcToken = splitPair[0];
      const destToken = splitPair[1];

      const params = {
        srcToken,
        destToken,
        amount: 0.01 * 10 ** 18,
        srcDecimals: 18,
        destDecimals: 18,
        side: 'SELL',
        network: 42161, //arbitrum
      };

      let response;
      try {
        response = await axios.get(apiUrl, { params });
      } catch (e) {
        console.log(`error with Kyberswap for ${pair.path}`);
      }

      if (!response) return;
      let current_price = Number(
        response.data.priceRoute.destAmount / 10 ** 18,
      ).toFixed(4);

      // console.log(`current price for ${pair.path} is ${current_price}`);

      let executed = false;

      for (let interval of intervals) {
        let priceArr = [];
        try {
          priceArr = pair[interval]['close_prices'];
        } catch (e) {
          // first time inserting
        }

        if (priceArr.length == 10) priceArr.shift(); // remove oldest price
        priceArr.push(current_price); // push new price

        const upsertData = {
          path: pair.path,
          ['current_price']: current_price,
          [interval]: { close_prices: priceArr },
          updated_at: new Date(),
        };

        let { data, error } = await supabase.from('Pairs').upsert([upsertData]);
        executed = true;
        if (error) console.log('Error:', error);
      }
      if (!executed) {
        const upsertData = {
          path: pair.path,
          ['current_price']: current_price,
          updated_at: new Date(),
        };
        let { data, error } = await supabase.from('Pairs').upsert([upsertData]);
        if (error) console.log('Error:', error);
      }
    }
  }
};

// Utility Functions
const sleep = (delay: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, delay));

function checkTime() {
  const now = new Date();
  const hours = now.getUTCHours();
  const minutes = now.getUTCMinutes();
  const seconds = now.getUTCSeconds();

  const isWithinGracePeriod = (targetSeconds: number) =>
    Math.abs(seconds - targetSeconds) <= 5;

  let intervals: string[] = [];

  const withinPeriod = isWithinGracePeriod(0);
  const zeroMinutes = minutes === 0;
  const is5Minutes = minutes % 5 === 0 && withinPeriod;
  const is15Minutes = minutes % 15 === 0 && withinPeriod;
  const is1Hours = hours % 1 === 0 && zeroMinutes && withinPeriod;
  const is4Hours = hours % 4 === 0 && zeroMinutes && withinPeriod;
  const is24Hours = hours === 0 && zeroMinutes && withinPeriod;

  if (is5Minutes) intervals.push(`5min_avg`);
  if (is15Minutes) intervals.push(`15min_avg`);
  if (is1Hours) intervals.push(`60min_avg`); // 8 hours in minutes
  if (is4Hours) intervals.push(`${4 * 60}min_avg`); // 4 hours in minutes
  if (is24Hours) intervals.push(`${24 * 60}min_avg`); // 24 hours in minutes

  return intervals;
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
