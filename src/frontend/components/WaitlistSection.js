"use client";

import { DynamicWidget } from "@dynamic-labs/sdk-react-core";

function WaitlistSection() {
  // Function to handle click event
  const handleButtonClick = () => {
    // Redirect to the target URL
    window.location.href = "https://760abapqqfl.typeform.com/to/umui6CKW";
  };

  return (
    <div className="text-center mt-48 mb-48">
      <h1 className="text-xl mb-10 text-white font-bold tracking-wide leading-tight">
        it may be a good idea to link your twitter account as well 😏
      </h1>
      <h1 className="flex justify-center">
        <DynamicWidget />
      </h1>
    </div>
  );
}

export default WaitlistSection;
