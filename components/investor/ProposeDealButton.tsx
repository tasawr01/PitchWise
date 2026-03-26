'use client';

import { useState } from 'react';
import { createDealProposal } from '@/app/actions/investor';
import { Handshake, Loader2, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ProposeDealButtonProps {
    pitchId: string;
    investorId: string;
    entrepreneurId: string;
    defaultAmount: number;
    defaultEquity: number;
}

export default function ProposeDealButton({ pitchId, investorId, entrepreneurId, defaultAmount, defaultEquity }: ProposeDealButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [amount, setAmount] = useState(defaultAmount);
    const [equity, setEquity] = useState(defaultEquity);
    const [terms, setTerms] = useState('Standard investment agreement terms apply.');
    const router = useRouter();

    const handlePropose = async () => {
        setIsLoading(true);
        try {
            const result = await createDealProposal({
                pitchId,
                investorId,
                entrepreneurId,
                amount,
                equity,
                terms
            });

            if (result.success) {
                alert('Deal proposal sent successfully!');
                setIsOpen(false);
                router.push('/investor_dashboard/deals');
            } else {
                alert('Failed: ' + result.error);
            }
        } catch (error) {
            console.error(error);
            alert('Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-[#0B2C4A] text-white rounded-lg font-semibold hover:bg-[#1e293b] shadow-lg transition-all"
            >
                <Handshake className="w-5 h-5" />
                Invest Now
            </button>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                <h3 className="text-xl font-bold text-[#0B2C4A] mb-4">Propose Investment</h3>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Investment Amount (Rs)</label>
                        <input
                            type="number"
                            className="w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            value={amount}
                            onChange={(e) => setAmount(Number(e.target.value))}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Equity (%)</label>
                        <input
                            type="number"
                            className="w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            value={equity}
                            onChange={(e) => setEquity(Number(e.target.value))}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Proposed Terms</label>
                        <textarea
                            className="w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 h-24"
                            value={terms}
                            onChange={(e) => setTerms(e.target.value)}
                        />
                    </div>
                </div>

                <div className="mt-6 flex gap-3">
                    <button
                        onClick={() => setIsOpen(false)}
                        className="flex-1 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handlePropose}
                        disabled={isLoading}
                        className="flex-1 py-2 bg-[#0B2C4A] text-white rounded-lg font-medium hover:bg-opacity-90 flex items-center justify-center gap-2"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Proposal'}
                    </button>
                </div>
            </div>
        </div>
    );
}
