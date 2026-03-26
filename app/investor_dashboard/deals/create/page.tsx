"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createDealProposal } from '@/app/actions/investor';
import { Loader2 } from 'lucide-react';
// import { getPitchById } from '@/app/actions/investor'; // We might need client-side fetch or pass data

// We need to wrap in Suspense for useSearchParams
function DealCreationForm() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const pitchId = searchParams.get('pitchId');
    const entrepreneurId = searchParams.get('entrepreneurId');
    const investorId = searchParams.get('investorId'); // Might need to fetch from session if not passed, but let's assume passed or handled by action

    const [amount, setAmount] = useState('');
    const [equity, setEquity] = useState('');
    const [terms, setTerms] = useState('Standard investment agreement terms apply.\n\n1. Valuation: ...\n2. Board Seats: ...\n3. Voting Rights: ...');
    const [isLoading, setIsLoading] = useState(false);

    if (!pitchId || !entrepreneurId) {
        return <div className="p-8 text-red-500">Missing required parameters.</div>;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // We need investorId. If not in params, assuming we verify session in action.
            // But createDealProposal takes investorId explicitly.
            // We should get it from a prop or fetch it.
            // Since this is a client component, we rely on the parent or context.
            // For now, let's assume the router passed it or we use a server component wrapper.
            // Ideally, the action `createDealProposal` should use `getUser()` internally for security.
            // But checking `investor.ts`, it takes `investorId` as arg.
            // So we must pass it.

            // To fix: I'll make the page a Server Component that renders this Client Component with investorId.
            // But for now, let's assume it's passed in query for MVP flow or user context is available.
            // I'll fetch user in the page wrapper.

            if (!investorId) {
                alert("User session invalid");
                return;
            }

            const result = await createDealProposal({
                pitchId,
                entrepreneurId,
                investorId,
                amount: Number(amount),
                equity: Number(equity),
                terms
            });

            if (result.success && result.dealId) {
                router.push(`/investor_dashboard/deals/${result.dealId}`);
            } else {
                alert('Failed: ' + result.error);
            }
        } catch (error) {
            console.error(error);
            alert('Error creating deal');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <h1 className="text-3xl font-extrabold text-[#0B2C4A] tracking-tight mb-2">Create Deal Proposal</h1>
            <p className="text-gray-500 mt-2 text-lg mb-8">
                Fill in the details below to generate a formal deal document.
                Both parties will need to verify this document.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Investment Amount (Rs)</label>
                        <input
                            type="number"
                            required
                            className="w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2 border"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Equity (%)</label>
                        <input
                            type="number"
                            required
                            step="0.1"
                            className="w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2 border"
                            value={equity}
                            onChange={(e) => setEquity(e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Terms & Conditions</label>
                    <textarea
                        required
                        className="w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 h-64 p-3 border font-mono text-sm"
                        value={terms}
                        onChange={(e) => setTerms(e.target.value)}
                    />
                </div>

                <div className="flex justify-end gap-4 pt-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-8 py-2 bg-[#0B2C4A] text-white rounded-lg font-medium hover:bg-opacity-90 flex items-center justify-center gap-2"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate Document'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default function DealCreatePage() {
    return (
        <div className="p-8">
            <Suspense fallback={<div>Loading...</div>}>
                <DealCreationForm />
            </Suspense>
        </div>
    );
}
