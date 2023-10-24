// Import dependencies
const dotenv = require("dotenv");
const axios = require("axios");

// Load environment variables
dotenv.config();

// Define your tokens
const inputToken = "0xbcdCB26fFec1bE5991FA4b5aF5B2BbC878965Db1";
const outputToken = "0xFA75399b5ce8C0299B0434E0D1bcFDFd8fF8a755";

// Get the API key from the environment variables
const apiKey = "0631b1fa-5205-42d3-89ef-c4e8ea3538fe";

// Define the URL and headers
const url = `https://mumbai.api.0x.org/swap/v1/quote?buyToken=${outputToken}&sellToken=${inputToken}&sellAmount=100000`;
const headers = {
  "0x-api-key": apiKey,
};

// @todo
const median = 1;

// Define a function to fetch the price
async function fetchPrice() {
  try {
    const response = await axios.get(url, { headers });
    console.log(`Price: ${response.data.price}`, Date());
    if (response.data.price / median < 0.95) {
      console.log("5% deviation detected");
    }
  } catch (error) {
    console.error(`Fetch failed: ${error.message}`);
  }
}

// Call fetchPrice every second
setInterval(fetchPrice, 1000);
