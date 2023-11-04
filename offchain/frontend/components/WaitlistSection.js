"use client";

function WaitlistSection() {
  // Function to handle click event
  const handleButtonClick = () => {
    // Redirect to the target URL
    window.location.href = "https://760abapqqfl.typeform.com/to/umui6CKW";
  };

  return (
    <div className="text-center mt-48 mb-48">
      <h1 className="text-6xl mb-10 text-white font-bold tracking-wide leading-tight">
        Join the waitlist today.
      </h1>
      <button
        onClick={handleButtonClick} // Add the onClick event handler here
        className="bg-green-500 text-white text-xl font-bold py-2 px-8 rounded-full shadow-lg hover:bg-green-600 focus:outline-none focus:ring focus:ring-green-200 focus:ring-opacity-50"
      >
        Join Waitlist
      </button>
    </div>
  );
}

export default WaitlistSection;
