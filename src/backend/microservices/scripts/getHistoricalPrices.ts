import axios from 'axios';
import { supabase } from '../utils/client';

const apiUrl = 'https://api.geckoterminal.com/api/v2';

const getLargestPoolAddress = async (tokenAddress: string) => {
  let response = await axios.get(
    `${apiUrl}/networks/arbitrum/tokens/${tokenAddress}/pools`,
  );

  return response.data.data[0].attributes.address;
};

const getPrices = async (poolAddress: string) => {
  const currentTime = Math.floor(new Date().getTime() / 1000);
  let response = await axios.get(
    `${apiUrl}/networks/arbitrum/pools/${poolAddress}/ohlcv/minute?aggregate=5&before_timestamp=${currentTime}&limit=10`,
  );

  const coinPricesUSD = response.data.data.attributes.ohlcv_list.map(
    (ohlcv: any) => [ohlcv[4]],
  );
  return coinPricesUSD;
};

const getFiveMinAvg = (priceData: number[]): number => {
  const total = priceData.reduce((acc, price) => acc + Number(price), 0);
  return total / priceData.length;
};

async function main(tokenAddress: string, wethAddress: string) {
  const { data: existingPairs } = await supabase
    .from('Pairs')
    .select('*')
    .eq('path', `${wethAddress}-${tokenAddress}`);

  if (existingPairs && existingPairs.length > 0) {
    const existingPrices = existingPairs[0][`5min_avg`]['close_prices'];
    const existingAvg = getFiveMinAvg(existingPrices);
    console.log('existing', existingAvg);
  }
  const coinPoolAddress = await getLargestPoolAddress(tokenAddress);
  const coinPrices = await getPrices(coinPoolAddress);

  const ethPoolAddress = await getLargestPoolAddress(wethAddress);
  const ethPrices = await getPrices(ethPoolAddress);

  const ratioPrices = coinPrices.map(
    (price: number, index: number) =>
      (0.01 * ethPrices[index]) / coinPrices[index],
  );

  const upsertData = {
    path: `${wethAddress}-${tokenAddress}`,
    ['5min_avg']: { close_prices: ratioPrices },
    updated_at: new Date(),
    tokenName: 'OMNI',
  };

  let { data, error } = await supabase.from('Pairs').upsert([upsertData]);

  const avgRatio = await getFiveMinAvg(ratioPrices);
  console.log(avgRatio);
}

main(
  '0xBFb01b32e6b2d6D724821753d3230B4F5D14054b',
  '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
);
