import {
  Web3Function,
  Web3FunctionContext,
} from '@gelatonetwork/web3-functions-sdk';
import { createClient } from '@supabase/supabase-js';

async function fetchReadyTrades(
  supabaseUrl: string,
  supabaseKey: string,
  storage: any,
) {
  const supabase = createClient(supabaseUrl!, supabaseKey!);

  const { data: Trades, error } = await supabase
    .from('Trades')
    .select('*')
    .eq('ready', true);

  if (error) {
    console.error('Error fetching data:', error);
    return;
  }
  if (Trades[0] && Trades[0].id != (await storage.get('lastExecuted'))) {
    await storage.set('lastExecuted', Trades[0].id);
    return Trades[0].zero_x_call_data;
  }
  return null;
}

Web3Function.onRun(async (context: Web3FunctionContext) => {
  const { userArgs, gelatoArgs, storage, secrets, multiChainProvider } =
    context;
  const provider = multiChainProvider.default();
  const splurgeAddy = await secrets.get('SPLURGE_ADDY');
  const supabaseUrl = await secrets.get('SUPABASE_URL');
  const supabaseKey = await secrets.get('SUPABASE_API_KEY');
  if (!supabaseUrl) throw new Error(`no supabase url provided`);
  if (!supabaseKey) throw new Error(`no supbase key provided`);
  if (!splurgeAddy) throw new Error(`no supabase url provided`);
  const readyTrades = await fetchReadyTrades(supabaseUrl, supabaseKey, storage);

  if (readyTrades) {
    return {
      canExec: true,
      callData: [
        {
          to: splurgeAddy,
          data: readyTrades,
        },
      ],
    };
  }

  return {
    canExec: false,
    message: `no trades to execute currently`,
  };
});
