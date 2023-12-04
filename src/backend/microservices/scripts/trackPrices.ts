import { config } from 'dotenv';
import axios, { AxiosResponse } from 'axios';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '../utils/client';

config();

const apiUrl: string = 'https://mumbai.api.0x.org/swap/v1/quote?';
const apiKey: string = process.env.OX_API_KEY || '';

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

      //const current_price = pair.current_price;

      let input_decimals = pair.input_decimals;

      if (!input_decimals) {
        input_decimals = 18;
      }

      const params = {
        sellToken: sellToken,
        buyToken: buyToken,
        sellAmount: 10 ** input_decimals, // Arbitrary, just trying to get exchange rate
      };

      const intervals = [15, 60, 240, 1440];

      let interval_columnName: string | null = null;
      let interval_columnValue: number;

      for (let i = 0; i < intervals.length; i++) {
        const interval = intervals[i];

        if (isTimeInterval(interval)) {
          interval_columnName = `${interval}min_avg`;
          break;
        }
      }

      try {
        const response: AxiosResponse = await axios.get(apiUrl, {
          params,
          headers,
        });
        const current_price = response.data.price;
        console.log(current_price);

        if (interval_columnName != null) {
          let xmin_avg = pair.interval_columnName;
          if (xmin_avg.close_prices.length === 10) {
            xmin_avg.close_prices.shift();
          }
          xmin_avg.close_prices.push(current_price);

          const upsertData = {
            path: pair.path,
            ['current_price']: current_price,
            [interval_columnName]: xmin_avg,
          };

          const upsertResponse = await supabase
            .from('Pairs')
            .upsert([upsertData]);
          console.log('Upsert Response:', upsertResponse);
        } else {
          const upsertData = {
            path: pair.path,
            ['current_price']: current_price,
          };

          const upsertResponse = await supabase
            .from('Pairs')
            .upsert([upsertData]);
          console.log('Upsert Response:', upsertResponse);
        }
      } catch (error) {
        console.error('Error:', (error as Error).message);
      }

      await sleep(1000);
    }
  }
};

// Utility Functions
const sleep = (delay: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, delay));

// Margin of error is 1 minute
const isTimeInterval = (intervalInMinutes: number): boolean => {
  const now = new Date();
  console.log(now);
  const minutes = now.getMinutes();
  console.log(minutes);
  // const minutes = 15;
  return minutes % intervalInMinutes === 0;
};

// Execution
console.log('Continuous evaluation loop started');

setInterval(updatePriceData, 15000);
