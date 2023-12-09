import { config } from 'dotenv';
import axios, { AxiosResponse } from 'axios';
import { supabase } from '../utils/client';

config();

const apiUrl: string = 'https://arbitrum.api.0x.org/swap/v1/price?';
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
    const intervals = checkTime();
    for (let i = 0; i < pairs.length; i++) {
      const pair = pairs[i];
      const splitPair = pair.path.split('-');
      const sellToken = splitPair[0];
      const buyToken = splitPair[1];

      const params = {
        sellToken,
        buyToken,
        sellAmount: 0.01 * 10 ** 18, // TODO: add decimal logic
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
      const current_price = (response.data.buyAmount / 10 ** 18).toFixed(4); // TODO: add decimal logic
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

  const withinPeriod = isWithinGracePeriod(0);
  const zeroMinutes = minutes === 0;
  const is15Minutes = minutes % 15 === 0 && withinPeriod;
  const is1Hours = hours % 1 === 0 && zeroMinutes && withinPeriod;
  const is4Hours = hours % 4 === 0 && zeroMinutes && withinPeriod;
  const is24Hours = hours === 0 && zeroMinutes && withinPeriod;

  if (is15Minutes) intervals.push(`15min_avg`);
  if (is1Hours) intervals.push(`60min_avg`); // 8 hours in minutes
  if (is4Hours) intervals.push(`${4 * 60}min_avg`); // 4 hours in minutes
  if (is24Hours) intervals.push(`${24 * 60}min_avg`); // 24 hours in minutes

  return intervals;
}

// must be called at a 15 second interval in order to fit the grace period of 5 seconds
function getNextIntervalTime() {
  const now = new Date();
  const seconds = now.getSeconds();
  const milliseconds = now.getMilliseconds();

  // Calculate how many milliseconds to next 60-second mark
  const secondsToNextInterval = 60 - (seconds % 60);
  const millisecondsToWait = secondsToNextInterval * 1000 - milliseconds;

  return millisecondsToWait;
}

async function executePeriodically() {
  await updatePriceData();
  setTimeout(executePeriodically, getNextIntervalTime()); // Schedule the next execution
}

console.log('Continuous evaluation loop started');
// wait till a 60 second interval, then continue calling every 60 seconds
const waitTime = getNextIntervalTime();
setTimeout(executePeriodically, waitTime);
