const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
import { ethers, JsonRpcProvider, Contract } from 'ethers';

//Set global API & Client Instances
const supabase = createClient(
  'https://gmupexxqnzrrzozcovjp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtdXBleHhxbnpycnpvemNvdmpwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY5OTIxOTEyNywiZXhwIjoyMDE0Nzk1MTI3fQ.iF0xiz-vE5tx52u4soGJbEtGHtIB_EyQFFU_eB5dVak',
);

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

// COPY PASTED FROM WEB3FUNCTIONS - NEED TO EDIT
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

function getDeconstructedCalldata(calldata: { data: any }): object {
  const ZEROEX_ABI = [
    'function transformERC20(address,address,uint256,uint256,(uint32, bytes)[]) public',
  ];
  const ZeroExAddy = '0xf1523fcd98490383d079f5822590629c154cfacf';
  const ZeroExContract = new ethers.Contract(ZeroExAddy, ZEROEX_ABI);

  let deconstructed = ZeroExContract.interface.decodeFunctionData(
    'transformERC20',
    calldata.data,
  );

  let object = [];

  // Loop through each row in ZeroExCalldata[4]
  for (let i = 0; i < deconstructed[4].length; i++) {
    // Create an object for each row and add it to the object array
    object.push([deconstructed[4][i][0], deconstructed[4][i][1]]);
  }

  const ZeroExStruct = [deconstructed[3], object]; // (uint256,(uint32, bytes)[])

  return ZeroExStruct;
}

async function getSwapCallData(inputTokenAddress: string, outputTokenAddress: string, amount: string){

  let apiUrl = 'OX_API_URL';
  let apiKey = '0X_API_KEY';

  const tokenPair = {
    input: inputTokenAddress, 
    output: outputTokenAddress,
    amount: amount,
  };

  try {
    let zeroX_quote = await fetchQuote(tokenPair, apiKey, apiUrl!);
    const swapCallData = getDeconstructedCalldata(zeroX_quote);
    return swapCallData; 
  } catch (error){
    console.error('Error in getSwapCallData:', error);
  }

}

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
      // Convert each string to a float and calculate the sum
      let sum = allMeanPrices.reduce((acc: any, val: number) => acc + val, 0);
      // Calculate the average
      let movingAveragePrice = sum / allMeanPrices.length;

      const current_time = new Date().getTime(); // UNIX timestamp
      const mostRecentBatch = Object.keys(trade.batch_timings).length;
      const lastBatchTime = trade.batch_timings[mostRecentBatch.toString()];
      const timeBetweenBatches = trade.time_bw_batches;

      // Get swap call data 
      const callData = getSwapCallData(trade.order.inputTokenAddy, trade.order.outputTokenAddy, trade.order.amount); 

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
              zero_x_call_data: callData
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
