"use client";

import Head from "next/head";
import Link from "next/link";
import Button from "@mui/material/Button";

const handleButtonClick = () => {
  // Redirect to the target URL
  window.location.href = "https://760abapqqfl.typeform.com/to/umui6CKW";
};

const LandingPage = () => (
  <div className="flex flex-col h-screen justify-center items-center bg-black font-sans">
    <div className="text-center">
      <h1 className="text-6xl mb-4 text-white font-bold tracking-wide leading-tight">
        Automate your trades
      </h1>

      <h1 className="text-6xl mb-8 text-white font-bold tracking-wide leading-tight">
        on DEXs seamlessly
      </h1>
      <p className="text-2xl mb-10 text-gray-400 tracking-wide">
        Best trading experience ever.
      </p>
      <button
        onClick={handleButtonClick}
        className="bg-green-500 text-white text-xl font-bold py-2 px-8 rounded-full shadow-lg hover:bg-green-600"
      >
        Join Waitlist
      </button>
    </div>
  </div>
);

export default LandingPage;
