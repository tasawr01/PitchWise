"use client";

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createDealProposal } from '@/app/actions/entrepreneur';
import { submitInvestorRating } from '@/app/actions/rating';
import { Loader2 } from 'lucide-react';
import RatingPopup from '@/components/rating/RatingPopup';

function DealCreationForm() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const pitchId = searchParams.get('pitchId');
    const investorId = searchParams.get('investorId');
    const entrepreneurId = searchParams.get('entrepreneurId');
    const conversationId = searchParams.get('conversationId');

    const [amount, setAmount] = useState('');
    const [equity, setEquity] = useState('');
    const [terms, setTerms] = useState('Standard investment agreement terms apply.\n\n1. Valuation: ...\n2. Board Seats: ...\n3. Voting Rights: ...');
    const [isLoading, setIsLoading] = useState(false);
    const [createdDealId, setCreatedDealId] = useState<string | null>(null);
    const [showRating, setShowRating] = useState(false);

    if (!pitchId || !investorId || !entrepreneurId) {
        return <div className="p-8 text-red-500">Missing required parameters.</div>;
    }

    const finishAndRedirect = () => {
        router.push(`/entrepreneur_dashboard`);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const result = await createDealProposal({
                pitchId,
                entrepreneurId,
                investorId,
                amount: Number(amount),
                equity: Number(equity),
                terms
            });

            if (result.success && result.dealId) {
                setCreatedDealId(result.dealId);
                if (conversationId) {
                    setShowRating(true);
                } else {
                    alert('Deal successfully created. The investor can now complete the payment.');
                    finishAndRedirect();
                }
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
            <h1 className="text-2xl font-bold text-[#0B2C4A] mb-6">Create Deal Proposal</h1>
            <p className="text-gray-500 mb-8">
                Fill in the details below to prepare an accepted deal for the investor.
                Once created, the investor can move directly into the payment flow.
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

            {showRating && conversationId && (
                <RatingPopup
                    title="Rate the Investor"
                    subtitle="Your deal is set. Share how working with this investor went."
                    onSubmit={async ({ stars, feedback }) => {
                        return await submitInvestorRating({
                            conversationId,
                            dealId: createdDealId || undefined,
                            closureType: 'completed',
                            stars,
                            feedback,
                        });
                    }}
                    onClose={() => {
                        setShowRating(false);
                        finishAndRedirect();
                    }}
                />
            )}
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
