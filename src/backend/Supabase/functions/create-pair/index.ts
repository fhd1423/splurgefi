// import axios from 'npm:axios';
// import ky from 'https://cdn.skypack.dev/ky?dts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.1';
import { corsHeaders } from '../_shared/cors.ts';

// Supabase client initialization
const supabase = createClient(
  'https://gmupexxqnzrrzozcovjp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtdXBleHhxbnpycnpvemNvdmpwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcwMTQ2MjU5NCwiZXhwIjoyMDE3MDM4NTk0fQ.YFvIg4OtlNGRr-AmSGn0fCOmEJm1JxQmKl7GX_y5-wY',
);

const apiUrl = 'https://api.geckoterminal.com/api/v2';
const WETH_ADDRESS = '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1';

// Function to get the largest pool address
const getLargestPoolAddress = async (tokenAddress: string) => {
  const response = await fetch(
    `${apiUrl}/networks/arbitrum/tokens/${tokenAddress}/pools`,
  );
  const data = await response.json();
  return data.data[0].attributes.address;
};

// Function to get prices
const getPrices = async (poolAddress: string) => {
  const currentTime = Math.floor(new Date().getTime() / 1000);
  const response = await fetch(
    `${apiUrl}/networks/arbitrum/pools/${poolAddress}/ohlcv/minute?aggregate=5&before_timestamp=${currentTime}&limit=10`,
  );
  const data = await response.json();
  return data.data.attributes.ohlcv_list.map((ohlcv: any) => [ohlcv[4]]);
};

const getCurrentPrice = async (tokenAddress: string) => {
  const apiUrl: string = 'https://api.geckoterminal.com/api/v2';
  const WETH_ADDRESS = '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1';

  let pairString = `${WETH_ADDRESS},${tokenAddress}`;

  let response;

  try {
    response = await fetch(
      `${apiUrl}/simple/networks/arbitrum/token_price/${pairString}`,
    );
    response = await response.json();
  } catch (e) {
    console.log('Error with geckoterminal');
    return;
  }
  let prices = response.data.attributes.token_prices;
  const ethPrice = prices[`${WETH_ADDRESS.toLowerCase()}`];
  const tokenPrice = prices[`${tokenAddress.toLowerCase()}`];

  const currentRatio = (0.01 * ethPrice) / tokenPrice;
  return currentRatio;
};

// Function to calculate the average price
const getFiveMinAvg = (priceData: number[]): number => {
  const total = priceData.reduce((acc, price) => acc + Number(price), 0);
  return total / priceData.length;
};

// Main function to process data
async function main(
  tokenAddress: string,
  tokenName: string,
  wethAddress: string,
) {
  const coinPoolAddress = await getLargestPoolAddress(tokenAddress);
  const coinPrices = await getPrices(coinPoolAddress);

  const ethPoolAddress = await getLargestPoolAddress(wethAddress);
  const ethPrices = await getPrices(ethPoolAddress);

  const ratioPrices = coinPrices.map(
    (_: number, index: number) => (0.01 * ethPrices[index]) / coinPrices[index],
  );

  const upsertData = {
    path: `${wethAddress}-${tokenAddress}`,
    ['5min_avg']: { close_prices: ratioPrices },
    updated_at: new Date(),
    tokenName,
  };

  let { data, error } = await supabase.from('Pairs').upsert([upsertData]);

  const avgRatio = await getFiveMinAvg(ratioPrices);
  return avgRatio;
}

// Deno server to handle requests
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  let responseData, status;
  try {
    const { tokenAddress, tokenName } = await req.json();
    const currentPrice = await getCurrentPrice(tokenAddress);
    const { data: existingPairs } = await supabase
      .from('Pairs')
      .select()
      .eq('path', `${WETH_ADDRESS}-${tokenAddress}`);

    if (existingPairs && existingPairs.length > 0) {
      const existingPrices = existingPairs[0]['5min_avg']['close_prices'];
      const existingAvg = getFiveMinAvg(existingPrices);

      responseData = {
        message: `Pair already exists for ${tokenName}`,
        avgPrice: existingAvg,
        currentPrice,
      };
      status = 200;
    } else {
      const avgPrice = await main(tokenAddress, tokenName, WETH_ADDRESS);
      responseData = {
        message: `Inserted new Pair for ${tokenName}`,
        avgPrice,
        currentPrice,
      };
      status = 200;
    }
  } catch (e) {
    let errorMessage = 'Unknown error occurred';
    if (e instanceof Error) {
      errorMessage = e.message;
    }
    responseData = {
      message: `Error processing request: ${errorMessage}`,
    };
    status = 500; // Internal Server Error
  }

  return new Response(JSON.stringify(responseData), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: status,
  });
});

// To invoke:
// curl -L -X POST 'https://gmupexxqnzrrzozcovjp.supabase.co/functions/v1/create-pair' -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtdXBleHhxbnpycnpvemNvdmpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDE0NjI1OTQsImV4cCI6MjAxNzAzODU5NH0.rBzk_etmt7NYB2Pzvn5TwAKvZhFjMRS-JPcP_2JtMeI' --data '{"name":"Functions"}'

// endpoint: https://gmupexxqnzrrzozcovjp.supabase.co/functions/v1/create-pair
