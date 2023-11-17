import React, { useState, useEffect } from "react";
import Head from "next/head";
import CustomInputBatches from "../components/CustomInputBatches";
import CustomDatePicker from "../components/CustomDatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import Grid from "@mui/material/Grid";
import dayjs from "dayjs";
import Link from "next/link";

export default function StepThree() {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [isWalletConnected, setIsWalletConnected] = useState(false);

    // Retreive data from previous view
    const [tradeDetails, setTradeDetails] = useState({
      inputTokenValue: "",
      outputTokenValue: "",
      inputToken: "",
      outputToken: "",
      toggleSelection: "", 
      percentChange: "", 
      selectedTradeAction: "", 
    });
  
    useEffect(() => {
      // Retrieve the state from localStorage
      const savedTradeDetails = localStorage.getItem("tradeDetails");
      if (savedTradeDetails) {
        setTradeDetails(JSON.parse(savedTradeDetails));
      }
    }, []);

  // Access setShowAuthFlow and primaryWallet from useDynamicContext
  const { setShowAuthFlow, primaryWallet } = useDynamicContext();

  const [batchValue, setBatchValue] = useState("");

  // Function to handle the authentication flow
  const handleAuthFlow = () => {
    setShowAuthFlow(true);
  };

  const uploadConditionalOrder = async () => {
    const generateRandomSalt = () => {
      const randomBytes = new Uint8Array(32);
      crypto.getRandomValues(randomBytes);

      // Convert the Uint8Array to a hex string
      const salt = Array.from(randomBytes).map(byte => byte.toString(16).padStart(2, '0')).join('');

      return salt;
    };

    const deadlineDate = new Date("2023-12-01T12:00:00") //December 1st 2023 at 12PM
    const unixTimestamp = deadlineDate.getTime() / 1000; //In seconds

    const signer = await primaryWallet.connector.getSigner();

    //Sign Payload, send payload and signature to backend
    const signature = await signer.signTypedData({
      account: primaryWallet.address,
      domain: {
        name: 'Splurge Finance',
        version: '1',
        chainId: 1,
        verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC', //CHANGE: to Splurge Addy
      },
      types: {
        conditionalOrder: [
          { name: 'inputTokenAddy', type: "address" },
          { name: 'outputTokenAddy', type: "address" },
          { name: 'recipient', type: "address" },
          { name: 'amount', type: "uint256" },
          { name: 'tranches', type: "uint256" },
          { name: 'deadline', type: "uint256" },
          { name: 'salt', type: "bytes64" }
        ],
      },
      primaryType: 'conditionalOrder',
      message: {
        inputTokenAddy: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", //WETH
        outputTokenAddy: "0x8390a1DA07E376ef7aDd4Be859BA74Fb83aA02D5", //GROK
        recipient: "0xBb6AeaBdf61Ca96e80Aa239bA8cC7e436862E596", //
        amount: 690 * 10 ** 18, //Input token scaled(18 decimal places)
        tranches: 1,
        deadline: unixTimestamp,
        salt: generateRandomSalt()
      }
    })

    console.log(signature);
  }

  // Listen for changes in primaryWallet
  useEffect(() => {
    if (primaryWallet?.address) {
      setIsWalletConnected(true);
    }
  }, [primaryWallet?.address]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="h-screen bg-black flex flex-col justify-center items-center">
        <Head>
          <title>Step Three</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <div className="pb-10" style={{ textAlign: "center", width: "100%" }}>
          <h1 className="text-4xl text-white mb-6 font-semibold">
            When should the automation end?
          </h1>
          <h3 className="text-lg text-custom-green font-bold">Step 3</h3>
        </div>

        <div className="pt-4 pb-12">
          <Grid container spacing={10} justifyContent="center">
            <Grid item>
              <CustomInputBatches
                title="Batches"
                placeHolder={"5"}
                value={batchValue}
                onValueChange={(e) => setBatchValue(e.target.value)} 
              />
            </Grid>
            <Grid item>
              <CustomDatePicker
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
              />
            </Grid>
          </Grid>
        </div>

        {batchValue && selectedDate && (
          <h2 className="pb-10 text-white">
            Summary: Execute the trade up to {batchValue} times or until the
            automation deadline, whichever occurs first, once trade conditions
            are met.
          </h2>
        )}

        {isWalletConnected ? (
          <div class="flex flex-col space-y-4 text-center">
            <p className="py-5 text-xl font-medium text-white">
              Wallet succesfully connected! 🎉
            </p>

            {/* <button
              onClick={handleAuthFlow}
              className="bg-green-500 text-white text-xl font-bold rounded-full shadow-lg hover:bg-green-600 w-96 h-16"
            >
              Start Automation
            </button> */}

            <Link href="/trades" passHref>
              <button
                onClick={handleAuthFlow}
                className="bg-green-500 text-white text-xl font-bold rounded-full shadow-lg hover:bg-green-600 w-96 h-16"
              >
                Start Automation
              </button>
            </Link>
          </div>
        ) : (
          <button
            onClick={handleAuthFlow}
            className="bg-green-500 text-white text-xl font-bold rounded-full shadow-lg hover:bg-green-600 w-96 h-16"
          >
            Connect Wallet
          </button>

        )}
      </div>
    </LocalizationProvider>
  );
}
