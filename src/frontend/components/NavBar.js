import Link from 'next/link';
import { Button } from '@mui/material';
import Typography from '@mui/material/Typography';
const NavBar = ({ inTradesPage }) => {
  return (
    <nav className='flex justify-between items-center px-8 pt-5 bg-black'>
      <Link href='/' passHref>
        {/* <Button>
          <Typography style={{ color: '#50D890', fontWeight: 'bold' }}>
            SplurgeFi
          </Typography>
        </Button> */}
        <button className='text-green-500 font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition duration-200'>
          SplurgeFi
        </button>
      </Link>

      {inTradesPage ? (
        <Link href='/automate' passHref>
          <button className='text-white font-medium text-base shadow-md hover:shadow-lg hover:scale-105 transition duration-200'>
            Create Trade
          </button>
        </Link>
      ) : (
        <Link href='/trades' passHref>
          <button className='text-white font-medium text-base shadow-md hover:shadow-lg hover:scale-105 transition duration-200'>
            View Trades
          </button>
        </Link>
      )}
    </nav>
  );
};

export default NavBar;
