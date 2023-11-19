"use client";

import React, { useState, useEffect } from "react";
import Head from "next/head";
import CustomInputToken from "../components/CustomInputToken";
import TokenSelector from "../components/TokenSelector";
import CustomToggle from "../components/CustomToggle";
import { Typography, Box } from "@mui/material";
import router from "next/router";
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import CustomInputPercent from "../components/CustomInputPercent";
import CustomInputBatches from "../components/CustomInputBatches";
import TradeSelector from "../components/TradeSelector";
import dayjs from "dayjs";
import CustomDatePicker from "@/components/CustomDatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { output } from "@/next.config";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { supabase } from "./client"

export default function StepOne() {

  // Sample options for testing
  const outputOptions = [
    { label: "GROK", value: "GROK" },
    { label: "JOE", value: "JOE" },
  ];

  const inputOptions = [
    { label: "WETH", value: "WETH"}, 
    { label: "USDC", value: "USDC"}
  ]

  const wethToJoePath = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2-0x6FC71D805f004EE2B5a2962344cb0703A8Ce2b31"

  

  // State to hold input values
  const [inputTokenValue, setInputTokenValue] = useState("");
  const [outputTokenValue, setOutputTokenValue] = useState("");
  const [selectedTradeAction, setSelectedTradeAction] = useState("");

  const [batchValue, setBatchValue] = useState("");
  const [selectedDate, setSelectedDate] = useState(dayjs());

  // State to hold selected tokens
  const [inputToken, setInputToken] = useState("");
  const [outputToken, setOutputToken] = useState("");

  const [toggleSelection, setToggleSelection] = useState('buy');

  // States for percent change and selected value
  const [percentChange, setPercentChange] = useState("");
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  // Access setShowAuthFlow and primaryWallet from useDynamicContext
  const { setShowAuthFlow, primaryWallet } = useDynamicContext();

  // State for error messages
  const [inputTokenError, setInputTokenError] = useState("");
  const [outputTokenError, setOutputTokenError] = useState("");
  const [inputTokenValueError, setInputTokenValueError] = useState("");
  const [tokenSelectionError, setTokenSelectionError] = useState("");


  const validateInputs = () => {
    let isValid = true;
    if (!inputToken) {
      setInputTokenError("Please select an input token.");
      isValid = false;
    } else {
      setInputTokenError("");
    }

    if (!outputToken) {
      setOutputTokenError("Please select an output token.");
      isValid = false;
    } else {
      setOutputTokenError("");
    }

    if (!inputTokenValue) {
      setInputTokenValueError("Please enter a value for the input token.");
      isValid = false;
    } else {
      setInputTokenValueError("");
    }

    return isValid;
  };

  const checkForWETH = () => {

    let selectedWETH = true; 

    if (validateInputs()){
      if (inputToken !== 'WETH' && outputToken !== 'WETH'){
        setTokenSelectionError("Please make sure that either your input or output token is WETH.")
        selectedWETH = false;
      }
    }

    return selectedWETH; 
  }

  // Handlers to update the state
  const handleInputTokenChange = (value) => {
    // console.log("Input Token Value:", value); 
    setInputTokenValue(value);
  };

  const handleOutputTokenChange = (value) => {
    // console.log("Output Token Value:", value); 
    setOutputTokenValue(value);
  };

  const handleInputTokenSelect = (token) => {
    // console.log("Input Token Selected:", token); 
    setInputToken(token);
  };

  const handleOutputTokenSelect = (token) => {
    console.log("Output Token Selected:", token); 
    setOutputToken(token);
  };

  const handleTradeActionChange = (action) => {
    // console.log("Selected Trade:", action);
    setSelectedTradeAction(action); 
  };

  const handlePercentChange = (event) => {
    setPercentChange(event.target.value);
  };

  // Store the values locally to pass to step-two
  const handleContinue = () => {
    router.push('/trades');  
  };

  // Listen for changes in primaryWallet
  useEffect(() => {
    if (primaryWallet?.address) {
      setIsWalletConnected(true);
    }
  }, [primaryWallet?.address]);

  const handleWalletConnection = () => {
    setShowAuthFlow(true);
    // Additional logic can be added here if needed
  };


  const uploadConditionalOrder = async () => {

    try {

      const generateRandomSalt = () => {
        const randomBytes = new Uint8Array(64); // Generating 64 random bytes
        crypto.getRandomValues(randomBytes);
        const salt = Array.from(randomBytes).map(byte => byte.toString(16).padStart(2, '0')).join('');
        // console.log("Salt length:", salt.length);
        return salt;
      };
  
      const unixTimestamp = selectedDate.unix(); // Unix timestamp in seconds
      const signer = await primaryWallet.connector.getSigner();
      let selectedPercentChange = parseInt(percentChange, 10);
      let selectedPriceAverage = parseInt(selectedTradeAction, 10);
      let selectedAmount = inputTokenValue;
  
      // Step 1: Parse the Decimal Value
      const [wholePart, decimalPartRaw] = selectedAmount.includes('.') ? selectedAmount.split('.') : [selectedAmount, ''];
      // Step 2: Normalize Decimal Part
      const decimalPart = decimalPartRaw.padEnd(18, '0'); // Add trailing zeros to make it 18 decimal places
      // Step 3: Convert to Integer
      const wholePartBigInt = BigInt(wholePart);
      const decimalPartBigInt = BigInt(decimalPart);
      // Step 4: Scale to Blockchain Format
      let amountInWei = wholePartBigInt * BigInt(10) ** BigInt(18) + decimalPartBigInt;
  
      //Sign Payload, send payload and signature to backend
      const signature = await signer.signTypedData({
        account: primaryWallet.address,
        domain: {
          name: 'Splurge Finance',
          version: '1',
          chainId: 1,
          verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC', //CHANGE: to Splurge Addy
        },
        types: {
          conditionalOrder: [
            { name: 'inputTokenAddress', type: "address" },
            { name: 'outputTokenAddress', type: "address" },
            { name: 'recipient', type: "address" },
            { name: 'orderType', type: "string" },
            { name: 'amount', type: "uint256" },
            { name: 'tranches', type: "uint256" },
            { name: 'percentChange', type: "uint256" },
            { name: 'priceAvg', type: "uint256" },
            { name: 'deadline', type: "uint256" },
            { name: 'salt', type: "bytes" }
          ],
        },
        primaryType: 'conditionalOrder',
        message: {
          inputTokenAddress: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
          outputTokenAddress: "0x8390a1DA07E376ef7aDd4Be859BA74Fb83aA02D5", // GROK
          recipient: "0xBb6AeaBdf61Ca96e80Aa239bA8cC7e436862E596",
          orderType: toggleSelection,
          amount: amountInWei, // Input token scaled(18 decimal places)
          tranches: 1,
          percentChange: selectedPercentChange,
          priceAvg: selectedPriceAverage,
          deadline: unixTimestamp,
          salt: generateRandomSalt()
        }
      })
      // console.log(signature);
  
      async function uploadData() {
  
        try {
          // Retrieve and store data to be uploaded to database 
          const currentTimestamp = new Date().toISOString();
          const orderData = {
            tradeOption: toggleSelection,
            inputTokenAddy: inputToken, 
            outputTokenAddy: outputToken, 
            tradeAmount: inputTokenValue,
            tradeDelta: percentChange, 
            avgPrice: selectedTradeAction, 
            batches: batchValue, 
            deadline: selectedDate.toISOString()
          }
  
          const jsonData = JSON.stringify(orderData); 
          // const pairId = await fetchPairId(wethToJoePath);
          console.log('WALLET ADDRESS INSIDE FETCH', primaryWallet.address);
  
          // created_at (timestamp), user (referenced to user table), pair (referenced to pair table), SplurgeOrder jsonb, signature - text, ready - bool, ZeroExCalldata - jsonb
          const { data, error } = await supabase
            .from('Trades')
            .insert([
              { created_at: currentTimestamp, 
                user: primaryWallet.address, 
                pair: wethToJoePath, 
                order: jsonData, 
                signature: signature, 
                complete: false, 
                ready: false
              }
            ]);
  
          if (error) throw error; 
  
        } catch (error) {
          console.error("Error uploading data to Supabase:", error)
        }

      }
  
      uploadData(); 
      // router.push('/trades');  

    } catch (error){

      console.error("Error during signature or data upload:", error);
      // setErrorMessage("Signature denied or failed to upload data. Please try again.");

    }

  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>

      <div className="h-screen bg-black flex flex-col justify-center items-center">
        <Head>
          <title>Step One</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <header className="w-full p-3 flex justify-between items-center">
          <h2 className="text-xl text-white font-bold">SplurgeFi</h2>
          <button onClick={() => router.push('/trades')} className="text-white text-sm font-semibold py-2 px-4">
            Log In
          </button>
        </header>

        <Box
          sx={{
            width: 500, 
            mx: "auto", 
          }}
        >
        
          <Paper elevation={3} sx={{backgroundColor: '#2B2B2B', padding: 2, color: 'text.primary', maxWidth: '100%', mx: 'auto', borderRadius: '16px'}}>
            <Grid container spacing={1.25}> 
              <Grid item xs={12}>
                  <CustomToggle selection={toggleSelection} setSelection={setToggleSelection}/>
              </Grid>
              <Grid item xs={12}>
                  <CustomInputToken
                      title="Input Token"
                      options={toggleSelection === 'buy' ? inputOptions : outputOptions}
                      onValueChange={handleInputTokenChange}
                      onSelectChange={handleInputTokenSelect}
                  />
              </Grid>
              <Grid item xs={12}>
                <TokenSelector
                  title="Output Token"
                  options={toggleSelection === 'buy' ? outputOptions: inputOptions}
                  onValueChange={handleOutputTokenChange}
                  onSelectChange={handleOutputTokenSelect}
                />
              </Grid>
              <Grid item xs={4}>
                { toggleSelection === 'buy' ?
                  <CustomInputPercent
                    title="Percent Change"
                    value={percentChange}
                    onValueChange={handlePercentChange}
                    isUpSelected={false} // Pass the derived state to the component
                    placeHolder={"0%"}
                  />
                  :
                  <CustomInputPercent
                    title="Percent Change"
                    value={percentChange}
                    onValueChange={handlePercentChange}
                    isUpSelected={true} // Pass the derived state to the component
                    placeHolder={"0%"}
                  />
                }

              </Grid>
              <Grid item xs={4}>
                <CustomInputBatches
                    title="Batches"
                    placeHolder={"5"}
                    value={batchValue}
                    onValueChange={(e) => setBatchValue(e.target.value)}
                />
              </Grid>
              <Grid item xs={4}>
                <TradeSelector
                  selectedTradeAction={selectedTradeAction}
                  onTradeActionChange={handleTradeActionChange}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomDatePicker
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                />
              </Grid>
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', pt: 4 }}>

              {!isWalletConnected ? (

                <button
                  onClick={handleWalletConnection}
                  className="bg-green-500 text-white text-xl font-bold rounded-lg shadow-lg hover:bg-green-600 w-96 h-14"
                >
                  Connect Wallet
                </button>

              ) : (

                <button
                  onClick={uploadConditionalOrder}
                  className="bg-green-500 text-white text-xl font-bold rounded-lg shadow-lg hover:bg-green-600 w-96 h-14"
                >
                  Start Automation
                </button>

              )}

              </Grid>
            </Grid>
          </Paper>

        </Box>
      </div> 

    </LocalizationProvider>
  );
}
