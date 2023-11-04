"use client";

import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { DynamicWidget } from "@dynamic-labs/sdk-react-core";

function WaitlistSection() {
  // Function to handle click event
  const handleButtonClick = () => {
    // Redirect to the target URL
    window.location.href = "https://760abapqqfl.typeform.com/to/umui6CKW";
  };

  const { setShowAuthFlow } = useDynamicContext();

  return (
    <div className="text-center mt-48 mb-48">
      <h1 className="text-5xl mb-5 text-white font-bold tracking-wide leading-tight">
        Join our waitlist.
      </h1>
      {/* <h1 className="flex justify-center">
        <DynamicWidget />
      </h1> */}

      <p className="text-2xl mb-8 text-gray-400 tracking-wide">
        Connect you wallet & twitter username to join.
      </p>

      <button
        className="bg-green-500 text-white text-xl font-bold py-2 px-8 rounded-full shadow-lg hover:bg-green-600"
        onClick={() => setShowAuthFlow(true)}
      >
        Connect Wallet
      </button>
    </div>
  );
}

export default WaitlistSection;
