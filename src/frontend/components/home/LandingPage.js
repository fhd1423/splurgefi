'use client';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import NavBar from '../NavBar';
import GradientText from './GradientText';

const LandingPage = () => {
  const router = useRouter();

  return (
    <div className='h-screen bg-black flex flex-col'>
      <NavBar inLandingPage={true} />
      <div className='flex flex-col h-screen bg-black font-sans px-4 sm:px-6 lg:px-8'>
        <Head>
          <title>SplurgeFi</title>
          <meta name='description' content='Welcome to SplurgeFi' />
          <link rel='icon' href='/favicon.ico' />
          <link
            href='https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
            rel='stylesheet'
          />
        </Head>

        <div className='text-center w-full max-w-2xl m-auto'>
          <h1 className='text-4xl sm:text-5xl md:text-6xl mb-4 text-white font-bold tracking-wide leading-tight'>
            <GradientText>Automate your trades on DEXs seamlessly</GradientText>
          </h1>

          <p className='text-2xl mb-10 text-gray-400 tracking-wide'>
            Best trading experience ever
          </p>

          <Link href='/automate' passHref>
            <button
              style={{
                backgroundColor: '#03C988',
                transition:
                  'transform 0.3s ease, background-color 0.3s ease, box-shadow 0.3s ease',
              }}
              className='text-white text-xl font-semibold rounded-lg shadow-lg hover:bg-green-700 hover:scale-105 hover:shadow-xl w-64 h-14'
              onClick={() => router.push('/trades')}
            >
              Get Started
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
