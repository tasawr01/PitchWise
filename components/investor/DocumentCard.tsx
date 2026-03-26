'use client';

import { useState } from 'react';
import { updateDealStatus } from '@/app/actions/investor';
import { formatCurrency } from '@/lib/utils';
import { FileText, Check, X, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface DocumentCardProps {
    deal: any;
    isReadOnly?: boolean;
}

export default function DocumentCard({ deal, isReadOnly = false }: DocumentCardProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [action, setAction] = useState<'approve' | 'reject' | null>(null);

    const handleAction = async (status: 'approved' | 'rejected') => {
        setIsLoading(true);
        setAction(status === 'approved' ? 'approve' : 'reject');

        try {
            await updateDealStatus(deal._id, status);
        } catch (error) {
            console.error('Failed to update deal status', error);
        } finally {
            setIsLoading(false);
            setAction(null);
        }
    };

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b border-gray-100 flex items-center gap-4">
                <div className="relative w-12 h-12 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                    {deal.pitch.logoUrl ? (
                        <Image src={deal.pitch.logoUrl} alt={deal.pitch.businessName} fill className="object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold">
                            {deal.pitch.businessName.charAt(0)}
                        </div>
                    )}
                </div>
                <div>
                    <h3 className="font-bold text-gray-900">{deal.pitch.businessName}</h3>
                    <p className="text-sm text-gray-500">Entrepreneur: {deal.entrepreneur.fullName}</p>
                </div>
                <div className="ml-auto">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide
                        ${deal.status === 'approved' ? 'bg-green-100 text-green-800' :
                            deal.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'}`}>
                        {deal.status}
                    </span>
                </div>
            </div>

            <div className="p-5 flex-1 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                        <span className="block text-xs text-gray-500 uppercase">Investment</span>
                        <span className="font-semibold text-gray-900">Rs. {formatCurrency(deal.amount)}</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                        <span className="block text-xs text-gray-500 uppercase">Equity</span>
                        <span className="font-semibold text-gray-900">{deal.equity}%</span>
                    </div>
                </div>

                <div>
                    <span className="block text-xs text-gray-500 uppercase mb-2">Terms & Conditions</span>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg line-clamp-3">
                        {deal.terms}
                    </p>
                </div>

                {deal.documentUrl && (
                    <a href={deal.documentUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium">
                        <FileText className="w-4 h-4" /> View Digital Agreement
                    </a>
                )}
            </div>

            {!isReadOnly && deal.status === 'pending' && (
                <div className="p-4 bg-gray-50 border-t border-gray-100 grid grid-cols-2 gap-3">
                    <button
                        onClick={() => handleAction('rejected')}
                        disabled={isLoading}
                        className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium text-sm disabled:opacity-50"
                    >
                        {isLoading && action === 'reject' ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                        Reject
                    </button>
                    <button
                        onClick={() => handleAction('approved')}
                        disabled={isLoading}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-[#0B2C4A] text-white rounded-lg hover:bg-opacity-90 font-medium text-sm disabled:opacity-50"
                    >
                        {isLoading && action === 'approve' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        Approve Deal
                    </button>
                </div>
            )}
        </div>
    );
}
