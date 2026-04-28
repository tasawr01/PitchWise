import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { redirect } from 'next/navigation';
import LineChart from '@/components/charts/LineChart';
import BarChart from '@/components/charts/BarChart';
import PieChart from '@/components/charts/PieChart';
import RecentActivity from '@/components/entrepreneur/RecentActivity';
import { getEntrepreneurStats, EntrepreneurStats } from '@/lib/entrepreneur-stats';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

async function loadDashboard(): Promise<{ stats: EntrepreneurStats; userId: string } | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return null;
    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        if (payload.role !== 'entrepreneur') return null;
        const stats = await getEntrepreneurStats(payload.id as string);
        return { stats, userId: payload.id as string };
    } catch {
        return null;
    }
}

export default async function EntrepreneurOverview() {
    const data = await loadDashboard();
    if (!data) redirect('/login');

    const { stats } = data;

    const activitySerialized = stats.activity.map(a => ({
        ...a,
        date: a.date instanceof Date ? a.date.toISOString() : a.date,
    }));

    return (
        <div className="space-y-8">
            <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold text-[#0B2C4A] tracking-tight">Dashboard Overview</h2>
                    <p className="text-gray-500 mt-2 text-lg">Real-time view of your pitches, investors, and funding.</p>
                </div>
                <div className="flex items-center gap-3 text-sm">
                    <span className="bg-green-50 text-green-700 px-3 py-1.5 rounded-full font-bold">● Live</span>
                </div>
            </header>

            {/* Primary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KpiCard
                    title="Capital Raised"
                    value={`Rs. ${formatCurrency(stats.deals.totalRaised)}`}
                    sub={`${stats.deals.approved} approved deal${stats.deals.approved === 1 ? '' : 's'}`}
                    color="emerald"
                    icon={<DollarIcon />}
                    deltaLabel={stats.funding.targetTotal > 0 ? `${stats.funding.raisedPercent}% of target` : undefined}
                />
                <KpiCard
                    title="Total Pitches"
                    value={stats.pitches.total}
                    sub={`${stats.pitches.approved} live · ${stats.pitches.pending} pending`}
                    color="blue"
                    icon={<RocketIcon />}
                    actionHref="/entrepreneur_dashboard/pitches"
                    actionLabel="Manage →"
                />
                <KpiCard
                    title="Total Pitch Views"
                    value={stats.pitches.totalViews.toLocaleString()}
                    sub={`Avg ${stats.pitches.avgViews} per pitch`}
                    color="indigo"
                    icon={<EyeIcon />}
                />
                <KpiCard
                    title="Pending Deals"
                    value={stats.deals.pending}
                    sub={`Awaiting investor sign-off`}
                    color="amber"
                    icon={<ClockIcon />}
                    actionHref="/entrepreneur_dashboard/deals"
                    actionLabel="Review →"
                />
            </div>

            {/* Mini Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <MiniStat label="Avg Deal Size" value={`Rs. ${formatCurrency(stats.deals.avgDealSize)}`} hint="Per closed deal" tone="emerald" />
                <MiniStat label="Avg Equity Given" value={`${stats.deals.avgEquityGiven}%`} hint="Per deal" tone="purple" />
                <MiniStat label="Active Chats" value={stats.pipeline.activeChats} hint="In progress" tone="blue" />
                <MiniStat label="Unique Investors" value={stats.pipeline.uniqueInvestors} hint="Closed with you" tone="indigo" />
                <MiniStat label="Watchlisted by" value={stats.pipeline.watchlistedBy} hint="Investors saved" tone="pink" />
                <MiniStat label="Unread Messages" value={stats.pipeline.unreadMessages} hint="In chats" tone="amber" />
            </div>

            {/* Charts row 1: Funding trend + Pitch performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ChartCard title="Funding Raised Over Time" subtitle="Capital received in the last 6 months" badge="Monthly" badgeTone="emerald">
                    <LineChart data={stats.trends.fundingTrend} color="#10b981" height={280} />
                </ChartCard>
                <ChartCard title="Views Per Pitch" subtitle="How your pitches are performing" badge="Top 6" badgeTone="indigo">
                    {stats.distributions.viewsPerPitch.length > 0 ? (
                        <BarChart data={stats.distributions.viewsPerPitch} height={280} />
                    ) : <EmptyState />}
                </ChartCard>
            </div>

            {/* Charts row 2: Pitch status + Deal status + Recent activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <ChartCard title="Pitch Pipeline" subtitle="Status of your pitches">
                    {stats.distributions.pitchStatus.length > 0 ? (
                        <PieChart data={stats.distributions.pitchStatus} height={220} showLegend={true} />
                    ) : <EmptyState />}
                </ChartCard>
                <ChartCard title="Deal Outcomes" subtitle="Investor responses">
                    {stats.distributions.dealStatus.length > 0 ? (
                        <PieChart data={stats.distributions.dealStatus} height={220} showLegend={true} />
                    ) : <EmptyState />}
                </ChartCard>
                <RecentActivity activities={activitySerialized} />
            </div>

            {/* Top Pitches Table */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-xl font-bold text-[#0B2C4A]">My Top Pitches</h3>
                        <p className="text-sm text-gray-500">Sorted by views</p>
                    </div>
                    <Link href="/entrepreneur_dashboard/pitches" className="text-sm font-semibold text-[#0B2C4A] hover:underline">
                        View all →
                    </Link>
                </div>
                {stats.pitches_list.length === 0 ? (
                    <div className="py-12 text-center text-gray-400">No pitches yet. Submit your first pitch to get started.</div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="text-xs text-gray-500 uppercase border-b border-gray-100">
                            <tr>
                                <th className="text-left py-2 font-semibold">Business</th>
                                <th className="text-left py-2 font-semibold">Industry</th>
                                <th className="text-left py-2 font-semibold">Status</th>
                                <th className="text-right py-2 font-semibold">Asking</th>
                                <th className="text-right py-2 font-semibold">Views</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {stats.pitches_list.map((p, i) => (
                                <tr key={i} className="hover:bg-gray-50/60">
                                    <td className="py-3 font-semibold text-[#0B2C4A]">{p.businessName}</td>
                                    <td className="py-3 text-gray-600">{p.industry}</td>
                                    <td className="py-3"><StatusBadge status={p.status} /></td>
                                    <td className="py-3 text-right font-mono text-gray-700">Rs. {formatCurrency(p.amountRequired)}</td>
                                    <td className="py-3 text-right">
                                        <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs font-bold">
                                            {p.views.toLocaleString()}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

/* --- Subcomponents --- */
function KpiCard({ title, value, sub, color, icon, deltaLabel, actionHref, actionLabel }: {
    title: string;
    value: string | number;
    sub: string;
    color: 'blue' | 'emerald' | 'indigo' | 'amber';
    icon: React.ReactNode;
    deltaLabel?: string;
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
        <div className={`bg-white p-6 rounded-2xl shadow-sm border-l-4 ${t.border} hover:shadow-md transition-all duration-300 hover:-translate-y-1 relative overflow-hidden`}>
            <div className="flex items-start justify-between mb-3">
                <div className={`p-2.5 rounded-xl ${t.bg} ${t.text}`}>{icon}</div>
                {deltaLabel && (
                    <span className="text-xs font-bold px-2 py-1 rounded-full bg-emerald-50 text-emerald-700">
                        {deltaLabel}
                    </span>
                )}
            </div>
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

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        draft: 'bg-gray-100 text-gray-700',
        pending: 'bg-amber-50 text-amber-700',
        approved: 'bg-emerald-50 text-emerald-700',
        rejected: 'bg-red-50 text-red-700',
        permanently_rejected: 'bg-red-100 text-red-800',
    };
    const labels: Record<string, string> = {
        draft: 'Draft',
        pending: 'Pending',
        approved: 'Approved',
        rejected: 'Rejected',
        permanently_rejected: 'Perm. Rejected',
    };
    return <span className={`text-xs font-bold px-2 py-1 rounded-full ${styles[status] || styles.draft}`}>{labels[status] || status}</span>;
}

function EmptyState() {
    return (
        <div className="h-[220px] flex flex-col items-center justify-center text-gray-400">
            <svg className="w-10 h-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-sm">No data yet</p>
        </div>
    );
}

/* --- Icons --- */
function DollarIcon() {
    return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
}
function RocketIcon() {
    return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
}
function EyeIcon() {
    return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;
}
function ClockIcon() {
    return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
}
