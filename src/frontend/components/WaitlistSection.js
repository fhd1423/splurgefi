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
    <div className="text-center mt-48 mb-48">
      <h1 className="text-5xl mb-5 text-white font-bold tracking-wide leading-tight">
        Join our waitlist.
      </h1>
      <p className="text-2xl mb-8 text-gray-400 tracking-wide">
        Connect you wallet & twitter alias to join.
      </p>

      {/* Conditionally render the button or the success message */}
      {isWalletConnected ? (
        <p className="text-2xl text-green-500 font-bold">
          You joined our waitlist! 🎉
        </p>
      ) : (
        <button
          className="bg-green-500 text-white text-xl font-bold py-2 px-8 rounded-full shadow-lg hover:bg-green-600"
          onClick={handleAuthFlow}
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
}

export default WaitlistSection;
