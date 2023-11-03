import Head from "next/head";
import Link from "next/link";

const LandingPage = () => (
  <div className="flex flex-col h-screen justify-center items-center bg-black font-sans">
    <Head>
      <title>SplurgeFi</title>
      <meta name="description" content="Welcome to SplurgeFi" />
      <link rel="icon" href="/favicon.ico" />
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
    </Head>

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
      <Link href="/step-one" className="focus:outline-none">
        <button className="bg-green-500 text-white text-xl font-bold py-2 px-8 rounded-full shadow-lg hover:bg-green-600">
          Get Started
        </button>
      </Link>
    </div>
  </div>
);

export default LandingPage;
