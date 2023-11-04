import Head from "next/head";

export default function StepOne() {
  return (
    <div className="h-screen bg-black flex flex-col justify-center items-center">
      <Head>
        <title>Step One</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1 className="text-4xl text-white mb-6">
        What tokens do you want to trade?
      </h1>
    </div>
  );
}
