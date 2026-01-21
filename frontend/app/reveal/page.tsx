'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import dynamic from 'next/dynamic';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contract';

const WalletConnectDynamic = dynamic(
    () => import('@/components/WalletConnect').then((mod) => ({ default: mod.WalletConnect })),
    { ssr: false, loading: () => <div className="h-10 w-36 bg-gray-200 rounded-lg animate-pulse" /> }
);

export default function RevealPage() {
    const [isMounted, setIsMounted] = useState(false);
    const { address, isConnected } = useAccount();

    const [submissionId, setSubmissionId] = useState('');
    const [ipfsHash, setIpfsHash] = useState('');
    const [status, setStatus] = useState<'idle' | 'revealing' | 'success' | 'error'>('idle');
    const [error, setError] = useState('');

    useEffect(() => { setIsMounted(true); }, []);

    const { data: submissionData } = useReadContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'getSubmission',
        args: address && submissionId && !isNaN(Number(submissionId))
            ? [address as `0x${string}`, BigInt(submissionId)]
            : undefined,
        query: {
            enabled: !!address && !!submissionId && !isNaN(Number(submissionId)),
        }
    });

    const sub = submissionData as [string, bigint, boolean, string] | undefined;
    const courseName: string = sub ? String(sub[3]) : '';
    const isAlreadyRevealed: boolean = sub ? Boolean(sub[2]) : false;
    const commitTime: string = sub ? new Date(Number(sub[1]) * 1000).toLocaleString() : '';

    const { writeContract, data: hash } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    useEffect(() => {
        if (isSuccess && status === 'revealing') {
            setStatus('success');
            localStorage.removeItem(`submission_${address}_latest`);
            console.log("Headers cleared. User must sync for new data.");
        }
    }, [isSuccess, status, address]);

    const revealWork = async () => {
        if (!submissionId || !ipfsHash || !address) {
            setError('Missing ID, CID, or Wallet connection.');
            return;
        }

        if (isAlreadyRevealed) {
            setError('This work is already revealed on the blockchain.');
            return;
        }

        setStatus('revealing');
        setError('');

        writeContract({
            address: CONTRACT_ADDRESS as `0x${string}`,
            abi: CONTRACT_ABI,
            functionName: 'revealWork',
            args: [BigInt(submissionId), ipfsHash.trim()],
            gas: BigInt(600000),
        }, {
            onError: (err: any) => {
                setStatus('error');
                const msg = err.message || "";
                if (msg.includes('ContentDoesNotMatchHash')) {
                    setError("Hash Mismatch: Use the EXACT CID from your submission receipt.");
                } else if (msg.includes('SubmissionDoesNotExists')) {
                    setError("ID not found for your address.");
                } else {
                    setError("Reveal failed. Check your ID/CID and try again.");
                }
                setTimeout(() => setStatus('idle'), 4000);
            }
        });
    };

    if (!isMounted) return <div className="max-w-3xl mx-auto mt-10 p-8" />;

    return (
        <div className="max-w-3xl mx-auto mt-10 p-8 bg-white rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-8 border-b pb-4">
                <h2 className="text-3xl font-bold text-black">🔓 Reveal Assignment</h2>
                <WalletConnectDynamic />
            </div>

            <div className="space-y-6">
                {}
                <div>
                    <label className="block text-sm font-bold mb-2 text-slate-800">Submission ID</label>
                    <input
                        type="number"
                        value={submissionId}
                        onChange={(e) => setSubmissionId(e.target.value)}
                        placeholder="Enter the ID from your receipt"
                        className="w-full p-3 border-2 border-slate-200 rounded-lg text-black focus:border-blue-500 outline-none"
                    />
                </div>

                {}
                <div>
                    <label className="block text-sm font-bold mb-2 text-slate-800">IPFS CID (Content Hash)</label>
                    <input
                        type="text"
                        value={ipfsHash}
                        onChange={(e) => setIpfsHash(e.target.value)}
                        placeholder="Qm..."
                        className="w-full p-3 border-2 border-slate-200 rounded-lg text-black focus:border-blue-500 outline-none"
                    />
                </div>

                {}
                {sub && submissionId && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800 font-bold mb-1 underline">Blockchain Verified Record:</p>
                        <p className="text-xs text-blue-700"><strong>Course:</strong> {courseName}</p>
                        <p className="text-xs text-blue-700"><strong>Status:</strong> {isAlreadyRevealed ? '✅ Revealed' : '⏳ Ready to Reveal'}</p>
                        <p className="text-xs text-blue-700"><strong>Committed On:</strong> {commitTime}</p>
                    </div>
                )}

                {error && <div className="p-3 bg-red-50 text-red-700 rounded border border-red-200 text-sm">{error}</div>}

                {}
                <button
                    onClick={revealWork}
                    disabled={!isConnected || status === 'revealing' || isAlreadyRevealed || isConfirming}
                    className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold hover:bg-blue-700 disabled:bg-slate-300 transition-all text-lg shadow-sm"
                >
                    {isAlreadyRevealed ? 'Already Revealed' :
                        status === 'revealing' || isConfirming ? '⛓️ Finalizing on Blockchain...' :
                            'Prove & Reveal Work'}
                </button>

                {status === 'success' && (
                    <div className="mt-4 p-4 bg-green-100 border-2 border-green-500 rounded-lg text-center text-green-800 font-bold">
                        🎉 Reveal Successful! Storage cleared.
                    </div>
                )}
            </div>
        </div>
    );
}