'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, CheckCircle2, CreditCard, Loader2, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface DealPaymentFormProps {
    deal: {
        _id: string;
        amount: number;
        equity: number;
        pitchName: string;
        entrepreneurName: string;
        investorName: string;
    };
}

interface IntentResponse {
    clientSecret: string;
}

export default function DealPaymentForm({ deal }: DealPaymentFormProps) {
    const router = useRouter();
    const [cardholderName, setCardholderName] = useState(deal.investorName);
    const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
    const [expiry, setExpiry] = useState('12/34');
    const [cvc, setCvc] = useState('123');
    const [intent, setIntent] = useState<IntentResponse | null>(null);
    const [loadingIntent, setLoadingIntent] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<{ receiptNumber: string; paymentId: string; redirectTo: string; sideEffects?: string[] } | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function createIntent() {
            try {
                setLoadingIntent(true);
                setError(null);

                const res = await fetch('/api/payment/create-intent', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ dealId: deal._id }),
                });

                const data = await res.json();
                if (!res.ok || !data.success) {
                    throw new Error(data.error || 'Failed to start payment session.');
                }

                if (data.alreadyPaid) {
                    router.replace(data.redirectTo || `/investor_dashboard/deals/${deal._id}`);
                    return;
                }

                if (!cancelled) {
                    setIntent({
                        clientSecret: data.clientSecret,
                    });
                }
            } catch (intentError: any) {
                if (!cancelled) {
                    setError(intentError.message || 'Failed to start payment session.');
                }
            } finally {
                if (!cancelled) {
                    setLoadingIntent(false);
                }
            }
        }

        createIntent();

        return () => {
            cancelled = true;
        };
    }, [deal._id, router]);

    useEffect(() => {
        if (!success) return;

        const timeout = window.setTimeout(() => {
            router.replace(success.redirectTo);
            router.refresh();
        }, 1800);

        return () => window.clearTimeout(timeout);
    }, [router, success]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!intent) return;

        try {
            setSubmitting(true);
            setError(null);

            const res = await fetch('/api/payment/confirm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    dealId: deal._id,
                    paymentIntentId: intent.clientSecret,
                    cardholderName,
                    cardNumber,
                    expiry,
                    cvc,
                }),
            });

            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.error || 'Payment failed.');
            }

            setSuccess({
                receiptNumber: data.receiptNumber,
                paymentId: data.paymentId,
                redirectTo: data.redirectTo || `/investor_dashboard/deals/${deal._id}`,
                sideEffects: data.sideEffects || [],
            });
        } catch (submitError: any) {
            setError(submitError.message || 'Payment failed.');
        } finally {
            setSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-3xl bg-[#0B2C4A] p-8 text-white shadow-xl">
                    <div className="flex items-center gap-3 text-green-300">
                        <CheckCircle2 className="h-7 w-7" />
                        <span className="text-sm font-bold uppercase tracking-[0.22em]">Payment Complete</span>
                    </div>
                    <h1 className="mt-6 text-4xl font-black tracking-tight">Payment successful</h1>
                    <p className="mt-4 max-w-lg text-white/80">
                        Your transaction has been recorded against this deal and the app is redirecting you back to the deal detail page.
                    </p>

                    <div className="mt-8 grid gap-4 sm:grid-cols-2">
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/50">Receipt Number</p>
                            <p className="mt-2 text-lg font-bold">{success.receiptNumber}</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/50">Amount Captured</p>
                            <p className="mt-2 text-lg font-bold">Rs. {formatCurrency(deal.amount)}</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
                    <h2 className="text-xl font-extrabold text-[#0B2C4A]">Side effects completed</h2>
                    <div className="mt-6 space-y-3">
                        {(success.sideEffects || []).map((item) => (
                            <div key={item} className="flex items-center gap-3 rounded-2xl bg-green-50 px-4 py-3 text-sm font-medium text-green-800">
                                <ShieldCheck className="h-4 w-4" />
                                {item}
                            </div>
                        ))}
                    </div>
                    <a
                        href={`/api/payments/${success.paymentId}/receipt`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-[#0B2C4A]/10 bg-[#0B2C4A] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#09223a]"
                    >
                        <CreditCard className="h-4 w-4" />
                        Open receipt PDF
                    </a>
                    <p className="mt-4 text-sm text-gray-500">Redirecting to deal details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-3xl bg-[#0B2C4A] p-8 text-white shadow-xl">
                <p className="text-sm font-bold uppercase tracking-[0.22em] text-cyan-300">Secure Checkout</p>
                <h1 className="mt-4 text-4xl font-black tracking-tight">{deal.pitchName}</h1>
                <p className="mt-3 max-w-lg text-white/75">
                    Complete this payment to mark the deal as funded and unlock the receipt flow across investor, entrepreneur, and admin screens.
                </p>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/50">Amount</p>
                        <p className="mt-2 text-3xl font-black">Rs. {formatCurrency(deal.amount)}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/50">Equity</p>
                        <p className="mt-2 text-3xl font-black">{deal.equity}%</p>
                    </div>
                </div>

            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h2 className="text-2xl font-extrabold text-[#0B2C4A]">Payment details</h2>
                        <p className="mt-1 text-sm text-gray-500">Funding for {deal.entrepreneurName}</p>
                    </div>
                    <div className="rounded-2xl bg-gray-50 px-4 py-3 text-right">
                        <p className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400">Deal Ref</p>
                        <p className="text-sm font-bold text-[#0B2C4A]">{deal._id.slice(-8).toUpperCase()}</p>
                    </div>
                </div>

                {loadingIntent ? (
                    <div className="flex min-h-[320px] items-center justify-center">
                        <div className="flex items-center gap-3 text-sm font-medium text-gray-500">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Preparing secure checkout...
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-700">Cardholder name</label>
                            <input
                                value={cardholderName}
                                onChange={(e) => setCardholderName(e.target.value)}
                                className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-[#0B2C4A]"
                                placeholder="Investor name"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-700">Card number</label>
                            <input
                                value={cardNumber}
                                onChange={(e) => setCardNumber(e.target.value)}
                                className="w-full rounded-2xl border border-gray-200 px-4 py-3 font-mono outline-none transition focus:border-[#0B2C4A]"
                                placeholder="4242 4242 4242 4242"
                            />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700">Expiry</label>
                                <input
                                    value={expiry}
                                    onChange={(e) => setExpiry(e.target.value)}
                                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 font-mono outline-none transition focus:border-[#0B2C4A]"
                                    placeholder="MM/YY"
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700">CVC</label>
                                <input
                                    value={cvc}
                                    onChange={(e) => setCvc(e.target.value)}
                                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 font-mono outline-none transition focus:border-[#0B2C4A]"
                                    placeholder="123"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={submitting || !intent}
                            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0B2C4A] px-5 py-4 text-sm font-bold text-white transition hover:bg-[#09223a] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                            Pay Rs. {formatCurrency(deal.amount)}
                        </button>

                        <p className="text-center text-xs text-gray-400">
                            Your card details are encrypted and processed securely.
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
}
