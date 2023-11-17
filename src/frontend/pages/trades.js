import React from "react";
import Head from "next/head";
import Trade from "../components/Trade";
import { Grid } from "@mui/material";

export default function Trades() {
  return (
    <div className="h-screen bg-black flex flex-col justify-start items-start pt-12 pl-10">
      <Head>
        <title>Trades</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <h1 className="text-4xl text-white mb-6 font-semibold">Trades</h1>

      {/* <Trade complete={false}/>

      <Trade complete={true}/> */}

      <Grid container spacing={5} direction="column">
        <Grid item>
          <Trade complete={false} />
        </Grid>
        <Grid item>
          <Trade complete={true} />
        </Grid>
      </Grid>
    </div>
  );
}
