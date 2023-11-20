const axios = require('axios');
const { ethers } = require('ethers');

const Splurge_ABI = [
  'function transformERC20(address,address,uint256,uint256,(uint32, bytes)[]) public',
];

import PriceQueue from './PriceQueue';
import chunk from './utils';

const priceQueues: Map<string, PriceQueue> = new Map();

const pairs = [
  {
    input: '0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889',
    output: '0xa0a6c157871A9F38253234BBfD2B8D79F9e9FCDC',
  },
];

const splurgeAddy = '0xf1523fcd98490383d079f5822590629c154cfacf';
const splurgeContract = new ethers.Contract(splurgeAddy, Splurge_ABI);

for (const pair of pairs) {
  const key = `${pair.input}:${pair.output}`;
  priceQueues.set(key, new PriceQueue());
}

const apiKey = '0631b1fa-5205-42d3-89ef-c4e8ea3538fe';

async function fetchPrice(pair: {
  input: string;
  output: string;
}): Promise<void> {
  const url = `https://mumbai.api.0x.org/swap/v1/quote?buyToken=${pair.output}&sellToken=${pair.input}&sellAmount=100000`;
  const headers = { '0x-api-key': apiKey };

  try {
    const response = await axios.get(url, { headers });
    console.log(
      `Price for ${pair.input}:${pair.output} is ${response.data.price}`,
      Date(),
    );

    let ZeroExCalldata = splurgeContract.interface.decodeFunctionData(
      'transformERC20',
      response.data.data,
    );

    console.log(ZeroExCalldata);

    const key = `${pair.input}:${pair.output}`;
    const priceQueue = priceQueues.get(key);
    if (priceQueue) {
      priceQueue.addPrice(response.data.price);
      const meanPrice = priceQueue.mean();
      if (meanPrice !== null) {
        console.log(`Mean for ${key}: ${meanPrice}`);
      }
    } else {
      console.error(`No PriceQueue found for ${key}`);
    }
  } catch (error) {
    console.log(error);
    //console.error(`Fetch failed for ${pair.input}:${pair.output}`);
  }
}

async function staggeredQuery(pairs: { input: string; output: string }[]) {
  const chunkedPairs = chunk(pairs, 3); // Chunk pairs into groups of 3
  chunkedPairs.forEach((chunk, index) => {
    setTimeout(() => {
      setInterval(async () => {
        const fetchPromises = chunk.map((pair) => fetchPrice(pair));
        await Promise.all(fetchPromises);
      }, 3000); // Fetch every 10 seconds
    }, index * 1000); // stagger by 1 second
  });
}

staggeredQuery(pairs);
