import { todo } from "node:test";

// Import dependencies
const dotenv = require("dotenv");
const axios = require("axios");

// Load environment variables
dotenv.config();

// Define your tokens
const inputToken = "0x6adeE270c1486c2304EEC0242f1091757E659b99";
const outputToken = "0xFbC49fE5DfA0f9c3eB672aBB4aCC80b0FDFBb9a3";

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
