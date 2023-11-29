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
  const [outputTokenValue, setOutputTokenValue] = useState('');
  const [selectedTradeAction, setSelectedTradeAction] = useState('');
  const [selectedTimeBwTrade, setSelectedTimeBwTrade] = useState('');

  const [batchValue, setBatchValue] = useState('');
  const [slippageValue, setSlippageValue] = useState('');
  const [selectedDate, setSelectedDate] = useState(dayjs());

  // State to hold selected tokens
  const [inputToken, setInputToken] = useState('');
  const [outputToken, setOutputToken] = useState('');

  const [toggleSelection, setToggleSelection] = useState('buy');

  // States for percent change and selected value
  const [percentChange, setPercentChange] = useState('');
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  // Access setShowAuthFlow and primaryWallet from useDynamicContext
  const { setShowAuthFlow, primaryWallet } = useDynamicContext();

  // State for error messages
  const [userInputError, setUserInputError] = useState('');

  const validateInputs = () => {
    let isValid = true;
    if (
      !inputToken ||
      !outputToken ||
      !inputTokenValue ||
      !percentChange ||
      !batchValue ||
      !selectedTradeAction ||
      !selectedDate ||
      !selectedTimeBwTrade ||
      !slippageValue
    ) {
      setUserInputError('Please make sure all inputs are filled.');
      isValid = false;
    } else {
      setUserInputError('');
    }

    return isValid;
  };

  // Input token addy - Rollbit
  const inputTokenAddy = '0x046EeE2cc3188071C02BfC1745A6b17c656e3f3d';
  const outputTokenAddy = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';

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

  const uploadConditionalOrder = async () => {
    try {
      const generateRandomSalt = () => {
        const randomBytes = new Uint8Array(64); // Generating 64 random bytes
        crypto.getRandomValues(randomBytes);
        return randomBytes;
      };

      const unixTimestamp = selectedDate.unix(); // Unix timestamp in seconds
      const signer = await primaryWallet.connector.getSigner();
      let selectedPercentChange = parseInt(percentChange, 10);
      let selectedPriceAverage = parseInt(selectedTradeAction, 10);
      let selectedAmount = inputTokenValue;

      // Step 1: Parse the Decimal Value
      const [wholePart, decimalPartRaw] = selectedAmount.includes('.')
        ? selectedAmount.split('.')
        : [selectedAmount, ''];
      // Step 2: Normalize Decimal Part
      const decimalPart = decimalPartRaw.padEnd(18, '0'); // Add trailing zeros to make it 18 decimal places
      // Step 3: Convert to Integer
      const wholePartBigInt = BigInt(wholePart);
      const decimalPartBigInt = BigInt(decimalPart);
      // Step 4: Scale to Blockchain Format
      let amountInWei =
        wholePartBigInt * BigInt(10) ** BigInt(18) + decimalPartBigInt;

      const generatedSalt = generateRandomSalt();
      const intBatches = parseInt(batchValue, 10);
      const intTimeBwTrade = parseInt(selectedTimeBwTrade, 10);
      const intSlippage = parseInt(slippageValue, 10);

      //Sign Payload, send payload and signature to backend
      const signature = await signer.signTypedData({
        account: primaryWallet.address,
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
            { name: 'orderType', type: 'string' },
            { name: 'amount', type: 'uint256' },
            { name: 'tranches', type: 'uint256' },
            { name: 'percentChange', type: 'uint256' },
            { name: 'priceAvg', type: 'uint256' },
            { name: 'deadline', type: 'uint256' },
            { name: 'timeBwTrade', type: 'uint256' },
            { name: 'slippage', type: 'uint256' },
            { name: 'salt', type: 'bytes' },
          ],
        },
        primaryType: 'conditionalOrder',
        message: {
          inputTokenAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
          outputTokenAddress: '0x8390a1DA07E376ef7aDd4Be859BA74Fb83aA02D5', // GROK
          recipient: '0xBb6AeaBdf61Ca96e80Aa239bA8cC7e436862E596',
          orderType: toggleSelection,
          amount: amountInWei, // Input token scaled(18 decimal places)
          tranches: intBatches,
          percentChange: selectedPercentChange,
          priceAvg: selectedPriceAverage,
          deadline: unixTimestamp,
          timeBwTrade: intTimeBwTrade,
          slippage: intSlippage,
          salt: generatedSalt,
        },
      });

      async function uploadData() {
        try {
          // Retrieve and store data to be uploaded to database
          const currentTimestamp = new Date().toISOString();
          const orderData = {
            inputTokenAddy: inputToken,
            outputTokenAddy: outputToken,
            recipient: primaryWallet.address,
            orderType: toggleSelection,
            amount: amountInWei,
            tranches: intBatches,
            percentChange: selectedPercentChange,
            priceAvg: selectedPriceAverage,
            deadline: unixTimestamp,
            timeBwTrade: intTimeBwTrade,
            slippage: intSlippage,
            salt: generatedSalt,
          };

          console.log('Order Data:', orderData);

          const { data, error } = await supabase.from('Trades').insert([
            {
              created_at: currentTimestamp,
              user: primaryWallet.address,
              pair: path,
              order: orderData,
              signature: signature,
              complete: false,
              ready: false,
              batches: intBatches,
              percent_change:
                toggleSelection === 'buy'
                  ? '-' + percentChange + '%'
                  : '+' + percentChange + '%',
              deadline: selectedDate.toISOString(),
              remainingBatches: intBatches,
              time_bw_batches: intTimeBwTrade,
              slippage: intSlippage,
            },
          ]);
        } catch (error) {
          console.error('Error uploading data to Supabase:', error);
        }
      }
      uploadData();
      router.push('/trades');
    } catch (error) {
      console.error('Error during signature or data upload:', error);
      // setErrorMessage("Signature denied or failed to upload data. Please try again.");
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
