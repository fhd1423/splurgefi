import { supabase } from '../utils/client';
import { viemClient } from '../utils/viemclient';
import { Address, parseAbiItem } from 'viem';

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

const updateTradeBatchTimings = async (signature: string) => {
  let { data: trades, error } = await supabase
    .from('Trades')
    .select('*')
    .eq('signature', signature);

  if (!trades || trades.length == 0) {
    console.log('no matching signature');
    return;
  }
  if (trades.length > 1) {
    console.log('multiple matching signature');
  }
  const trade = trades[0]; // as TradeOrder

  updateRemainingBatches(trade.id, trade.remainingBatches - 1);

  // Check if batch_timings data exists (i.e. not null)
  if (trade.batch_timings) {
    const numberOfExecutedBatches = Object.keys(trade.batch_timings).length;
    const newBatchNumber = numberOfExecutedBatches + 1;
    const newBatchTimestamp = new Date().getTime(); // Get current unix timestamp
    trade.batch_timings[newBatchNumber.toString()] = newBatchTimestamp;

    updateTimings(trade.id, trade.batch_timings);
  } else {
    // Data doesn't exist yet - first batch execution
    const current_time = new Date();
    const timestamp = current_time.getTime(); // UNIX timestamp

    const batch_timings = {
      '1': timestamp,
    };
    updateTimings(trade.id, batch_timings);
  }

  // Update trade as complete if batches are over
  if (trade.remainingBatches == 0) {
    markTradeAsComplete(trade.id);
  }
};

const contractEventListener = async () => {
  viemClient.watchEvent({
    address: process.env.SPLURGE_ADDRESS as Address,
    event: parseAbiItem('event TradeEvent(bytes indexed _signature)'),
    onLogs: (logs) => {
      logs.forEach((log) => {
        // Extract the signature from the log
        const signature = log.args._signature;
        updateTradeBatchTimings(signature as Address);
      });
    },
  });
};

console.log('listening to events to update trades');
contractEventListener();
