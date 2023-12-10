import { ActionFn, Context, Event, WebhookEvent } from '@tenderly/actions';
import { Address, createWalletClient, http } from 'viem';
import { createClient } from '@supabase/supabase-js';

import { privateKeyToAccount } from 'viem/accounts';

import { arbitrum } from 'viem/chains';

const supabase = createClient(
  'https://gmupexxqnzrrzozcovjp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtdXBleHhxbnpycnpvemNvdmpwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcwMTQ2MjU5NCwiZXhwIjoyMDE3MDM4NTk0fQ.YFvIg4OtlNGRr-AmSGn0fCOmEJm1JxQmKl7GX_y5-wY',
);

export const execTrade: ActionFn = async (context: Context, event: Event) => {
  const PRIVATE_KEY = await context.secrets.get('PRIVATE_KEY');
  const SPLURGE_ADDRESS = await context.secrets.get('SPLURGE_ADDRESS');
  const account = privateKeyToAccount(PRIVATE_KEY as Address);

  const walletClient = createWalletClient({
    account,
    chain: arbitrum,
    transport: http(),
  });

  let request = event as WebhookEvent;
  const tradeID = request.payload.id;

  const { data, error } = await supabase
    .from('Trades')
    .select('*')
    .eq('id', tradeID);

  if (error || !data) throw new Error('Error with supabase');

  const trade = data[0];

  let txHash;
  try {
    txHash = await walletClient.sendTransaction({
      to: SPLURGE_ADDRESS as Address,
      data: trade.zero_x_call_data,
    });
  } catch (e) {
    console.log('transaction failure');
  }

  if (txHash) console.log(`Trade ${tradeID} processed successfully`);
};
