'use client';

import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, Alert } from '@mui/material';
import Head from 'next/head';
import router from 'next/router';

// MUI Date Picker Imports
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

// Custom Component Imports
import CustomInputToken from '../components/CustomInputToken';
import TokenSelector from '../components/TokenSelector';
import CustomToggle from '../components/CustomToggle';
import CustomInputPercent from '../components/CustomInputPercent';
import CustomInputBatches from '../components/CustomInputBatches';
import TradeSelector from '../components/TradeSelector';
import CustomDatePicker from '@/components/CustomDatePicker';
import TimeSelector from '@/components/TimeSelector';
import NavBar from '../components/NavBar';
import { useSignTypedData } from 'wagmi';

// SDK & Client Imports
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { supabase } from '../components/client';
import { uploadUserData, generateRandomSalt, parseJwt } from '@/helpers/utils';

export default function Automate() {
  // Define a function to handle the asynchronous Supabase call
  function fetchPairsData() {
    return supabase.from('Pairs').select('*');
  }

  useEffect(() => {
    fetchPairsData().then((response) => {
      const { data: pairs, error } = response;

      if (error) {
        console.error('Error fetching pairs data:', error);
        return;
      }

      const newOutputOptions = pairs.map((pair) => ({
        label: pair.tokenName,
        value:
          pair.path.split('-')[0] ===
          '0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889' // if its WETH
            ? pair.path.split('-')[1] // Use the second part if the first part matches the specific string
            : pair.path.split('-')[0], // Otherwise, use the first part
      }));

      setOutputOptions(newOutputOptions);
    });
  }, []);

  const inputOptions = [
    { label: 'WMATIC', value: '0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889' },
  ];

  const [message, setMessage] = useState({
    inputTokenAddress: null, // WETH
    outputTokenAddress: null, // GROK
    recipient: null,
    amount: null, // Input token scaled(18 decimal places)
    tranches: null,
    percentChange: null,
    priceAvg: null,
    deadline: null,
    timeBwTrade: null,
    salt: generateRandomSalt(),
  });

  const [toggleSelection, setToggleSelection] = useState('buy');
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [userInputError, setUserInputError] = useState('');
  const [outputOptions, setOutputOptions] = useState([]);

  const { setShowAuthFlow, authToken, primaryWallet } = useDynamicContext();

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
      'salt',
    ];
    const isAnyFieldEmpty = fields.every((field) => message[field]);

    if (isAnyFieldEmpty) {
      setUserInputError('Please make sure all inputs are filled.');
      return false;
    } else {
      setUserInputError('');
      return true;
    }
  };

  const handleMessageChange = (field, value) => {
    setMessage((prevMessage) => ({
      ...prevMessage,
      [field]: value,
    }));
  };

  const handleWalletConnection = () => {
    setShowAuthFlow(true);
  };

  // Listen for changes in primaryWallet
  useEffect(() => {
    if (primaryWallet?.address && authToken) {
      // authenticateUserWithSupabase(authToken);
      const jwtData = parseJwt(authToken);

      uploadUserData(primaryWallet?.address, jwtData);
      handleMessageChange('recipient', primaryWallet?.address);
    }
    if (primaryWallet?.address) {
      setIsWalletConnected(true);
    }
  }, [primaryWallet?.address, authToken]);

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
          { name: 'salt', type: 'bytes32' },
        ],
      },
      primaryType: 'conditionalOrder',
      message,

      async onSuccess(data, err) {
        console.log('success');
        await supabase.from('Trades').insert([
          {
            user: primaryWallet.address,
            pair: `${message.inputTokenAddress}-${message.outputTokenAddress}`,
            order: message,
            signature: data,
            complete: false,
            ready: false,
          },
        ]);
        router.push('/trades');
      },

      onError(data, error) {
        console.log('Error', { data, error });
      },
      onSettled(data, error) {
        console.log('settled', { data, error });
      },
    });

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
                  onValueChange={handleMessageChange}
                  onSelectChange={handleMessageChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TokenSelector
                  title='Output Token'
                  options={
                    toggleSelection === 'buy' ? outputOptions : inputOptions
                  }
                  onValueChange={handleMessageChange}
                  onSelectChange={handleMessageChange}
                />
              </Grid>
              <Grid item xs={4}>
                {toggleSelection === 'buy' ? (
                  <CustomInputPercent
                    title='Percent Change'
                    value={message.percentChange}
                    onValueChange={handleMessageChange}
                    isUpSelected={false} // Pass the derived state to the component
                    placeHolder={'0%'}
                  />
                ) : (
                  <CustomInputPercent
                    title='Percent Change'
                    value={message.percentChange}
                    onValueChange={handleMessageChange}
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
                <TradeSelector
                  // currentMovAvg= message.priceAvg
                  onTradeActionChange={handleMessageChange}
                  title='Moving Avg.'
                  tokenAddy={message.outputTokenAddress}
                />
              </Grid>
              <Grid item xs={6}>
                <CustomDatePicker
                  // selectedDate={selectedDate}
                  setSelectedDate={handleMessageChange}
                />
              </Grid>

              <Grid item xs={6}>
                <TimeSelector
                  // selectedTradeAction={selectedTimeBwTrade}
                  onTradeActionChange={handleMessageChange}
                  title='Execution Interval'
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
                      console.log('Button clicked');
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
        </Box>

        {userInputError && <Alert severity='error'>{userInputError}</Alert>}
      </div>
    </LocalizationProvider>
  );
}
