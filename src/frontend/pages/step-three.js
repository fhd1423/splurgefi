import React, { useState, useEffect } from "react";
import Head from "next/head";
import CustomInputPercent from "../components/CustomInputPercent";
import CustomDatePicker from "../components/CustomDatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import Grid from "@mui/material/Grid";
import dayjs from "dayjs";

export default function StepThree() {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  // Access setShowAuthFlow and primaryWallet from useDynamicContext
  const { setShowAuthFlow, primaryWallet } = useDynamicContext();

  const [percentValue, setPercentValue] = useState("");

  // Function to handle the authentication flow
  const handleAuthFlow = () => {
    setShowAuthFlow(true);
  };

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
              <CustomInputPercent
                title="Batches"
                placeHolder={"5"}
                value={percentValue}
                onValueChange={(e) => setPercentValue(e.target.value)} // Corrected: use a handler function to set the value
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

        {isWalletConnected ? (
          <div class="flex flex-col space-y-4">
            <p className="py-5 text-xl font-medium">
              Wallet succesfully connected! 🎉
            </p>

            <button
              onClick={handleAuthFlow}
              className="bg-green-500 text-white text-xl font-bold py-2 px-8 rounded-full shadow-lg hover:bg-green-600"
            >
              Start Automation
            </button>
          </div>
        ) : (
          <button
            onClick={handleAuthFlow}
            className="bg-green-500 text-white text-xl font-bold py-2 px-8 rounded-full shadow-lg hover:bg-green-600"
          >
            Connect Wallet
          </button>
        )}
      </div>
    </LocalizationProvider>
  );
}
