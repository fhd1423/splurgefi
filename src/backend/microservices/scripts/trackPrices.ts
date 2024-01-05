import axios from 'axios';
import { config } from 'dotenv';
import { supabase } from '../utils/client';

config();

const apiUrl: string = 'https://api.dexscreener.com';
const WETH_ADDRESS = '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1';

// Get Requested Pairs & recent PriceQueue from "Pairs" Table
const getPairs = async () => {
  const { data: Pairs, error } = await supabase.from('Pairs').select('*');
  return Pairs;
};

function chunkArray(array: string[], chunkSize: number) {
  const chunks = [];

  for (let i = 0; i < array.length; i += chunkSize) {
    const chunk = array.slice(i, i + chunkSize);
    chunks.push(chunk);
  }

  return chunks;
}

// Construct PriceQueue
const updatePriceData = async () => {
  const pairs = await getPairs();
  if (!pairs) return;

  const pairList = pairs.map((pair) => pair.path.split('-')[1]);
  const poolAddressList = pairs.map((pair) => pair.largestPool);
  let chunkedPools = chunkArray(poolAddressList as unknown as string[], 30);

  const isInInterval = checkTime();
  let wethPrice: string;

  try {
    const wethResponse = await axios.get(
      `${apiUrl}/latest/dex/tokens/${WETH_ADDRESS}`,
    );
    wethPrice = wethResponse.data.pairs[0].priceUsd;
  } catch (e) {
    console.error('error getting weth price');
  }

  let allresponses = [];
  for (const chunk of chunkedPools) {
    const poolString = chunk.join(',');
    allresponses.push(
      axios.get(`${apiUrl}/latest/dex/pairs/arbitrum/${poolString}`),
    );
    //console.log(`${apiUrl}/latest/dex/pairs/arbitrum/${poolString}`);
  }

  const results = await Promise.all(allresponses);

  let filteredPrices: { [key: string]: number } = {};

  results.forEach((response) => {
    const priceDatas = response.data.pairs;

    let pairsTracked = new Set();

    priceDatas.forEach((pair: any) => {
      if (!pairsTracked.has(pair.baseToken.address)) {
        pairsTracked.add(pair.baseToken.address);
        filteredPrices[pair.baseToken.address] = pair.priceUsd;
      }
    });
  });

  let pairPrices: { [key: string]: number } = {};
  pairList.map(
    (pair) =>
      (pairPrices[`${WETH_ADDRESS}-${pair}`] =
        (0.01 * Number(wethPrice)) / Number(filteredPrices[pair])),
  );

  //console.log(pairPrices);
  if (isInInterval) {
    for (let pair of pairs) {
      const current_price = pairPrices[pair.path];
      let priceArr = [];
      try {
        priceArr = pair['15min_avg']['close_prices'];
      } catch (e) {
        // first time inserting
      }
      if (priceArr.length == 10) priceArr.shift(); // remove oldest price
      priceArr.push(pairPrices[pair.path]); // push new price

      const upsertData = {
        path: pair.path,
        ['current_price']: current_price,
        ['15min_avg']: { close_prices: priceArr },
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
  const is15Minutes = minutes % 15 === 0 && withinPeriod;

  if (is15Minutes) return true;
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
