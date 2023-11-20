const axios = require('axios');
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

//Set global API & Client Instances
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_API_KEY,
);

//Get Requested Pairs & recent PriceQueue from "Pairs" Table
const getPairs = async () => {
  let { data: Pairs, error } = await supabase.from('Pairs').select('*');
  return Pairs;
};

const updateTrades = async () => {
  let pairs = await getPairs();

  for (let pair of pairs) {
    let { data: Trades, error } = await supabase
      .from('Trades')
      .select('*')
      .eq('pair', pair.path)
      .eq('ready', false);

    let currentPrice = pair['current_price'];

    for (let trade of Trades) {
      let allMeanPrices;
      try {
        allMeanPrices = pair[`${trade.order.avgPrice}min_avg`]['close_prices'];
      } catch (e) {
        console.log(`error with ${pair}`);
        break;
      }
      if (!allMeanPrices || allMeanPrices.length == 0) {
        console.log(`error with ${pair}`);
        break;
      }
      let sum = allMeanPrices.reduce((acc: any, val: number) => acc + val, 0);
      let movingAveragePrice = sum / allMeanPrices.length;

      if (trade.order.tradeOption == 'buy') {
        let buyUnder =
          ((100 - trade.order.tradeDelta) / 100) * movingAveragePrice;
        console.log('buyUnder', buyUnder);
        console.log('currentPrice', currentPrice);
        console.log('medianPrice', movingAveragePrice);
        if (currentPrice <= buyUnder) {
          const { data, error } = await supabase
            .from('Trades')
            .update({ ready: 'true' })
            .eq('id', trade.id)
            .select();
          console.log(data || error);
        }
      }
      if (trade.order.tradeOption == 'sell') {
        let sellOver =
          ((100 + trade.order.tradeDelta) / 100) * movingAveragePrice;
        if (currentPrice >= sellOver) {
          const { data, error } = await supabase
            .from('Trades')
            .update({ ready: 'true' })
            .eq('id', trade.id)
            .select();
          console.log(data || error);
        }
      }
    }
  }
};

updateTrades();
