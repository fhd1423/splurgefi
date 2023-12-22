'use client';

import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, Alert } from '@mui/material';
import Head from 'next/head';
import { formatEther, getAddress } from 'viem';
import { useTheme, useMediaQuery } from '@mui/material';
import router from 'next/router';

// MUI Date Picker Imports
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

// Custom Component Imports
import InputToken from '../components/automate/InputToken';
import OutputToken from '../components/automate/OutputToken';
import ToggleSwap from '../components/automate/ToggleSwap';
import InputPercent from '../components/automate/InputPercent';
import InputBatches from '../components/automate/InputBatches';
import DatePicker from '@/components/automate/DatePicker';
import TimeSelector from '@/components/automate/TimeSelector';
import NavBar from '../components/NavBar';
import TradeSummaryDropdown from '@/components/automate/TradeSummaryDropdown';
import AvgPriceDropdown from '@/components/automate/AvgPriceDropdown';
import ToggleSwitch from '@/components/automate/Switch';
import CommunityPopUp from '@/components/automate/CommunityPopUp';
import {
  useSignTypedData,
  usePrepareContractWrite,
  useContractWrite,
  useContractRead,
} from 'wagmi';

// SDK & Client Imports
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { supabase } from '../components/supabase/client';
import sendSupabaseRequest from '../components/supabase/supabaseClient';

import { uploadUserData, generateRandomSalt, parseJwt } from '@/helpers/utils';
import { ERC20abi } from '@/helpers/ERC20';
import ProfitDropdown from '@/components/automate/ProfitDropdown';

export default function Automate() {
  const SPLURGE_ADDRESS = '0xe3345D0cca4c478cf16cDd0B7D7363ba223c87AF';
  const WETH_ADDRESS = '0x82af49447d8a07e3bd95bd0d56f35241523fbab1';

  // FRONT END RESPONSIVENESS
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('md'));

  //STATE
  const [toggleSelection, setToggleSelection] = useState('buy');
  const [userInputError, setUserInputError] = useState('');
  const [allInputsFilled, setInputsFilled] = useState(false);
  const [correctTokensFilled, setCorrectTokensFilled] = useState(false);
  const [isTradeSumAccordionExpanded, setIsTradeSumAccordionExpanded] =
    useState(true);
  const [tokenBalance, setTokenBalance] = useState(null);
  const [averagePrice, setAveragePrice] = useState(null);
  const [profit, setProfit] = useState(null);

  const [message, setMessage] = useState({
    inputTokenAddress: WETH_ADDRESS, // DEFAULT INPUT - WETH
    outputTokenAddress: '0xd77b108d4f6cefaa0cae9506a934e825becca46e', // DEFAULT OUTPUT - WINR
    recipient: null,
    amount: null, // Input token scaled(18 decimal places)
    tranches: 1,
    percentChange: null,
    priceAvg: 5,
    deadline: null,
    timeBwTrade: 100,
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

  const [isToggled, setIsToggled] = useState(false);

  // PRICE DATA METHODS
  const getHistoricalPriceData = async (tokenAddress) => {
    const axios = require('axios');
    const apiUrl = 'https://coins.llama.fi/prices/historical/';

    const currentTimestampInSeconds = Math.floor(new Date().getTime() / 1000);
    const timestamp = currentTimestampInSeconds - 50 * 60; // UNIX timestamp of 50 mins ago
    // const coins = 'arbitrum:0x82af49447d8a07e3bd95bd0d56f35241523fbab1'; // WETH on Arbitrum chain
    const coins = 'arbitrum:' + tokenAddress;
    const increment = 5 * 60;
    try {
      const numberOfDataPoints = Math.ceil(
        (currentTimestampInSeconds - timestamp) / increment,
      );

      const fetchPriceData = (time) => {
        const url = `${apiUrl}${time}/${coins}`;
        return axios
          .get(url)
          .then((response) => response.data.coins[coins].price);
      };

      const priceDataPromises = Array.from(
        { length: numberOfDataPoints },
        (_, index) => {
          const time = timestamp + index * increment;
          return fetchPriceData(time);
        },
      );

      const priceData = await Promise.all(priceDataPromises);
      return priceData;
    } catch (error) {
      console.error('Error fetching historical price data:', error);
      throw error;
    }
  };

  const getCurrentPriceData = async (tokenAddress) => {
    const axios = require('axios');
    const apiUrl = 'https://coins.llama.fi/prices/current/';
    const coins = 'arbitrum:' + tokenAddress;

    const url = `${apiUrl}${coins}`;
    try {
      const response = await axios.get(url);
      return response.data.coins[coins].price;
    } catch (error) {
      console.error('Error fetching current price data:', error);
      throw error;
    }
  };

  const getFiveMinAvg = async (priceData) => {
    const total = priceData.reduce((acc, price) => acc + price, 0);
    return total / priceData.length;
  };

  // HANDLERS
  const handleMessageChange = (field, value) => {
    setMessage((prevMessage) => ({
      ...prevMessage,
      [field]: value,
    }));
  };

  const toggleSwitch = () => {
    setIsToggled(!isToggled);
    if (isToggled) {
      handleMessageChange('tranches', 1);
      handleMessageChange('timeBwTrade', 100);
    }
    if (!isToggled && (message.tranches != 1 || message.timeBwTrade != 100)) {
      handleMessageChange('tranches', null);
      handleMessageChange9('timeBwTrade', null);
    }
  };

  const validate = (validationType) => {
    let fields = [];

    if (validationType == 'includeWeth') {
      fields = ['inputTokenAddress', 'outputTokenAddress'];
      const hasWeth = fields.some((field) => message[field] === WETH_ADDRESS);
      if (!hasWeth)
        setUserInputError('Please make sure either input or output is WETH.');
    } else if (validationType == 'tradeEntered') {
      fields = ['amount', 'percentChange', 'deadline'];
    } else if (validationType == 'everything') {
      fields = [
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
    }

    const isAnyFieldEmpty = fields.some((field) => !message[field]);

    if (isAnyFieldEmpty) return false;
    return true;
  };

  useEffect(() => {
    const correctTokens = validate('everything');
    validate('includeWeth');

    if (correctTokens) {
      if (currentInput.name === 'WETH') {
        console.log('INSIDE CALC PROFIT FOR INPUT WETH');

        // Fetch the 5-min average price
        getHistoricalPriceData(currentOutput.address)
          .then((priceData) => getFiveMinAvg(priceData))
          .then((avgPrice) => {
            setAveragePrice(avgPrice);
            console.log('Average Price:', avgPrice); // WORKS

            console.log('Output Address:', currentOutput.address);
            // Now fetch the current price
            return getCurrentPriceData(currentOutput.address).then(
              (currentPriceData) => {
                console.log('Current Price:', currentPriceData);

                // Calculate and set profit based on average and current prices
                const resultingProfit = calcBuyProfit(
                  avgPrice,
                  currentPriceData,
                  message.percentChange,
                  message.amount,
                );
                setProfit(resultingProfit);
                console.log('Calculated Profit:', resultingProfit);
                return resultingProfit;
              },
            );
          })
          .catch((error) => console.error('Error:', error));
      } else {
        getHistoricalPriceData(currentInput.address)
          .then((priceData) => getFiveMinAvg(priceData))
          .then((avg) => setAveragePrice(avg))
          .catch((error) =>
            console.error('Error calculating average price:', error),
          );

        getCurrentPriceData(currentInput.address)
          .then((currentPriceData) =>
            calcSellProfit(
              averagePrice,
              currentPriceData,
              message.percentChange,
              message.amount,
            ),
          )
          .then((resultingProfit) => setProfit(resultingProfit));
      }
    }
  }, [message]);

  // Need previous avg. price of token to buy and current price of that token (sellPrice)
  function calcBuyProfit(avgPrice, sellPrice, percentChange, amountWETH) {
    const amountWETHInEther = amountWETH / 1e18;

    // Calc buy price
    const buyPrice = avgPrice * (1 - percentChange / 100);

    // Calc profit
    const amountOfBuyToken = amountWETHInEther / buyPrice;

    // Profit in terms of buy token
    const profit = amountOfBuyToken * (sellPrice - buyPrice);

    return profit.toFixed(2);
  }

  function calcSellProfit(avgPrice, buyPrice, percentChange, amountOfToken) {
    const amountOfTokenInEther = amountOfToken / 1e18;
    // Calculate sell price as a percentage above the average price
    const sellPrice = avgPrice * (1 + percentChange / 100);

    // Calculate profit
    // Based on the difference between the sell price and the buy price
    const profit = amountOfTokenInEther * (sellPrice - buyPrice);

    return profit.toFixed(2);
  }

  //AUTH - DYNAMIC
  const { setShowAuthFlow, authToken, primaryWallet } = useDynamicContext();
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const handleWalletConnection = () => {
    setShowAuthFlow(true);
  };
  useEffect(() => {
    if (primaryWallet?.address && authToken) {
      console.log('SEX', authToken);
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
  const { data: balance } = useContractRead({
    address: message.inputTokenAddress,
    abi: ERC20abi,
    functionName: 'balanceOf',
    args: [primaryWallet?.address],
    chainId: 42161,
    onSuccess(data) {
      let formattedBalance = 0;
      try {
        formattedBalance = formatEther(balance);
      } catch (e) {}
      setTokenBalance(String(formattedBalance));
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
        const result = await sendSupabaseRequest(authToken, {
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
        });

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
  useEffect(() => {
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
        pricesMap[tokenName] = [pair['current_price'], avg5min];
      });

      setPricesMap(pricesMap);

      if (error) {
        console.error('Error fetching pairs data:', error);
        return;
      }
    });
  }, pricesMap);

  return (
    <div className='bg-gradient-to-br from-stone-900 to-emerald-900'>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <NavBar inTradesPage={false} />

        <div className='h-screen flex justify-center items-center overflow-hidden relative'>
          <Head>
            <title>Automate</title>
            <link rel='icon' href='/favicon.ico' />
          </Head>

          <Box
            sx={{
              width: { xs: '85%', md: '500px' },
              mx: 'auto',
              mt: '-60px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div className='mb-10'>
              {userInputError && (
                <Alert severity='error'>{userInputError}</Alert>
              )}
            </div>

            <Paper
              elevation={16}
              sx={{
                width: '100%',
                backgroundColor: '#2B2B2B',
                padding: { xs: 2, sm: 3 },
                color: 'text.primary',
                borderRadius: '16px',
              }}
            >
              <div className='w-full flex justify-end items-center'>
                <span className='mr-2  font-semibold text-white'>
                  Swap Over Time
                </span>
                <div
                  className={`w-14 h-8 flex items-center bg-gray-200 rounded-full p-1 cursor-pointer ${
                    isToggled ? 'bg-green-400' : 'bg-gray-700'
                  }`}
                  onClick={toggleSwitch}
                >
                  <div
                    className={`bg-white w-6 h-6 rounded-full shadow-md transform ${
                      isToggled ? 'translate-x-6' : 'translate-x-0'
                    } transition-transform`}
                  ></div>
                </div>
              </div>

              <Grid container spacing={2} justifyContent='center'>
                <React.Fragment>
                  <Grid item xs={12}>
                    <InputToken
                      title='Allocate'
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
                  {isToggled && (
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
                  )}

                  {isToggled && (
                    <Grid item xs={6} style={{ marginTop: '5px' }}>
                      <TimeSelector
                        onTradeActionChange={handleMessageChange}
                        title='Every'
                      />
                    </Grid>
                  )}

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

                  {allInputsFilled && (
                    <Grid item xs={12}>
                      <Typography
                        sx={{
                          display: 'inline',
                          color: 'white',
                          fontWeight: 'medium',
                        }}
                      >
                        {'Estimated Profit: '}
                      </Typography>
                      <Typography
                        sx={{
                          display: 'inline',
                          color: '#03C988',
                          fontWeight: 'bold',
                        }}
                      >
                        {profit + ' ' + currentOutput.name}
                      </Typography>
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
                          if (!validate('everything')) {
                            setUserInputError(
                              'Please make sure all inputs are filled.',
                            );
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

          {isLargeScreen && (
            <div
              style={{ position: 'absolute', bottom: '100px', left: '30px' }}
            >
              <CommunityPopUp />
            </div>
          )}
        </div>
      </LocalizationProvider>
    </div>
  );
}
