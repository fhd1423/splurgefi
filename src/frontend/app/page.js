"use client";
import LandingPage from "../components/LandingPage";
import FeaturesSection from "../components/FeaturesSection";
import WaitlistSection from "../components/WaitlistSection";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";

export default function Home() {
  return (
    <div className="flex flex-col bg-black font-sans w-full">
      <DynamicContextProvider
        settings={{
          // Find your environment id at https://app.dynamic.xyz/dashboard/developer
          environmentId: "a8961ac2-2a97-4735-a2b2-253f2485557e",//8f61ad0e-bccc-44b2-a96e-148f47498674
          walletConnectors: [EthereumWalletConnectors],
        }}
      >
        <LandingPage />
        <FeaturesSection />
        <WaitlistSection />
      </DynamicContextProvider>
    </div>
  );
}
