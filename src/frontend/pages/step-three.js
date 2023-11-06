"use client";
import React, { useState } from "react";
import Head from "next/head";
import CustomInputPercent from "../components/CustomInputPercent";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import dayjs from "dayjs";

export default function StepThree() {
  const [selectedDate, setSelectedDate] = useState(dayjs());

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
              <CustomInputPercent title="Batches" />
            </Grid>
            <Grid item>
              <DatePicker
                label="Choose a date"
                value={selectedDate}
                onChange={(newDate) => setSelectedDate(newDate)}
                renderInput={(params) => <TextField {...params} />}
              />
            </Grid>
          </Grid>
        </div>
      </div>
    </LocalizationProvider>
  );
}
