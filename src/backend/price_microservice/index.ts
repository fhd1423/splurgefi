import { config } from 'dotenv';
import axios, { AxiosResponse } from 'axios';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

config();

// Set global API & Client Instances
const supabase: SupabaseClient = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_API_KEY!,
);
const apiUrl: string = process.env.API_URL || '';
const apiKey: string = process.env.API_KEY || '';

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

      //const daily_prices = pair.daily_prices;

      const params = {
        sellToken: sellToken,
        buyToken: buyToken,
        sellAmount: '1000000000000000000', // Arbitrary, just trying to get exchange rate
      };

      const intervals = [15, 60, 240, 1440];

      let interval_columnName: string | null = null;
      let interval_columnValue: number;

      intervals.forEach((interval) => {
        if (isTimeInterval(interval)) {
          interval_columnName = `${interval}min_avg`;
        }
      });

      try {
        const response: AxiosResponse = await axios.get(apiUrl, {
          params,
          headers,
        });
        interval_columnValue = response.data.price;
        const daily_prices = interval_columnValue;
        console.log(daily_prices);

        if (interval_columnName != null) {
          let xmin_avg = pair[interval_columnName];
          if (xmin_avg.close_prices.length === 10) {
            xmin_avg.close_prices.shift();
          }
          xmin_avg.close_prices.push(interval_columnValue);

          const upsertData = {
            path: pair.path,
            ['daily_prices']: daily_prices,
            [interval_columnName]: xmin_avg,
          };

          const upsertResponse = await supabase
            .from('Pairs')
            .upsert([upsertData]);
          console.log('Upsert Response:', upsertResponse);
        } else {
          const upsertData = {
            path: pair.path,
            ['daily_prices']: daily_prices,
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
  const minutes = now.getMinutes();
  return minutes % intervalInMinutes === 0;
};

// Execution
const runContinuousUpdate = async () => {
  console.log('Continuous update loop started.');
  while (true) {
    await updatePriceData();
    await sleep(1000);
  }
};

runContinuousUpdate();

// Handling
process.on('SIGINT', async () => {
  console.log('Received SIGINT. Stopping the script gracefully.');
  process.exit(0);
});
