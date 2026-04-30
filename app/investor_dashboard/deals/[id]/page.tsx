import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Deal from '@/models/Deal';
import { formatCurrency } from '@/lib/utils';
import { ArrowLeft, Calendar, CheckCircle2, CreditCard, FileText, Hash, Shield, XCircle } from 'lucide-react';
import Link from 'next/link';
import { getDealStage, getDealStageLabel } from '@/lib/deal-status';

export const dynamic = 'force-dynamic';

const badgeStyles: Record<string, string> = {
    awaiting_payment: 'bg-yellow-100 text-yellow-800',
    processing_payment: 'bg-blue-100 text-blue-800',
    payment_failed: 'bg-amber-100 text-amber-800',
    paid: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
};

export default async function DealDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) redirect('/login');
    const user = await verifyToken(token);
    if (!user || user.role !== 'investor') redirect('/login');

    await dbConnect();
    const deal = await Deal.findById(id)
        .populate('pitch', 'businessName')
        .populate('entrepreneur', 'fullName email')
        .populate('investor', 'fullName email organizationName')
        .populate('paymentRecord', 'receiptNumber cardLast4 processedAt _id')
        .lean() as any;

    if (!deal || deal.investor?._id?.toString() !== user.id) {
        return <div className="p-8">Deal not found.</div>;
    }

    const stage = getDealStage(deal);
    const badgeStyle = badgeStyles[stage] || badgeStyles.awaiting_payment;
    const paymentRecordId = typeof deal.paymentRecord === 'object' ? deal.paymentRecord?._id?.toString() : deal.paymentRecord?.toString();

    return (
        <div className="mx-auto max-w-5xl space-y-6">
            <Link href="/investor_dashboard/deals" className="inline-flex items-center text-sm font-semibold text-gray-500 transition-colors hover:text-[#0B2C4A]">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to deals
            </Link>

            <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-lg">
                <div className="border-b border-gray-100 bg-[#0B2C4A] px-8 py-8 text-white">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                            <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-300">Deal Overview</p>
                            <h1 className="mt-3 text-4xl font-black tracking-tight">{deal.pitch?.businessName}</h1>
                            <p className="mt-2 max-w-2xl text-white/75">
                                Review the accepted deal, payment progress, and generated receipt.
                            </p>
                        </div>
                        <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${badgeStyle}`}>
                            {stage === 'paid' ? <CheckCircle2 className="h-4 w-4" /> : stage === 'rejected' ? <XCircle className="h-4 w-4" /> : <CreditCard className="h-4 w-4" />}
                            {getDealStageLabel(deal)}
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 px-8 py-8 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="space-y-6">
                        <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
                            <span className="flex items-center gap-1.5">
                                <Hash className="h-4 w-4" />
                                Ref: <span className="font-mono font-semibold">{deal._id?.toString().slice(-8).toUpperCase()}</span>
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Calendar className="h-4 w-4" />
                                {new Date(deal.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="rounded-2xl bg-[#0B2C4A] p-5 text-white">
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-200">Investment Amount</p>
                                <p className="mt-2 text-3xl font-black">Rs. {formatCurrency(deal.amount)}</p>
                            </div>
                            <div className="rounded-2xl bg-green-600 p-5 text-white">
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-200">Equity Stake</p>
                                <p className="mt-2 text-3xl font-black">{deal.equity}%</p>
                            </div>
                        </div>

                        <div className="rounded-3xl border border-gray-200 bg-gray-50 p-6">
                            <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-[#0B2C4A]">
                                <Shield className="h-4 w-4" /> Terms &amp; Conditions
                            </h2>
                            <p className="mt-4 whitespace-pre-wrap font-mono text-sm leading-relaxed text-gray-700">
                                {deal.terms || 'No terms provided.'}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="rounded-3xl border border-gray-200 p-6">
                            <h2 className="text-lg font-extrabold text-[#0B2C4A]">Parties</h2>
                            <div className="mt-5 space-y-4 text-sm">
                                <div>
                                    <p className="font-bold uppercase tracking-[0.16em] text-gray-400">Investor</p>
                                    <p className="mt-1 font-semibold text-gray-900">{deal.investor?.fullName}</p>
                                    <p className="text-gray-500">{deal.investor?.email}</p>
                                </div>
                                <div>
                                    <p className="font-bold uppercase tracking-[0.16em] text-gray-400">Entrepreneur</p>
                                    <p className="mt-1 font-semibold text-gray-900">{deal.entrepreneur?.fullName}</p>
                                    <p className="text-gray-500">{deal.entrepreneur?.email}</p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-3xl border border-gray-200 p-6">
                            <h2 className="text-lg font-extrabold text-[#0B2C4A]">Payment</h2>

                            {stage === 'paid' ? (
                                <div className="mt-5 space-y-4">
                                    <div className="rounded-2xl bg-green-50 p-4 text-sm text-green-900">
                                        <p className="font-semibold">
                                            {deal.paymentRecord?.receiptNumber ? `Receipt ${deal.paymentRecord.receiptNumber}` : 'Payment completed'}
                                        </p>
                                        <p className="mt-1">Paid on {new Date(deal.paidAt || deal.paymentRecord?.processedAt || deal.updatedAt).toLocaleString()}</p>
                                        <p className="mt-1">
                                            {deal.paymentRecord?.cardLast4
                                                ? `Visa ending in ${deal.paymentRecord.cardLast4}`
                                                : 'This paid deal was created before receipt tracking was added.'}
                                        </p>
                                    </div>
                                    {paymentRecordId && (
                                        <a
                                            href={`/api/payments/${paymentRecordId}/receipt`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 rounded-2xl bg-[#0B2C4A] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#09223a]"
                                        >
                                            <FileText className="h-4 w-4" />
                                            Open Receipt PDF
                                        </a>
                                    )}
                                </div>
                            ) : stage === 'rejected' ? (
                                <div className="mt-5 rounded-2xl bg-red-50 p-4 text-sm text-red-800">
                                    {deal.rejectionReason || 'This deal was declined before payment.'}
                                </div>
                            ) : (
                                <div className="mt-5 space-y-4">
                                    <div className="rounded-2xl bg-yellow-50 p-4 text-sm text-yellow-800">
                                        The deal has been accepted and is waiting for payment.
                                    </div>
                                    <Link
                                        href={`/investor_dashboard/deals/${deal._id}/pay`}
                                        className="inline-flex items-center gap-2 rounded-2xl bg-[#0B2C4A] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#09223a]"
                                    >
                                        <CreditCard className="h-4 w-4" />
                                        {stage === 'payment_failed' ? 'Retry Payment' : 'Go to Payment Page'}
                                    </Link>
                                </div>
                            )}

                            {deal.documentUrl && (
                                <a
                                    href={deal.documentUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800"
                                >
                                    <FileText className="h-4 w-4" />
                                    View digital agreement
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
