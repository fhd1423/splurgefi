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
  });

  useEffect(() => {
    // Retrieve the state from localStorage
    const savedTradeDetails = localStorage.getItem("tradeDetails");
    if (savedTradeDetails) {
      setTradeDetails(JSON.parse(savedTradeDetails));
    }
  }, []);

  // States for percent change and selected value
  const [percentChange, setPercentChange] = useState("");
  const [selectedSelectorValue, setSelectedSelectorValue] = useState("");

  const handlePercentChange = (event) => {
    setPercentChange(event.target.value);
    // You can also do other things with the new value here
  };

  const handleSelectorChange = (event) => {
    // Assuming you have a state to store the selected value
    setSelectedSelectorValue(event.target.value);
    // You can also do other things with the new value here
  };

  // State for the trade action
  const [selectedTradeAction, setSelectedTradeAction] = useState("");

  // Handler to update trade action
  const handleTradeActionChange = (action) => {
    console.log("Selected Trade:", action);
    setSelectedTradeAction(action); // Corrected to use the right state setter function
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
        <Grid container spacing={10} justifyContent="center">
          <Grid item>
            <CustomInputPercent
              title="Percent Change"
              value={percentChange}
              onValueChange={handlePercentChange}
              onSelectorChange={handleSelectorChange}
              placeHolder={"0%"}
              selectorValue={selectedSelectorValue}
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
      {percentChange && selectedSelectorValue && selectedTradeAction && (
        <h2 className="pb-10 text-white">
          Summary: When{" "}
          {selectedTradeAction === "Buy output token"
            ? tradeDetails.outputToken
            : tradeDetails.inputToken}{" "}
          {selectedSelectorValue === "+" ? "increases" : "decreases"} by{" "}
          {percentChange}%,
          {selectedTradeAction === "Buy output token"
            ? " buy "
            : " sell "} for{" "}
          {selectedTradeAction === "Buy output token"
            ? tradeDetails.inputToken
            : tradeDetails.outputToken}
          {"."}
        </h2>
      )}
      <Link href="/step-three" passHref>
        <button className="bg-green-500 text-white text-xl font-bold rounded-full shadow-lg hover:bg-green-600 w-96 h-16">
          Continue
        </button>
      </Link>
    </div>
  );
}
