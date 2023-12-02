const axios = require('axios');
import { ethers, JsonRpcProvider, Contract } from 'ethers';
import { Address, decodeFunctionData, encodeFunctionData } from 'viem';
import { supabase } from '../utils/client';

const getTrades = async () => {
  let { data: Trades, error } = await supabase.from('Trades').select('*');
  return Trades;
};

// Fetch all events based on signature
// const getContractLogEvents = async (signature: string) => {
//   // Contract & Ethers setup
//   const provider = new JsonRpcProvider(
//     'https://eth-mainnet.g.alchemy.com/v2/oQcwBviequQgqzvgAXUShhOlCzgZKtKK',
//   );
//   const contractAddress = 'CONTRACT_ADDRESS';
//   const contractABI = 'CONTRACT_ABI';

//   const contract = new Contract(contractAddress, contractABI, provider);

//   try {
//     const eventFilter = contract.filters.TradeEvent(null, signature);
//     const events = await contract.queryFilter(eventFilter);

//     return events;
//   } catch (error) {
//     console.error('Error fetching contract events:', error);
//     throw error;
//   }
// };

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
  if (!trades) return;

  for (let trade of trades) {
    // let events = await getContractLogEvents(trade.signature);
    // const numberOfEvents = events.length;
    let numberOfEvents = 3;
    let remainingBatches = trade.batches - numberOfEvents;

    // Only update remaining batches if the value in the db is not up to date
    if (trade.remainingBatches != remainingBatches) {
      updateRemainingBatches(trade.id, remainingBatches);
    }

    // Check if batch_timings data exists (i.e. not null)
    if (trade.batch_timings) {
      const numberOfExecutedBatches = Object.keys(trade.batch_timings).length;

      // Update most recent executed batch
      if (numberOfExecutedBatches + 1 == numberOfEvents) {
        const newBatchNumber = numberOfExecutedBatches + 1;
        const newBatchTimestamp = new Date().getTime(); // Get current unix timestamp
        trade.batch_timings[newBatchNumber.toString()] = newBatchTimestamp;

        updateTimings(trade.id, trade.batch_timings);
      }
    } else {
      // Data doesn't exist yet - first batch execution
      if (numberOfEvents == 1) {
        const current_time = new Date();
        const timestamp = current_time.getTime(); // UNIX timestamp

        const batch_timings = {
          '1': timestamp,
        };
        updateTimings(trade.id, batch_timings);
      }
    }

    // Update trade as complete if batches are over
    if (trade.batches == numberOfEvents) {
      markTradeAsComplete(trade.id);
    }
  }
};

console.log('starting to update trades');
setInterval(updateTradeBatchTimings, 15000);
