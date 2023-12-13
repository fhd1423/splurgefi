'use client';

import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, Alert } from '@mui/material';
import Head from 'next/head';
import router from 'next/router';

// MUI Date Picker Imports
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

// Custom Component Imports
import InputToken from '../components/automate/InputToken';
import OutputToken from '../components/automate/OutputToken';
import ToggleOrderType from '../components/automate/ToggleBuySell';
import ToggleSwap from '../components/automate/ToggleSwap';
import InputPercent from '../components/automate/InputPercent';
import InputBatches from '../components/automate/InputBatches';
import TradeSelector from '../components/automate/TradeSelector';
import DatePicker from '@/components/automate/DatePicker';
import TimeSelector from '@/components/automate/TimeSelector';
import LimitPriceInput from '@/components/limit/limitPrice';
import NavBar from '../components/NavBar';
import {
  useSignTypedData,
  usePrepareContractWrite,
  useContractWrite,
  useContractRead,
} from 'wagmi';

// SDK & Client Imports
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { supabase } from '../components/client';
import { uploadUserData, generateRandomSalt, parseJwt } from '@/helpers/utils';
import { ERC20abi } from '@/helpers/ERC20';

export default function Automate() {
  const SPLURGE_ADDRESS = '0xe3345D0cca4c478cf16cDd0B7D7363ba223c87AF';

  //AUTOMATION STATE
  const [toggleSelection, setToggleSelection] = useState('buy');
  const [toggleTrade, setToggleTrade] = useState('pumpinator');
  const [userInputError, setUserInputError] = useState('');
  const [outputOptions, setOutputOptions] = useState([]);
  const [limitPrice, setLimitPrice] = useState('');


  const inputOptions = [
    { label: 'WETH', value: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1' },
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

  //HANDLERS
  const handleMessageChange = (field, value) => {
    setMessage((prevMessage) => ({
      ...prevMessage,
      [field]: value,
    }));
  };

  const handleLimitPriceChange = (newValue) => {
    setLimitPrice(newValue);
  };

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

  //AUTH - DYNAMIC
  const { setShowAuthFlow, authToken, primaryWallet } = useDynamicContext();
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const handleWalletConnection = () => {
    setShowAuthFlow(true);
  };
  useEffect(() => {
    if (primaryWallet?.address && authToken) {
      const jwtData = parseJwt(authToken);

      uploadUserData(primaryWallet?.address, jwtData);
      handleMessageChange('recipient', primaryWallet?.address);
    }
    if (primaryWallet?.address) {
      setIsWalletConnected(true);
    }
  }, [primaryWallet?.address, authToken]);

  //ON-CHAIN INTERACTIONS
  const { data: allowance } = useContractRead({
    address: message.inputTokenAddress,
    abi: ERC20abi,
    functionName: 'allowance',
    args: [primaryWallet?.address, SPLURGE_ADDRESS],
    chainId: 42161,
    onSuccess(data) {
      return data;
    },
  });

  const { config } = usePrepareContractWrite({
    address: message.inputTokenAddress,
    abi: ERC20abi,
    functionName: 'approve',
    chainId: 42161,
    args: [SPLURGE_ADDRESS, message.amount],
    onSuccess(data) {
      return true;
    },
    onError(error) {
      return false;
    },
  });

  const { write: approveToken } = useContractWrite(config);

  const { data, isError, isLoading, isSuccess, signTypedData } =
    useSignTypedData({
      domain: {
        name: 'Splurge Finance',
        version: '1',
        chainId: 42161,
        verifyingContract: SPLURGE_ADDRESS, //CHANGE: to Splurge Addy
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
            remainingBatches: message.tranches,
            lastExecuted: 0,
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

  //SUPABASE - PAIRS
  const [averageMap, setAverageMap] = useState();
  function fetchPairsData() {
    return supabase.from('Pairs').select('*');
  }

  useEffect(
    () => {
      fetchPairsData().then((response) => {
        const { data: pairs, error } = response;

        function calculateAverage(arr) {
          return (
            arr.reduce((acc, val) => Number(acc) + Number(val), 0) / arr.length
          );
        }

        const averageMap = {};

        pairs.forEach((pair) => {
          const { tokenName } = pair;
          const avg15min = calculateAverage(pair['15min_avg'].close_prices);
          const avg60min = calculateAverage(pair['60min_avg'].close_prices);
          const avg240min = calculateAverage(pair['240min_avg'].close_prices);
          const avg1440min = calculateAverage(pair['1440min_avg'].close_prices);

          averageMap[tokenName] = [avg15min, avg60min, avg240min, avg1440min];
        });

        setAverageMap(averageMap);

        if (error) {
          console.error('Error fetching pairs data:', error);
          return;
        }

        const newOutputOptions = pairs.map((pair) => ({
          label: pair.tokenName,
          value:
            pair.path.split('-')[0] ===
            '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1' // if its WETH
              ? pair.path.split('-')[1] // Use the second part if the first part matches the specific string
              : pair.path.split('-')[0], // Otherwise, use the first part
        }));

        setOutputOptions(newOutputOptions);
      });
    },
    outputOptions,
    averageMap,
  );

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
            <Grid container spacing={1.25} justify='center'>
              <Grid item xs={12}>
                <ToggleOrderType
                  toggleTrade={toggleTrade}
                  setToggleTrade={setToggleTrade}
                />
              </Grid>
              <Grid item xs={12}>
                <InputToken
                  options={
                    toggleSelection === 'buy' ? inputOptions : outputOptions
                  }
                  onValueChange={handleMessageChange}
                  onSelectChange={handleMessageChange}
                  message={message}
                />
              </Grid>
              <Grid
                item
                xs={12}
                align='center'
                style={{ margin: '-20px 0px', zIndex: 2 }}
              >
                <ToggleSwap
                  selection={toggleSelection}
                  setSelection={setToggleSelection}
                  message={message}
                  handleMessageChange={handleMessageChange}
                />
              </Grid>
              <Grid
                item
                xs={12}
                style={{ marginTop: '-8px', marginBottom: '20px', zIndex: 1 }}
              >
                <OutputToken
                  options={
                    toggleSelection === 'buy' ? outputOptions : inputOptions
                  }
                  onValueChange={handleMessageChange}
                  onSelectChange={handleMessageChange}
                  message={message}
                />
              </Grid>
              {toggleTrade === 'pumpinator' ? (
                <React.Fragment>
                  <Grid item xs={4}>
                    {toggleSelection === 'buy' ? (
                      <InputPercent
                        title='Percent Change'
                        value={message.percentChange}
                        onValueChange={handleMessageChange}
                        isUpSelected={false} // Pass the derived state to the component
                        placeHolder={'0%'}
                      />
                    ) : (
                      <InputPercent
                        title='Percent Change'
                        value={message.percentChange}
                        onValueChange={handleMessageChange}
                        isUpSelected={true} // Pass the derived state to the component
                        placeHolder={'0%'}
                      />
                    )}
                  </Grid>
                  <Grid item xs={4}>
                    <InputBatches
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
                    <DatePicker
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
                </React.Fragment>) : (
                  <Grid item xs={12}>
                    <LimitPriceInput
                      label="Limit Price"
                      value={limitPrice}
                      onValueChange={handleLimitPriceChange}
                    />
                    <DatePicker
                      // selectedDate={selectedDate}
                      setSelectedDate={handleMessageChange}
                    />
                  </Grid>
              )}

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
                      if (allowance < message.amount) {
                        approveToken?.();
                      }
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
