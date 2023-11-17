"use client";

import Head from "next/head";
import CustomInputPercent from "../components/CustomInputPercent";
import TradeSelector from "../components/TradeSelector";
import Grid from "@mui/material/Grid";
import Link from "next/link";
import React, { useEffect, useState } from "react";

export default function StepTwo() {
  // Retreive data from previous view
  const [tradeDetails, setTradeDetails] = useState({
    inputTokenValue: "",
    outputTokenValue: "",
    inputToken: "",
    outputToken: "",
    toggleSelection: "", 
  });

  const [isUpSelected, setIsUpSelected] = useState(null);

  useEffect(() => {
    // Retrieve the state from localStorage
    const savedTradeDetails = localStorage.getItem("tradeDetails");
    if (savedTradeDetails) {
      const details = JSON.parse(savedTradeDetails);
      setTradeDetails(details);
      
      // Set the arrow direction based on the trade action
      setIsUpSelected(details.toggleSelection === 'sell');

    }
  }, []);

    // Store the values locally to pass to step-three
  const handleContinue = () => {
    localStorage.setItem(
      "tradeDetails",
      JSON.stringify({
        inputTokenValue: tradeDetails.inputTokenValue, 
        outputTokenValue: tradeDetails.outputTokenValue, 
        inputToken: tradeDetails.inputToken, 
        outputToken: tradeDetails.outputToken, 
        toggleSelection: tradeDetails.toggleSelection, 
        percentChange, 
        selectedTradeAction 
      })
    );
  };

  // States for percent change and selected value
  const [percentChange, setPercentChange] = useState("");
  // const [selectedSelectorValue, setSelectedSelectorValue] = useState("");

  const handlePercentChange = (event) => {
    setPercentChange(event.target.value);
  };

  // const handleSelectorChange = (event) => {
  //   setSelectedSelectorValue(event.target.value);
  // };

  // State for the trade action
  const [selectedTradeAction, setSelectedTradeAction] = useState("");

  // Handler to update trade action
  const handleTradeActionChange = (action) => {
    // console.log("Selected Trade:", action);
    setSelectedTradeAction(action); 
  };

  return (
    <div className="h-screen bg-black flex flex-col justify-center items-center">
      <Head>
        <title>Step Two</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="pb-10" style={{ textAlign: "center", width: "100%" }}>
        <h1 className="text-4xl text-white mb-6 font-semibold">
          When should the trade be executed?
        </h1>
        <h3 className="text-lg text-custom-green font-bold">Step 2</h3>
      </div>
      <div className="pt-4 pb-12">
        {/* <CustomInputPercent
            title="Percent Change"
            value={percentChange}
            onValueChange={handlePercentChange}
            isUpSelected={isUpSelected} // Pass the derived state to the component
            onToggle={() => setIsUpSelected(!isUpSelected)} // Toggle function for the arrow
            placeHolder={"0%"}
          /> */}
        <Grid container spacing={10} justifyContent="center">
          <Grid item>
            <CustomInputPercent
              title="Percent Change"
              value={percentChange}
              onValueChange={handlePercentChange}
              isUpSelected={isUpSelected} // Pass the derived state to the component
              onToggle={() => setIsUpSelected(!isUpSelected)} // Toggle function for the arrow
              placeHolder={"0%"}
            />
          </Grid>
          <Grid item>
            <TradeSelector
              selectedTradeAction={selectedTradeAction}
              onTradeActionChange={handleTradeActionChange}
            />
          </Grid>
        </Grid>
      </div>
      {/* <h2 className="pb-10">{tradeDetails.inputTokenValue}</h2> */}
      {percentChange && selectedTradeAction &&(
        <h1 className="text-white">
          Summary: When{" "}
          {tradeDetails.toggleSelection === "buy"
            ? tradeDetails.outputToken
            : tradeDetails.inputToken}{" "}
          {isUpSelected === true ? "increases" : "decreases"} by{" "}
          {percentChange}% over the {selectedTradeAction},
          {tradeDetails.toggleSelection === "buy"
            ? " buy "
            : " sell "} with{" "}
          {tradeDetails.toggleSelection === "buy"
            ? tradeDetails.inputToken
            : tradeDetails.outputToken}
          {"."}
        </h1>
      )}

      <div className="pt-20"> 
        <Link href="/step-three" passHref>
          <button onClick={handleContinue} 
          className="bg-green-500 text-white text-xl font-bold rounded-full shadow-lg hover:bg-green-600 w-96 h-16">
            Continue
          </button>
        </Link>
      </div>
    </div>
  );
}
