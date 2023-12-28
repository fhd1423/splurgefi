'use client';

import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, Alert } from '@mui/material';
import Head from 'next/head';
import { formatEther, getAddress } from 'viem';
import { useTheme, useMediaQuery } from '@mui/material';
import router from 'next/router';
import { Toaster, toast } from 'sonner';

// MUI Date Picker Imports
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

// Custom Component Imports
import InputToken from '../components/automate/InputToken';
import OutputToken from '../components/automate/OutputToken';
import ToggleSwap from '../components/automate/ToggleSwap';
import sendCreatePairRequest from '@/components/supabase/sendCreatePairRequest';
import AvgPriceDropdown from '@/components/automate/AvgPriceDropdown';
import InputPercent from '../components/automate/InputPercent';
import InputBatches from '../components/automate/InputBatches';
import DatePicker from '@/components/automate/DatePicker';
import TimeSelector from '@/components/automate/TimeSelector';
import NavBar from '../components/NavBar';
import CommunityPopUp from '@/components/automate/CommunityPopUp';
import {
  useSignTypedData,
  usePrepareContractWrite,
  useContractWrite,
  useContractRead,
} from 'wagmi';

// SDK & Client Imports
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import sendSupabaseRequest from '../components/supabase/supabaseClient';

import { uploadUserData, generateRandomSalt, parseJwt } from '@/helpers/utils';
import { ERC20abi } from '@/helpers/ERC20';

export default function Automate() {
  const SPLURGE_ADDRESS = '0x2c5C7dbE16685e1371F4caeAF586c6CaBFFc4252';
  const WETH_ADDRESS = '0x82af49447d8a07e3bd95bd0d56f35241523fbab1';

  // FRONT END RESPONSIVENESS
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('md'));

  //STATE
  const [toggleSelection, setToggleSelection] = useState('buy');
  const [allInputsFilled, setInputsFilled] = useState(false);
  const [tokenBalance, setTokenBalance] = useState(null);
  const [priceData, setPriceData] = useState([]);
  const [tokensSelected, setTokensSelected] = useState(false);

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
      if (!hasWeth) {
        toast.error('Please make sure either input or output is WETH.');
      }
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
    } else if (validationType == 'tokens') {
      fields = ['inputTokenAddress', 'outputTokenAddress'];
    }

    const isAnyFieldEmpty = fields.some((field) => !message[field]);

    const emptyFields = fields.filter((field) => !message[field]);
    if (emptyFields.length > 0) {
      console.log('Empty fields:', emptyFields);
    }
    if (isAnyFieldEmpty) {
      return false;
    }
    return true;
  };

  // Fetchs avg price from edge func
  useEffect(() => {
    const correctTokens = validate('includeWeth');
    const fetchPrice = async () => {
      console.log('FETCH PRICE CALLED');
      if (correctTokens) {
        try {
          let data;
          if (currentInput.name === 'WETH') {
            data = await sendCreatePairRequest(
              getAddress(currentOutput.address),
              currentOutput.symbol,
              false,
            );
          } else {
            data = await sendCreatePairRequest(
              getAddress(currentInput.address),
              currentInput.symbol,
              false,
            );
          }

          if (data && data.avgPrice && data.currentPrice) {
            setPriceData([data.currentPrice, data.avgPrice]);
            setTokensSelected(true); // Set this to true so price data can be displayed
          } else {
            console.error('Price data not found');
          }
        } catch (error) {
          console.error('Error fetching average price:', error);
        }
      }
    };

    fetchPrice();
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

  // Check balance
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

      const roundedBalance = Number(formattedBalance).toFixed(5);
      setTokenBalance(roundedBalance);
    },
  });

  // Approve
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
        const req1 = sendCreatePairRequest(
          getAddress(currentInput.address),
          currentInput.symbol,
          true,
        );

        const req2 = sendCreatePairRequest(
          getAddress(currentOutput.address),
          currentOutput.symbol,
          true,
        );

        const req3 = sendSupabaseRequest(authToken, {
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

        await Promise.all([req1, req2, req3]);

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
                <span className='mr-2 font-semibold text-white text-sm'>
                  Swap Over Time
                </span>
                <div
                  className={`w-10 h-6 flex items-center bg-gray-200 rounded-full p-1 cursor-pointer ${
                    isToggled ? 'bg-green-400' : 'bg-gray-700'
                  }`}
                  onClick={toggleSwitch}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform ${
                      isToggled ? 'translate-x-4' : 'translate-x-0'
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
                  {message.inputTokenAddress == WETH_ADDRESS && (
                    <div className='w-full text-center p-4 text-white font-semibold text-lg'>
                      Current {currentOutput.symbol} Output:
                      <span className='rounded-lg p-1 text-emerald-500 bg-black ml-1'>
                        {(
                          -1 *
                          ((1 - priceData[0] / priceData[1]) * 100)
                        ).toFixed(2)}
                        %
                      </span>
                    </div>
                  )}
                  {message.outputTokenAddress == WETH_ADDRESS && (
                    <div className='w-full text-center p-4 text-white font-semibold text-lg'>
                      Current {currentOutput.symbol} Output:
                      <span className='rounded-lg p-1 text-emerald-500 bg-black ml-1'>
                        {((1 - priceData[0] / priceData[1]) * 100).toFixed(2)}%
                      </span>
                    </div>
                  )}
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
                    <Grid item xs={6}>
                      <TimeSelector
                        onTradeActionChange={handleMessageChange}
                        title='Every'
                      />
                    </Grid>
                  )}

                  <Grid item xs={6}>
                    <InputPercent
                      title='When output increases by'
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
                            toast.error(
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

          {tokensSelected && isLargeScreen && (
            <div
              className={`absolute right-0 pr-5 ${
                isToggled ? 'top-20' : 'top-32'
              }`}
            >
              {currentInput.name === 'WETH' ? (
                // Get price on token you're going to buy
                <AvgPriceDropdown
                  prices={priceData}
                  tokenAddy={currentOutput.address}
                  currentInput={currentInput.name}
                  currentOutput={currentOutput.name}
                />
              ) : (
                // Get price on token you're going to sell
                <AvgPriceDropdown
                  prices={priceData}
                  tokenAddy={currentInput.address}
                  currentInput={currentInput.name}
                  currentOutput={currentOutput.name}
                />
              )}
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
        <Toaster richColors />
      </LocalizationProvider>
    </div>
  );
}
