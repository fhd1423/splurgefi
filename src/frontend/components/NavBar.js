import { DynamicWidget } from '@dynamic-labs/sdk-react-core';
import Link from 'next/link';
const NavBar = ({ inLandingPage }) => {
  return (
    <nav className='flex justify-between items-center px-8 pt-5'>
      {/* Left-aligned links */}
      <div className='flex space-x-6'>
        <Link href='/' passHref>
          <button
            style={{ color: '#03C988' }}
            className='font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition duration-200'
          >
            SplurgeFi
          </button>
        </Link>
        {!inLandingPage && (
          <Link href='/trades' passHref>
            <button className='text-white font-medium text-base shadow-md hover:shadow-lg hover:scale-105 transition duration-200'>
              My Trades
            </button>
          </Link>
        )}
        {!inLandingPage && (
          <Link href='/automate' passHref>
            <button className='text-white font-medium text-base shadow-md hover:shadow-lg hover:scale-105 transition duration-200'>
              New Trade
            </button>
          </Link>
        )}
      </div>

      {!inLandingPage && (
        <DynamicWidget
          innerButtonComponent={
            <button className='h-10'>Connect Wallet</button>
          }
        />
      )}
    </nav>
  );
};

export default NavBar;
