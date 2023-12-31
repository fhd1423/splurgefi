import { EthereumWalletConnectors } from '@dynamic-labs/ethereum';
import { DynamicContextProvider } from '@dynamic-labs/sdk-react-core';
import { DynamicWagmiConnector } from '@dynamic-labs/wagmi-connector';
import '../app/globals.css';

function MyApp({ Component, pageProps }) {
  return (
    <>
      {/* CssBaseline for baseline styling */}
      <DynamicContextProvider
        settings={{
          // Find your environment id at https://app.dynamic.xyz/dashboard/developer
          environmentId: 'a8961ac2-2a97-4735-a2b2-253f2485557e',
          walletConnectors: [EthereumWalletConnectors],
          accessDeniedMessagePrimary: 'Not authorized',
          accessDeniedMessageSecondary:
            'Unfortunately you are not allowed to proceed.',
          accessDeniedButton: {
            action: () =>
              window.open('https://twitter.com/splurgefinance', '_blank'),
            title: 'Contact us',
          },
          siweStatement:
            'Welcome to Splurge! Signing this gas-free message verifies you as the owner of this wallet. In no way does this give Splurge to do anything on your behalf.',
        }}
      >
        <DynamicWagmiConnector>
          <Component {...pageProps} />
        </DynamicWagmiConnector>
      </DynamicContextProvider>
    </>
  );
}

export default MyApp;
