import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Trade from '../components/Trade';
import { Grid } from '@mui/material';
import {
  DynamicContextProvider,
  DynamicWidget,
  useDynamicContext,
} from '@dynamic-labs/sdk-react-core';
import { EthereumWalletConnectors } from '@dynamic-labs/ethereum';
import { supabase } from '../components/client';
import NavBar from '../components/NavBar';

export default function Trades() {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const { setShowAuthFlow, primaryWallet } = useDynamicContext();
  const [userTrades, setUserTrades] = useState(new Map());
  const [userTradeSignatures, setUserTradeSignatures] = useState(new Array());

  const checkRemainingBatches = (trade_signature) => {
    const contractABI = ['NEED TO ADD ABI'];

    const contractAddress = 'CONTRACT_ADDRESS';
    const contract = new web3.eth.Contract(contractABI, contractAddress);

    contract.events
      .TradeEvent({
        filter: { _signature: 'WE NEED TO ADD SIGNATURE HER' },
        fromBlock: 'latest',
      })
      .on('data', (event) => {
        console.log(event);
      })
      .on('error', console.error);
  };

  useEffect(() => {
    const fetchUsersTradeSignatures = async () => {
      if (primaryWallet?.address) {
        const { data, error } = await supabase
          .from('Trades')
          .select('signature')
          .eq('user', primaryWallet.address);

        if (error) {
          console.error('Error fetching trade signatures:', error);
          return;
        }

        // Empty array
        const signatureArray = [];

        // data.forEach(trade => {
        //   signatureArray.push()
        // });
      }
    };
    const fetchTrades = async () => {
      if (primaryWallet?.address) {
        const { data, error } = await supabase
          .from('Trades')
          .select(
            'id, pair, complete, batches, percent_change, deadline, remainingBatches',
          )
          .eq('user', primaryWallet.address);

        if (error) {
          console.error('Error fetching trades:', error);
          return;
        }

        let newTrades = new Map();
        data.forEach((trade) => {
          newTrades.set(trade.id, [
            trade.pair,
            trade.complete,
            trade.batches,
            trade.percent_change,
            trade.deadline,
            trade.remainingBatches,
          ]);
        });

        setUserTrades(newTrades);
      }
    };

    // Check remaining balances from smart contract

    // Update remaining balances
    fetchTrades();
  }, [primaryWallet?.address]);

  return (
    <div className='h-screen bg-black flex flex-col'>
      <NavBar inTradesPage={true} />
      <div className='h-screen bg-black flex flex-col justify-start items-start pt-12 pl-10'>
        <DynamicContextProvider
          settings={{
            environmentId: 'a8961ac2-2a97-4735-a2b2-253f2485557e',
            walletConnectors: [EthereumWalletConnectors],
            siweStatement:
              'Welcome to Splurge! Signing this gas-free message verifies you as the owner of this wallet.',
          }}
        >
          <Head>
            <title>Trades</title>
            <link rel='icon' href='/favicon.ico' />
          </Head>

          <div className='w-full flex justify-between items-center p-4'>
            <h1 className='text-4xl text-white font-semibold'>Trades</h1>
            <DynamicWidget
              innerButtonComponent={
                <button className='h-10'>Connect Wallet</button>
              }
            />
          </div>

          {/* <p className="text-white">{primaryWallet?.address || "Address null"}</p> */}
          {/* <p className="text-white">{userTrades.size}</p> */}

          {userTrades.size > 0 ? (
            <div className='flex flex-col overflow-y-auto space-y-5 pb-10 w-full'>
              {Array.from(userTrades).map(
                ([
                  id,
                  [
                    pair,
                    complete,
                    batches,
                    percentChange,
                    deadline,
                    remainingBatches,
                  ],
                ]) => (
                  <div key={id} className='first:mt-0 mt-3'>
                    <Trade
                      complete={complete}
                      batches={batches}
                      percentChange={percentChange}
                      deadline={deadline}
                      remainingBatches={remainingBatches}
                    />
                  </div>
                ),
              )}
            </div>
          ) : (
            <h3 className='text-white p-4'>
              No trades linked to account. Please make sure you connect your
              wallet.
            </h3>
          )}
        </DynamicContextProvider>
      </div>
    </div>
  );
}
