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

const updateRemainingBatches = async (id: number, remainingBatches: number) => {
  const { data, error } = await supabase
    .from('Trades')
    .update({
      remainingBatches,
      ready: false,
    })
    .match({ id });

  if (error) {
    console.error('Error updating row:', error);
  } else {
    console.log(
      `updated trade ${id}, there are ${remainingBatches} batches remaining`,
    );
  }
};

const updateTimings = async (id: number, lastExecuted: number) => {
  const { data, error } = await supabase
    .from('Trades')
    .update({
      lastExecuted,
      ready: false,
    })
    .match({ id });

  if (error) {
    console.error('Error updating row:', error);
  } else {
    console.log(`updated trade ${id}, executed at ${lastExecuted}`);
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
  const trade = trades[0];

  updateRemainingBatches(trade.id, trade.remainingBatches - 1);

  const justExecuted = parseInt((new Date().getTime() / 1000).toFixed(0));

  updateTimings(trade.id, justExecuted);

  if (trade.remainingBatches == 0) {
    markTradeAsComplete(trade.id);
  }
};

const contractEventListener = async () => {
  viemClient.watchEvent({
    address: process.env.SPLURGE_ADDRESS as Address,
    event: parseAbiItem('event TradeEvent(bytes signature)'),
    onLogs: (logs) => {
      logs.forEach((log) => {
        // Extract the signature from the log
        const signature = log.args.signature;
        updateTradeBatchTimings(signature as Address);
      });
    },
  });
};

console.log('listening to events to update trades');
contractEventListener();
