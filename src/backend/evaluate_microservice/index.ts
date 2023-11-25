const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
import { ethers, JsonRpcProvider, Contract } from 'ethers';
import { Address, decodeFunctionData, encodeFunctionData } from 'viem';
import ExAbi from './zeroexabi';
import splurgeAbi from './splurgeAbi';

//Set global API & Client Instances
const supabase = createClient(
  'https://gmupexxqnzrrzozcovjp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtdXBleHhxbnpycnpvemNvdmpwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY5OTIxOTEyNywiZXhwIjoyMDE0Nzk1MTI3fQ.iF0xiz-vE5tx52u4soGJbEtGHtIB_EyQFFU_eB5dVak',
);
const WETH = '0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889'; //wmatic for now

type TransformERC20 = [
  string, // First address
  string, // Second address
  bigint, // First big integer
  bigint, // Second big integer
  Array<{
    deploymentNonce: number;
    data: string;
  }>,
];

type SwapDataStruct = {
  inputTokenAddress: Address;
  outputTokenAddress: Address;
  recipient: Address;
  amount: number;
  tranches: number;
  percentChange: number;
  priceAvg: number;
  deadline: number;
  timeBwTrade: number;
  slippage: number;
  salt: number;
};
async function fetchQuote(
  pair: {
    input: string;
    output: string;
    amount: string;
  },
  apiKey: string,
  apiUrl: string,
) {
  const url = `${apiUrl}buyToken=${pair.output}&sellToken=${pair.input}&sellAmount=${pair.amount}`;
  const headers = { '0x-api-key': apiKey };
  const response = await axios.get(url, { headers });

  return response.data;
}

async function generateZeroExStruct(
  inputTokenAddress: Address,
  outputTokenAddress: Address,
  trancheToSell: number,
) {
  const res = await fetchQuote(
    {
      input: inputTokenAddress,
      output: outputTokenAddress,
      amount: String(trancheToSell),
    },
    '0631b1fa-5205-42d3-89ef-c4e8ea3538fe',
    'https://mumbai.api.0x.org/swap/v1/quote?',
  );

  const typedArgs = decodeFunctionData({
    abi: ExAbi,
    data: res.data,
  }).args as TransformERC20;

  const object = typedArgs[4].map(({ deploymentNonce, data }) => [
    deploymentNonce,
    data,
  ]);

  return [typedArgs[3], object]; // (uint256,(uint32, bytes)[])
}

const encodeInput = async (SwapData: SwapDataStruct, signature: string) => {
  const splurgeOrderStruct = [
    SwapData.inputTokenAddress, // inputTokenAddy
    SwapData.outputTokenAddress, // outputTokenAddy
    SwapData.recipient, // recipient
    BigInt(SwapData.amount), // amount
    BigInt(SwapData.tranches), // tranches
    BigInt(SwapData.percentChange), // percent change
    BigInt(SwapData.priceAvg), // priceAvg
    BigInt(SwapData.deadline), // deadline
    BigInt(SwapData.timeBwTrade), // time between trades
    BigInt(SwapData.slippage), // slippage
    BigInt(SwapData.salt), // salt
  ];

  let trancheToSell = Math.floor(SwapData.amount / SwapData.tranches);
  if (SwapData.inputTokenAddress == WETH) {
    trancheToSell = Math.floor(trancheToSell * 0.995);
  }
  const zeroExSwapStruct = await generateZeroExStruct(
    SwapData.inputTokenAddress,
    SwapData.outputTokenAddress,
    trancheToSell,
  );

  const data = encodeFunctionData({
    abi: splurgeAbi,
    functionName: 'verifyExecuteTrade',
    args: [splurgeOrderStruct, signature, zeroExSwapStruct],
  });

  return data;
};

// Fetch all events based on signature
const getContractLogEvents = async (signature: string) => {
  // Contract & Ethers setup
  const provider = new JsonRpcProvider(
    'https://eth-mainnet.g.alchemy.com/v2/oQcwBviequQgqzvgAXUShhOlCzgZKtKK',
  );
  const contractAddress = 'CONTRACT_ADDRESS';
  const contractABI = 'CONTRACT_ABI';

  const contract = new Contract(contractAddress, contractABI, provider);

  try {
    const eventFilter = contract.filters.TradeEvent(null, signature);
    const events = await contract.queryFilter(eventFilter);

    return events;
  } catch (error) {
    console.error('Error fetching contract events:', error);
    throw error;
  }
};

//Get Requested Pairs & recent PriceQueue from "Pairs" Table
const getPairs = async () => {
  let { data: Pairs, error } = await supabase.from('Pairs').select('*');
  return Pairs;
};

const getTrades = async () => {
  let { data: Trades, error } = await supabase.from('Trades').select('*');
  return Trades;
};

// Mark as complete
const markTradeAsComplete = async (id: number) => {
  const { data, error } = await supabase
    .from('Trades')
    .update({
      complete: true,
      ready: false,
    })
    .match({ id: id });

  if (error) {
    console.error('Error updating row:', error);
  }
};

const updateRemainingBatches = async (id: number, batches_left: number) => {
  const { data, error } = await supabase
    .from('Trades')
    .update({
      remainingBatches: batches_left,
    })
    .match({ id: id });

  if (error) {
    console.error('Error updating row:', error);
  }
};

const updateTimings = async (id: number, timings: Record<string, any>) => {
  const { data, error } = await supabase
    .from('Trades')
    .update({
      batch_timings: timings,
      ready: false,
    })
    .match({ id: id });

  if (error) {
    console.error('Error updating row:', error);
  }
};

const updateTradeBatchTimings = async () => {
  let trades = await getTrades();

  for (let trade of trades) {
    let events = await getContractLogEvents(trade.signature);
    const numberOfEvents = events.length;

    // Update trade as complete if batches are over
    if (trade.batches == numberOfEvents) {
      markTradeAsComplete(trade.id);
    } else {
      let remainingBatches = trade.batches - numberOfEvents;
      updateRemainingBatches(trade.id, remainingBatches);

      // Check if batch_timings data exists (i.e. not null)
      if (trade.batch_timings) {
        const numberOfExecutedBatches = Object.keys(trade.batchTimings).length;

        // Update most recent executed batch
        if (numberOfExecutedBatches + 1 == numberOfEvents) {
          const newBatchNumber = Object.keys(trade.batchTimings).length + 1;
          const newBatchTimestamp = new Date().getTime(); // Get current unix timestamp
          trade.batchTimings[newBatchNumber.toString()] = newBatchTimestamp;

          updateTimings(trade.id, trade.batch_timings);
        }
      } else {
        // Data doesn't exist yet - first batch execution
        const current_time = new Date();
        const timestamp = current_time.getTime(); // UNIX timestamp

        const batch_timings = {
          '1': timestamp,
        };

        updateTimings(trade.id, batch_timings);
      }
    }
  }
};

const updateTrades = async () => {
  let pairs = await getPairs();

  for (let pair of pairs) {
    let { data: Trades, error } = await supabase
      .from('Trades')
      .select('*')
      .eq('ready', 'false')
      .eq('pair', pair.path);

    let currentOutput = pair['current_price'];

    for (let trade of Trades) {
      let allMeanPrices;
      try {
        allMeanPrices = pair[`${trade.order.priceAvg}min_avg`]['close_prices'];
      } catch (e) {
        console.log(`error with ${pair}`);
        break;
      }
      if (!allMeanPrices || allMeanPrices.length == 0) {
        console.log(`error with ${pair}`);
        break;
      }
      let movingAveragePrice =
        allMeanPrices.reduce((acc: any, val: any) => acc + Number(val), 0) /
        allMeanPrices.length;

      const current_time = new Date().getTime(); // UNIX timestamp
      const mostRecentBatch = Object.keys(trade.batch_timings).length;
      const lastBatchTime = trade.batch_timings[mostRecentBatch.toString()];
      const timeBetweenBatches = trade.time_bw_batches;

      // Get swap call data
      const callData = await encodeInput(
        trade.order as SwapDataStruct,
        trade.signature,
      );

      // Only mark trade as ready if time between batches is satisfied
      if (timeBetweenBatches >= current_time - lastBatchTime) {
        let buyOutputOver =
          ((100 + Number(trade.order.percentChange)) / 100) *
          movingAveragePrice;
        if (currentOutput >= buyOutputOver) {
          const { data, error } = await supabase
            .from('Trades')
            .update({
              ready: true,
              zero_x_call_data: callData,
            })
            .eq('id', trade.id)
            .select();
          console.log(data || error);
        }
      }
    }
  }
};

updateTradeBatchTimings();
updateTrades();
