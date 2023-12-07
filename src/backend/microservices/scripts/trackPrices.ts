import { config } from 'dotenv';
import axios, { AxiosResponse } from 'axios';
import { supabase } from '../utils/client';

config();

const apiUrl: string = 'https://mumbai.api.0x.org/swap/v1/quote?';
const apiKey: string = '47e88863-d00f-4e4f-bfe0-10b124369789';

const headers = {
  '0x-api-key': apiKey,
};

// Get Requested Pairs & recent PriceQueue from "Pairs" Table
const getPairs = async () => {
  const { data: Pairs, error } = await supabase.from('Pairs').select('*');
  return Pairs;
};

// Construct PriceQueue
const updatePriceData = async () => {
  const pairs = await getPairs();

  if (pairs) {
    for (let i = 0; i < pairs.length; i++) {
      const pair = pairs[i];
      const splitPair = pair.path.split('-');
      const sellToken = splitPair[0];
      const buyToken = splitPair[1];

      const params = {
        sellToken: sellToken,
        buyToken: buyToken,
        sellAmount: pair.decimals || 10 ** 18, // Arbitrary, just trying to get exchange rate
      };

      const response: AxiosResponse = await axios.get(apiUrl, {
        params,
        headers,
      });

      const current_price = response.data.price;
      // console.log(`current price for ${pair.path} is ${current_price}`);

      const intervals = checkTime();

      let executed = false;
      for (let interval of intervals) {
        let newPrices = pair[interval]['close_prices'];

        if (pair[interval]['close_prices'].length == 10) newPrices.shift(); // remove oldest price
        newPrices.push(current_price); // push new price

        const upsertData = {
          path: pair.path,
          ['current_price']: current_price,
          [interval]: { close_prices: newPrices },
        };

        await supabase.from('Pairs').upsert([upsertData]);
        executed = true;
        console.log(`upserting price data for ${interval}`);
      }
      if (!executed) {
        const upsertData = {
          path: pair.path,
          ['current_price']: current_price,
        };
        await supabase.from('Pairs').upsert([upsertData]);
      }

      await sleep(1000);
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

  const is15Minutes = minutes % 15 === 0 && isWithinGracePeriod(0);
  const is1Hours = hours % 1 === 0 && minutes === 0 && isWithinGracePeriod(0);
  const is4Hours = hours % 4 === 0 && minutes === 0 && isWithinGracePeriod(0);
  const is24Hours = hours === 0 && minutes === 0 && isWithinGracePeriod(0);

  if (is15Minutes) intervals.push(`15min_avg`);
  if (is1Hours) intervals.push(`60min_avg`); // 8 hours in minutes
  if (is4Hours) intervals.push(`${4 * 60}min_avg`); // 4 hours in minutes
  if (is24Hours) intervals.push(`${12 * 60}min_avg`); // 24 hours in minutes

  return intervals;
}

// must be called at a 15 second interval in order to fit the grace period of 5 seconds
function getNextIntervalTime() {
  const now = new Date();
  const seconds = now.getSeconds();
  const milliseconds = now.getMilliseconds();

  // Calculate how many milliseconds to next 15-second mark
  const secondsToNextInterval = 15 - (seconds % 15);
  const millisecondsToWait = secondsToNextInterval * 1000 - milliseconds;

  return millisecondsToWait;
}

console.log('Continuous evaluation loop started');
// wait till a 15 second interval, then continue calling every 15 seconds
const waitTime = getNextIntervalTime();
setTimeout(() => {
  setInterval(updatePriceData, 15000);
}, waitTime);
