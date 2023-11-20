import React, { useState, useEffect } from "react";
import Head from "next/head";
import Trade from "../components/Trade";
import { Grid } from "@mui/material";
import { DynamicContextProvider, DynamicWidget, useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { supabase } from "./client"
import NavBar from "../components/NavBar";

export default function Trades() {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const { setShowAuthFlow, primaryWallet } = useDynamicContext();
  const [userTrades, setUserTrades] = useState(new Map());

  useEffect(() => {
    const fetchTrades = async () => {
      if (primaryWallet?.address) {
        const { data, error } = await supabase
          .from('Trades')
          .select('id, pair, complete, batches, percent_change, deadline, remainingBatches')
          .eq('user', primaryWallet.address);
    
        if (error) {
          console.error('Error fetching trades:', error);
          return;
        }
        
        let newTrades = new Map();
        data.forEach(trade => {
          newTrades.set(trade.id, [trade.pair, trade.complete, trade.batches, trade.percent_change, trade.deadline, trade.remainingBatches]);
        });
        
        setUserTrades(newTrades);
      }
    };

    fetchTrades();
  }, [primaryWallet?.address]);

  return (

    <div className="h-screen bg-black flex flex-col">
      <NavBar inTradesPage={true}/>
      <div className="h-screen bg-black flex flex-col justify-start items-start pt-12 pl-10">
        <DynamicContextProvider
          settings={{
            environmentId: "a8961ac2-2a97-4735-a2b2-253f2485557e",
            walletConnectors: [EthereumWalletConnectors],
            siweStatement: "Welcome to Splurge! Signing this gas-free message verifies you as the owner of this wallet."
          }}
        >
          <Head>
            <title>Trades</title>
            <link rel="icon" href="/favicon.ico" />
          </Head>

          <div className="w-full flex justify-between items-center p-4">
            <h1 className="text-4xl text-white font-semibold">Trades</h1>
            <DynamicWidget   
                innerButtonComponent={<button className="h-10">Connect Wallet</button>}
            />
          </div>

          {/* <p className="text-white">{primaryWallet?.address || "Address null"}</p> */}
          {/* <p className="text-white">{userTrades.size}</p> */}

          {userTrades.size > 0 ? 
            <Grid container spacing={3} direction="column">
              {Array.from(userTrades).map(([id, [pair, complete, batches, percentChange, deadline, remainingBatches]]) => (
                <Grid item key={id}>
                  <Trade 
                    complete={complete}
                    batches={batches}
                    percentChange={percentChange}
                    deadline={deadline}
                    remainingBatches={remainingBatches}
                  />
                </Grid>
              ))}
            </Grid>
            : 
            <h3 className="text-white p-4">No trades linked to account. Please make sure you connect your wallet.</h3>
          }
        </DynamicContextProvider>
      </div>
    </div>

    
  );
}
