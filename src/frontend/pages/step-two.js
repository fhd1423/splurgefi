"use client";

import React from "react";
import Head from "next/head";
import CustomInputPercent from "../components/CustomInputPercent";
import CustomInputToken from "../components/CustomInputToken";
import Grid from "@mui/material/Grid";
import Link from "next/link";

export default function StepTwo() {
  const tokenOptions = [
    { label: "Token A", value: "A" },
    { label: "Token B", value: "B" },
  ];

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
            <CustomInputPercent title="Percent Change" />
          </Grid>
          <Grid item>
            <CustomInputToken title="Token" options={tokenOptions} />
          </Grid>
        </Grid>
      </div>

      <Link href="/step-three" passHref>
        <button className="bg-green-500 text-white text-xl font-bold rounded-full shadow-lg hover:bg-green-600 w-96 h-16">
          Continue
        </button>
      </Link>
    </div>
  );
}
