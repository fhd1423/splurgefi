const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

//Set global API & Client Instances
const supabase = createClient(
  'https://gmupexxqnzrrzozcovjp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtdXBleHhxbnpycnpvemNvdmpwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY5OTIxOTEyNywiZXhwIjoyMDE0Nzk1MTI3fQ.iF0xiz-vE5tx52u4soGJbEtGHtIB_EyQFFU_eB5dVak',
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
      .eq('ready', 'true')
      .eq('pair', pair.path);

    let allPrices = pair['daily_prices'].priceFeed;
    let currentPrice = allPrices[allPrices.length - 1];

    for (let trade of Trades) {
      let allMeanPrices =
        pair[`${trade.order.avgPrice}min_avg`]['close_prices'];
      if (!allMeanPrices || allMeanPrices.length == 0) {
        console.log('hit an error');
        break;
      }
      // Convert each string to a float and calculate the sum
      let sum = allMeanPrices.reduce((acc: any, val: number) => acc + val, 0);
      // Calculate the average
      let movingAveragePrice = sum / allMeanPrices.length;

      if (trade.order.tradeOption == 'buy') {
        let buyUnder =
          ((100 - trade.order.tradeDelta) / 100) * movingAveragePrice;
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
