'use client';

import { useEffect, useState } from 'react';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useAccount } from 'wagmi';

export function WalletConnect() {
    const { open } = useWeb3Modal();
    const { address, isConnected } = useAccount();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return (
            <div className="px-6 py-2 bg-gray-200 rounded-lg animate-pulse h-10 w-32">
                {}
            </div>
        );
    }

    if (isConnected) {
        return (
            <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm">
                <span>✓</span>
                <span>{address?.slice(0, 6)}...{address?.slice(-4)}</span>
            </div>
        );
    }

    return (
        <button
            onClick={() => open()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
            Connect Wallet
        </button>
    );
}
