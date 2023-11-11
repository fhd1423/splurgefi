import Feature from "./Feature";

function FeaturesSection() {
  return (
    <div className="flex flex-wrap justify-around items-center mt-10 mb-20 px-4 sm:px-6 md:px-8">
      {/* Wrap each Feature component with a div that controls its width at different breakpoints */}
      <div className="w-full sm:w-1/2 lg:w-1/3 mb-6 lg:mb-0">
        <Feature
          title="Automated Trades"
          description="Don’t waste time staring at charts."
        />
      </div>
      <div className="w-full sm:w-1/2 lg:w-1/3 mb-6 lg:mb-0">
        <Feature
          title="Gasless"
          description="Don't worry about gas after the approval."
        />
      </div>
      <div className="w-full sm:w-1/2 lg:w-1/3">
        <Feature
          title="Maximize Returns"
          description="Split your automated trade into batches."
        />
      </div>
    </div>
  );
}

export default FeaturesSection;
