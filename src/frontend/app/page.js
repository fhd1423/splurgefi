"use client";
import LandingPage from "../components/LandingPage";
import FeaturesSection from "../components/FeaturesSection";
import WaitlistSection from "../components/WaitlistSection";
import {
  DynamicContextProvider,
  DynamicWidget,
} from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";

export default function Home() {
  return (
    <div className="flex flex-col bg-black font-sans w-full">
      <DynamicContextProvider
        settings={{
          // Find your environment id at https://app.dynamic.xyz/dashboard/developer
          environmentId: "8f61ad0e-bccc-44b2-a96e-148f47498674",
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
