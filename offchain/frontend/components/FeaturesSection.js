import Feature from "./Feature";

function FeaturesSection() {
  return (
    <div className="flex justify-around mt-10 mb-20 items-center">
      {" "}
      {/* Added mb-20 here */}
      <Feature
        title="Automated Trades"
        description="Don’t track token prices. We’ll do that for you."
      />
      <Feature
        title="10x Faster"
        description="Easy, secure, and fast trading experience."
      />
      <Feature
        title="Maximize Returns"
        description="Auto-batch trades for optimal gains."
      />
    </div>
  );
}

export default FeaturesSection;
