function Feature({ title, description }) {
  return (
    <div className="flex flex-col items-center p-4">
      <h2 className="text-3xl mb-2 text-custom-green font-bold">{title}</h2>
      <p className="text-xl text-white-400">{description}</p>
    </div>
  );
}

export default Feature;
