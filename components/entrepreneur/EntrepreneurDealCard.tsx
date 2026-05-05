'use client';

import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle2, XCircle, Clock, User, DollarSign, TrendingUp, ExternalLink } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface EntrepreneurDealCardProps {
    deal: any;
}

const statusBadge = (deal: any) => {
    if (deal.status === 'completed') {
        return { label: 'Completed', icon: <CheckCircle2 className="w-3.5 h-3.5" />, cls: 'bg-green-50 text-green-700 border-green-200' };
    }
    if (deal.status === 'rejected') {
        return { label: 'Discarded', icon: <XCircle className="w-3.5 h-3.5" />, cls: 'bg-amber-50 text-amber-700 border-amber-200' };
    }
    if (deal.paymentStatus === 'paid') {
        return { label: 'Active (Paid)', icon: <CheckCircle2 className="w-3.5 h-3.5" />, cls: 'bg-blue-50 text-blue-700 border-blue-200' };
    }
    return { label: 'In Progress', icon: <Clock className="w-3.5 h-3.5" />, cls: 'bg-yellow-50 text-yellow-700 border-yellow-200' };
};

export default function EntrepreneurDealCard({ deal }: EntrepreneurDealCardProps) {
    const investorName = deal.investor?.fullName || 'Investor';
    const investorOrg = deal.investor?.organizationName;
    const investorId = deal.investor?._id || deal.investor;
    const badge = statusBadge(deal);

    const investorProfileHref = investorId ? `/investors/${String(investorId)}` : null;

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
            <div className="p-5">
                <div className="flex items-center gap-4 mb-4">
                    <div className="relative w-12 h-12 bg-gray-100 rounded-xl overflow-hidden shrink-0 border border-gray-200">
                        {deal.pitch?.logoUrl ? (
                            <Image src={deal.pitch.logoUrl} alt={deal.pitch.businessName || ''} fill className="object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#0B2C4A] font-black text-xl">
                                {deal.pitch?.businessName?.charAt(0) || '?'}
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-extrabold text-gray-900 truncate text-base">{deal.pitch?.businessName || 'Untitled Pitch'}</h3>
                        <p className="text-sm text-gray-500 truncate flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {investorProfileHref ? (
                                <Link href={investorProfileHref} className="hover:text-[#0B2C4A] hover:underline">
                                    {investorName}
                                </Link>
                            ) : (
                                <span>{investorName}</span>
                            )}
                            {investorOrg && <span className="text-gray-400">· {investorOrg}</span>}
                        </p>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${badge.cls} shrink-0`}>
                        {badge.icon}
                        {badge.label}
                    </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-[#0B2C4A]/5 rounded-xl p-3">
                        <span className="flex items-center gap-1 text-xs font-bold text-[#0B2C4A]/60 uppercase tracking-wider mb-1">
                            <DollarSign className="w-3 h-3" /> Amount
                        </span>
                        <span className="font-extrabold text-[#0B2C4A] text-base">Rs. {formatCurrency(deal.finalAmount ?? deal.amount)}</span>
                    </div>
                    <div className="bg-green-50 rounded-xl p-3">
                        <span className="flex items-center gap-1 text-xs font-bold text-green-700/70 uppercase tracking-wider mb-1">
                            <TrendingUp className="w-3 h-3" /> Equity
                        </span>
                        <span className="font-extrabold text-green-700 text-base">{deal.finalEquity ?? deal.equity}%</span>
                    </div>
                </div>

                {investorId && (
                    <Link
                        href={`/investors/${String(investorId)}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#0B2C4A] hover:text-blue-700"
                    >
                        <ExternalLink className="w-3.5 h-3.5" /> View investor profile
                    </Link>
                )}
            </div>
        </div>
    );
}
