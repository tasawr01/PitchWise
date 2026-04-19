'use client';

import { useState } from 'react';
import { formatCurrency } from '@/lib/utils';
import { ChevronRight, TrendingUp, DollarSign, Clock, CheckCircle, XCircle } from 'lucide-react';
import Image from 'next/image';
import DealDetailModal from './DealDetailModal';

interface DocumentCardProps {
    deal: any;
    isReadOnly?: boolean;
}

const statusConfig: Record<string, { label: string; textColor: string; bg: string; border: string; icon: React.ReactNode }> = {
    pending: {
        label: 'Pending Review',
        textColor: 'text-yellow-700',
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        icon: <Clock className="w-3.5 h-3.5" />,
    },
    approved: {
        label: 'Approved',
        textColor: 'text-green-700',
        bg: 'bg-green-50',
        border: 'border-green-200',
        icon: <CheckCircle className="w-3.5 h-3.5" />,
    },
    rejected: {
        label: 'Rejected',
        textColor: 'text-red-700',
        bg: 'bg-red-50',
        border: 'border-red-200',
        icon: <XCircle className="w-3.5 h-3.5" />,
    },
};

export default function DocumentCard({ deal, isReadOnly = false }: DocumentCardProps) {
    const [modalOpen, setModalOpen] = useState(false);

    const status = statusConfig[deal.status] ?? statusConfig['pending'];

    return (
        <>
            {/* ── Card ─────────────────────────────────────── */}
            <button
                onClick={() => setModalOpen(true)}
                className="w-full text-left bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#0B2C4A]/20 transition-all duration-200 overflow-hidden group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0B2C4A]"
            >
                {/* Card Top Strip */}
                <div className={`h-1.5 w-full ${deal.status === 'approved' ? 'bg-green-500' : deal.status === 'rejected' ? 'bg-red-400' : 'bg-yellow-400'}`} />

                <div className="p-5">
                    {/* Header Row */}
                    <div className="flex items-center gap-4 mb-4">
                        {/* Logo */}
                        <div className="relative w-12 h-12 bg-gray-100 rounded-xl overflow-hidden shrink-0 border border-gray-200">
                            {deal.pitch?.logoUrl ? (
                                <Image src={deal.pitch.logoUrl} alt={deal.pitch.businessName} fill className="object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-[#0B2C4A] font-black text-xl">
                                    {deal.pitch?.businessName?.charAt(0)}
                                </div>
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <h3 className="font-extrabold text-gray-900 truncate text-base">{deal.pitch?.businessName}</h3>
                            <p className="text-sm text-gray-500 truncate">with {deal.entrepreneur?.fullName}</p>
                        </div>

                        {/* Status Badge */}
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${status.bg} ${status.border} ${status.textColor} shrink-0`}>
                            {status.icon}
                            {status.label}
                        </span>
                    </div>

                    {/* Key Figures */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-[#0B2C4A]/5 rounded-xl p-3">
                            <span className="flex items-center gap-1 text-xs font-bold text-[#0B2C4A]/60 uppercase tracking-wider mb-1">
                                <DollarSign className="w-3 h-3" /> Investment
                            </span>
                            <span className="font-extrabold text-[#0B2C4A] text-base">Rs. {formatCurrency(deal.amount)}</span>
                        </div>
                        <div className="bg-green-50 rounded-xl p-3">
                            <span className="flex items-center gap-1 text-xs font-bold text-green-700/70 uppercase tracking-wider mb-1">
                                <TrendingUp className="w-3 h-3" /> Equity
                            </span>
                            <span className="font-extrabold text-green-700 text-base">{deal.equity}%</span>
                        </div>
                    </div>

                    {/* Terms Preview */}
                    <p className="text-xs text-gray-400 line-clamp-2 mb-4 font-mono bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                        {deal.terms || 'No terms attached.'}
                    </p>

                    {/* Click Hint */}
                    <div className="flex items-center justify-end text-xs font-semibold text-[#0B2C4A]/60 group-hover:text-[#0B2C4A] transition-colors">
                        View full details
                        <ChevronRight className="w-4 h-4 ml-0.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                </div>
            </button>

            {/* ── Modal ────────────────────────────────────── */}
            {modalOpen && (
                <DealDetailModal
                    deal={deal}
                    isReadOnly={isReadOnly}
                    onClose={() => setModalOpen(false)}
                />
            )}
        </>
    );
}
