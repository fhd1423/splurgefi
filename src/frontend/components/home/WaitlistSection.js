'use client';

import Link from 'next/link';

function WaitlistSection() {
  return (
    <div className='text-center mt-10 md:mt-20 lg:mt-48 mb-10 md:mb-20 lg:mb-48 px-5 sm:px-10'>
      <h1 className='text-3xl sm:text-4xl md:text-5xl mb-4 sm:mb-5 md:mb-6 text-white font-bold tracking-wide leading-snug'>
        Automate your first trade today
      </h1>
      <p className='text-2xl mb-10 text-gray-400 tracking-wide'>
        Sit back and relax
      </p>

      <Link href='/automate' passHref>
        <button
          style={{
            backgroundColor: '#03C988',
            transition:
              'transform 0.3s ease, background-color 0.3s ease, box-shadow 0.3s ease',
          }}
          className='text-white text-xl font-semibold rounded-lg shadow-lg hover:bg-green-700 hover:scale-105 hover:shadow-xl w-64 h-14'
        >
          Get Started
        </button>
      </Link>
    </div>
  );
}

export default WaitlistSection;
