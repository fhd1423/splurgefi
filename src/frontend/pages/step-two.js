"use client";

import React from "react";
import Head from "next/head";
import CustomInputPercent from "../components/CustomInputPercent";
import TradeSelector from "../components/TradeSelector";
import Grid from "@mui/material/Grid";
import Link from "next/link";
import { useState } from "react";

export default function StepTwo() {
  // State for percent change
  const [percentChange, setPercentChange] = useState("");

  // Handler to update percent change
  const handlePercentChange = (event) => {
    setPercentChange(event.target.value);
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
      {/* {percentChange && selectedToken && (
        <h2 className="pb-10">
          Summary: When {selectedToken} increases by {percentChange}%, sell for
          DAI
        </h2>
      )} */}
      <Link href="/step-three" passHref>
        <button className="bg-green-500 text-white text-xl font-bold rounded-full shadow-lg hover:bg-green-600 w-96 h-16">
          Continue
        </button>
      </Link>
    </div>
  );
}
