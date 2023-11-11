"use client";

import React, { useState } from "react";
import Head from "next/head";
import CustomInputToken from "../components/CustomInputToken";
import Link from "next/link";

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

  // Handlers to update the state
  const handleInputTokenChange = (value) => {
    console.log("Input Token Value:", value); // Log the input token value
    setInputTokenValue(value);
  };

  const handleOutputTokenChange = (value) => {
    console.log("Output Token Value:", value); // Log the output token value
    setOutputTokenValue(value);
  };

  const handleInputTokenSelect = (token) => {
    console.log("Input Token Selected:", token); // Log the input token selection
    setInputToken(token);
  };

  const handleOutputTokenSelect = (token) => {
    console.log("Output Token Selected:", token); // Log the output token selection
    setOutputToken(token);
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

      <div className="space-y-8 pt-6 pb-12">
        <CustomInputToken
          title="Input Token"
          options={tokenOptions}
          onValueChange={handleInputTokenChange}
          onSelectChange={handleInputTokenSelect}
        />
        <CustomInputToken
          title="Output Token"
          options={tokenOptions}
          onValueChange={handleOutputTokenChange}
          onSelectChange={handleOutputTokenSelect}
        />
      </div>

      <Link href="/step-two" passHref>
        <button className="bg-green-500 text-white text-xl font-bold rounded-full shadow-lg hover:bg-green-600 w-96 h-16">
          Continue
        </button>
      </Link>
    </div>
  );
}
