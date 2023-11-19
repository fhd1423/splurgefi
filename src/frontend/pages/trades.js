import React from "react";
import Head from "next/head";
import Trade from "../components/Trade";
import { Grid } from "@mui/material";
import { useState, useEffect } from "react";
import { supabase } from "./client"

export default function Trades() {

  const [walletAddress, setWalletAddress] = useState('');

  // Mapping of pairs to status 
  const [userTrades, setUserTrades] = useState(new Map());

  useEffect(() => {
    const address = localStorage.getItem('walletAddress');
    console.log("ADDRESS IN USE EFFECT:", address); 
    // console.log("WALLET ADDRESS:", walletAddress); 

    if (address !== '') {
      setWalletAddress(address);
      tradeStatus(address); 
    }
  }, []);

  // Use primary wallet address (verified_credential_address to get verified_credential_id (primary key)
  // const fetchUserId = async (address) => {

  //   console.log("ADDRES INSIDE TRADES:", address);

  //   const { data, error } = await supabase
  //     .from('Users')
  //     .select('verified_credential_id')
  //     .eq('verified_credential_address', address)
  
  //     if (error) {
  //       console.log('error', error)
  //     } else {

  //       console.log("User id:", data[0]?.verified_credential_id)
  //       return data[0]?.verified_credential_id;
  //     }
  
  // };

  const tradeStatus = async (address) => {
    const { data, error } = await supabase
      .from('Trades')
      .select('pair, complete')
      .eq('user', address);
  
    if (error) {
      console.log('error', error);
    } else {
      let newTrades = new Map();
      data.forEach(trade => {
        newTrades.set(trade.pair, trade.complete);
      });
      setUserTrades(newTrades);
    }
  };

  return (
    <div className="h-screen bg-black flex flex-col justify-start items-start pt-12 pl-10">
      <Head>
        <title>Trades</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
  
      <h1 className="text-4xl text-white mb-6 font-semibold">Trades</h1>
  
      {/* <p>Number of trades: {userTrades.size}</p> */}

      <Grid container spacing={3} direction="column">
        {Array.from(userTrades).map(([pair, complete]) => (
          <Grid item key={pair}>
            <Trade complete={complete} />
          </Grid>
        ))}
      </Grid>
    </div>
  );
}
