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
import { supabase } from "./client"

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

  const fetchUserId = async (userIdentifier) => {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('your_user_identifier_column', userIdentifier)
      .single();
  
    if (error) {
      console.error('Error fetching user ID:', error);
      return null; // or handle the error as needed
    }
  
    return data.id; // Assuming 'id' is the column name for user ID
  };

  const fetchPairId = async (pairIdentifier) => {
    const { data, error } = await supabase
      .from('pairs')
      .select('id')
      .eq('your_pair_identifier_column', pairIdentifier)
      .single();
  
    if (error) {
      console.error('Error fetching pair ID:', error);
      return null; // or handle the error as needed
    }
  
    return data.id; // Assuming 'id' is the column name for pair ID
  };


  const uploadConditionalOrder = async () => {

    const generateRandomSalt = () => {
      const randomBytes = new Uint8Array(64); // Generating 64 random bytes
      crypto.getRandomValues(randomBytes);
      const salt = Array.from(randomBytes).map(byte => byte.toString(16).padStart(2, '0')).join('');
      console.log("Salt length:", salt.length);
      return salt;
    };



    const unixTimestamp = selectedDate.unix(); // Unix timestamp in seconds
    const signer = await primaryWallet.connector.getSigner();
    let selectedPercentChange = parseInt(tradeDetails.percentChange, 10);
    let selectedPriceAverage = parseInt(tradeDetails.selectedTradeAction, 10);
    let selectedAmount = tradeDetails.inputTokenValue;

    // Step 1: Parse the Decimal Value
    const [wholePart, decimalPartRaw] = selectedAmount.includes('.') ? selectedAmount.split('.') : [selectedAmount, ''];
    // Step 2: Normalize Decimal Part
    const decimalPart = decimalPartRaw.padEnd(18, '0'); // Add trailing zeros to make it 18 decimal places
    // Step 3: Convert to Integer
    const wholePartBigInt = BigInt(wholePart);
    const decimalPartBigInt = BigInt(decimalPart);
    // Step 4: Scale to Blockchain Format
    let amountInWei = wholePartBigInt * BigInt(10) ** BigInt(18) + decimalPartBigInt;


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
          { name: 'inputTokenAddress', type: "address" },
          { name: 'outputTokenAddress', type: "address" },
          { name: 'recipient', type: "address" },
          { name: 'orderType', type: "string" },
          { name: 'amount', type: "uint256" },
          { name: 'tranches', type: "uint256" },
          { name: 'percentChange', type: "uint256" },
          { name: 'priceAvg', type: "uint256" },
          { name: 'deadline', type: "uint256" },
          { name: 'salt', type: "bytes" }
        ],
      },
      primaryType: 'conditionalOrder',
      message: {
        inputTokenAddress: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
        outputTokenAddress: "0x8390a1DA07E376ef7aDd4Be859BA74Fb83aA02D5", // GROK
        recipient: "0xBb6AeaBdf61Ca96e80Aa239bA8cC7e436862E596",
        orderType: tradeDetails.toggleSelection,
        amount: amountInWei, // Input token scaled(18 decimal places)
        tranches: 1,
        percentChange: selectedPercentChange,
        priceAvg: selectedPriceAverage,
        deadline: unixTimestamp,
        salt: generateRandomSalt()
      }
    })
    console.log(signature);

    async function uploadData() {

      try {
        // Retrieve and store data to be uploaded to database 
        const currentTimestamp = new Date().toISOString();
        const orderData = {
          tradeOption: tradeDetails.toggleSelection,
          inputTokenAddy: tradeDetails.inputToken, 
          outputTokenAddy: tradeDetails.outputToken, 
          tradeAmount: tradeDetails.inputTokenValue,
          tradeDelta: tradeDetails.percentChange, 
          avgPrice: tradeDetails.selectedTradeAction, 
          batches: batchValue, 
          deadline: selectedDate.toISOString()
        }

        const jsonData = JSON.stringify(orderData); 

        // created_at (timestamp), user (referenced to user table), pair (referenced to pair table), SplurgeOrder jsonb, signature - text, ready - bool, ZeroExCalldata - jsonb
        const { data, error } = await supabase
          .from('Trades')
          .insert([
            { created_at: currentTimestamp, 
              SplurgeOrder: jsonData, 
              signature: signature, 
              ready: false
            }
          ]);

        if (error) throw error; 

      } catch (error) {
        console.error("Error uploading data to Supabase:", error)
      }


    }

    uploadData(); 
    // router.push('/trades');
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
                onClick={uploadConditionalOrder}
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