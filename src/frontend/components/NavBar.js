import Link from 'next/link';

const NavBar = ({ inTradesPage }) => {
  return (
    <nav className='flex justify-between items-center px-8 pt-5 bg-black'>
      <Link href='/' passHref>
        <button className='text-green-500 font-bold text-lg hover:underline'>
          SplurgeFi
        </button>
      </Link>

      {inTradesPage ? (
        <Link href='/automate' passHref>
          <button className='text-white font-medium text-base hover:underline'>
            Create Trade
          </button>
        </Link>
      ) : (
        <Link href='/trades' passHref>
          <button className='text-white font-medium text-base hover:underline'>
            View Trades
          </button>
        </Link>
      )}
    </nav>
  );
};

export default NavBar;
