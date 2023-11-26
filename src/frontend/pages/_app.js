import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { CacheProvider } from '@emotion/react';
import theme from '@/app/theme';
import createEmotionCache from '@/app/createEmotionCache';
import '../app/globals.css';
import {
  DynamicContextProvider,
  DynamicWidget,
} from '@dynamic-labs/sdk-react-core';
import { DynamicWagmiConnector } from '@dynamic-labs/wagmi-connector';
import { EthereumWalletConnectors } from '@dynamic-labs/ethereum';
const cache = createEmotionCache();

function MyApp({ Component, pageProps }) {
  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        {/* CssBaseline for baseline styling */}
        <DynamicContextProvider
          settings={{
            // Find your environment id at https://app.dynamic.xyz/dashboard/developer
            environmentId: 'a8961ac2-2a97-4735-a2b2-253f2485557e', //8f61ad0e-bccc-44b2-a96e-148f47498674
            walletConnectors: [EthereumWalletConnectors],
            siweStatement:
              'Welcome to Splurge! Signing this gas-free message verifies you as the owner of this wallet. In no way does this give Splurge to do anything on your behalf. We will reach out to you soon!',
          }}
        >
          <DynamicWagmiConnector>
            <CssBaseline />
            <Component {...pageProps} />
          </DynamicWagmiConnector>
        </DynamicContextProvider>
      </ThemeProvider>
    </CacheProvider>
  );
}

export default MyApp;
