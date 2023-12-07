import { config } from 'dotenv';
import axios, { AxiosResponse } from 'axios';
import { supabase } from '../utils/client';

config();

const apiUrl: string = 'https://arbitrum.api.0x.org/swap/v1/quote?';
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
        sellAmount: 0.01 * 10 ** pair.decimals || 0.01 * 10 ** 18, // Arbitrary, just trying to get exchange rate
      };

      let response;
      try {
        response = await axios.get(apiUrl, {
          params,
          headers,
        });
      } catch (e) {
        console.log('Error with 0x:');
      }

      if (!response) return;
      const current_price = response.data.buyAmount;
      console.log(`current price for ${pair.path} is ${current_price}`);

      const intervals = checkTime();

      let executed = false;
      for (let interval of intervals) {
        let priceArr;
        try {
          priceArr = pair[interval]['close_prices'];
        } catch (e) {
          // when the pair interval data is empty
          priceArr = [current_price];
        }

        if (priceArr.length == 10) priceArr.shift(); // remove oldest price
        priceArr.push(current_price); // push new price

        const upsertData = {
          path: pair.path,
          ['current_price']: current_price,
          [interval]: { close_prices: priceArr },
        };

        let { data, error } = await supabase.from('Pairs').upsert([upsertData]);
        executed = true;
        if (error) console.log('Error:', error);
        else console.log(`upserting price data for ${interval}`);
      }
      if (!executed) {
        const upsertData = {
          path: pair.path,
          ['current_price']: current_price,
        };
        let { data, error } = await supabase.from('Pairs').upsert([upsertData]);
        if (error) console.log('Error:', error);
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

let lastExecutionTime = Date.now(); // Record the time when the script starts

function executePeriodically() {
  const now = Date.now(); // Current time
  updatePriceData(); // Execute your function

  const timeTaken = Date.now() - now; // Calculate the time taken to execute updatePriceData
  const nextExecutionTime = Math.max(0, 15000 - timeTaken); // Calculate the time for the next execution

  lastExecutionTime = Date.now(); // Update the last execution time after updatePriceData has executed
  setTimeout(executePeriodically, nextExecutionTime); // Schedule the next execution
}

console.log('Continuous evaluation loop started');
// wait till a 15 second interval, then continue calling every 15 seconds
const waitTime = getNextIntervalTime();
setTimeout(executePeriodically, waitTime);
