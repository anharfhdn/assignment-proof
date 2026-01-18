'use client';

import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config';
import { sepolia } from 'viem/chains';

const queryClient = new QueryClient();

const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID as string;

if (!projectId) throw new Error('Missing WalletConnect Project ID');

const metadata = {
    name: 'ProofOfWork',
    description: 'Academic timestamping',
    url: '',
    icons: ['']
};

const config = defaultWagmiConfig({
    chains: [sepolia],
    projectId,
    metadata,
});

createWeb3Modal({
    wagmiConfig: config,
    projectId,
    enableAnalytics: true
});

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </WagmiProvider>
    );
}
