"use client";

import React, { useState } from "react";
import Head from "next/head";
import CustomInputToken from "../components/CustomInputToken";
import TokenSelector from "../components/TokenSelector";
import Link from "next/link";
import CustomToggle from "../components/CustomToggle";
import { Typography, Box } from "@mui/material";

export default function StepOne() {
  // Sample options for testing
  const tokenOptions = [
    { label: "WETH", value: "WETH" },
    { label: "JOE", value: "JOE" },
  ];


  // State to hold input values
  const [inputTokenValue, setInputTokenValue] = useState("");
  const [outputTokenValue, setOutputTokenValue] = useState("");

  // State to hold selected tokens
  const [inputToken, setInputToken] = useState("");
  const [outputToken, setOutputToken] = useState("");

  const [toggleSelection, setToggleSelection] = useState('buy');

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

  // Store the values locally to pass to step-two
  const handleContinue = () => {
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
  };

  return (
    <div className="h-screen bg-black flex flex-col justify-center items-center">
      <Head>
        <title>Step One</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1 className="text-4xl text-white mb-6 font-semibold">
        What tokens do you want to trade?
      </h1>
      <h3 className="text-lg text-custom-green font-bold">Step 1</h3>

      {/* <Box sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '5px', 
      paddingTop: '20px', 
      paddingBottom: '0px' 
      }}>
        <Typography variant="h5" component="h5" color="white" sx={{ whiteSpace: 'nowrap' }}>
          I want to automate a
        </Typography>
        <CustomToggle selection={toggleSelection} setSelection={setToggleSelection}/>
      </Box> */}

      {/* <p className="text-white text-xl">
        Current Selection: {toggleSelection}
      </p> */}

      {/* <div style={{ display: 'flex', justifyContent: 'center', padding: '50px 10px' }}>
        <div style={{ flex: '1', marginRight: '15px' }}>

        <CustomInputToken
            title="Input Token"
            options={tokenOptions}
            onValueChange={handleInputTokenChange}
            onSelectChange={handleInputTokenSelect}
          />

        </div>
        <div style={{ flex: '1', marginLeft: '15px' }}>

          <TokenSelector
            title="Output Token"
            options={tokenOptions}
            onValueChange={handleInputTokenChange}
            onSelectChange={handleInputTokenSelect}
          />

        </div>
      </div> */}

      <div className="space-y-8 pt-6 pb-12">

        <div className="flex justify-center items-center pt-5">
          <CustomToggle selection={toggleSelection} setSelection={setToggleSelection}/>
        </div>

        <CustomInputToken
          title="Input Token"
          options={tokenOptions}
          onValueChange={handleInputTokenChange}
          onSelectChange={handleInputTokenSelect}
        />
        <TokenSelector
          title="Output Token"
          options={tokenOptions}
          onValueChange={handleOutputTokenChange}
          onSelectChange={handleOutputTokenSelect}
        />
      </div>

      <Link href="/step-two" passHref>
        <button
          onClick={handleContinue}
          className="bg-green-500 text-white text-xl font-bold rounded-full shadow-lg hover:bg-green-600 w-96 h-16"
        >
          Continue
        </button>
      </Link>
    </div>
  );
}
