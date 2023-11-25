import {
  Web3Function,
  Web3FunctionContext,
} from '@gelatonetwork/web3-functions-sdk';
import { createClient } from '@supabase/supabase-js';

async function fetchReadyTrades(supabaseUrl: string, supabaseKey: string) {
  const supabase = createClient(supabaseUrl!, supabaseKey!);

  const { data: Trades, error } = await supabase
    .from('Trades')
    .select('zero_x_call_data')
    .eq('ready', true);

  if (error) {
    console.error('Error fetching data:', error);
    return;
  }
  if (Trades[0]) return Trades[0].zero_x_call_data.replace(/['"]+/g, '');
  return null;
}

Web3Function.onRun(async (context: Web3FunctionContext) => {
  const { userArgs, gelatoArgs, secrets, multiChainProvider } = context;
  const provider = multiChainProvider.default();
  const splurgeAddy = '0xA3b9b6eAee4B9e473bD9bB249E35F0D71Aaa2BD7';

  //Get Supabase Trades
  const supabaseUrl = await secrets.get('SUPABASE_URL');
  const supabaseKey = await secrets.get('SUPABASE_API_KEY');
  if (!supabaseUrl) throw new Error(`no supabase url provided`);
  if (!supabaseKey) throw new Error(`no supbase key provided`);
  const readyTrades = await fetchReadyTrades(supabaseUrl, supabaseKey);

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
    message: `api key not provided`,
  };
});
