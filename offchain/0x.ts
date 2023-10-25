const axios = require("axios");
import PriceQueue from "./PriceQueue";
import chunk from "./utils";

const priceQueues: Map<string, PriceQueue> = new Map();

const pairs = [
  {
    input: "0xbcdCB26fFec1bE5991FA4b5aF5B2BbC878965Db1",
    output: "0xFA75399b5ce8C0299B0434E0D1bcFDFd8fF8a755",
  },
  {
    input: "0xFA75399b5ce8C0299B0434E0D1bcFDFd8fF8a755",
    output: "0xbcdCB26fFec1bE5991FA4b5aF5B2BbC878965Db1",
  },
  {
    input: "0x50dbE194eC396E22A0796919C048323D6086E79D",
    output: "0xF83Efca7dd4a646C288aC30A8F761383DCFF5306",
  },
  {
    input: "0xF83Efca7dd4a646C288aC30A8F761383DCFF5306",
    output: "0x50dbE194eC396E22A0796919C048323D6086E79D",
  },
  {
    input: "0x193842E186561260DC49Bd1f5981bfDED1BD672D",
    output: "0x58c330A4f6e783779a6d1A904555E9E5375d0255",
  },
  {
    input: "0x58c330A4f6e783779a6d1A904555E9E5375d0255",
    output: "0x193842E186561260DC49Bd1f5981bfDED1BD672D",
  },
];

for (const pair of pairs) {
  const key = `${pair.input}:${pair.output}`;
  priceQueues.set(key, new PriceQueue());
}

const apiKey = "0631b1fa-5205-42d3-89ef-c4e8ea3538fe";

async function fetchPrice(pair: {
  input: string;
  output: string;
}): Promise<void> {
  const url = `https://mumbai.api.0x.org/swap/v1/quote?buyToken=${pair.output}&sellToken=${pair.input}&sellAmount=100000`;
  const headers = { "0x-api-key": apiKey };

  try {
    const response = await axios.get(url, { headers });
    console.log(
      `Price for ${pair.input}:${pair.output} is ${response.data.price}`,
      Date()
    );

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
    console.error(`Fetch failed for ${pair.input}:${pair.output}`);
  }
}

async function staggeredQuery(pairs: { input: string; output: string }[]) {
  const chunkedPairs = chunk(pairs, 3); // Chunk pairs into groups of 3
  chunkedPairs.forEach((chunk, index) => {
    setTimeout(() => {
      setInterval(async () => {
        const fetchPromises = chunk.map((pair) => fetchPrice(pair));
        await Promise.all(fetchPromises);
      }, 10000); // Fetch every 10 seconds
    }, index * 1000); // stagger by 1 second
  });
}

staggeredQuery(pairs);
