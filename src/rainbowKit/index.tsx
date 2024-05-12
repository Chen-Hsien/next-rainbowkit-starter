'use client';

import { RainbowKitProvider, connectorsForWallets } from '@rainbow-me/rainbowkit';
import { metaMaskWallet, rainbowWallet, walletConnectWallet } from '@rainbow-me/rainbowkit/wallets';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { bscTestnet } from 'wagmi/chains';
import { particleGoogleWallet, particleTwitterWallet, particleWallet } from '../particleWallet';

const connectors = connectorsForWallets(
    [
        {
            groupName: 'Recommended',
            wallets: [
                particleGoogleWallet,
                particleTwitterWallet,
                particleWallet,
                metaMaskWallet,
                rainbowWallet,
                walletConnectWallet,
            ],
        },
    ],
    {
        appName: 'My RainbowKit App',
        projectId: '04309ed1007e77d1f119b85205bb779d',
    }
);

const config = createConfig({
    connectors,
    chains: [bscTestnet],
    transports: {
        [bscTestnet.id]: http(),
    },
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider>{children}</RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}
