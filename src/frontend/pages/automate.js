'use client';

import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, Alert } from '@mui/material';
import Head from 'next/head';
import { getAddress } from 'viem';
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
import NavBar from '../components/NavBar';
import TradeSummaryDropdown from '@/components/automate/TradeSummaryDropdown';
import AvgPriceDropdown from '@/components/automate/AvgPriceDropdown';
import Popover from '@mui/material/Popover';

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
  const WETH_ADDRESS = '0x82af49447d8a07e3bd95bd0d56f35241523fbab1';

  //STATE
  const [toggleSelection, setToggleSelection] = useState('buy');
  // const [toggleTrade, setToggleTrade] = useState('pro');
  const [userInputError, setUserInputError] = useState('');
  const [allInputsFilled, setInputsFilled] = useState(false);
  const [correctTokensFilled, setCorrectTokensFilled] = useState(false);
  const [isTradeSumAccordionExpanded, setIsTradeSumAccordionExpanded] =
    useState(true);
  const [tokenBalance, setTokenBalance] = useState(null);

  const [message, setMessage] = useState({
    inputTokenAddress: WETH_ADDRESS, // DEFAULT INPUT - WETH
    outputTokenAddress: '0xd77b108d4f6cefaa0cae9506a934e825becca46e', // DEFAULT OUTPUT - WINR
    recipient: null,
    amount: null, // Input token scaled(18 decimal places)
    tranches: null,
    percentChange: null,
    priceAvg: 5,
    deadline: null,
    timeBwTrade: null,
    salt: generateRandomSalt(),
  });

  const [currentInput, setCurrentInput] = useState({
    name: 'WETH',
    address: WETH_ADDRESS,
    logoURI:
      'https://assets.coingecko.com/coins/images/2518/thumb/weth.png?1696503332',
    symbol: 'WETH',
  });

  const [currentOutput, setCurrentOutput] = useState({
    name: 'WINR',
    address: '0xd77b108d4f6cefaa0cae9506a934e825becca46e',
    logoURI:
      'https://assets.coingecko.com/coins/images/29340/thumb/WINR.png?1696528290',
    symbol: 'WINR',
  });

  // HANDLERS
  const handleMessageChange = (field, value) => {
    setMessage((prevMessage) => ({
      ...prevMessage,
      [field]: value,
    }));
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

    const isValidSwap = fields.some((field) => message[field] == WETH_ADDRESS);

    if (!isValidSwap) {
      setUserInputError(`Either input or output must be WETH`);
      return false;
    }

    const isAnyFieldEmpty = fields.some((field) => !message[field]);

    if (isAnyFieldEmpty) {
      setUserInputError('Please make sure all inputs are filled.');
      return false;
    }

    setUserInputError('');
    return true;
  };

  const tradeEntered = () => {
    const fields = [
      'inputTokenAddress',
      'outputTokenAddress',
      'amount',
      'tranches',
      'percentChange',
      'deadline',
      'timeBwTrade',
    ];

    const isAnyFieldEmpty = fields.some((field) => !message[field]);

    if (isAnyFieldEmpty) {
      return false;
    }

    return true;
  };

  const validateInputAndOutput = () => {
    const fields = ['inputTokenAddress', 'outputTokenAddress'];

    const isWETHIncluded = fields.some(
      (field) => message[field] === WETH_ADDRESS,
    );
    if (!isWETHIncluded) {
      return false;
    }

    return true;
  };

  useEffect(() => {
    const allFilled = tradeEntered();
    setInputsFilled(allFilled);

    const correctTokens = validateInputAndOutput();
    setCorrectTokensFilled(correctTokens);

    if (validateInputs()) {
      setUserInputError('');
    }

    if (!correctTokens) {
      setUserInputError('Please make sure either input or output is WETH.');
    } else {
      console.log('INSIDE ELSE');
      console.log('INPUT ADDY:', message.inputTokenAddress);
      console.log('Output ADDY:', message.outputTokenAddress);

      setUserInputError('');
    }

    console.log('All inputs filled:', allFilled);
  }, [message]);

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
  const { data: balance } = useContractRead({
    address: message.inputTokenAddress,
    abi: ERC20abi,
    functionName: 'balanceOf',
    args: [primaryWallet?.address],
    chainId: 42161,
    onSuccess(data) {
      console.log('Balance:', data.toString());
      setTokenBalance(data.toString());
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
        await supabase.from('Trades').insert([
          {
            user: primaryWallet.address,
            pair: `${getAddress(message.inputTokenAddress)}-${getAddress(
              message.outputTokenAddress,
            )}`, // have to checksum to match in db for now
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
  const [pricesMap, setPricesMap] = useState();
  function fetchPairsData() {
    return supabase.from('Pairs').select('*');
  }

  // Update token avgs
  useEffect(
    () => {
      fetchPairsData().then((response) => {
        const { data: pairs, error } = response;

        function calculateAverage(arr) {
          return (
            arr.reduce((acc, val) => Number(acc) + Number(val), 0) / arr.length
          );
        }

        const pricesMap = {};

        pairs.forEach((pair) => {
          const { tokenName } = pair;
          const avg5min = calculateAverage(pair['5min_avg'].close_prices);

          // const avg15min = calculateAverage(pair['15min_avg'].close_prices);
          // const avg60min = calculateAverage(pair['60min_avg'].close_prices);
          // const avg240min = calculateAverage(pair['240min_avg'].close_prices);
          // const avg1440min = calculateAverage(pair['1440min_avg'].close_prices);

          // averageMap[tokenName] = [avg15min, avg60min, avg240min, avg1440min];
          pricesMap[tokenName] = [pair['current_price'], avg5min];
        });

        setPricesMap(pricesMap);

        if (error) {
          console.error('Error fetching pairs data:', error);
          return;
        }
      });
    },

    pricesMap,
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <NavBar inTradesPage={false} />

      <div className='h-screen bg-black flex justify-center items-center overflow-hidden relative'>
        <Head>
          <title>Automate</title>
          <link rel='icon' href='/favicon.ico' />
        </Head>

        <Box
          sx={{
            width: 500,
            mx: 'auto',
            mt: '-60px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div className='mb-10'>
            {userInputError && <Alert severity='error'>{userInputError}</Alert>}
          </div>

          <Paper
            elevation={16}
            sx={{
              width: '100%',
              backgroundColor: '#2B2B2B',
              padding: { xs: 2, sm: 3 },
              color: 'text.primary',
              borderRadius: '16px',
              boxShadow: `
  0 35px 100px -10px rgba(3, 201, 136, 0.2),
  0 30px 80px -10px rgba(3, 201, 136, 0.15),
  0 -25px 60px -10px rgba(3, 201, 136, 0.1),
  0 -35px 100px -10px rgba(3, 201, 136, 0.1)
`,
            }}
          >
            <Grid container spacing={2} justifyContent='center'>
              <React.Fragment>
                <Grid item xs={12}>
                  <InputToken
                    title='I want to allocate'
                    onValueChange={handleMessageChange}
                    onSelectChange={handleMessageChange}
                    message={message}
                    currentInput={currentInput}
                    setCurrentInput={setCurrentInput}
                    tokenBalance={tokenBalance}
                    address={primaryWallet?.address}
                  />
                </Grid>
                <Grid
                  item
                  xs={12}
                  container
                  direction='column'
                  alignItems='center'
                  justifyContent='center'
                  style={{ marginBottom: '-15px' }}
                >
                  <ToggleSwap
                    selection={toggleSelection}
                    setSelection={setToggleSelection}
                    message={message}
                    handleMessageChange={handleMessageChange}
                    currentInput={currentInput}
                    currentOutput={currentOutput}
                    setCurrentInput={setCurrentInput}
                    setCurrentOutput={setCurrentOutput}
                  />
                </Grid>
                <Grid item xs={12}>
                  <OutputToken
                    title='To recieve'
                    onValueChange={handleMessageChange}
                    onSelectChange={handleMessageChange}
                    message={message}
                    currentOutput={currentOutput}
                    setCurrentOutput={setCurrentOutput}
                  />
                </Grid>

                <Grid item xs={6}>
                  <InputBatches
                    title='Split into'
                    placeHolder={'5'}
                    value={message.tranches}
                    onValueChange={(e) =>
                      handleMessageChange('tranches', e.target.value)
                    }
                  />
                </Grid>

                <Grid item xs={6}>
                  <TimeSelector
                    onTradeActionChange={handleMessageChange}
                    title='Every'
                  />
                </Grid>

                <Grid item xs={6}>
                  <InputPercent
                    title='When profit increases by'
                    value={message.percentChange}
                    onValueChange={handleMessageChange}
                    isUpSelected={toggleSelection !== 'buy'}
                    placeHolder={'0'}
                  />
                </Grid>

                <Grid item xs={6}>
                  <DatePicker
                    title='Until'
                    setSelectedDate={handleMessageChange}
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
                      style={{
                        backgroundColor: '#03C988',
                        transition:
                          'transform 0.3s ease, background-color 0.3s ease, box-shadow 0.3s ease',
                      }}
                      onClick={handleWalletConnection}
                      className='text-white text-xl font-semibold rounded-lg shadow-lg hover:bg-green-600 hover:scale-[1.02] hover:shadow-md w-96 h-14 mt-[15px]'
                    >
                      Connect Wallet
                    </button>
                  ) : (
                    <button
                      style={{
                        backgroundColor: '#03C988',
                        transition:
                          'transform 0.3s ease, background-color 0.3s ease, box-shadow 0.3s ease',
                      }}
                      onClick={() => {
                        if (!validateInputs()) {
                          return;
                        }
                        if (allowance < message.amount) {
                          approveToken?.();
                        }
                        signTypedData();
                      }}
                      className='text-white text-xl font-semibold rounded-lg shadow-lg hover:bg-green-600 hover:scale-[1.02] hover:shadow-md w-96 h-14 mt-[15px]'
                    >
                      Start Automation
                    </button>
                  )}
                </Grid>
              </React.Fragment>
            </Grid>
          </Paper>
        </Box>

        {allInputsFilled && (
          <div className='absolute right-0 pr-5 space-y-1.25'>
            <div
              className={`${isTradeSumAccordionExpanded ? 'pb-10' : 'pb-5'}`}
            >
              <TradeSummaryDropdown
                tradeEntered={allInputsFilled}
                currentInput={currentInput.name}
                currentOutput={currentOutput.name}
                batches={message.tranches}
                percentChange={message.percentChange}
                movingAvg={message.priceAvg}
                timeBwTrades={message.timeBwTrade}
                expanded={isTradeSumAccordionExpanded}
                setExpanded={setIsTradeSumAccordionExpanded}
                tradeType={toggleSelection}
              />
            </div>

            <div>
              {currentInput.name === 'WETH' ? (
                // Get price on token you're going to buy
                <AvgPriceDropdown
                  prices={pricesMap[currentOutput.name]}
                  tokenAddy={currentOutput.address}
                />
              ) : (
                // Get price on token you're going to sell
                <AvgPriceDropdown
                  prices={pricesMap[currentInput.name]}
                  tokenAddy={currentInput.address}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </LocalizationProvider>
  );
}
