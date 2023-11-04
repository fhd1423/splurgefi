"use client";

import { useEffect, useState } from "react";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";

function WaitlistSection() {
  // Local state to track if the wallet is connected
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  // Destructure setShowAuthFlow and primaryWallet from useDynamicContext
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
    <div className="text-center mt-10 md:mt-20 lg:mt-48 mb-10 md:mb-20 lg:mb-48 px-5 sm:px-10">
      <h1 className="text-3xl sm:text-4xl md:text-5xl mb-4 sm:mb-5 md:mb-6 text-white font-bold tracking-wide leading-snug">
        Join our waitlist.
      </h1>
      <p className="text-md sm:text-lg md:text-xl mb-6 sm:mb-8 text-gray-400 tracking-wide">
        Connect your wallet & Twitter alias to join.
      </p>

      {/* Conditionally render the button or the success message */}
      {isWalletConnected ? (
        <p className="text-md sm:text-lg md:text-xl text-green-500 font-bold">
          You joined our waitlist! 🎉
        </p>
      ) : (
        <button
          className="bg-green-500 text-white text-md sm:text-lg md:text-xl font-bold py-2 px-4 sm:px-6 md:px-8 rounded-full shadow-lg hover:bg-green-600 transition-colors duration-300"
          onClick={handleAuthFlow}
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
}

export default WaitlistSection;
