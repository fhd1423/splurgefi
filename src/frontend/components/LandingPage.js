"use client";
import Head from "next/head";
import { useEffect, useState } from "react";
import { useDynamicContext, DynamicWidget } from "@dynamic-labs/sdk-react-core";
import GradientText from "./GradientText";
import Link from "next/link";
import { useRouter } from 'next/navigation'
import NavBar from "./NavBar";

const LandingPage = () => {

  const router = useRouter()

  // Local state to track if the wallet is connected
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  // Access setShowAuthFlow and primaryWallet from useDynamicContext
  const { setShowAuthFlow, primaryWallet } = useDynamicContext();

  // Function to handle the authentication flow
  const handleAuthFlow = () => {
    setShowAuthFlow(true);
  };

  // Use useEffect to listen for changes in primaryWallet and redirect on successful connection
  useEffect(() => {
    if (primaryWallet?.address) {
      setIsWalletConnected(true);
      localStorage.setItem('walletAddress', primaryWallet.address); // Store wallet address
      router.push('/trades'); // Redirect to the trades page
    }
  }, [primaryWallet?.address, router]);

  return (

    <div className="h-screen bg-black flex flex-col">
      <NavBar inTradesPage={false}/>
      <div className="flex flex-col h-screen bg-black font-sans px-4 sm:px-6 lg:px-8">
        <Head>
          <title>SplurgeFi</title>
          <meta name="description" content="Welcome to SplurgeFi" />
          <link rel="icon" href="/favicon.ico" />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
            rel="stylesheet"
          />
        </Head>

        {/* Navigation Bar */}
        {/* <header className="w-full py-6 px-6 flex justify-between items-center">
          <h2 className="text-xl text-white font-bold">SplurgeFi</h2>

          <button onClick={handleAuthFlow} className="bg-green-500 text-white text-sm font-semibold py-2 px-4 rounded-md shadow-lg hover:bg-green-600">
            Log In
          </button>
          {/* <button onClick={() => router.push('/trades')} className="bg-green-500 text-white text-sm font-semibold py-2 px-4 rounded-md shadow-lg hover:bg-green-600">
            Log In
          </button> */}

        {/* </header> */} 

        <div className="text-center w-full max-w-2xl m-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl mb-4 text-white font-bold tracking-wide leading-tight">
            <GradientText>Automate your trades on DEXs seamlessly</GradientText>
          </h1>

          <p className="text-2xl mb-10 text-gray-400 tracking-wide">
            Best trading experience ever.
          </p>
          <Link href="/automate" passHref>
            <button className="bg-green-500 text-white text-xl font-bold py-2 px-8 rounded-full shadow-lg hover:bg-green-600">
              Get Started
            </button>
          </Link>
        </div>
      </div>
    </div>

    
  );
};

export default LandingPage;
