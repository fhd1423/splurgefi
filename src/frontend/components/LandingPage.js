"use client";

import Head from "next/head";
import Button from "@mui/material/Button";
import { useEffect, useState } from "react";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";

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
    <div className="flex flex-col h-screen justify-center items-center bg-black font-sans">
      <Head>
        <title>SplurgeFi</title>
        <meta name="description" content="Welcome to SplurgeFi" />
        <link rel="icon" href="/favicon.ico" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div className="text-center">
        <h1 className="text-6xl mb-4 text-white font-bold tracking-wide leading-tight">
          Automate your trades
        </h1>

        <h1 className="text-6xl mb-8 text-white font-bold tracking-wide leading-tight">
          on DEXs seamlessly
        </h1>
        <p className="text-2xl mb-10 text-gray-400 tracking-wide">
          Connect you wallet & twitter alias to join.
        </p>

        {/* Conditionally render the button or the success message */}
        {isWalletConnected ? (
          <p className="text-2xl text-green-500 font-bold">
            You joined our waitlist! 🎉
          </p>
        ) : (
          <button
            onClick={handleAuthFlow}
            className="bg-green-500 text-white text-xl font-bold py-2 px-8 rounded-full shadow-lg hover:bg-green-600"
          >
            Connect Wallet
          </button>
        )}
      </div>
    </div>
  );
};

export default LandingPage;
