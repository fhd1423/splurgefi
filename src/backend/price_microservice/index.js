const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

//Set global API & Client Instances
const supabase = createClient(
  'https://gmupexxqnzrrzozcovjp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtdXBleHhxbnpycnpvemNvdmpwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY5OTIxOTEyNywiZXhwIjoyMDE0Nzk1MTI3fQ.iF0xiz-vE5tx52u4soGJbEtGHtIB_EyQFFU_eB5dVak',
);
const apiUrl = 'https://api.0x.org/swap/v1/price';
const apiKey = 'b84d510c-12a6-4565-b5fa-cd0923d3c178';

const headers = {
  '0x-api-key': apiKey,
};

//Get Requested Pairs & recent PriceQueue from "Pairs" Table
const getPairs = async () => {
  let { data: Pairs, error } = await supabase
    .from('Pairs')
    .select("*");

  return Pairs;
};

//Construct PriceQueue
const updatePriceData = async () => {
  const pairs = await getPairs();

  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i];
    const splitPair = pair.path.split('-');
    const sellToken = splitPair[0];
    const buyToken = splitPair[1];

    const daily_prices = pair.daily_prices;

    const params = {
      sellToken: sellToken,
      buyToken: buyToken,
      sellAmount: '1000000000000000000', //Arbitrary, just trying to get exchange rate
    };

    const intervals = [15, 60, 240, 1440];

    let interval_columnName = null;
    let interval_columnValue;

    intervals.forEach((interval) => {
        if(isTimeInterval(interval)){
            interval_columnName = `${interval}min_avg`;
        }
    });

    let xmin_avg = pair[interval_columnName];

    axios
      .get(apiUrl, { params, headers })
      .then((response) => {
        interval_columnValue = response.data.price;
        daily_prices.priceFeed.push(interval_columnValue);
        xmin_avg.close_prices.push(interval_columnValue)
        console.log(daily_prices);
        if(interval_columnName != null){
            supabase
            .from('Pairs')
            .upsert([
              {
                path: pair.path,
                ['daily_prices']: daily_prices,
                [interval_columnName]: xmin_avg
              },
            ])
            .then((upsertResponse) => {
              console.log('Upsert Response:', upsertResponse);
            });
        }
        else{
            supabase
            .from('Pairs')
            .upsert([
              {
                path: pair.path,
                ['daily_prices']: daily_prices,
              },
            ])
            .then((upsertResponse) => {
              console.log('Upsert Response:', upsertResponse);
            });
        }
      })
      .catch((error) => {
        console.error('Error:', error.message);
      });

    await sleep(1000);
  }
};

//UTILITY FUNCTIONS
const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));


//Margin of error is 1 minute
const isTimeInterval = (intervalInMinutes) => {
    const now = new Date();
    //const minutes = now.getMinutes();
    const minutes = 150;
    return minutes % intervalInMinutes === 0;
};

//EXECUTION
updatePriceData();
