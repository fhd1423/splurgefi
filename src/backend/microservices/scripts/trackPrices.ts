import { config } from 'dotenv';
import axios, { AxiosResponse } from 'axios';
import { supabase } from '../utils/client';

config();

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

      //const current_price = pair.current_price;

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
        const current_price = interval_columnValue;
        console.log(current_price);

        if (interval_columnName != null) {
          let xmin_avg = pair[interval_columnName];
          if (xmin_avg.close_prices.length === 10) {
            xmin_avg.close_prices.shift();
          }
          xmin_avg.close_prices.push(interval_columnValue);

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
