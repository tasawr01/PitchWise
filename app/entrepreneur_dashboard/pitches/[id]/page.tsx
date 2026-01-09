import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import dbConnect from '@/lib/db';
import Pitch from '@/models/Pitch';
import { jwtVerify } from 'jose';

async function getPitch(id: string) {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return null;

    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        await dbConnect();

        const pitch = await Pitch.findOne({ _id: id, entrepreneur: payload.id });
        if (!pitch) return null;

        return JSON.parse(JSON.stringify(pitch));
    } catch (error) {
        console.error('Error fetching pitch:', error);
        return null;
    }
}

export default async function PitchDetailsPage({ params }: { params: { id: string } }) {
    // Await params as per Next.js 15+ requirements if applicable, but for now standard access
    const { id } = await params;
    const pitch = await getPitch(id);

    if (!pitch) {
        notFound();
    }

    return (
        <div className="max-w-5xl mx-auto pb-12">
            <div className="mb-6">
                <Link
                    href="/entrepreneur_dashboard/pitches"
                    className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-[#0B2C4A] transition-colors"
                >
                    <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to My Pitches
                </Link>
            </div>

            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                {/* Header Image */}
                <div className="relative h-64 md:h-80 w-full bg-gray-100">
                    {pitch.demoUrl ? (
                        <Image
                            src={pitch.demoUrl}
                            alt={pitch.title}
                            fill
                            className="object-cover"
                            priority
                            sizes="100vw"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#0B2C4A]/5 to-[#0B2C4A]/10 text-[#0B2C4A]/20">
                            <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                    )}
                    <div className="absolute top-6 right-6">
                        <StatusBadge status={pitch.status} />
                    </div>
                </div>

                {/* Main Content */}
                <div className="px-8 py-8">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-8 pb-8 border-b border-gray-100">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-extrabold text-[#0B2C4A] mb-2 tracking-tight">{pitch.title}</h1>
                            <p className="text-xl text-gray-500 font-medium">{pitch.businessName}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <span className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Amount Required</span>
                            <span className="text-3xl font-bold text-green-600">${pitch.amountRequired.toLocaleString()}</span>
                            <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{pitch.fundingType}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* Left Column: Details */}
                        <div className="lg:col-span-2 space-y-10">

                            {/* Problem & Solution */}
                            <section>
                                <h3 className="text-lg font-bold text-[#0B2C4A] mb-4 flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-lg bg-[#0B2C4A]/10 flex items-center justify-center text-[#0B2C4A]">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                                    </span>
                                    Problem & Solution
                                </h3>
                                <div className="space-y-6">
                                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">The Problem</h4>
                                        <p className="text-gray-600 leading-relaxed text-lg">{pitch.problemStatement}</p>
                                    </div>
                                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                                        <h4 className="text-sm font-bold text-[#0B2C4A] uppercase tracking-wide mb-2">Our Solution</h4>
                                        <p className="text-gray-700 leading-relaxed text-lg">{pitch.solution}</p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-700 mb-2">Unique Selling Point</h4>
                                            <p className="text-gray-600">{pitch.uniqueSellingPoint}</p>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-700 mb-2">Target Customer</h4>
                                            <p className="text-gray-600">{pitch.targetCustomer}</p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <hr className="border-gray-100" />

                            {/* Product & Market */}
                            <section>
                                <h3 className="text-lg font-bold text-[#0B2C4A] mb-4 flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-lg bg-[#0B2C4A]/10 flex items-center justify-center text-[#0B2C4A]">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                    </span>
                                    Product & Market
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                                    <div>
                                        <span className="block text-xs font-semibold text-gray-400 uppercase mb-1">Industry</span>
                                        <span className="text-gray-900 font-medium">{pitch.industry}</span>
                                    </div>
                                    <div>
                                        <span className="block text-xs font-semibold text-gray-400 uppercase mb-1">Stage</span>
                                        <span className="text-gray-900 font-medium">{pitch.stage}</span>
                                    </div>
                                    <div>
                                        <span className="block text-xs font-semibold text-gray-400 uppercase mb-1">Offering Type</span>
                                        <span className="text-gray-900 font-medium">{pitch.offeringType}</span>
                                    </div>
                                    <div>
                                        <span className="block text-xs font-semibold text-gray-400 uppercase mb-1">Product Status</span>
                                        <span className="text-gray-900 font-medium">{pitch.productStatus}</span>
                                    </div>
                                    <div>
                                        <span className="block text-xs font-semibold text-gray-400 uppercase mb-1">Market Type</span>
                                        <span className="text-gray-900 font-medium">{pitch.marketType}</span>
                                    </div>
                                </div>
                                <div className="mt-6">
                                    <span className="block text-xs font-semibold text-gray-400 uppercase mb-3">Key Features</span>
                                    <div className="flex flex-wrap gap-2">
                                        {pitch.keyFeatures.map((feature: string, idx: number) => (
                                            <span key={idx} className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200">
                                                {feature}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </section>

                            <hr className="border-gray-100" />

                            {/* Traction & Revenue */}
                            <section>
                                <h3 className="text-lg font-bold text-[#0B2C4A] mb-4 flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-lg bg-[#0B2C4A]/10 flex items-center justify-center text-[#0B2C4A]">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                                    </span>
                                    Traction & Revenue
                                </h3>
                                <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
                                    <div className="grid grid-cols-3 divide-x divide-gray-100 p-4 bg-gray-50">
                                        <div className="text-center px-2">
                                            <span className="block text-xs text-gray-500 uppercase mb-1">Monthly Rev</span>
                                            <span className="block text-lg font-bold text-[#0B2C4A]">${pitch.monthlyRevenue?.toLocaleString() || 0}</span>
                                        </div>
                                        <div className="text-center px-2">
                                            <span className="block text-xs text-gray-500 uppercase mb-1">Growth Rate</span>
                                            <span className="block text-lg font-bold text-green-600">{pitch.monthlyGrowthRate}%</span>
                                        </div>
                                        <div className="text-center px-2">
                                            <span className="block text-xs text-gray-500 uppercase mb-1">Total Users</span>
                                            <span className="block text-lg font-bold text-blue-600">{pitch.customerCount?.toLocaleString() || pitch.totalUsers?.toLocaleString() || 0}</span>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                                            <div>
                                                <span className="block text-xs font-semibold text-gray-400 uppercase mb-1">Revenue Model</span>
                                                <p className="text-gray-900">{pitch.revenueModel}</p>
                                            </div>
                                            <div>
                                                <span className="block text-xs font-semibold text-gray-400 uppercase mb-1">Pricing Model</span>
                                                <p className="text-gray-900">{pitch.pricingModel}</p>
                                            </div>
                                        </div>
                                        {pitch.majorMilestones && pitch.majorMilestones.length > 0 && (
                                            <div>
                                                <span className="block text-xs font-semibold text-gray-400 uppercase mb-2">Major Milestones</span>
                                                <ul className="list-disc list-inside space-y-1 text-gray-600">
                                                    {pitch.majorMilestones.map((milestone: string, idx: number) => (
                                                        <li key={idx}>{milestone}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </section>

                        </div>

                        {/* Right Column: Sidebar */}
                        <div className="space-y-8">

                            {/* Overview Card */}
                            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">Quick Overview</h3>
                                <ul className="space-y-4 text-sm">
                                    <li className="flex justify-between border-b border-gray-200 pb-2">
                                        <span className="text-gray-500">Founded</span>
                                        <span className="font-medium text-gray-900">{new Date(pitch.createdAt).toLocaleDateString()}</span>
                                    </li>
                                    <li className="flex justify-between border-b border-gray-200 pb-2">
                                        <span className="text-gray-500">Views</span>
                                        <span className="font-medium text-gray-900">{pitch.views || 0}</span>
                                    </li>
                                    <li className="flex justify-between border-b border-gray-200 pb-2">
                                        <span className="text-gray-500">Team Size</span>
                                        <span className="font-medium text-gray-900">{pitch.teamSize} members</span>
                                    </li>
                                    <li className="flex justify-between pt-1">
                                        <span className="text-gray-500">Funding Type</span>
                                        <span className="font-medium text-[#0B2C4A]">{pitch.fundingType}</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Team */}
                            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                                <h3 className="text-md font-bold text-[#0B2C4A] mb-4">Founder</h3>
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-xl font-bold text-gray-500 uppercase">
                                        {pitch.founderName[0]}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">{pitch.founderName}</p>
                                        <p className="text-sm text-gray-500">{pitch.founderRole}</p>
                                        <p className="text-xs text-gray-400 mt-1">{pitch.founderExpYears} years exp.</p>
                                    </div>
                                </div>
                                {pitch.linkedinUrl && (
                                    <a href={pitch.linkedinUrl} target="_blank" rel="noopener noreferrer" className="mt-4 block text-center w-full py-2 bg-blue-50 text-blue-700 text-sm font-semibold rounded-lg hover:bg-blue-100 transition-colors">
                                        LinkedIn Profile
                                    </a>
                                )}
                            </div>

                            {/* Documents */}
                            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                                <h3 className="text-md font-bold text-[#0B2C4A] mb-4">Documents</h3>
                                <div className="space-y-3">
                                    <a href={pitch.pitchDeckUrl} target="_blank" rel="noopener noreferrer" className="flex items-center p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors group">
                                        <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-500 mr-3 group-hover:scale-110 transition-transform">
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="font-semibold text-gray-900 text-sm truncate">Pitch Deck</p>
                                            <p className="text-xs text-gray-500">PDF Document</p>
                                        </div>
                                    </a>
                                    {pitch.financialsUrl && (
                                        <a href={pitch.financialsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors group">
                                            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-green-500 mr-3 group-hover:scale-110 transition-transform">
                                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="font-semibold text-gray-900 text-sm truncate">Financials</p>
                                                <p className="text-xs text-gray-500">PDF Document</p>
                                            </div>
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: any = {
        pending: 'bg-yellow-100 text-yellow-800',
        approved: 'bg-green-100 text-green-800',
        rejected: 'bg-red-100 text-red-800',
    };
    return (
        <span className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide shadow-sm border border-white/20 backdrop-blur-md ${styles[status]}`}>
            {status}
        </span>
    );
}
