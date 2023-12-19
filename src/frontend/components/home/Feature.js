function Feature({ title, description }) {
  return (
    <div className='flex flex-col items-center p-4'>
      {/* Responsive text size and margin */}
      <h2
        style={{ color: '#03C988' }}
        className='text-2xl sm:text-3xl mb-2 font-bold text-center'
      >
        {title}
      </h2>
      {/* Ensure the text is not too large on small devices */}
      <p className='text-lg sm:text-xl text-white text-center'>{description}</p>
    </div>
  );
}

export default Feature;
