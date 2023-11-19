"use client";

import React, { useState } from "react";
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

export default function StepOne() {

  // Sample options for testing
  const tokenOptions = [
    { label: "WETH", value: "WETH" },
    { label: "JOE", value: "JOE" },
  ];
  

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
  const [isUpSelected, setIsUpSelected] = useState(null);

  // State for error messages
  const [inputTokenError, setInputTokenError] = useState("");
  const [outputTokenError, setOutputTokenError] = useState("");
  const [inputTokenValueError, setInputTokenValueError] = useState("");
  const [tokenSelectionError, setTokenSelectionError] = useState("");
  // States for percent change and selected value
  const [percentChange, setPercentChange] = useState("");

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
    // console.log("Output Token Selected:", token); 
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

    if (validateInputs() && checkForWETH()){
      localStorage.setItem(
        "tradeDetails",
        JSON.stringify({
          inputTokenValue,
          outputTokenValue,
          inputToken,
          outputToken,
          toggleSelection,
        })
      );

      router.push('/step-two');  

    }

  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>

      <div className="h-screen bg-black flex flex-col justify-center items-center">
        <Head>
          <title>Step One</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>

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
                      options={tokenOptions}
                      onValueChange={handleInputTokenChange}
                      onSelectChange={handleInputTokenSelect}
                  />
              </Grid>
              <Grid item xs={12}>
                <TokenSelector
                  title="Output Token"
                  options={tokenOptions}
                  onValueChange={handleInputTokenChange}
                  onSelectChange={handleInputTokenSelect}
                />
              </Grid>
              <Grid item xs={4}>
                <CustomInputPercent
                  title="Percent Change"
                  value={percentChange}
                  onValueChange={handlePercentChange}
                  isUpSelected={isUpSelected} // Pass the derived state to the component
                  onToggle={() => setIsUpSelected(!isUpSelected)} // Toggle function for the arrow
                  placeHolder={"0%"}
                />
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
                <button
                  className="bg-green-500 text-white text-xl font-bold rounded-lg shadow-lg hover:bg-green-600 w-96 h-14"
                >
                  Connect Wallet
                </button>
              </Grid>
            </Grid>
          </Paper>

        </Box>
      </div> 

    </LocalizationProvider>
  );
}
