'use client';

import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, Alert } from '@mui/material';
import Head from 'next/head';
import dayjs from 'dayjs';
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

// SDK & Client Imports
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { supabase } from '../components/client';

export default function Automate() {
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

  // State to hold input values
  const [inputTokenValue, setInputTokenValue] = useState('');
  const [selectedTradeAction, setSelectedTradeAction] = useState('');
  const [selectedTimeBwTrade, setSelectedTimeBwTrade] = useState('');
  const [batchValue, setBatchValue] = useState('');
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [inputToken, setInputToken] = useState('');
  const [outputToken, setOutputToken] = useState('');
  const [toggleSelection, setToggleSelection] = useState('buy');
  const [percentChange, setPercentChange] = useState('');
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [userInputError, setUserInputError] = useState('');

  const { setShowAuthFlow, authToken, primaryWallet } = useDynamicContext();

  const validateInputs = () => {
    const fields = [
      inputToken,
      outputToken,
      inputTokenValue,
      percentChange,
      batchValue,
      selectedTradeAction,
      selectedDate,
      selectedTimeBwTrade,
    ];
    const isAnyFieldEmpty = fields.some((field) => !field);

    if (isAnyFieldEmpty) {
      setUserInputError('Please make sure all inputs are filled.');
      return false;
    } else {
      setUserInputError('');
      return true;
    }
  };

  // Handlers to update the state
  const handleInputTokenChange = (value) => {
    console.log('Input Token Value:', value);
    setInputTokenValue(value);
  };

  const handleOutputTokenChange = (value) => {
    console.log('Output Token Value:', value);
    setOutputTokenValue(value);
  };

  const handleInputTokenSelect = (token) => {
    console.log('Input Token Selected:', token);
    setInputToken(token);
  };

  const handleOutputTokenSelect = (token) => {
    console.log('Output Token Selected:', token);
    setOutputToken(token);
  };

  const handleTradeActionChange = (action) => {
    console.log('Selected Trade:', action);
    setSelectedTradeAction(action);
  };

  const handleTimeBwTradeChange = (action) => {
    console.log('Selected time bw trades:', action);
    setSelectedTimeBwTrade(action);
  };

  const handlePercentChange = (event) => {
    console.log('Selected percent change:', event);
    setPercentChange(event.target.value);
  };

  const handleWalletConnection = () => {
    setShowAuthFlow(true);
  };

  const uploadUserData = async (publicAddress, metadata) => {
    const userData = {
      verified_credential_address: publicAddress,
      created_at: new Date().toISOString(),
      metadata: metadata,
    };

    try {
      // Perform an upsert operation
      const { data, error } = await supabase.from('Users').upsert(userData, {
        onConflict: 'verified_credential_address',
        ignoreDuplicates: true, // Ensure it doesn't update existing records
      });

      if (error) {
        console.error('Error uploading user data to Supabase', error);
        return;
      }
      console.log('User data successfully uploaded to Supabase', data);
    } catch (error) {
      console.error('Error in uploadUserData function', error);
    }
  };

  function parseJwt(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join(''),
      );

      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('Error decoding JWT', e);
      return null;
    }
  }

  // Listen for changes in primaryWallet
  useEffect(() => {
    if (primaryWallet?.address && authToken) {
      // authenticateUserWithSupabase(authToken);
      const jwtData = parseJwt(authToken);

      uploadUserData(primaryWallet?.address, jwtData);
    }
    if (primaryWallet?.address) {
      setIsWalletConnected(true);
    }
  }, [primaryWallet?.address, authToken]);

  // Utility function to generate random salt
  function generateRandomSalt() {
    const randomBytes = new Uint8Array(64); // Generating 64 random bytes
    crypto.getRandomValues(randomBytes);
    return (
      '0x' +
      Array.from(randomBytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
    );
  }

  // Function to convert token amount to Wei
  function toWei(amount) {
    const [whole, decimal = ''] = amount.toString().split('.');
    const wholeBigInt = BigInt(whole);
    const decimalBigInt = BigInt(decimal.padEnd(18, '0'));
    return wholeBigInt * BigInt(10) ** BigInt(18) + decimalBigInt;
  }

  // Function to upload data
  async function uploadData(primaryWallet, signature, orderData, router) {
    try {
      const currentTimestamp = new Date().toISOString();
      const { data, error } = await supabase.from('Trades').insert([
        {
          created_at: currentTimestamp,
          user: primaryWallet?.address,
          pair: path,
          order: orderData,
          signature: signature,
          complete: false,
          ready: false,
          batches: parseInt(batchValue, 10),
          percent_change:
            orderData.orderType === 'buy'
              ? '-' + orderData.percentChange + '%'
              : '+' + orderData.percentChange + '%',
          deadline: selectedDate.toISOString(),
          remainingBatches: parseInt(batchValue, 10),
          time_bw_batches: parseInt(selectedTimeBwTrade, 10),
        },
      ]);
      router.push('/trades');
    } catch (error) {
      console.error('Error uploading data to Supabase:', error);
    }
  }

  const uploadConditionalOrder = async () => {
    try {
      const unixTimestamp = selectedDate.unix();
      const signer = await primaryWallet.connector.getSigner();

      // Prepare order data
      const orderData = {
        inputTokenAddress: inputToken,
        outputTokenAddress: outputToken,
        recipient: primaryWallet.address,
        orderType: toggleSelection,
        amount: toWei(inputTokenValue).toString(),
        tranches: parseInt(batchValue, 10),
        percentChange: parseInt(percentChange, 10),
        priceAvg: parseInt(selectedTradeAction, 10),
        deadline: unixTimestamp,
        timeBwTrade: parseInt(selectedTimeBwTrade, 10),
        salt: generateRandomSalt(),
      };

      // Sign the data
      const signature = await signer.signTypedData({
        account: primaryWallet.address,
        domain: {
          name: 'Splurge Finance',
          version: '1',
          chainId: 1,
          verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC', // Change as needed
        },
        types: {
          conditionalOrder: [
            { name: 'inputTokenAddress', type: 'address' },
            { name: 'outputTokenAddress', type: 'address' },
            { name: 'recipient', type: 'address' },
            { name: 'orderType', type: 'string' },
            { name: 'amount', type: 'uint256' },
            { name: 'tranches', type: 'uint256' },
            { name: 'percentChange', type: 'uint256' },
            { name: 'priceAvg', type: 'uint256' },
            { name: 'deadline', type: 'uint256' },
            { name: 'timeBwTrade', type: 'uint256' },
            { name: 'salt', type: 'bytes' },
          ],
        },
        primaryType: 'conditionalOrder',
        message: orderData,
      });

      // Upload data
      await uploadData(primaryWallet, signature, orderData, router);
    } catch (error) {
      console.error('Error during signature or data upload:', error);
    }
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
                  onValueChange={handleInputTokenChange}
                  onSelectChange={handleInputTokenSelect}
                />
              </Grid>
              <Grid item xs={12}>
                <TokenSelector
                  title='Output Token'
                  options={
                    toggleSelection === 'buy' ? outputOptions : inputOptions
                  }
                  onValueChange={handleOutputTokenChange}
                  onSelectChange={handleOutputTokenSelect}
                />
              </Grid>
              <Grid item xs={4}>
                {toggleSelection === 'buy' ? (
                  <CustomInputPercent
                    title='Percent Change'
                    value={percentChange}
                    onValueChange={handlePercentChange}
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
                  value={batchValue}
                  onValueChange={(e) => setBatchValue(e.target.value)}
                />
              </Grid>
              <Grid item xs={4}>
                <TradeSelector
                  selectedTradeAction={selectedTradeAction}
                  onTradeActionChange={handleTradeActionChange}
                  title='Moving Avg.'
                  tokenAddy={outputToken}
                />
              </Grid>
              <Grid item xs={6}>
                <CustomDatePicker
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                />
              </Grid>

              <Grid item xs={6}>
                <TimeSelector
                  selectedTradeAction={selectedTimeBwTrade}
                  onTradeActionChange={handleTimeBwTradeChange}
                  title='Time bw trades'
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
                      if (validateInputs()) {
                        uploadConditionalOrder();
                      }
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
