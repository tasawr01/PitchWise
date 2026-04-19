import { getPitchById, checkWatchlistStatus } from '@/app/actions/investor';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';
import WatchlistButton from '@/components/investor/WatchlistButton';
import TalkNowButton from '@/components/investor/TalkNowButton';

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

    if (!pitch || pitch.status !== 'approved') {
        notFound();
    }

    const isWatched = await checkWatchlistStatus(user.id as string, id);

    // Helper to render a field if it exists
    const Field = ({ label, value }: { label: string; value: any }) => {
        const displayValue = value ? value : <span className="text-gray-400 italic font-normal">Not Provided</span>;
        return (
            <div className="mb-4">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{label}</h4>
                <p className="text-gray-900 text-base whitespace-pre-wrap">{displayValue}</p>
            </div>
        );
    };

    const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
        <section className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm mb-8">
            <h3 className="text-xl font-bold text-[#0B2C4A] mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
                {title}
            </h3>
            {children}
        </section>
    );

    return (
        <div className="max-w-5xl mx-auto pb-20">
            {/* Header / Nav */}
            <div className="mb-8 flex justify-between items-center">
                <Link
                    href="/investor_dashboard/explore"
                    className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-[#0B2C4A] transition-colors"
                >
                    <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Explore
                </Link>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <WatchlistButton investorId={user.id as string} pitchId={pitch._id} initialIsWatched={isWatched} />
                    <TalkNowButton
                        pitchId={pitch._id}
                        entrepreneurId={pitch.entrepreneur._id}
                        investorId={user.id as string}
                    />
                </div>
            </div>

            {/* Hero Section */}
            <div className="bg-white rounded-3xl p-8 md:p-10 shadow-xl border border-gray-100 mb-10 relative overflow-hidden">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    {/* Logo */}
                    <div className="w-32 h-32 flex-shrink-0 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-center overflow-hidden relative">
                        {pitch.logoUrl ? (
                            <Image src={pitch.logoUrl} alt="Logo" fill className="object-cover" />
                        ) : (
                            <span className="text-gray-300 font-bold text-4xl">{pitch.businessName?.[0]}</span>
                        )}
                    </div>

                    <div className="flex-1">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-[#0B2C4A] tracking-tight mb-2">{pitch.businessName}</h1>
                        <p className="text-xl text-gray-500 font-medium mb-6">{pitch.title}</p>

                        <div className="flex flex-wrap gap-4">
                            <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
                                <span className="block text-xs font-bold text-blue-800 uppercase">Industry</span>
                                <span className="text-blue-900 font-semibold">{pitch.industry}</span>
                            </div>
                            <div className="bg-purple-50 px-4 py-2 rounded-lg border border-purple-100">
                                <span className="block text-xs font-bold text-purple-800 uppercase">Stage</span>
                                <span className="text-purple-900 font-semibold">{pitch.stage}</span>
                            </div>
                            <div className="bg-green-50 px-4 py-2 rounded-lg border border-green-100">
                                <span className="block text-xs font-bold text-green-800 uppercase">Seeking</span>
                                <span className="text-green-900 font-semibold">Rs. {formatCurrency(pitch.amountRequired)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content (Left 2/3) */}
                <div className="lg:col-span-2">

                    <Section title="The Problem & Solution">
                        <div className="grid grid-cols-1 gap-6">
                            <Field label="Problem Statement" value={pitch.problemStatement} />
                            <Field label="Urgency" value={pitch.problemUrgency} />
                            <Field label="Target Customer" value={pitch.targetCustomer} />
                            <div className="h-px bg-gray-100 my-2"></div>
                            <Field label="Solution" value={pitch.solution} />
                            <Field label="How it Works" value={pitch.solutionMechanism} />
                            <Field label="Unique Selling Point" value={pitch.uniqueSellingPoint} />
                        </div>
                    </Section>

                    <Section title="The Market">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Field label="Market Size & Location" value={pitch.marketSizeLocation} />
                            <Field label="Market Growth" value={pitch.marketGrowth} />
                            <div className="col-span-1 md:col-span-2">
                                <Field label="Competitors" value={pitch.competitors} />
                                <Field label="Current Alternatives" value={pitch.currentAlternatives} />
                            </div>
                        </div>
                    </Section>

                    <Section title="Business & Execution">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Field label="Revenue Model" value={pitch.revenueModel} />
                            <Field label="Pricing Model" value={pitch.pricingModel} />
                            <Field label="Rev/Customer" value={pitch.revenuePerCustomer} />
                        </div>
                        <div className="mt-6">
                            <Field label="Traction / Validation" value={pitch.traction} />
                            <Field label="Customer Validation" value={pitch.customerValidation} />
                        </div>
                        <div className="mt-6">
                            <Field label="Key Technology" value={pitch.keyTechnology} />
                            <Field label="Moat (Defensibility)" value={pitch.moat} />
                            <Field label="Risks" value={pitch.risks} />
                            <Field label="Risk Mitigation" value={pitch.riskMitigation} />
                        </div>
                    </Section>

                    <Section title="The Team">
                        <Field label="Founder Background" value={pitch.founderBackground} />
                        <Field label="Team Fit" value={pitch.teamFit} />
                    </Section>
                </div>

                {/* Sidebar (Right 1/3) */}
                <div className="space-y-8">

                    {/* The Deal Card */}
                    <div className="bg-[#0B2C4A] rounded-2xl p-6 text-white shadow-lg">
                        <h3 className="text-xl font-bold mb-6 border-b border-white/20 pb-4">The Deal</h3>
                        <div className="space-y-4">
                            <div>
                                <span className="block text-xs font-bold text-gray-300 uppercase">Valuation</span>
                                <span className="text-2xl font-bold">Rs. {pitch.valuation ? formatCurrency(pitch.valuation) : 'N/A'}</span>
                            </div>
                            <div>
                                <span className="block text-xs font-bold text-gray-300 uppercase">Equity Offered</span>
                                <span className="text-2xl font-bold">{pitch.equityOffered}%</span>
                            </div>
                            <div>
                                <span className="block text-xs font-bold text-gray-300 uppercase">Amount Required</span>
                                <span className="text-2xl font-bold text-green-400">Rs. {formatCurrency(pitch.amountRequired)}</span>
                            </div>
                        </div>
                        <div className="mt-6 pt-4 border-t border-white/20">
                            <p className="text-xs font-bold text-gray-300 uppercase mb-2">Use of Funds</p>
                            <p className="text-sm text-gray-200">{pitch.useOfFunds}</p>
                        </div>
                    </div>

                    {/* Financials Card */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-bold text-[#0B2C4A] mb-4">Financial Projections</h3>
                        <div className="space-y-4">
                            <Field label="Monthly Expenses" value={pitch.monthlyExpenses} />
                            <Field label="Break-Even Point" value={pitch.breakEvenPoint} />
                            <Field label="Profitability Timeline" value={pitch.profitabilityTimeline} />
                        </div>
                    </div>

                    {/* Vision Card */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-bold text-[#0B2C4A] mb-4">Vision & Exit</h3>
                        <div className="space-y-4">
                            <Field label="5-Year Vision" value={pitch.vision} />
                            <Field label="Exit Plan" value={pitch.exitPlan} />
                            <Field label="Plan B (No Investment)" value={pitch.noInvestmentPlan} />
                        </div>
                    </div>

                    {/* Documents List */}
                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                        <h3 className="text-lg font-bold text-[#0B2C4A] mb-4">Documents</h3>
                        <div className="space-y-3">
                            <a href={pitch.pitchDeckUrl} target="_blank" className="flex items-center p-3 bg-white rounded-xl border border-gray-200 hover:border-[#0B2C4A] transition-all group">
                                <span className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-500 mr-3 group-hover:bg-red-100 transition-colors">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                </span>
                                <div>
                                    <span className="block text-sm font-bold text-gray-900">Pitch Deck</span>
                                    <span className="text-xs text-gray-500">PDF Document</span>
                                </div>
                            </a>

                            {pitch.demoUrl && (
                                <a href={pitch.demoUrl} target="_blank" className="flex items-center p-3 bg-white rounded-xl border border-gray-200 hover:border-[#0B2C4A] transition-all group">
                                    <span className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 mr-3 group-hover:bg-blue-100 transition-colors">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </span>
                                    <div>
                                        <span className="block text-sm font-bold text-gray-900">Demo / Prototype</span>
                                        <span className="text-xs text-gray-500">View File/Link</span>
                                    </div>
                                </a>
                            )}

                            {pitch.financialsUrls && pitch.financialsUrls.length > 0 && pitch.financialsUrls.map((url: string, i: number) => (
                                <a key={i} href={url} target="_blank" className="flex items-center p-3 bg-white rounded-xl border border-gray-200 hover:border-[#0B2C4A] transition-all group">
                                    <span className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-green-500 mr-3 group-hover:bg-green-100 transition-colors">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                                    </span>
                                    <div>
                                        <span className="block text-sm font-bold text-gray-900">Financials {i + 1}</span>
                                        <span className="text-xs text-gray-500">Document</span>
                                    </div>
                                </a>
                            ))}

                            {pitch.tractionProofUrls && pitch.tractionProofUrls.length > 0 && pitch.tractionProofUrls.map((url: string, i: number) => (
                                <a key={i} href={url} target="_blank" className="flex items-center p-3 bg-white rounded-xl border border-gray-200 hover:border-[#0B2C4A] transition-all group">
                                    <span className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-500 mr-3 group-hover:bg-purple-100 transition-colors">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </span>
                                    <div>
                                        <span className="block text-sm font-bold text-gray-900">Traction Proof {i + 1}</span>
                                        <span className="text-xs text-gray-500">Document</span>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
