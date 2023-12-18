'use client';

import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, Alert } from '@mui/material';
import Head from 'next/head';
import { getAddress } from 'viem';
import router from 'next/router';

// MUI Date Picker Imports
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { styled } from '@mui/material/styles';
import Container from '@mui/material';
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
import LimitPriceInput from '@/components/automate/limitPrice';
import NavBar from '../components/NavBar';
import TradeSummaryDropdown from '@/components/automate/TradeSummaryDropdown';
import AvgPriceDropdown from '@/components/automate/AvgPriceDropdown';
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
  const [toggleTrade, setToggleTrade] = useState('pro');
  const [userInputError, setUserInputError] = useState('');
  const [allInputsFilled, setInputsFilled] = useState(false);
  const [isTradeSumAccordionExpanded, setIsTradeSumAccordionExpanded] =
    useState(true);

  const [message, setMessage] = useState({
    inputTokenAddress: WETH_ADDRESS, // DEFAULT INPUT - WETH
    outputTokenAddress: '0xd77b108d4f6cefaa0cae9506a934e825becca46e', // DEFAULT OUTPUT - WINR
    recipient: null,
    amount: null, // Input token scaled(18 decimal places)
    tranches: null,
    percentChange: null,
    priceAvg: null,
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

  //HANDLERS
  const handleMessageChange = (field, value) => {
    setMessage((prevMessage) => ({
      ...prevMessage,
      [field]: value,
    }));
  };

  const handleLimitMessageChange = (field, value) => {
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
      setUserInputError(`Either input or output must be WETH ${WETH_ADDRESS}`);
      return false;
    }

    const isAnyFieldEmpty = fields.some((field) => !message[field]);

    if (isAnyFieldEmpty) {
      setUserInputError('Please make sure all inputs are filled.');
      return false;
    }
    return true;
  };

  const tradeEntered = () => {
    const fields = [
      'inputTokenAddress',
      'outputTokenAddress',
      'amount',
      'tranches',
      'percentChange',
      'priceAvg',
      'deadline',
      'timeBwTrade',
    ];

    const isAnyFieldEmpty = fields.some((field) => !message[field]);

    if (isAnyFieldEmpty) {
      return false;
    }

    return true;
  };

  useEffect(() => {
    const allFilled = tradeEntered();
    setInputsFilled(allFilled);

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
  const [averageMap, setAverageMap] = useState();
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
      });
    },

    averageMap,
  );

  //STYLING
  const StyledTypography = styled(Typography)(({ theme }) => ({
    color: '#D9D9D9',
    padding: '6px 12px',
    margin: '80px',
    fontSize: '1.5rem',
    lineHeight: 1.75,
    fontFamily: 'Inter, sans-serif',
    fontWeight: 'bold',
    textTransform: 'capitalize',
    fontWeight: 'normal',
    border: 'none',
    color: '#27ae60', // Green text color
    transform: 'skewX(-20deg)', // Apply skew transformation
  }));

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <NavBar inTradesPage={false} />

      <div className='h-screen bg-black flex justify-center items-center overflow-hidden relative'>
        <Head>
          <title>Automate</title>
          <link rel='icon' href='/favicon.ico' />
        </Head>

        <div className='flex items-start'>
          <div className='flex flex-row align-items-start'>
            <Box
              sx={{
                width: 500,
                // mx: 'auto',
                // marginTop: '-30px',
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
                  <React.Fragment>
                    <Grid item xs={12}>
                      <InputToken
                        onValueChange={handleMessageChange}
                        onSelectChange={handleMessageChange}
                        message={message}
                        currentInput={currentInput}
                        setCurrentInput={setCurrentInput}
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
                        currentInput={currentInput}
                        currentOutput={currentOutput}
                        setCurrentInput={setCurrentInput}
                        setCurrentOutput={setCurrentOutput}
                      />
                    </Grid>
                    <Grid
                      item
                      xs={12}
                      style={{
                        marginTop: '-8px',
                        marginBottom: '20px',
                        zIndex: 1,
                      }}
                    >
                      <OutputToken
                        onValueChange={handleMessageChange}
                        onSelectChange={handleMessageChange}
                        message={message}
                        currentOutput={currentOutput}
                        setCurrentOutput={setCurrentOutput}
                        limitOrder={false}
                      />
                    </Grid>
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
                      {toggleTrade == 'pro' && (
                        <InputBatches
                          title='Batches'
                          placeHolder={'5'}
                          value={message.tranches}
                          onValueChange={(e) =>
                            handleMessageChange('tranches', e.target.value)
                          }
                        />
                      )}
                    </Grid>
                    <Grid item xs={4}>
                      {toggleTrade == 'pro' && (
                        <TradeSelector
                          onTradeActionChange={handleMessageChange}
                          title='Moving Avg.'
                          tokenAddy={message.outputTokenAddress}
                        />
                      )}
                    </Grid>
                    <Grid item xs={6}>
                      <DatePicker setSelectedDate={handleMessageChange} />
                    </Grid>

                    {toggleTrade == 'pro' && (
                      <Grid item xs={6}>
                        <TimeSelector
                          onTradeActionChange={handleMessageChange}
                          title='Time Between Batches'
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
                      {/* {console.log('trade:', message)} */}

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
                            if (!validateInputs()) {
                              return;
                            }
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
                  </React.Fragment>
                </Grid>
              </Paper>
            </Box>
            {userInputError && <Alert severity='error'>{userInputError}</Alert>}
          </div>

          {allInputsFilled && (
            <div className='absolute right-0 pr-5'>
              <div
                className={`${isTradeSumAccordionExpanded ? 'pb-10' : 'pb-2'}`}
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
                />
              </div>

              <div>
                {currentInput.name === 'WETH' ? (
                  // Get price on token you're going to buy
                  <AvgPriceDropdown
                    avgPrices={averageMap[currentOutput.name]}
                  />
                ) : (
                  // Get price on token you're going to sell
                  <AvgPriceDropdown avgPrices={averageMap[currentInput.name]} />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </LocalizationProvider>
  );
}
