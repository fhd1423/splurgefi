import {
  Web3Function,
  Web3FunctionContext,
} from '@gelatonetwork/web3-functions-sdk';
import { Contract } from '@ethersproject/contracts';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

require('dotenv').config();

// const Splurge_ABI = [
//   'function prepareVerifyTrade((address,address,address,uint256,uint8,uint256,uint8),bytes memory,bytes memory) public',
// ];

interface OrderDetails {
  batches: string;
  avgPrice: string;
  deadline: string;
  tradeDelta: string;
  tradeAmount: string;
  tradeOption: string;
  inputTokenAddy: string;
  outputTokenAddy: string;
}

// Create order with the following data
// inputTokenAddy,
// outputTokenAddy,
// recipient,
// orderType,
// amount,
// tranches,
// percentChange,
// priceAvg,
// deadline,
// salt

interface TradesMapping {
  signature: string;
  orderDetails: OrderDetails;
}

async function fetchReadyTrades(supabaseUrl: string, supabaseKey: string) {
  const supabase = createClient(supabaseUrl!, supabaseKey!);

  const { data: Trades, error } = await supabase
    .from('Trades')
    .select('*')
    .eq('ready', true);

  if (error) {
    console.error('Error fetching data:', error);
    return;
  }
  // Map through the data to parse the 'order' JSONB and create the mapping
  const tradeMappings: TradesMapping[] = Trades.map((trade) => ({
    signature: trade.signature,
    orderDetails: JSON.parse(trade.order) as OrderDetails,
  }));

  console.log('Trade Mappings:', tradeMappings);
  return tradeMappings;
}

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

Web3Function.onRun(async (context: Web3FunctionContext) => {
  //Set environment up
  const Splurge_ABI = [
    'function verifyExecuteTrade((address,address,address,string,uint256,uint256,uint256,uint256,uint256,bytes),bytes memory,(uint256,(uint32,bytes)) public)',
  ];
  const { userArgs, gelatoArgs, secrets, multiChainProvider } = context;
  const provider = multiChainProvider.default();
  const splurgeAddy = '0x414ab760a79ba57df175a7ce49e78fbb4d12b963';
  const splurgeContract = new Contract(
    String(splurgeAddy),
    Splurge_ABI,
    provider,
  );

  //Get Supabase Trades
  const supabaseUrl = await secrets.get('SUPABASE_URL');
  const supabaseKey = await secrets.get('SUPABASE_API_KEY');
  const readyTrades = await fetchReadyTrades(supabaseUrl!, supabaseKey!);

  let apiUrl = await secrets.get('OX_API_URL');
  let apiKey = await secrets.get('0X_API_KEY');

  let callData_queue = [];

  if (apiKey) {
    //Iterate through Supabase Ready Trades
    for (const tradeMapping of readyTrades!) {
      const tokenPair = {
        input: tradeMapping.orderDetails.inputTokenAddy,
        output: tradeMapping.orderDetails.outputTokenAddy,
        amount: tradeMapping.orderDetails.tradeAmount,
      };
      let zeroX_quote = await fetchQuote(tokenPair, apiKey, apiUrl!);

      console.log('Signature:', tradeMapping.signature);
      console.log('Order Details:', tradeMapping.orderDetails);

      const order = tradeMapping.orderDetails;
      const signature = tradeMapping.signature;
      const swapCallData = zeroX_quote.data;

      let SplurgeContractTrade = {
        order: order,
        signature: signature,
        swapCallData: swapCallData,
      };

      callData_queue.push(SplurgeContractTrade);
    }

    return {
      canExec: true,
      callData: [
        {
          to: splurgeAddy,
          data: splurgeContract.interface.encodeFunctionData(
            'prepareVerifyTrade',
            callData_queue,
          ),
        },
      ],
    };
    // if (callData && ) {
    //   const order = [
    //     '0x9c3c9283d3e44854697cd22d3faa240cfb032889', // inputTokenAddy
    //     '0xa0a6c157871a9f38253234bbfd2b8d79f9e9fcdc', // outputTokenAddy
    //     '0x8839278a75dc8249bc0c713a710aaebd0fee6750', // recipient
    //     '100000000000000000', // amount
    //     6, // tranches
    //     '1730016559', // deadline
    //     1, // salt
    //   ];
    //   const sig =
    //     '0x8dc8d0ba773a15c6b279e902c10028eb4b5acf829b70d57366331d1599c67b2f184f17211871faecb61a3725cad515580de5d0c73434364ef9424a0e4eadc1381b';

    //   const swapCallData =
    //     '0x415565b00000000000000000000000009c3c9283d3e44854697cd22d3faa240cfb032889000000000000000000000000a0a6c157871a9f38253234bbfd2b8d79f9e9fcdc00000000000000000000000000000000000000000000000000000000000186a000000000000000000000000000000000000000000000000000000016d1d7f05c00000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000360000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000000000000000000000000000009c3c9283d3e44854697cd22d3faa240cfb032889000000000000000000000000a0a6c157871a9f38253234bbfd2b8d79f9e9fcdc00000000000000000000000000000000000000000000000000000000000001400000000000000000000000000000000000000000000000000000000000000320000000000000000000000000000000000000000000000000000000000000032000000000000000000000000000000000000000000000000000000000000002e000000000000000000000000000000000000000000000000000000000000186a0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003200000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000012556e697377617056330000000000000000000000000000000000000000000000000000000000000000000000000186a000000000000000000000000000000000000000000000000000000016d1d7f05c000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000e592427a0aece92de3edee1f18e0157c0586156400000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002b9c3c9283d3e44854697cd22d3faa240cfb032889002710a0a6c157871a9f38253234bbfd2b8d79f9e9fcdc000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000b000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000020000000000000000000000009c3c9283d3e44854697cd22d3faa240cfb032889000000000000000000000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee0000000000000000000000000000000000000000000000000000000000000000869584cd0000000000000000000000001000000000000000000000000000000000000011000000000000000000000000000000003395e8e1b4e8429c8b3e871b4e1cdb5c';
    //   return {
    //     canExec: true,
    //     callData: [
    //       {
    //         to: splurgeAddy,
    //         data: splurgeContract.interface.encodeFunctionData(
    //           'prepareVerifyTrade',
    //           [order, sig, swapCallData],
    //         ),
    //       },
    //     ],
    //   };
  }
  return {
    canExec: false,
    message: `api key not provided`,
  };
});
