import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { jwtVerify } from 'jose';
import dbConnect from '@/lib/db';
import Investor from '@/models/Investor';
import LineChart from '@/components/charts/LineChart';
import BarChart from '@/components/charts/BarChart';
import PieChart from '@/components/charts/PieChart';
import InvestorRecentActivity from '@/components/investor/InvestorRecentActivity';
import { getInvestorStats, InvestorStats } from '@/lib/investor-stats';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

async function loadDashboard(): Promise<{ stats: InvestorStats; userName: string } | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return null;
    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        if (payload.role !== 'investor') return null;
        await dbConnect();
        const investor: any = await Investor.findById(payload.id).select('fullName').lean();
        const stats = await getInvestorStats(payload.id as string);
        return { stats, userName: investor?.fullName || 'Investor' };
    } catch {
        return null;
    }
}

export default async function InvestorDashboard() {
    const data = await loadDashboard();
    if (!data) redirect('/login');

    const { stats, userName } = data;
    const activitySerialized = stats.activity.map(a => ({
        ...a,
        date: a.date instanceof Date ? a.date.toISOString() : a.date,
    }));

    return (
        <div className="space-y-8">
            <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold text-[#0B2C4A] tracking-tight">Dashboard Overview</h2>
                    <p className="text-gray-500 mt-2 text-lg">Welcome back, {userName}. Here's your portfolio snapshot.</p>
                </div>
                <div className="flex items-center gap-3 text-sm">
                    <span className="bg-green-50 text-green-700 px-3 py-1.5 rounded-full font-bold">● Live</span>
                </div>
            </header>

            {/* Primary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KpiCard
                    title="Total Invested"
                    value={`Rs. ${formatCurrency(stats.portfolio.totalInvested)}`}
                    sub={`${stats.portfolio.activeInvestments} active investment${stats.portfolio.activeInvestments === 1 ? '' : 's'}`}
                    color="emerald"
                    icon={<DollarIcon />}
                />
                <KpiCard
                    title="Pending Deals"
                    value={stats.deals.pending}
                    sub="Awaiting your decision"
                    color="amber"
                    icon={<ClockIcon />}
                    actionHref="/investor_dashboard/deals"
                    actionLabel="Review →"
                />
                <KpiCard
                    title="Watchlist"
                    value={stats.discovery.watchlistCount}
                    sub="Pitches you're tracking"
                    color="indigo"
                    icon={<BookmarkIcon />}
                    actionHref="/investor_dashboard/watchlist"
                    actionLabel="Open →"
                />
                <KpiCard
                    title="Win Rate"
                    value={`${stats.deals.winRate}%`}
                    sub={`${stats.deals.approved} won · ${stats.deals.rejected} lost`}
                    color="blue"
                    icon={<TrophyIcon />}
                />
            </div>

            {/* Mini Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <MiniStat label="Avg Check Size" value={`Rs. ${formatCurrency(stats.portfolio.avgCheckSize)}`} hint="Per deal" tone="emerald" />
                <MiniStat label="Avg Equity" value={`${stats.portfolio.avgEquity}%`} hint="Per deal" tone="purple" />
                <MiniStat label="Total Equity Held" value={`${stats.portfolio.totalEquityHeld}%`} hint="Across portfolio" tone="indigo" />
                <MiniStat label="Active Chats" value={stats.discovery.activeChats} hint="Live deal talks" tone="blue" />
                <MiniStat label="Available Pitches" value={stats.discovery.availablePitches} hint="In market" tone="pink" />
                <MiniStat label="Unread Messages" value={stats.discovery.unreadMessages} hint="In chats" tone="amber" />
            </div>

            {/* Charts row 1: Portfolio trend + market trend */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ChartCard title="Investment Activity" subtitle="Capital deployed in the last 6 months" badge="Monthly" badgeTone="emerald">
                    <LineChart data={stats.trends.investmentTrend} color="#10b981" height={280} />
                </ChartCard>
                <ChartCard title="Market Pulse" subtitle="New approved pitches per month" badge="Monthly" badgeTone="indigo">
                    <BarChart data={stats.trends.marketActivity} color="#3b82f6" height={280} />
                </ChartCard>
            </div>

            {/* Charts row 2: Portfolio distribution + activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <ChartCard title="Portfolio by Industry" subtitle="Capital spread (Rs.)">
                    {stats.distributions.portfolioByIndustry.length > 0 ? (
                        <PieChart data={stats.distributions.portfolioByIndustry} height={220} showLegend={true} />
                    ) : <EmptyState label="No investments yet" />}
                </ChartCard>
                <ChartCard title="Portfolio by Stage" subtitle="Where your bets sit">
                    {stats.distributions.portfolioByStage.length > 0 ? (
                        <PieChart data={stats.distributions.portfolioByStage} height={220} showLegend={true} />
                    ) : <EmptyState label="No investments yet" />}
                </ChartCard>
                <InvestorRecentActivity activities={activitySerialized} />
            </div>

            {/* Watchlist breakdown + Recent investments */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <ChartCard title="Watchlist by Industry" subtitle="What you're scouting">
                    {stats.distributions.watchlistByIndustry.length > 0 ? (
                        <PieChart data={stats.distributions.watchlistByIndustry} height={220} showLegend={true} />
                    ) : <EmptyState label="Watchlist is empty" />}
                </ChartCard>

                <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-xl font-bold text-[#0B2C4A]">Recent Investments</h3>
                            <p className="text-sm text-gray-500">Your latest closed deals</p>
                        </div>
                        <Link href="/investor_dashboard/portfolio" className="text-sm font-semibold text-[#0B2C4A] hover:underline">
                            View portfolio →
                        </Link>
                    </div>
                    {stats.portfolioList.length === 0 ? (
                        <div className="py-12 text-center text-gray-400">No closed investments yet. Browse pitches to get started.</div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead className="text-xs text-gray-500 uppercase border-b border-gray-100">
                                <tr>
                                    <th className="text-left py-2 font-semibold">Business</th>
                                    <th className="text-left py-2 font-semibold">Industry</th>
                                    <th className="text-right py-2 font-semibold">Amount</th>
                                    <th className="text-right py-2 font-semibold">Equity</th>
                                    <th className="text-right py-2 font-semibold">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {stats.portfolioList.map((p, i) => (
                                    <tr key={i} className="hover:bg-gray-50/60">
                                        <td className="py-3 font-semibold text-[#0B2C4A]">{p.businessName}</td>
                                        <td className="py-3 text-gray-600">{p.industry}</td>
                                        <td className="py-3 text-right font-mono text-gray-700">Rs. {formatCurrency(p.amount)}</td>
                                        <td className="py-3 text-right">
                                            <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full text-xs font-bold">
                                                {p.equity}%
                                            </span>
                                        </td>
                                        <td className="py-3 text-right text-gray-500 text-xs">
                                            {new Date(p.date).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Market context */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ContextCard
                    label="Avg. Pitch Ask"
                    value={`Rs. ${formatCurrency(stats.market.avgPitchAsk)}`}
                    sub="Across all live pitches"
                />
                <ContextCard
                    label="Total Capital Sought"
                    value={`Rs. ${formatCurrency(stats.market.totalCapitalSeeking)}`}
                    sub="Aggregate ask in market"
                />
                <ContextCard
                    label="Matching Your Preferences"
                    value={stats.discovery.matchingPitches.toLocaleString()}
                    sub={`Pitches in your industries`}
                />
            </div>
        </div>
    );
}

/* --- Subcomponents --- */
function KpiCard({ title, value, sub, color, icon, actionHref, actionLabel }: {
    title: string;
    value: string | number;
    sub: string;
    color: 'blue' | 'emerald' | 'indigo' | 'amber';
    icon: React.ReactNode;
    actionHref?: string;
    actionLabel?: string;
}) {
    const tones = {
        blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-500' },
        emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-500' },
        indigo: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-500' },
        amber: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-500' },
    } as const;
    const t = tones[color];
    return (
        <div className={`bg-white p-6 rounded-2xl shadow-sm border-l-4 ${t.border} hover:shadow-md transition-all duration-300 hover:-translate-y-1`}>
            <div className={`p-2.5 rounded-xl ${t.bg} ${t.text} inline-flex mb-3`}>{icon}</div>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">{title}</p>
            <h3 className="text-3xl font-extrabold text-[#0B2C4A] my-1">{value}</h3>
            <p className="text-xs text-gray-400 font-medium">{sub}</p>
            {actionHref && actionLabel && (
                <Link href={actionHref} className={`inline-block mt-3 text-xs font-bold ${t.text} hover:underline`}>
                    {actionLabel}
                </Link>
            )}
        </div>
    );
}

function MiniStat({ label, value, hint, tone }: { label: string; value: string | number; hint: string; tone: 'green' | 'emerald' | 'purple' | 'blue' | 'pink' | 'indigo' | 'amber' }) {
    const tones = {
        green: 'text-green-600',
        emerald: 'text-emerald-600',
        purple: 'text-purple-600',
        blue: 'text-blue-600',
        pink: 'text-pink-600',
        indigo: 'text-indigo-600',
        amber: 'text-amber-600',
    };
    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">{label}</p>
            <p className={`text-2xl font-extrabold ${tones[tone]} my-1`}>{value}</p>
            <p className="text-[11px] text-gray-400">{hint}</p>
        </div>
    );
}

function ChartCard({ title, subtitle, badge, badgeTone = 'navy', children, className = '' }: {
    title: string;
    subtitle: string;
    badge?: string;
    badgeTone?: 'navy' | 'emerald' | 'indigo' | 'amber' | 'purple';
    children: React.ReactNode;
    className?: string;
}) {
    const badges = {
        navy: 'bg-[#0B2C4A] text-white',
        emerald: 'bg-emerald-50 text-emerald-700',
        indigo: 'bg-indigo-50 text-indigo-700',
        amber: 'bg-amber-50 text-amber-700',
        purple: 'bg-purple-50 text-purple-700',
    };
    return (
        <div className={`bg-white p-8 rounded-2xl shadow-lg border border-gray-100 transition-shadow hover:shadow-xl ${className}`}>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-bold text-[#0B2C4A]">{title}</h3>
                    <p className="text-sm text-gray-500">{subtitle}</p>
                </div>
                {badge && (
                    <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${badges[badgeTone]}`}>
                        {badge}
                    </span>
                )}
            </div>
            <div className="pb-2">{children}</div>
        </div>
    );
}

function ContextCard({ label, value, sub }: { label: string; value: string; sub: string }) {
    return (
        <div className="bg-linear-to-br from-[#0B2C4A] to-[#173b62] text-white p-5 rounded-2xl shadow-md">
            <p className="text-xs font-bold uppercase tracking-wider opacity-70">{label}</p>
            <p className="text-2xl font-extrabold my-1">{value}</p>
            <p className="text-xs opacity-60">{sub}</p>
        </div>
    );
}

function EmptyState({ label = 'No data yet' }: { label?: string }) {
    return (
        <div className="h-[220px] flex flex-col items-center justify-center text-gray-400">
            <svg className="w-10 h-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-sm">{label}</p>
        </div>
    );
}

/* --- Icons --- */
function DollarIcon() {
    return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
}
function ClockIcon() {
    return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
}
function BookmarkIcon() {
    return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>;
}
function TrophyIcon() {
    return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>;
}
