import axios from 'npm:axios';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.1';

const supabase = createClient(
  'https://gmupexxqnzrrzozcovjp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtdXBleHhxbnpycnpvemNvdmpwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcwMTQ2MjU5NCwiZXhwIjoyMDE3MDM4NTk0fQ.YFvIg4OtlNGRr-AmSGn0fCOmEJm1JxQmKl7GX_y5-wY',
);

const apiUrl = 'https://api.geckoterminal.com/api/v2';

const getLargestPoolAddress = async (tokenAddress: string) => {
  const response = await axios.get(
    `${apiUrl}/networks/arbitrum/tokens/${tokenAddress}/pools`,
  );

  return response.data.data[0].attributes.address;
};

const getPrices = async (poolAddress: string) => {
  const currentTime = Math.floor(new Date().getTime() / 1000);
  const response = await axios.get(
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
    path: `${tokenAddress}-${wethAddress}`,
    ['5min_avg']: { close_prices: ratioPrices },
    updated_at: new Date(),
    tokenName,
  };

  let { data, error } = await supabase.from('Pairs').upsert([upsertData]);

  const avgRatio = await getFiveMinAvg(ratioPrices);
  return avgRatio;
}

Deno.serve(async (req) => {
  const { tokenAddress, tokenName } = await req.json();

  let data;
  try {
    const avgPrice = await main(
      tokenAddress,
      tokenName,
      '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    );
    data = {
      message: `Inserted new Pair for ${tokenName}`,
      avgPrice,
    };
  } catch (e) {
    data = {
      message: `Error inserting new pair for ${tokenName}!`,
    };
  }

  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
});

// To invoke:
// curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/' \
//  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
//   --header 'Content-Type: application/json' \
//   --data '{"name":"Functions"}'
