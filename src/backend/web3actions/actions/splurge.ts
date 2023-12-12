import { ActionFn, Context, Event, WebhookEvent } from '@tenderly/actions';
import { createClient } from '@supabase/supabase-js';

import { JsonRpcProvider, Wallet } from 'ethers';

const provider = new JsonRpcProvider('https://arb1.arbitrum.io/rpc');

const supabase = createClient(
  'https://gmupexxqnzrrzozcovjp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtdXBleHhxbnpycnpvemNvdmpwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcwMTQ2MjU5NCwiZXhwIjoyMDE3MDM4NTk0fQ.YFvIg4OtlNGRr-AmSGn0fCOmEJm1JxQmKl7GX_y5-wY',
);

export const execTrade: ActionFn = async (context: Context, event: Event) => {
  const PRIVATE_KEY = await context.secrets.get('PRIVATE_KEY');
  const SPLURGE_ADDRESS = await context.secrets.get('SPLURGE_ADDRESS');
  const account = new Wallet(PRIVATE_KEY, provider);

  let request = event as WebhookEvent;
  const tradeID = request.payload.id;

  const { data, error } = await supabase
    .from('Trades')
    .select('*')
    .eq('id', tradeID);

  if (error || !data) throw new Error('Error with supabase');

  const trade = data[0];

  let txHash;

  txHash = await account.sendTransaction({
    to: SPLURGE_ADDRESS,
    data: trade.zero_x_call_data,
  });

  if (txHash)
    console.log(`Trade ${tradeID} processed successfully at ${txHash}`);
};
