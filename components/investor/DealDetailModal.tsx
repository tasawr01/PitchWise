'use client';

import { useState } from 'react';
import { updateDealStatus } from '@/app/actions/investor';
import { formatCurrency } from '@/lib/utils';
import {
    X,
    CheckCircle,
    XCircle,
    Loader2,
    FileText,
    AlertCircle,
    Building2,
    User,
    TrendingUp,
    DollarSign,
    Calendar,
    Hash,
    Shield,
} from 'lucide-react';
import Image from 'next/image';

interface DealDetailModalProps {
    deal: any;
    isReadOnly?: boolean;
    onClose: () => void;
}

export default function DealDetailModal({ deal, isReadOnly = false, onClose }: DealDetailModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [action, setAction] = useState<'approve' | 'reject' | null>(null);
    const [done, setDone] = useState(false);

    const handleAction = async (status: 'approved' | 'rejected') => {
        setIsLoading(true);
        setAction(status === 'approved' ? 'approve' : 'reject');
        try {
            await updateDealStatus(deal._id, status);
            setDone(true);
        } catch (error) {
            console.error('Failed to update deal status', error);
        } finally {
            setIsLoading(false);
        }
    };

    const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
        pending:  { label: 'Pending Review',  color: 'text-yellow-700', bg: 'bg-yellow-100 border-yellow-200' },
        approved: { label: 'Approved',        color: 'text-green-700',  bg: 'bg-green-100 border-green-200'  },
        rejected: { label: 'Rejected',        color: 'text-red-700',    bg: 'bg-red-100 border-red-200'      },
    };

    const currentStatus = done
        ? (action === 'approve' ? 'approved' : 'rejected')
        : deal.status;

    const { label, color, bg } = statusConfig[currentStatus] ?? statusConfig['pending'];

    return (
        /* Backdrop */
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
            onClick={onClose}
        >
            {/* Modal Panel */}
            <div
                className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                {/* ── Header ─────────────────────────────── */}
                <div className="sticky top-0 z-10 bg-white rounded-t-3xl px-8 pt-8 pb-5 border-b border-gray-100 flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div className="relative w-14 h-14 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                            {deal.pitch?.logoUrl ? (
                                <Image src={deal.pitch.logoUrl} alt={deal.pitch.businessName} fill className="object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-[#0B2C4A] font-black text-2xl">
                                    {deal.pitch?.businessName?.charAt(0)}
                                </div>
                            )}
                        </div>
                        <div>
                            <h2 className="text-2xl font-extrabold text-[#0B2C4A]">{deal.pitch?.businessName}</h2>
                            <span className={`inline-flex items-center gap-1.5 mt-1 px-3 py-0.5 rounded-full text-xs font-bold border ${bg} ${color}`}>
                                {currentStatus === 'approved' && <CheckCircle className="w-3 h-3" />}
                                {currentStatus === 'rejected' && <XCircle className="w-3 h-3" />}
                                {label}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-900"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* ── Body ───────────────────────────────── */}
                <div className="px-8 py-6 space-y-6">

                    {/* Ref / Date */}
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                        <span className="flex items-center gap-1.5">
                            <Hash className="w-4 h-4" />
                            Ref: <span className="font-mono font-semibold">{deal._id?.toString().slice(-8).toUpperCase()}</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            {new Date(deal.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                    </div>

                    {/* Parties */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
                            <p className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <Building2 className="w-3.5 h-3.5" /> Investor
                            </p>
                            <p className="font-bold text-gray-900">{deal.investor?.fullName}</p>
                            {deal.investor?.organizationName && (
                                <p className="text-sm text-gray-500">{deal.investor.organizationName}</p>
                            )}
                            <p className="text-sm text-gray-400 mt-0.5">{deal.investor?.email}</p>
                        </div>
                        <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100">
                            <p className="text-xs font-bold text-purple-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5" /> Entrepreneur
                            </p>
                            <p className="font-bold text-gray-900">{deal.entrepreneur?.fullName}</p>
                            <p className="text-sm text-gray-500">Founder, {deal.pitch?.businessName}</p>
                            <p className="text-sm text-gray-400 mt-0.5">{deal.entrepreneur?.email}</p>
                        </div>
                    </div>

                    {/* Key Figures */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#0B2C4A] rounded-2xl p-5 text-white">
                            <p className="text-xs font-bold text-blue-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                <DollarSign className="w-3.5 h-3.5" /> Investment Amount
                            </p>
                            <p className="text-3xl font-extrabold">Rs. {formatCurrency(deal.amount)}</p>
                        </div>
                        <div className="bg-green-600 rounded-2xl p-5 text-white">
                            <p className="text-xs font-bold text-green-200 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                <TrendingUp className="w-3.5 h-3.5" /> Equity Stake
                            </p>
                            <p className="text-3xl font-extrabold">{deal.equity}%</p>
                        </div>
                    </div>

                    {/* Terms & Conditions */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <Shield className="w-4 h-4 text-[#0B2C4A]" /> Terms &amp; Conditions
                        </h3>
                        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 max-h-52 overflow-y-auto">
                            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed font-mono">
                                {deal.terms || 'No terms provided.'}
                            </p>
                        </div>
                    </div>

                    {/* Document link */}
                    {deal.documentUrl && (
                        <a
                            href={deal.documentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-semibold transition-colors"
                        >
                            <FileText className="w-4 h-4" /> View Digital Agreement
                        </a>
                    )}

                    {/* Disclaimer */}
                    {!isReadOnly && !done && currentStatus === 'pending' && (
                        <div className="flex items-start gap-3 p-4 bg-yellow-50 text-yellow-800 rounded-xl border border-yellow-200">
                            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                            <p className="text-sm">
                                By approving this deal, you confirm that all details above are accurate and agreed upon.
                                This action will be recorded in admin records.
                            </p>
                        </div>
                    )}

                    {/* Done Banner */}
                    {done && (
                        <div className={`flex items-center gap-3 p-4 rounded-xl border ${action === 'approve' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                            {action === 'approve'
                                ? <CheckCircle className="w-5 h-5 shrink-0" />
                                : <XCircle className="w-5 h-5 shrink-0" />}
                            <p className="text-sm font-semibold">
                                Deal has been {action === 'approve' ? 'approved' : 'rejected'} successfully.
                            </p>
                        </div>
                    )}
                </div>

                {/* ── Footer Actions ──────────────────────── */}
                {!isReadOnly && !done && currentStatus === 'pending' && (
                    <div className="sticky bottom-0 bg-white border-t border-gray-100 px-8 py-5 flex gap-3 rounded-b-3xl">
                        <button
                            onClick={() => handleAction('rejected')}
                            disabled={isLoading}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-bold text-sm disabled:opacity-50 transition-colors"
                        >
                            {isLoading && action === 'reject'
                                ? <Loader2 className="w-4 h-4 animate-spin" />
                                : <XCircle className="w-4 h-4" />}
                            Reject Deal
                        </button>
                        <button
                            onClick={() => handleAction('approved')}
                            disabled={isLoading}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#0B2C4A] text-white rounded-xl hover:bg-[#09223a] font-bold text-sm disabled:opacity-50 transition-all shadow-lg hover:shadow-xl"
                        >
                            {isLoading && action === 'approve'
                                ? <Loader2 className="w-4 h-4 animate-spin" />
                                : <CheckCircle className="w-4 h-4" />}
                            Approve &amp; Sign Deal
                        </button>
                    </div>
                )}

                {/* Read-only close footer */}
                {(isReadOnly || done) && (
                    <div className="sticky bottom-0 bg-white border-t border-gray-100 px-8 py-5 rounded-b-3xl">
                        <button
                            onClick={onClose}
                            className="w-full py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
