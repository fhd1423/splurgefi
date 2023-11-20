'use client';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useDynamicContext, DynamicWidget } from '@dynamic-labs/sdk-react-core';
import GradientText from './GradientText';
import Link from 'next/link';

const LandingPage = () => {
  // Local state to track if the wallet is connected
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  // Access setShowAuthFlow and primaryWallet from useDynamicContext
  const { setShowAuthFlow, primaryWallet } = useDynamicContext();

  // Function to handle the authentication flow
  const handleAuthFlow = () => {
    setShowAuthFlow(true);
  };

  // Use useEffect to listen for changes in primaryWallet
  useEffect(() => {
    if (primaryWallet?.address) {
      setIsWalletConnected(true);
    }
  }, [primaryWallet?.address]);

  return (
    <div className='flex flex-col h-screen justify-center items-center bg-black font-sans px-4 sm:px-6 lg:px-8'>
      <Head>
        <title>SplurgeFi</title>
        <meta name='description' content='Welcome to SplurgeFi' />
        <link rel='icon' href='/favicon.ico' />
        <link
          href='https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
          rel='stylesheet'
        />
      </Head>

      <div className='text-center w-full max-w-2xl'>
        <h1 className='text-4xl sm:text-5xl md:text-6xl mb-4 text-white font-bold tracking-wide leading-tight'>
          <GradientText>Automate your trades on DEXs seamlessly</GradientText>
        </h1>

        <p className='text-2xl mb-10 text-gray-400 tracking-wide'>
          Best trading experience ever.
        </p>
        <Link href='/step-one' passHref>
          <button className='bg-green-500 text-white text-xl font-bold py-2 px-8 rounded-full shadow-lg hover:bg-green-600'>
            Get Started
          </button>
        </Link>
        {/* <h2 className="text-4xl sm:text-5xl md:text-6xl mb-8 text-white font-bold tracking-wide leading-tight">
          on DEXs seamlessly
        </h2> */}
        {/* <p className="text-xl sm:text-2xl mb-10 text-gray-400 tracking-wide">
          Connect your wallet & twitter to join.
        </p> */}

        {/* Conditionally render the button or the success message */}
        {/* <>
          {isWalletConnected && (
            <>
              <p className="text-md sm:text-lg md:text-xl text-green-500 font-bold">
                You joined our waitlist! 🎉
              </p>

              <button className="bg-green-500 text-white px-4 py-2 rounded-full" onClick={signConditionalOrder}>
                Sign
              </button>
            </>
          )}
          <h1 className="flex justify-center p-2">
            <DynamicWidget />
          </h1>
        </> */}
      </div>
    </div>
  );
};

export default LandingPage;
