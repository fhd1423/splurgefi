'use client';

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import CustomInputToken from '../components/CustomInputToken';
import TokenSelector from '../components/TokenSelector';
import CustomToggle from '../components/CustomToggle';
import { Typography, Box } from '@mui/material';
import router from 'next/router';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import CustomInputPercent from '../components/CustomInputPercent';
import CustomInputBatches from '../components/CustomInputBatches';
import TradeSelector from '../components/TradeSelector';
import dayjs from 'dayjs';
import CustomDatePicker from '@/components/CustomDatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { supabase } from '../components/client';
import NavBar from '../components/NavBar';
import LineChart from '@/components/LineChart';
import { useSignTypedData } from 'wagmi';

export default function Automate() {
  const [message, setMessage] = useState({
    inputTokenAddress: '0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889', // WETH
    outputTokenAddress: '0x52C6CCc28C9B5f0f4F37b61316CD4F14C2D4197D', // GROK
    recipient: '0xBb6AeaBdf61Ca96e80Aa239bA8cC7e436862E596',
    amount: 1, // Input token scaled(18 decimal places)
    tranches: 1,
    percentChange: 1,
    priceAvg: 1,
    deadline: 1,
    timeBwTrade: 1,
    slippage: 1,
    salt: 1,
  });

  const { data, isError, isLoading, isSuccess, signTypedData } =
    useSignTypedData({
      domain: {
        name: 'Splurge Finance',
        version: '1',
        chainId: 1,
        verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC', //CHANGE: to Splurge Addy
      },
      types: {
        conditionalOrder: [
          { name: 'inputTokenAddress', type: 'address' },
          { name: 'outputTokenAddress', type: 'address' },
          { name: 'recipient', type: 'address' },
          { name: 'amount', type: 'uint256' },
          { name: 'tranches', type: 'uint256' },
          { name: 'percentChange', type: 'uint256' },
          { name: 'priceAvg', type: 'uint256' },
          { name: 'deadline', type: 'uint256' },
          { name: 'timeBwTrade', type: 'uint256' },
          { name: 'slippage', type: 'uint256' },
          { name: 'salt', type: 'uint256' },
        ],
      },
      primaryType: 'conditionalOrder',
      message,

      async onSuccess(data, err) {
        await supabase.from('Trades').insert([
          {
            user: primaryWallet.address,
            pair: path,
            order: message,
            signature: data,
          },
        ]);
      },

      onError(data, error) {
        console.log('Error', { data, error });
      },
    });

  // Sample options for testing
  const outputOptions = [
    { label: 'GROK', value: '0x8390a1DA07E376ef7aDd4Be859BA74Fb83aA02D5' },
    { label: 'JOE', value: '0x76e222b07C53D28b89b0bAc18602810Fc22B49A8' },
    { label: 'ROLBIT', value: '0x046EeE2cc3188071C02BfC1745A6b17c656e3f3d' },
    { label: 'LINK', value: '0x514910771AF9Ca656af840dff83E8264EcF986CA' },
    { label: 'YUNKI', value: '0x52C6CCc28C9B5f0f4F37b61316CD4F14C2D4197D' },
  ];

  const inputOptions = [
    { label: 'WETH', value: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' },
    { label: 'WMATIC', value: '0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889' },
  ];

  const path =
    '0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889-0x52C6CCc28C9B5f0f4F37b61316CD4F14C2D4197D';

  const [toggleSelection, setToggleSelection] = useState('buy');
  const [selectedDate, setSelectedDate] = useState(dayjs());

  const [isWalletConnected, setIsWalletConnected] = useState(false);

  // Access setShowAuthFlow and primaryWallet from useDynamicContext
  const { setShowAuthFlow, primaryWallet } = useDynamicContext();

  // State for error messages
  const [userInputError, setUserInputError] = useState('');

  // Generic handler for message state updates
  const handleMessageChange = (field, value) => {
    setMessage((prevMessage) => ({
      ...prevMessage,
      [field]: value,
    }));
  };

  // Example of how to use handleMessageChange
  // handleMessageChange('inputTokenAddress', 'newAddress');

  // Validation function
  const validateInputs = () => {
    const fields = [
      'inputTokenAddress',
      'outputTokenAddress',
      'recipient',
      'amount',
      'tranches',
      'percentChange',
      'priceAvg',
      'deadline',
      'timeBwTrade',
      'slippage',
      'salt',
    ];
    const isValid = fields.every((field) => message[field]);
    setUserInputError(isValid ? '' : 'Please make sure all inputs are filled.');
    return isValid;
  };

  // Listen for changes in primaryWallet
  useEffect(() => {
    if (primaryWallet?.address) {
      setIsWalletConnected(true);
    }
  }, [primaryWallet?.address]);

  const handleWalletConnection = () => {
    setShowAuthFlow(true);
    // Additional logic can be added here if needed
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <NavBar inTradesPage={false} />

      <div className='h-screen bg-black flex flex-col justify-center items-center'>
        <Head>
          <title>Step One</title>
          <link rel='icon' href='/favicon.ico' />
        </Head>

        <Box
          sx={{
            width: 500,
            mx: 'auto',
            marginTop: '-30px', // Adjust this value to move the modal up
          }}
        >
          <Paper
            elevation={3}
            sx={{
              backgroundColor: '#2B2B2B',
              padding: 2,
              color: 'text.primary',
              maxWidth: '100%',
              mx: 'auto',
              borderRadius: '16px',
              // Applying a white glow effect:
              boxShadow: '0 0 15px 5px rgba(255, 255, 255, 0.3)',
            }}
          >
            <Grid container spacing={1.25}>
              <Grid item xs={12}>
                <CustomToggle
                  selection={toggleSelection}
                  setSelection={setToggleSelection}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomInputToken
                  title='Input Token'
                  options={
                    toggleSelection === 'buy' ? inputOptions : outputOptions
                  }
                  onValueChange={(e) => handleMessageChange('amount', e)}
                />
              </Grid>
              <Grid item xs={12}>
                <TokenSelector
                  title='Output Token'
                  options={
                    toggleSelection === 'buy' ? outputOptions : inputOptions
                  }
                  onValueChange={(e) =>
                    handleMessageChange('outputTokenAddress', e.target.value)
                  }
                />
              </Grid>
              <Grid item xs={4}>
                {toggleSelection === 'buy' ? (
                  <CustomInputPercent
                    title='Percent Change'
                    value={message.percentChange}
                    onValueChange={(e) =>
                      handleMessageChange('percentChange', e.target.value)
                    }
                    isUpSelected={false} // Pass the derived state to the component
                    placeHolder={'0%'}
                  />
                ) : (
                  <CustomInputPercent
                    title='Percent Change'
                    value={percentChange}
                    onValueChange={handlePercentChange}
                    isUpSelected={true} // Pass the derived state to the component
                    placeHolder={'0%'}
                  />
                )}
              </Grid>
              <Grid item xs={4}>
                <CustomInputBatches
                  title='Batches'
                  placeHolder={'5'}
                  value={message.tranches}
                  onValueChange={(e) =>
                    handleMessageChange('tranches', e.target.value)
                  }
                />
              </Grid>
              <Grid item xs={4}>
                <TradeSelector title='Trade based on' />
              </Grid>
              <Grid item xs={4}>
                <CustomDatePicker
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                />
              </Grid>

              <Grid item xs={4}>
                <TradeSelector
                  selectedTradeAction={message.timeBwTrade}
                  onTradeActionChange={(e) =>
                    handleMessageChange('timeBwTrades', e.target.value)
                  }
                  title='Time bw trades'
                />
              </Grid>

              <Grid item xs={4}>
                <CustomInputBatches
                  title='Slippage'
                  placeHolder={'5'}
                  value={message.slippage}
                  onValueChange={(e) =>
                    handleMessageChange('slippage', e.target.value)
                  }
                />
              </Grid>

              <Grid
                item
                xs={12}
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  pt: 4,
                }}
              >
                {!isWalletConnected ? (
                  <button
                    onClick={handleWalletConnection}
                    className='bg-green-500 text-white text-xl font-bold rounded-lg shadow-lg hover:bg-green-600 w-96 h-14 mt-[10px]'
                  >
                    Connect Wallet
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      signTypedData();
                    }}
                    className='bg-green-500 text-white text-xl font-bold rounded-lg shadow-lg hover:bg-green-600 w-96 h-14 mt-[10px]'
                  >
                    Start Automation
                  </button>
                )}
              </Grid>
            </Grid>
          </Paper>
          <LineChart />
        </Box>
        <div className='text-red-500 mt-2'>{userInputError}</div>
      </div>
    </LocalizationProvider>
  );
}
