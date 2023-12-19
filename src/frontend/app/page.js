'use client';
import LandingPage from '../components/home/LandingPage';
import FeaturesSection from '../components/home/FeaturesSection';
import WaitlistSection from '../components/home/WaitlistSection';
import {
  DynamicContextProvider,
  DynamicWidget,
} from '@dynamic-labs/sdk-react-core';
import Graph from '../components/home/Graph';
import { EthereumWalletConnectors } from '@dynamic-labs/ethereum';

export default function Home() {
  return (
    <div className='flex flex-col bg-black font-sans w-full'>
      <DynamicContextProvider
        settings={{
          // Find your environment id at https://app.dynamic.xyz/dashboard/developer
          environmentId: 'a8961ac2-2a97-4735-a2b2-253f2485557e', //8f61ad0e-bccc-44b2-a96e-148f47498674
          walletConnectors: [EthereumWalletConnectors],
          siweStatement:
            'Welcome to Splurge! Signing this gas-free message verifies you as the owner of this wallet. In no way does this give Splurge to do anything on your behalf. We will reach out to you soon!',
        }}
      >
        <LandingPage />
        <Graph />
        <FeaturesSection />
        <WaitlistSection />
        <footer className='mt-auto w-full max-w-[85rem] py-10 px-4 sm:px-6 lg:px-8 mx-auto'>
          <div className='text-center'>
            <div>
              <a
                className='flex-none text-xl font-semibold text-black dark:text-white'
                href='#'
                aria-label='Brand'
              >
                Splurge Finance
              </a>
            </div>

            <div className='mt-3'>
              <p className='text-gray-500'>
                © SplurgeFi. 2023. All rights reserved.
              </p>
            </div>

            <div className='mt-3 flex space-x-2 justify-center items-center'>
              <a
                className='inline-flex justify-center items-center w-10 h-10 text-center text-gray-500 hover:bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-white transition dark:text-gray-500 dark:hover:text-gray-200 dark:hover:bg-gray-800'
                href='https://twitter.com/splurgefinance'
              >
                <svg
                  className='w-3.5 h-3.5'
                  xmlns='http://www.w3.org/2000/svg'
                  width='16'
                  height='16'
                  fill='currentColor'
                  viewBox='0 0 16 16'
                >
                  <path d='M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z' />
                </svg>
              </a>

              {/* Docs link here */}
              <a
                href='https://splurge.gitbook.io/splurge-docs/'
                className='text-gray-500 hover:text-blue-500 transition'
                target='_blank'
                rel='noopener noreferrer'
              >
                Docs
              </a>
            </div>
          </div>
        </footer>
      </DynamicContextProvider>
    </div>
  );
}
