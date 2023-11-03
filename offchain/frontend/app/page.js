import LandingPage from "../components/LandingPage";
import FeaturesSection from "../components/FeaturesSection";
import WaitlistSection from "../components/WaitlistSection";

export default function Home() {
  return (
    <div className="flex flex-col bg-black font-sans w-full">
      <LandingPage />
      <FeaturesSection />
      <WaitlistSection />
    </div>
  );
}
