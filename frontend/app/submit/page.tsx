'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { keccak256, toBytes } from 'viem';
import dynamic from 'next/dynamic';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contract';
import type { UploadStatus } from '@/lib/types';

const WalletConnectDynamic = dynamic(
    () => import('@/components/WalletConnect').then((mod) => ({ default: mod.WalletConnect })),
    {
        ssr: false,
        loading: () => <div className="h-10 w-36 bg-gray-200 rounded-lg animate-pulse" />
    }
);

export default function SubmitPage() {
    const [isMounted, setIsMounted] = useState(false);

    const { address, isConnected } = useAccount();
    const { writeContract, data: hash } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    const [file, setFile] = useState<File | null>(null);
    const [courseId, setCourseId] = useState('');
    const [status, setStatus] = useState<UploadStatus>('idle');
    const [ipfsHash, setIpfsHash] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (isSuccess && status === 'submitting' && address) {
            setStatus('success');
            const submission = {
                ipfsHash,
                courseId,
                fileName: file?.name,
                timestamp: Date.now(),
                txHash: hash as string,
            };
            localStorage.setItem(`submission_${address}_latest`, JSON.stringify(submission));
        }
    }, [isSuccess, status, address, ipfsHash, file?.name, hash, courseId]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            const maxSize = 10 * 1024 * 1024; // 10MB
            if (selectedFile.size > maxSize) {
                setError('File too large. Max size is 10MB.');
                return;
            }
            setFile(selectedFile);
            setError('');
        }
    };

    const handleFullSubmission = async () => {
        if (!file || !courseId) return;
        let currentCid = '';

        try {
            setStatus('uploading');
            setError('');

            const formData = new FormData();
            formData.append('file', file);
            const response = await fetch('/api/upload', { method: 'POST', body: formData });
            const data = await response.json();

            if (!data.success) throw new Error(data.error || 'Upload failed');

            currentCid = data.ipfsHash;
            setIpfsHash(currentCid);

            setStatus('submitting');
            const contentHash = keccak256(toBytes(currentCid));

            writeContract({
                address: CONTRACT_ADDRESS as `0x${string}`,
                abi: CONTRACT_ABI,
                functionName: 'commitWork',
                args: [contentHash, courseId],
            }, {
                onSuccess: (txHash) => {
                    console.log("Transaction sent:", txHash);
                    setStatus('submitting');
                },
                onError: async (err) => {
                    console.warn("User rejected or contract error occurred");

                    setStatus('error');
                    setError("Transaction cancelled. Cleaning up storage...");

                    try {
                        await fetch('/api/unpin', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ cid: currentCid }),
                        });
                        console.log("Unpinned CID:", currentCid);
                    } catch (cleanupErr) {
                        console.error("Failed to unpin:", cleanupErr);
                    }

                    setTimeout(() => setStatus('idle'), 2000);
                }
            });

        } catch (err: any) {
            setStatus('error');
            setError(err instanceof Error ? err.message : 'Submission failed');
            setTimeout(() => setStatus('idle'), 3000);
        }
    };

    if (!isMounted) {
        return <div className="max-w-3xl mx-auto mt-10 p-8" />;
    }

    return (
        <div className="max-w-3xl mx-auto mt-10 p-8 bg-white rounded-lg shadow-lg">
            {}
            <div className="flex justify-between items-start mb-8">
                <h2 className="text-3xl font-bold text-slate-900">Submit Assignment</h2>
                <div className="ml-auto">
                    <WalletConnectDynamic />
                </div>
            </div>

            {}
            {!isConnected && (
                <div className="mb-8 p-6 bg-orange-50 border-2 border-orange-200 rounded-lg">
                    <p className="text-orange-800 font-semibold mb-2">Please connect your wallet to submit assignments</p>
                </div>
            )}

            {}
            <div className="mb-6">
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Course/Assignment ID
                </label>
                <input
                    type="text"
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    placeholder="e.g., CS101-Assignment1"
                    disabled={!isConnected}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-black placeholder:text-gray-400 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"                />
            </div>

            <div className="mb-6">
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Select File (PDF, DOCX, ZIP, etc.)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition">
                    <input
                        type="file"
                        onChange={handleFileChange}
                        className="hidden"
                        id="file-upload"
                        accept=".pdf,.doc,.docx,.zip,.txt"
                        disabled={!isConnected}
                    />
                    <label htmlFor="file-upload" className="cursor-pointer block w-full">
                        {file ? (
                            <div>
                                <p className="text-green-600 font-semibold">✓ {file.name}</p>
                                <p className="text-sm text-gray-500">
                                    Size: {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                            </div>
                        ) : (
                            <div>
                                <p className="text-gray-600">Click to select file</p>
                                <p className="text-sm text-gray-400">Max size: 10MB</p>
                            </div>
                        )}
                    </label>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800">❌ {error}</p>
                </div>
            )}

            <button
                onClick={handleFullSubmission}
                disabled={!isConnected || !file || !courseId || status === 'uploading' || status === 'submitting'}
                className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition text-lg"
            >
                {status === 'idle' && '📤 Upload to IPFS & Submit'}
                {status === 'uploading' && '⏳ Uploading to IPFS...'}
                {status === 'hashing' && '🔐 Hashing...'}
                {status === 'submitting' && '⛓️ Submitting to Blockchain...'}
                {isConfirming && '⏳ Confirming Transaction...'}
                {status === 'success' && '✅ Submitted Successfully!'}
                {status === 'error' && '❌ Error - Try Again'}
            </button>

            {}
            {status === 'success' && (
                <div className="mt-6 p-6 bg-green-50 border-2 border-green-500 rounded-lg">
                    <h3 className="font-bold text-lg mb-3 text-green-800">✅ Submission Successful!</h3>

                    {}
                    <div className="space-y-2 text-sm text-gray-800">
                        <p><strong className="text-green-900">Course:</strong> {courseId}</p>
                        <p><strong className="text-green-900">File:</strong> {file?.name}</p>

                        <p className="flex flex-col gap-1">
                            <strong className="text-green-900">IPFS Hash:</strong>
                            <code className="bg-white px-2 py-1 rounded border border-green-200 break-all text-xs text-gray-700">
                                {ipfsHash}
                            </code>
                        </p>

                        <p className="flex flex-col gap-1">
                            <strong className="text-green-900">Transaction Hash:</strong>
                            <code className="bg-white px-2 py-1 rounded border border-green-200 break-all text-xs text-gray-700">
                                {hash}
                            </code>
                        </p>

                        <a
                            href={`https://ipfs.io/ipfs/${ipfsHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium transition"
                        >
                            View on IPFS
                        </a>
                    </div>
                </div>
            )}

            <div className="mt-8 bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
                <h3 className="font-bold text-lg mb-3 text-yellow-800">⚠️ Important Information</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Your file is cryptographically hashed for security</li>
                    <li>• The blockchain records a timestamp proof of your work</li>
                    <li>• If you cancel the transaction, the temporary upload is deleted</li>
                </ul>
            </div>
        </div>
    );
}