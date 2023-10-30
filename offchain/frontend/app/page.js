import Head from "next/head";

export default function Home() {
  return (
    <div className="flex flex-col h-screen justify-center items-center bg-gray-100">
      <Head>
        <title>SplurgeFi</title>
        <meta name="description" content="Welcome to SplurgeFi" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="text-center">
        <h1 className="text-4xl mb-4 font-bold text-gray-700">
          Welcome to SplurgeFi
        </h1>
        <p className="text-xl mb-8 text-gray-600">
          Your journey to financial splurging starts here.
        </p>
        <button className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
          Get Started
        </button>
      </div>
    </div>
  );
}
