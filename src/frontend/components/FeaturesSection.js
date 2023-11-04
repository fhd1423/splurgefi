import Feature from "./Feature";

function FeaturesSection() {
  return (
    <div className="flex justify-around mt-10 mb-20 items-center">
      {" "}
      {/* Added mb-20 here */}
      <Feature
        title="Automated Trades"
        description="Don’t waste time staring at charts."
      />
      <Feature
        title="Optimized for Speed"
        description="Easy, secure, and fast trading experience."
      />
      <Feature
        title="Maximize Returns"
        description="Split your automated trade into batches."
      />
    </div>
  );
}

export default FeaturesSection;
