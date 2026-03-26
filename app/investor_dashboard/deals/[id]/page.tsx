import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Deal from '@/models/Deal';
import { formatCurrency } from '@/lib/utils';
import { CheckCircle, AlertCircle, Printer, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// We need a server action or client button to "Verify"
// I'll add a client component for the button if needed, or use a form action.

async function verifyDeal(formData: FormData) {
    "use server";
    const dealId = formData.get('dealId') as string;
    await dbConnect();
    await Deal.findByIdAndUpdate(dealId, { status: 'approved' }); // or 'signed_by_investor'
    redirect('/investor_dashboard/deals');
}

export default async function DealVerificationPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) redirect('/auth/login');
    const user = await verifyToken(token);
    if (!user || user.role !== 'investor') redirect('/auth/login');

    await dbConnect();
    const deal = await Deal.findById(id)
        .populate('pitch', 'businessName')
        .populate('entrepreneur', 'fullName email')
        .populate('investor', 'fullName email organizationName')
        .lean() as any;

    if (!deal) return <div className="p-8">Deal not found</div>;

    // Type casting for populated fields
    const pitchName = (deal.pitch as any).businessName;
    const entrepreneurName = (deal.entrepreneur as any).fullName;
    const investorName = (deal.investor as any).fullName;
    const investorOrg = (deal.investor as any).organizationName;

    return (
        <div className="max-w-4xl mx-auto p-8">
            <Link href="/investor_dashboard/deals" className="flex items-center text-gray-500 hover:text-gray-900 mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Deals
            </Link>

            <div className="bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden">
                {/* Document Header */}
                <div className="bg-gray-50 border-b border-gray-200 p-8 flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">Deal Memorandum</h1>
                        <p className="text-gray-500 text-sm uppercase tracking-wider">Ref: {deal._id.toString().slice(-8).toUpperCase()}</p>
                    </div>
                    <div className="text-right">
                        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mb-2">
                            {deal.status === 'pending' ? 'Pending Signature' : deal.status}
                        </div>
                        <p className="text-gray-500 text-sm">{new Date(deal.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>

                {/* Document Body */}
                <div className="p-12 space-y-8 text-gray-800 leading-relaxed font-serif">
                    <div className="text-center pb-8 border-b border-gray-100">
                        <p className="italic text-gray-500 mb-4">This agreement is made between</p>
                        <div className="flex justify-center items-center gap-12">
                            <div>
                                <h3 className="font-bold text-lg">{investorName}</h3>
                                <p className="text-sm text-gray-500">{investorOrg || 'Investor'}</p>
                            </div>
                            <span className="text-gray-400 font-style-italic">&</span>
                            <div>
                                <h3 className="font-bold text-lg">{entrepreneurName}</h3>
                                <p className="text-sm text-gray-500">Founder, {pitchName}</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold mb-4 uppercase text-gray-400 text-xs tracking-widest">Investment Details</h3>
                        <div className="flex gap-12">
                            <div>
                                <span className="block text-sm text-gray-500">Amount</span>
                                <span className="text-2xl font-bold">{formatCurrency(deal.amount)}</span>
                            </div>
                            <div>
                                <span className="block text-sm text-gray-500">Equity Stake</span>
                                <span className="text-2xl font-bold">{deal.equity}%</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold mb-4 uppercase text-gray-400 text-xs tracking-widest">Terms & Conditions</h3>
                        <div className="bg-gray-50 p-6 rounded-lg whitespace-pre-wrap font-mono text-sm text-gray-700 border border-gray-100">
                            {deal.terms}
                        </div>
                    </div>

                    <div className="pt-8 border-t border-gray-100 mt-12">
                        <div className="flex items-start gap-3 p-4 bg-yellow-50 text-yellow-800 rounded-lg border border-yellow-200">
                            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                            <p className="text-sm">
                                By verifying this document, you confirm that the details above are accurate and agreed upon.
                                This document will be stored in the admin records.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="bg-gray-50 border-t border-gray-200 p-6 flex justify-between items-center">
                    <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                        <Printer className="w-5 h-5" /> Print
                    </button>

                    {deal.status === 'pending' && (
                        <form action={verifyDeal}>
                            <input type="hidden" name="dealId" value={deal._id.toString()} />
                            <button
                                type="submit"
                                className="flex items-center gap-2 px-8 py-3 bg-[#0B2C4A] text-white rounded-lg font-bold hover:bg-[#154670] shadow-lg transition-transform hover:scale-105"
                            >
                                <CheckCircle className="w-5 h-5" /> Verify & Sign Deal
                            </button>
                        </form>
                    )}
                    {deal.status === 'approved' && (
                        <div className="flex items-center gap-2 text-green-600 font-bold px-8 py-3">
                            <CheckCircle className="w-5 h-5" /> Verified
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
