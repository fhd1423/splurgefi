'use client';

import { useDynamicScopes } from '@dynamic-labs/sdk-react-core';
import { Box, Grid, Paper, useMediaQuery, useTheme } from '@mui/material';
import Head from 'next/head';
import router from 'next/router';
import React, { useEffect, useState } from 'react';
import { Toaster, toast } from 'sonner';
import { getAddress } from 'viem';

// MUI Date Picker Imports
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

// Custom Component Imports
import CommunityPopUp from '@/components/automate/CommunityPopUp';
import DatePicker from '@/components/automate/DatePicker';
import TimeSelector from '@/components/automate/TimeSelector';
import sendCreatePairRequest from '@/components/supabase/sendCreatePairRequest';
import {
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useSignTypedData,
} from 'wagmi';
import NavBar from '../components/NavBar';
import InputBatches from '../components/automate/InputBatches';
import InputPercent from '../components/automate/InputPercent';
import InputToken from '../components/automate/InputToken';
import OutputToken from '../components/automate/OutputToken';
import ToggleSwap from '../components/automate/ToggleSwap';

// SDK & Client Imports
import { ERC20abi } from '@/helpers/ERC20';
import { generateRandomSalt, parseJwt } from '@/helpers/utils';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import sendSupabaseRequest from '../components/supabase/supabaseClient';

export default function Automate() {
  const { userHasScopes } = useDynamicScopes();
  const SPLURGE_ADDRESS = '0xc6f9745EDE9faeD41ff8189Bb2FF7f5864d6366E';
  const WETH_ADDRESS = '0x82af49447d8a07e3bd95bd0d56f35241523fbab1';

  // FRONT END RESPONSIVENESS
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('md'));

  //STATE
  const [toggleSelection, setToggleSelection] = useState('buy');
  const [tokenBalance, setTokenBalance] = useState(null);
  const [priceData, setPriceData] = useState([]);
  const [priceDataLoading, setPriceDataLoading] = useState(false);

  const [message, setMessage] = useState({
    inputTokenAddress: WETH_ADDRESS, // DEFAULT INPUT - WETH
    outputTokenAddress: '0xd77b108d4f6cefaa0cae9506a934e825becca46e', // DEFAULT OUTPUT - WINR
    recipient: null,
    amount: null, // Input token scaled(18 decimal places)
    tranches: 1,
    percentChange: null,
    priceAvg: 15,
    deadline: null,
    timeBwTrade: 100,
    salt: generateRandomSalt(),
  });

  const outputIsWETH = message.outputTokenAddress == WETH_ADDRESS;

  const [currentInput, setCurrentInput] = useState({
    name: 'WETH',
    address: WETH_ADDRESS,
    logoURI:
      'https://assets.coingecko.com/coins/images/2518/thumb/weth.png?1696503332',
    symbol: 'WETH',
    decimals: 18,
  });

  const [currentOutput, setCurrentOutput] = useState({
    name: 'WINR',
    address: '0xd77b108d4f6cefaa0cae9506a934e825becca46e',
    logoURI:
      'https://assets.coingecko.com/coins/images/29340/thumb/WINR.png?1696528290',
    symbol: 'WINR',
    decimals: 18,
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
      handleMessageChange('timeBwTrade', null);
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
        setPriceDataLoading(true);
        try {
          let data;
          if (currentInput.name === 'WETH') {
            data = await sendCreatePairRequest(
              getAddress(currentOutput.address),
              currentOutput.symbol,
              true,
            );
          } else {
            data = await sendCreatePairRequest(
              getAddress(currentInput.address),
              currentInput.symbol,
              true,
            );
          }

          if (data && data.avgPrice && data.currentPrice) {
            setPriceData([data.currentPrice, data.avgPrice]);
            setPriceDataLoading(false);
          } else {
            console.error('Price data not found');
          }
        } catch (error) {
          console.error('Error fetching average price:', error);
        }
      }
    };

    fetchPrice();
  }, [currentInput, currentOutput]);

  //AUTH - DYNAMIC
  const { authToken, primaryWallet } = useDynamicContext();
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  useEffect(() => {
    if (primaryWallet?.address && authToken) {
      const jwtData = parseJwt(authToken);
      // uploadUserData(primaryWallet?.address, jwtData);

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
        formattedBalance = Number(balance) / 10 ** currentInput.decimals;
      } catch (e) {}

      const roundedBalance =
        Math.floor(Number(formattedBalance) * 100000) / 100000;
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

  const { signTypedData } = useSignTypedData({
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
      const req3 = await sendSupabaseRequest(authToken, {
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

  const handleStartAutomation = () => {
    if (!isWalletConnected) {
      toast.error('Wallet not connected');
      return;
    }
    if (!userHasScopes('beta')) {
      toast.error('Your wallet is not whitelisted for beta testing');
      return;
    }
    if (!validate('everything')) {
      toast.error('Please make sure all inputs are filled.');
      return;
    }
    if (allowance < message.amount) {
      approveToken?.();
    }
    signTypedData();
  };

  return (
    <div className='bg-gradient-to-br from-stone-900 to-emerald-900'>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <NavBar />

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
                  style={{ position: 'relative', zIndex: 1 }}
                  onClick={toggleSwitch}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform ${
                      isToggled ? 'translate-x-4' : 'translate-x-0'
                    } transition-transform`}
                    style={{ position: 'absolute', zIndex: 0 }}
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

                  <div className='w-full text-center pt-3 mb-0 text-white font-semibold text-base'>
                    {outputIsWETH
                      ? `Current ${currentInput.symbol} Price Delta:`
                      : `Current ${currentOutput.symbol} Price Delta:`}
                    {!priceDataLoading ? (
                      <span className='rounded-lg p-1 text-emerald-500 bg-black ml-1'>
                        {((1 - priceData[0] / priceData[1]) * 100).toFixed(2)}%
                      </span>
                    ) : (
                      <span className='rounded-lg p-1 text-emerald-500 bg-black ml-1'>
                        <m className='animate-pulse'>... </m>
                      </span>
                    )}
                  </div>

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
                      title={
                        outputIsWETH
                          ? `When ${currentInput.symbol} pumps`
                          : `When ${currentOutput.symbol} dumps`
                      }
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
                    <button
                      style={{
                        backgroundColor: '#03C988',
                        transition:
                          'transform 0.3s ease, background-color 0.3s ease, box-shadow 0.3s ease',
                      }}
                      onClick={handleStartAutomation}
                      className='text-white text-xl font-semibold rounded-lg shadow-lg hover:bg-green-600 hover:scale-[1.02] hover:shadow-md w-96 h-14 mt-[15px]'
                    >
                      {userHasScopes('beta') || !isWalletConnected
                        ? 'Start Automation'
                        : 'Not In Beta'}
                    </button>
                  </Grid>
                </React.Fragment>
              </Grid>
            </Paper>
          </Box>

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
