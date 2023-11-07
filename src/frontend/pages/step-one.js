"use client";

import React, { useState } from "react";
import Head from "next/head";
import CustomInputToken from "../components/CustomInputToken";
import Link from "next/link";

export default function StepOne() {
  const [value, setValue] = useState("");
  const tokenOptions = [
    { label: "Token A", value: "A" },
    { label: "Token B", value: "B" },
  ];

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
        <CustomInputToken title="Input Token" options={tokenOptions} />
        <CustomInputToken title="Output Token" options={tokenOptions} />
      </div>

      <Link href="/step-two" passHref>
        <button className="bg-green-500 text-white text-xl font-bold rounded-full shadow-lg hover:bg-green-600 w-96 h-16">
          Continue
        </button>
      </Link>
    </div>
  );
}
