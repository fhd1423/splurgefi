import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Trade from '../components/trades/Trade';
import {
  DynamicContextProvider,
  DynamicWidget,
  useDynamicContext,
} from '@dynamic-labs/sdk-react-core';
import { EthereumWalletConnectors } from '@dynamic-labs/ethereum';
import { supabase } from '../components/client';
import NavBar from '../components/NavBar';

export default function Trades() {
  const { setShowAuthFlow, primaryWallet } = useDynamicContext();
  const [userTrades, setUserTrades] = useState(new Map());

  const getNameFromPair = async (pair) => {
    const { data: payingETH } = await supabase
      .from('Pairs')
      .select('tokenName')
      .eq('path', pair);

    if (payingETH[0]) return `ETH -> ${payingETH[0].tokenName}`;
    else {
      const { data: payingToken } = await supabase
        .from('Pairs')
        .select('tokenName')
        .eq('path', `${pair.split('-')[1]}-${pair.split('-')[0]}`);

      if (payingToken[0]) return `${payingToken[0].tokenName} -> ETH`;
      return `Unkown Trade Pair`;
    }
  };

  async function updateTradeStatus(tradeId) {
    try {
      const { data, error } = await supabase
        .from('Trades')
        .update({ ['tradeStopped']: true })
        .eq('id', tradeId);

      if (error) throw error;
      console.log('Trade updated successfully:', data);
    } catch (error) {
      console.error('Error updating trade:', error);
    }
  }

  useEffect(() => {
    const fetchTrades = async () => {
      if (primaryWallet?.address) {
        const { data, error } = await supabase
          .from('Trades')
          .select('*')
          .eq('user', primaryWallet.address);

        if (error) {
          console.error('Error fetching trades:', error);
          return;
        }

        const tradesPromises = data.map(async (trade) => ({
          id: trade.id,
          details: [
            await getNameFromPair(trade.pair),
            trade.pair,
            trade.complete,
            trade.order.tranches,
            trade.order.percentChange,
            trade.order.deadline,
            trade.remainingBatches,
          ],
        }));

        const tradesResults = await Promise.all(tradesPromises);
        let newTrades = new Map(
          tradesResults.map((item) => [item.id, item.details]),
        );

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
                    tokenName,
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
                      id={id}
                      name={tokenName}
                      complete={complete}
                      batches={batches}
                      percentChange={`${percentChange}%`}
                      deadline={deadline}
                      remainingBatches={remainingBatches}
                      onStopTrade={updateTradeStatus}
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
