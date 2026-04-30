'use client';

import { useState } from 'react';
import { updateDealStatus } from '@/app/actions/investor';
import { formatCurrency } from '@/lib/utils';
import { useRouter } from 'next/navigation';
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
    CreditCard,
} from 'lucide-react';
import Image from 'next/image';
import { getDealStage } from '@/lib/deal-status';

interface DealDetailModalProps {
    deal: any;
    isReadOnly?: boolean;
    onClose: () => void;
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    awaiting_payment: { label: 'Awaiting Payment', color: 'text-yellow-700', bg: 'bg-yellow-100 border-yellow-200' },
    processing_payment: { label: 'Processing', color: 'text-blue-700', bg: 'bg-blue-100 border-blue-200' },
    payment_failed: { label: 'Payment Failed', color: 'text-amber-700', bg: 'bg-amber-100 border-amber-200' },
    paid: { label: 'Paid', color: 'text-green-700', bg: 'bg-green-100 border-green-200' },
    rejected: { label: 'Rejected', color: 'text-red-700', bg: 'bg-red-100 border-red-200' },
};

export default function DealDetailModal({ deal, isReadOnly = false, onClose }: DealDetailModalProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const stage = done ? 'rejected' : getDealStage(deal);
    const { label, color, bg } = statusConfig[stage] ?? statusConfig.awaiting_payment;
    const canReject = !done && (stage === 'awaiting_payment' || stage === 'payment_failed');
    const paymentRecordId = typeof deal.paymentRecord === 'object' ? deal.paymentRecord?._id : deal.paymentRecord;

    const handleReject = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await updateDealStatus(deal._id, 'rejected');
            if (!result.success) {
                setError(result.error || 'Failed to update deal status.');
                return;
            }

            setDone(true);
            router.refresh();
        } catch (submitError) {
            console.error('Failed to reject deal', submitError);
            setError('Failed to update deal status.');
        } finally {
            setIsLoading(false);
        }
    };

    const goToPayment = () => {
        router.push(`/investor_dashboard/deals/${deal._id}/pay`);
        onClose();
    };

    const isPaymentReady = stage === 'awaiting_payment' || stage === 'payment_failed' || stage === 'processing_payment';

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
            onClick={onClose}
        >
            <div
                className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
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
                                {stage === 'paid' && <CheckCircle className="w-3 h-3" />}
                                {stage === 'rejected' && <XCircle className="w-3 h-3" />}
                                {stage !== 'paid' && stage !== 'rejected' && <CreditCard className="w-3 h-3" />}
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

                <div className="px-8 py-6 space-y-6">
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

                    {isPaymentReady && (
                        <div className="flex items-start gap-3 p-4 bg-yellow-50 text-yellow-800 rounded-xl border border-yellow-200">
                            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                            <p className="text-sm">
                                This deal has already been accepted and is waiting for payment. Visit the payment page to complete the transaction.
                            </p>
                        </div>
                    )}

                    {stage === 'paid' && paymentRecordId && (
                        <div className="rounded-2xl border border-green-200 bg-green-50 p-5">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-green-700">Payment Receipt</p>
                                    <p className="text-sm text-green-900 mt-1">
                                        Receipt {deal.paymentRecord?.receiptNumber || 'available'} for payment ending in {deal.paymentRecord?.cardLast4 || '4242'}.
                                    </p>
                                </div>
                                <a
                                    href={`/api/payments/${paymentRecordId}/receipt`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[#0B2C4A] shadow-sm border border-green-200 hover:bg-green-100 transition-colors"
                                >
                                    <FileText className="w-4 h-4" /> Open Receipt
                                </a>
                            </div>
                        </div>
                    )}

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

                    {done && (
                        <div className="flex items-center gap-3 p-4 rounded-xl border bg-red-50 border-red-200 text-red-800">
                            <XCircle className="w-5 h-5 shrink-0" />
                            <p className="text-sm font-semibold">Deal rejected successfully.</p>
                        </div>
                    )}

                    {error && (
                        <div className="flex items-center gap-3 p-4 rounded-xl border bg-red-50 border-red-200 text-red-800">
                            <XCircle className="w-5 h-5 shrink-0" />
                            <p className="text-sm font-semibold">{error}</p>
                        </div>
                    )}
                </div>

                {!isReadOnly && !done && (
                    <div className="sticky bottom-0 bg-white border-t border-gray-100 px-8 py-5 flex gap-3 rounded-b-3xl">
                        {canReject && (
                            <button
                                onClick={handleReject}
                                disabled={isLoading}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-bold text-sm disabled:opacity-50 transition-colors"
                            >
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                                Decline Deal
                            </button>
                        )}
                        {isPaymentReady && (
                            <button
                                onClick={goToPayment}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#0B2C4A] text-white rounded-xl hover:bg-[#09223a] font-bold text-sm transition-all shadow-lg hover:shadow-xl"
                            >
                                <CreditCard className="w-4 h-4" />
                                {stage === 'payment_failed' ? 'Retry Payment' : 'Continue to Payment'}
                            </button>
                        )}
                        {(stage === 'paid' || stage === 'rejected') && (
                            <button
                                onClick={onClose}
                                className="w-full py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 transition-colors"
                            >
                                Close
                            </button>
                        )}
                    </div>
                )}

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
