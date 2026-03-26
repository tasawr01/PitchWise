import { getPitchById, checkWatchlistStatus } from '@/app/actions/investor';
// getSession import removed
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';
import WatchlistButton from '@/components/investor/WatchlistButton';
import TalkNowButton from '@/components/investor/TalkNowButton';
import ProposeDealButton from '@/components/investor/ProposeDealButton';
import { FileText, Download, ExternalLink, PlayCircle, Users, BarChart3, ShieldCheck, Globe, Calendar } from 'lucide-react';
import dbConnect from '@/lib/db';
import Investor from '@/models/Investor';

// Helper to get user securely
async function getUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return null;
    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        if (payload.role !== 'investor') return null;
        return payload;
    } catch {
        return null;
    }
}

export default async function PitchDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const user = await getUser();

    if (!user) redirect('/login');

    const pitch = await getPitchById(id);

    // If pitch wasn't found or status is not approved, 404
    if (!pitch || pitch.status !== 'approved') {
        notFound();
    }

    const isWatched = await checkWatchlistStatus(user.id as string, id);

    return (
        <div className="max-w-7xl mx-auto pb-12">
            {/* Header / Hero Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                <div className="relative h-64 bg-slate-900">
                    {/* Cover Image Placeholder or Blur */}
                    {pitch.logoUrl && (
                        <div className="absolute inset-0 opacity-20">
                            <Image src={pitch.logoUrl} alt="Cover" fill className="object-cover blur-sm" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

                    <div className="absolute bottom-6 left-6 md:left-10 flex items-end gap-6 text-white">
                        <div className="relative w-24 h-24 rounded-xl bg-white p-2 shadow-lg shrink-0">
                            {pitch.logoUrl ? (
                                <Image src={pitch.logoUrl} alt={pitch.businessName} fill className="object-contain p-2" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <Globe className="w-10 h-10" />
                                </div>
                            )}
                        </div>
                        <div className="mb-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-bold">{pitch.businessName}</h1>
                                <span className="bg-blue-500/20 text-blue-200 border border-blue-500/30 px-3 py-0.5 rounded-full text-sm font-medium backdrop-blur-md">
                                    {pitch.industry}
                                </span>
                            </div>
                            <p className="text-lg text-gray-200 max-w-2xl text-shadow">{pitch.title}</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 bg-white">
                    <div className="flex gap-8 text-center md:text-left">
                        <div>
                            <span className="block text-sm text-gray-500 uppercase tracking-wide">Ask Amount</span>
                            <span className="block text-2xl font-bold text-[#0B2C4A]">Rs. {formatCurrency(pitch.amountRequired)}</span>
                        </div>
                        <div className="w-px bg-gray-200 h-12 hidden md:block" />
                        <div>
                            <span className="block text-sm text-gray-500 uppercase tracking-wide">Equity Offered</span>
                            <span className="block text-2xl font-bold text-[#0B2C4A]">{pitch.equityOffered}%</span>
                        </div>
                        <div className="w-px bg-gray-200 h-12 hidden md:block" />
                        <div>
                            <span className="block text-sm text-gray-500 uppercase tracking-wide">Valuation</span>
                            <span className="block text-2xl font-bold text-green-600">Rs. {formatCurrency(pitch.valuation)}</span>
                        </div>
                    </div>

                    import TalkNowButton from '@/components/investor/TalkNowButton';

                    // ... (existing imports, adjusted below)

                    <div className="flex gap-4">
                        <WatchlistButton investorId={user.id as string} pitchId={pitch._id} initialIsWatched={isWatched} />
                        <TalkNowButton
                            pitchId={pitch._id}
                            entrepreneurId={pitch.entrepreneur._id}
                            investorId={user.id as string}
                        />
                        <ProposeDealButton
                            pitchId={pitch._id}
                            investorId={user.id as string}
                            entrepreneurId={pitch.entrepreneur._id}
                            defaultAmount={pitch.amountRequired}
                            defaultEquity={pitch.equityOffered}
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Main Pitch Content */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Problem & Solution */}
                    <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                        <h2 className="text-xl font-bold text-[#0B2C4A] mb-6 flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-blue-500" />
                            Problem & Solution
                        </h2>
                        <div className="space-y-6">
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-2">The Problem</h3>
                                <p className="text-gray-600 leading-relaxed">{pitch.problemStatement}</p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-2">Our Solution</h3>
                                <p className="text-gray-600 leading-relaxed">{pitch.solution}</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="text-sm font-semibold text-gray-700 mb-1">Target Customer</h4>
                                    <p className="text-sm text-gray-600">{pitch.targetCustomer}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="text-sm font-semibold text-gray-700 mb-1">Market Size</h4>
                                    <p className="text-sm text-gray-600">{pitch.marketSizeLocation}</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Business Details */}
                    <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                        <h2 className="text-xl font-bold text-[#0B2C4A] mb-6 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-blue-500" />
                            Business Details
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Revenue Model</h3>
                                <p className="text-gray-800">{pitch.revenueModel}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Stage</h3>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                    {pitch.stage}
                                </span>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Competitors</h3>
                                <p className="text-gray-800">{pitch.competitors}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Unique Selling Point</h3>
                                <p className="text-gray-800">{pitch.uniqueSellingPoint}</p>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-100">
                            <h3 className="font-semibold text-gray-900 mb-3">Traction</h3>
                            <p className="text-gray-600 italic bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
                                "{pitch.traction}"
                            </p>
                        </div>
                    </section>

                    {/* Team */}
                    <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                        <h2 className="text-xl font-bold text-[#0B2C4A] mb-6 flex items-center gap-2">
                            <Users className="w-5 h-5 text-blue-500" />
                            The Team
                        </h2>
                        <div className="flex items-start gap-4">
                            <div className="relative w-16 h-16 bg-gray-200 rounded-full overflow-hidden shrink-0">
                                {pitch.entrepreneur?.profilePhoto ? (
                                    <Image src={pitch.entrepreneur.profilePhoto} alt="Founder" fill className="object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-500 text-xl font-bold">
                                        {pitch.entrepreneur?.fullName?.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">{pitch.entrepreneur?.fullName}</h3>
                                <p className="text-sm text-gray-500 mb-3">Founder</p>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    {pitch.founderBackground}
                                </p>
                            </div>
                        </div>
                        <div className="mt-6">
                            <h4 className="text-sm font-semibold text-gray-900 mb-2">Why this team?</h4>
                            <p className="text-gray-600 text-sm">{pitch.teamFit}</p>
                        </div>
                    </section>
                </div>

                {/* Right Column: Documents & Actions */}
                <div className="lg:col-span-1 space-y-6">

                    {/* Documents */}
                    <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="font-bold text-[#0B2C4A] mb-4 flex items-center gap-2">
                            <FileText className="w-4 h-4" /> Documents
                        </h3>
                        <div className="space-y-3">
                            {pitch.pitchDeckUrl ? (
                                <a
                                    href={pitch.pitchDeckUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-red-100 text-red-600 rounded">
                                            <FileText className="w-4 h-4" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">Pitch Deck</span>
                                    </div>
                                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                                </a>
                            ) : (
                                <div className="text-sm text-gray-400 italic">No Pitch Deck uploaded</div>
                            )}

                            {/* Financials - Placeholder if not array, need to handle Array vs String based on Schema */}
                            {pitch.financialsUrls && pitch.financialsUrls.length > 0 && (
                                <div className="mt-2">
                                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Financials</p>
                                    {pitch.financialsUrls.map((url: string, idx: number) => (
                                        <a
                                            key={idx}
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors group mb-2"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-green-100 text-green-600 rounded">
                                                    <BarChart3 className="w-4 h-4" />
                                                </div>
                                                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">Financial Doc {idx + 1}</span>
                                            </div>
                                            <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Media / Demo */}
                    {pitch.demoUrl && (
                        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="font-bold text-[#0B2C4A] mb-4 flex items-center gap-2">
                                <PlayCircle className="w-4 h-4" /> Demo / Video
                            </h3>
                            <a
                                href={pitch.demoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block relative aspect-video bg-gray-900 rounded-lg overflow-hidden group"
                            >
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-red-600 transition-colors">
                                        <PlayCircle className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                                {/* Thumbnail logic could go here if we had one */}
                                <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/80 text-white text-xs text-center">
                                    Click to watch demo
                                </div>
                            </a>
                        </section>
                    )}

                    {/* Funding Info */}
                    <section className="bg-[#0B2C4A] text-white rounded-xl shadow-sm p-6">
                        <h3 className="font-bold mb-4">Investment Terms</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center border-b border-white/10 pb-2">
                                <span className="text-gray-300 text-sm">Min Investment</span>
                                <span className="font-medium">TBD</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-white/10 pb-2">
                                <span className="text-gray-300 text-sm">Use of Funds</span>
                                <span className="font-medium text-right text-xs max-w-[150px] truncate">{pitch.useOfFunds}</span>
                            </div>
                            <div className="flex justify-between items-center pt-2">
                                <span className="text-gray-300 text-sm">Exit Plan</span>
                                <span className="font-medium text-right text-xs">{pitch.exitPlan}</span>
                            </div>
                        </div>
                    </section>

                </div>
            </div>
        </div>
    );
}
