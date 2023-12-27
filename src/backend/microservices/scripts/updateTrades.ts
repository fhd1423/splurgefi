import { supabase } from '../utils/client';
import { viemClient } from '../utils/viemclient';
import { Address, parseAbiItem } from 'viem';

const updateTrade = async (
  id: number,
  remainingBatches: number,
  lastExecuted: number,
  amountReceieved: number,
) => {
  const { data, error } = await supabase
    .from('Trades')
    .update({
      remainingBatches,
      lastExecuted,
      ready: false,
      complete: remainingBatches == 0,
      amountReceieved,
    })
    .match({ id });

  if (error) {
    console.error('Error updating row:', error);
  } else {
    console.log(
      `updated trade ${id}, executed trade at ${lastExecuted} there are ${remainingBatches} batches remaining`,
    );
  }
};

const updateTradeBatchTimings = async (
  signature: string,
  amountReceieved: number,
) => {
  let { data: trades, error } = await supabase
    .from('Trades')
    .select('*')
    .eq('signature', signature);

  if (!trades || trades.length == 0) {
    console.log('no matching signature');
    return;
  }
  const trade = trades[0];
  const justExecuted = parseInt((new Date().getTime() / 1000).toFixed(0));
  const currentReceieved = trade.amountReceieved;

  updateTrade(
    trade.id,
    trade.remainingBatches - 1,
    justExecuted,
    currentReceieved + amountReceieved,
  );
};

const contractEventListener = async () => {
  viemClient.watchEvent({
    address: process.env.SPLURGE_ADDRESS as Address, //'0xF8638B550bF764732e0a69d99b445a82858Bc572',
    event: parseAbiItem(
      'event TradeEvent(bytes signature, uint256 amountReceieved)',
    ),
    onLogs: (logs) => {
      const seenSignatures = new Set();
      logs.forEach((log) => {
        const signature = log.args.signature;
        const amount = log.args.amountReceieved;

        if (!seenSignatures.has(signature)) {
          seenSignatures.add(signature);
          updateTradeBatchTimings(signature as Address, Number(amount));
        }
      });
    },
  });
};

console.log('listening to events to update trades');
contractEventListener();
