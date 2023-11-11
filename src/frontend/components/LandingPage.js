"use client";
import Head from "next/head";
import { useEffect, useState } from "react";
import { useDynamicContext, DynamicWidget } from "@dynamic-labs/sdk-react-core";
import GradientText from "./GradientText";

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

  //TESTING DYNAMIC SIGNATURES
  //function to sign message
  const signConditionalOrder = async () => {
    const generateRandomSalt = () => {
      const randomBytes = new Uint8Array(32);
      crypto.getRandomValues(randomBytes);

      // Convert the Uint8Array to a hex string
      const salt = Array.from(randomBytes).map(byte => byte.toString(16).padStart(2, '0')).join('');

      return salt;
    };

    const deadlineDate = new Date("2023-12-01T12:00:00") //December 1st 2023 at 12PM
    const unixTimestamp = deadlineDate.getTime() / 1000; //In seconds

    const mock_conditional_order = {
      inputTokenAddy: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", //WETH
      outputTokenAddy: "0x8390a1DA07E376ef7aDd4Be859BA74Fb83aA02D5", //GROK
      recipient: "0xBb6AeaBdf61Ca96e80Aa239bA8cC7e436862E596", //
      amount: 690 * 10 ** 18, //Input token scaled(18 decimal places)
      tranches: 1,
      deadline: unixTimestamp,
      salt: generateRandomSalt()
    }

    const jsonString = JSON.stringify(mock_conditional_order);

    const payloadBytes = new TextEncoder().encode(jsonString);

    if (!primaryWallet) return;
    const signer = await primaryWallet.connector.getSigner();
    if (!signer) return;
    const signature = await signer.signMessage({
      account: primaryWallet.address,
      message: { raw: payloadBytes }
    });

    console.log(signature);
  }



  return (
    <div className="flex flex-col h-screen justify-center items-center bg-black font-sans px-4 sm:px-6 lg:px-8">
      <Head>
        <title>SplurgeFi</title>
        <meta name="description" content="Welcome to SplurgeFi" />
        <link rel="icon" href="/favicon.ico" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div className="text-center w-full max-w-2xl">
        <h1 className="text-4xl sm:text-5xl md:text-6xl mb-4 text-white font-bold tracking-wide leading-tight">
          <GradientText>Automate your trades on DEXs seamlessly</GradientText>
        </h1>

        {/* <h2 className="text-4xl sm:text-5xl md:text-6xl mb-8 text-white font-bold tracking-wide leading-tight">
          on DEXs seamlessly
        </h2> */}
        <p className="text-xl sm:text-2xl mb-10 text-gray-400 tracking-wide">
          Connect your wallet & twitter to join.
        </p>

        {/* Conditionally render the button or the success message */}
        <>
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
        </>
      </div>
    </div>
  );
};

export default LandingPage;
