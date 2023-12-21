import axios from 'axios';

// JSON response format
interface CoinPriceResponse {
  coins: {
    [key: string]: {
      decimals: number;
      symbol: string;
      price: number;
      timestamp: number;
      confidence: number;
    };
  };
}

// Format: /prices/historical/{timestamp}/{coins}
const apiUrl: string = 'https://coins.llama.fi/prices/historical/';

const getHistoricalPriceData = async () => {
  const currentTimestampInSeconds = Math.floor(new Date().getTime() / 1000);
  const timestamp = currentTimestampInSeconds - 50 * 60; // UNIX timestamp of 50 mins ago
  const coins = 'arbitrum:0x82af49447d8a07e3bd95bd0d56f35241523fbab1'; // WETH on Arbitrum chain
  const increment = 5 * 60;

  try {
    const priceDataPromises = Array.from(
      {
        length: Math.ceil((currentTimestampInSeconds - timestamp) / increment),
      },
      (_, index) =>
        axios
          .get(`${apiUrl}${timestamp + index * increment}/${coins}`)
          .then(
            (response) =>
              (response.data as CoinPriceResponse).coins[coins].price,
          ),
    );

    const priceData = await Promise.all(priceDataPromises);
    return priceData;
  } catch (error) {
    console.error('Error fetching historical price data:', error);
    throw error;
  }
};

const getFiveMinAvg = async (priceData: number[]): Promise<number> => {
  const total = priceData.reduce((acc, price) => acc + price, 0);
  return total / priceData.length;
};

getHistoricalPriceData()
  .then((priceData) => {
    console.log('Price Data:', priceData);
    return getFiveMinAvg(priceData);
  })
  .then((avg) => {
    console.log('5 min average:', avg);
  })
  .catch((error) => console.error(error));
