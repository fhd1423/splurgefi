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
    .select('path,daily_prices');

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

    axios
      .get(apiUrl, { params, headers })
      .then((response) => {
        daily_prices.priceFeed.push(response.data.price);
        console.log(daily_prices);
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
      })
      .catch((error) => {
        console.error('Error:', error.message);
        // setTimeout(() => {
        //     axios.get(apiUrl, { params, headers })
        //     .then(response => {
        //         console.log('API Response:', response.data);
        //     },5000);
        // });
      });

    await sleep(1000);
  }
};

//UTILITY FUNCTIONS
const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

updatePriceData();
