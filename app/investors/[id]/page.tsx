import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { notFound, redirect } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Briefcase, MapPin, Building2, Wallet, TrendingUp, Layers, BarChart3, CalendarDays } from 'lucide-react';
import { getInvestorPublicProfile } from '@/app/actions/rating';
import StarsDisplay from '@/components/rating/StarsDisplay';
import RatingsList from '@/components/rating/RatingsList';
import { formatCurrency } from '@/lib/utils';

export const dynamic = 'force-dynamic';

async function requireAuth() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return null;
    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        return payload;
    } catch {
        return null;
    }
}

export default async function InvestorPublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const auth = await requireAuth();
    if (!auth) redirect('/login');

    const { id } = await params;
    const result = await getInvestorPublicProfile(id);
    if (!result.success || !result.investor) notFound();

    const investor: any = result.investor;
    const back = auth.role === 'entrepreneur' ? '/entrepreneur_dashboard/investors' : '/investor_dashboard';

    const investmentRange = (() => {
        if (investor.investmentMin && investor.investmentMax) {
            return `Rs. ${investor.investmentMin} – Rs. ${investor.investmentMax}`;
        }
        if (investor.investmentMin) return `From Rs. ${investor.investmentMin}`;
        if (investor.investmentMax) return `Up to Rs. ${investor.investmentMax}`;
        return null;
    })();

    return (
        <div className="max-w-5xl mx-auto p-6 md:p-10">
            <Link
                href={back}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-[#0B2C4A] transition-colors mb-6"
            >
                <ArrowLeft className="w-4 h-4" /> Back
            </Link>

            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-[#0B2C4A] to-slate-800 px-8 py-10 text-white">
                    <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                        <div className="relative w-28 h-28 rounded-2xl overflow-hidden border-4 border-white/20 shadow-xl shrink-0 bg-white/10">
                            {investor.profilePhoto ? (
                                <Image src={investor.profilePhoto} alt={investor.fullName} fill className="object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-white font-extrabold text-4xl">
                                    {investor.fullName?.charAt(0)?.toUpperCase()}
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{investor.fullName}</h1>
                            {investor.organizationName && (
                                <p className="text-blue-200 mt-1 flex items-center gap-2">
                                    <Building2 className="w-4 h-4" /> {investor.organizationName}
                                </p>
                            )}
                            <div className="flex flex-wrap gap-3 mt-4">
                                {investor.investorType && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-bold uppercase tracking-wider">
                                        <Briefcase className="w-3 h-3" /> {investor.investorType}
                                    </span>
                                )}
                                {investor.cityCountry && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-bold uppercase tracking-wider">
                                        <MapPin className="w-3 h-3" /> {investor.cityCountry}
                                    </span>
                                )}
                            </div>
                            <div className="mt-5">
                                <StarsDisplay avg={result.avg || 0} count={result.count || 0} size={20} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-8 py-7 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {investmentRange && (
                        <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
                            <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                <Wallet className="w-3.5 h-3.5" /> Investment Range
                            </p>
                            <p className="text-base font-bold text-gray-900">{investmentRange}</p>
                        </div>
                    )}

                    {Array.isArray(investor.industryPreferences) && investor.industryPreferences.length > 0 && (
                        <div className="bg-purple-50 rounded-2xl p-5 border border-purple-100">
                            <p className="text-xs font-bold text-purple-700 uppercase tracking-wider mb-2">Industry Preferences</p>
                            <div className="flex flex-wrap gap-1.5">
                                {investor.industryPreferences.map((ind: string) => (
                                    <span key={ind} className="px-2.5 py-1 bg-white border border-purple-200 rounded-full text-xs font-semibold text-purple-700">
                                        {ind}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-10">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xl font-extrabold text-[#0B2C4A] flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" /> Investment Portfolio
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                            <TrendingUp className="w-3.5 h-3.5" /> Total Invested
                        </p>
                        <p className="text-2xl font-extrabold text-[#0B2C4A]">Rs. {formatCurrency((result as any).portfolio?.totalAmount || 0)}</p>
                    </div>
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5" /> Pitches Backed
                        </p>
                        <p className="text-2xl font-extrabold text-[#0B2C4A]">{(result as any).portfolio?.uniquePitches || 0}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{(result as any).portfolio?.count || 0} total deals</p>
                    </div>
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                            <Briefcase className="w-3.5 h-3.5" /> Industries
                        </p>
                        {((result as any).portfolio?.industries || []).length === 0 ? (
                            <p className="text-sm text-gray-400">—</p>
                        ) : (
                            <div className="flex flex-wrap gap-1.5 mt-1">
                                {((result as any).portfolio?.industries as string[]).slice(0, 4).map((ind) => (
                                    <span key={ind} className="px-2 py-0.5 bg-blue-50 border border-blue-100 rounded-full text-xs font-semibold text-blue-700">
                                        {ind}
                                    </span>
                                ))}
                                {((result as any).portfolio?.industries as string[]).length > 4 && (
                                    <span className="text-xs text-gray-400 self-center">
                                        +{((result as any).portfolio?.industries as string[]).length - 4}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {((result as any).portfolio?.deals || []).length === 0 ? (
                    <div className="bg-gray-50 rounded-2xl p-8 text-center text-sm text-gray-500 border border-dashed border-gray-200">
                        No funded deals yet for this investor.
                    </div>
                ) : (
                    <ul className="space-y-3">
                        {((result as any).portfolio?.deals as any[]).map((deal: any) => (
                            <li key={deal._id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-center gap-4">
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
                                    <p className="font-bold text-gray-900 truncate">{deal.pitch?.businessName || 'Untitled Pitch'}</p>
                                    <p className="text-xs text-gray-500 truncate">
                                        {deal.pitch?.industry || 'General'}
                                        {deal.pitch?.stage && <span className="text-gray-400"> · {deal.pitch.stage}</span>}
                                        {deal.entrepreneur?.fullName && <span className="text-gray-400"> · {deal.entrepreneur.fullName}</span>}
                                    </p>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="font-extrabold text-[#0B2C4A]">Rs. {formatCurrency(deal.finalAmount ?? deal.amount)}</p>
                                    <p className="text-xs text-green-700 font-semibold">{deal.finalEquity ?? deal.equity}% equity</p>
                                    {(deal.paidAt || deal.createdAt) && (
                                        <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1 justify-end">
                                            <CalendarDays className="w-3 h-3" />
                                            {new Date(deal.paidAt || deal.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </p>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="mt-10">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-extrabold text-[#0B2C4A]">Reviews from Entrepreneurs</h2>
                    <StarsDisplay avg={result.avg || 0} count={result.count || 0} />
                </div>
                <RatingsList
                    ratings={(result.ratings || []) as any}
                    emptyLabel="No reviews yet for this investor."
                />
            </div>
        </div>
    );
}
