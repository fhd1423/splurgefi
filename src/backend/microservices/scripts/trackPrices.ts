import { config } from 'dotenv';
import axios, { AxiosResponse } from 'axios';
import { supabase } from '../utils/client';

config();

const apiUrl: string = 'https://mumbai.api.0x.org/swap/v1/quote?';
const apiKey: string = '0631b1fa-5205-42d3-89ef-c4e8ea3538fe';

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
      console.log(`current price for ${pair.path} is ${current_price}`);

      const intervals = checkTime();

      for (let interval of intervals) {
        let newPrices = pair[interval]['close_prices'];

        if (pair[interval]['close_prices'].length == 10) newPrices.shift(); // remove oldest price
        newPrices.push(current_price); // push new price

        const upsertData = {
          path: pair.path,
          ['current_price']: current_price,
          [interval]: { close_prices: newPrices },
        };

        try {
          await supabase.from('Pairs').upsert([upsertData]);
        } catch (e) {
          console.error('error upserting to ${interval}');
        }
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
  const is4Hours = hours % 4 === 0 && minutes === 0 && isWithinGracePeriod(0);
  const is8Hours = hours % 8 === 0 && minutes === 0 && isWithinGracePeriod(0);
  const is24Hours = hours === 0 && minutes === 0 && isWithinGracePeriod(0);

  if (is15Minutes) intervals.push(`15min_avg`);
  if (is4Hours) intervals.push(`${4 * 60}min_avg`); // 4 hours in minutes
  if (is8Hours) intervals.push(`${8 * 60}min_avg`); // 8 hours in minutes
  if (is24Hours) intervals.push(`${12 * 60}min_avg`); // 24 hours in minutes

  return intervals;
}

// Execution
console.log('Continuous evaluation loop started');
setInterval(updatePriceData, 15000);
