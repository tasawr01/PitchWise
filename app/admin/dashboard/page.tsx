import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import LineChart from '@/components/charts/LineChart';
import BarChart from '@/components/charts/BarChart';
import PieChart from '@/components/charts/PieChart';
import { getAdminStats, AdminStats } from '@/lib/admin-stats';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

async function safeGetStats(): Promise<AdminStats | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return null;
    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        await jwtVerify(token, secret);
        return await getAdminStats();
    } catch {
        return null;
    }
}

export default async function AdminOverview() {
    const stats = await safeGetStats();

    if (!stats) {
        return (
            <div className="p-8 text-center text-red-500">
                Unable to load dashboard. Please re-authenticate.
            </div>
        );
    }

    const growthIsPositive = stats.users.userGrowthPct >= 0;

    return (
        <div className="space-y-8">
            <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold text-[#0B2C4A] tracking-tight">System Overview</h2>
                    <p className="text-gray-500 mt-2 text-lg">Real-time platform health, traction, and funding metrics.</p>
                </div>
                <div className="flex items-center gap-3 text-sm">
                    <span className="bg-green-50 text-green-700 px-3 py-1.5 rounded-full font-bold">
                        ● Live
                    </span>
                    <span className="text-gray-500">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                </div>
            </header>

            {/* Primary KPI Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KpiCard
                    title="Total Funding Volume"
                    value={`$${formatCurrency(stats.deals.totalVolume)}`}
                    sub={`${stats.deals.approved} closed deals · avg $${formatCurrency(stats.deals.avgDealSize)}`}
                    color="emerald"
                    icon={<DollarIcon />}
                />
                <KpiCard
                    title="Active Users"
                    value={stats.users.total}
                    sub={`${stats.users.entrepreneurs} Entrepreneurs · ${stats.users.investors} Investors`}
                    color="blue"
                    icon={<UsersIcon />}
                    delta={`${growthIsPositive ? '+' : ''}${stats.users.userGrowthPct}% MoM`}
                    deltaPositive={growthIsPositive}
                />
                <KpiCard
                    title="Live Pitches"
                    value={stats.pitches.approved}
                    sub={`${stats.pitches.totalViews.toLocaleString()} total views · ${stats.pitches.avgViews} avg`}
                    color="indigo"
                    icon={<RocketIcon />}
                />
                <KpiCard
                    title="Pending Approvals"
                    value={stats.users.pendingApproval + stats.pitches.pending}
                    sub={`${stats.users.pendingApproval} users · ${stats.pitches.pending} pitches`}
                    color="amber"
                    icon={<ClockIcon />}
                    actionHref="/admin/users"
                    actionLabel="Review →"
                />
            </div>

            {/* Secondary KPI Row */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <MiniStat label="Approval Rate" value={`${stats.pitches.approvalRate}%`} hint="Pitches approved" tone="green" />
                <MiniStat label="Deal Success" value={`${stats.deals.successRate}%`} hint="Approved vs closed" tone="emerald" />
                <MiniStat label="Avg Equity" value={`${stats.deals.avgEquity}%`} hint="Per deal" tone="purple" />
                <MiniStat label="Active Chats" value={stats.engagement.activeConversations} hint="In-progress deals" tone="blue" />
                <MiniStat label="Subscribers" value={stats.engagement.newsletterSubs} hint="Newsletter" tone="pink" />
                <MiniStat label="Blog Posts" value={stats.engagement.blogPosts} hint="Published" tone="indigo" />
            </div>

            {/* Charts Row 1: Trends */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ChartCard
                    title="User Growth"
                    subtitle="New registrations over the last 6 months"
                    badge="Monthly"
                >
                    <LineChart data={stats.trends.userGrowth} color="#0B2C4A" height={280} />
                </ChartCard>
                <ChartCard
                    title="Funding Volume Trend"
                    subtitle="Capital deployed via approved deals"
                    badge="Monthly"
                    badgeTone="emerald"
                >
                    <LineChart data={stats.trends.fundingVolume} color="#10b981" height={280} />
                </ChartCard>
            </div>

            {/* Charts Row 2: Distribution + Pitch trend */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <ChartCard
                    title="Pitch Submissions"
                    subtitle="New pitches per month"
                    badge="Monthly"
                    badgeTone="indigo"
                    className="lg:col-span-2"
                >
                    <BarChart data={stats.trends.pitchTrend} color="#3b82f6" height={280} />
                </ChartCard>
                <ChartCard
                    title="User Composition"
                    subtitle="Platform makeup"
                    badge="Live"
                >
                    {stats.distributions.userRoles.length > 0 ? (
                        <PieChart data={stats.distributions.userRoles} height={240} showLegend={true} />
                    ) : <EmptyState />}
                </ChartCard>
            </div>

            {/* Pitch Status & Top Pitches */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <ChartCard
                    title="Pitch Status Breakdown"
                    subtitle="Pipeline distribution"
                    badge="Live"
                    badgeTone="amber"
                >
                    {stats.distributions.pitchStatus.length > 0 ? (
                        <BarChart data={stats.distributions.pitchStatus} height={260} />
                    ) : <EmptyState />}
                </ChartCard>

                <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-xl font-bold text-[#0B2C4A]">Top Performing Pitches</h3>
                            <p className="text-sm text-gray-500">Most-viewed approved pitches</p>
                        </div>
                        <Link href="/admin/pitches" className="text-sm font-semibold text-[#0B2C4A] hover:underline">
                            View all →
                        </Link>
                    </div>
                    {stats.topPitches.length === 0 ? (
                        <div className="py-12 text-center text-gray-400">No approved pitches yet.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="text-xs text-gray-500 uppercase border-b border-gray-100">
                                    <tr>
                                        <th className="text-left py-2 font-semibold">#</th>
                                        <th className="text-left py-2 font-semibold">Business</th>
                                        <th className="text-left py-2 font-semibold">Industry</th>
                                        <th className="text-right py-2 font-semibold">Ask</th>
                                        <th className="text-right py-2 font-semibold">Views</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {stats.topPitches.map((p, i) => (
                                        <tr key={i} className="hover:bg-gray-50/60 transition">
                                            <td className="py-3 font-bold text-gray-400">{i + 1}</td>
                                            <td className="py-3 font-semibold text-[#0B2C4A]">{p.businessName}</td>
                                            <td className="py-3 text-gray-600">{p.industry}</td>
                                            <td className="py-3 text-right font-mono text-gray-700">${formatCurrency(p.amountRequired)}</td>
                                            <td className="py-3 text-right">
                                                <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs font-bold">
                                                    {p.views.toLocaleString()}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Activity Footer */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <ActivityCard label="Messages This Month" value={stats.engagement.messagesThisMonth} subtle={`${stats.engagement.totalMessages.toLocaleString()} total`} />
                <ActivityCard label="New Pitches This Month" value={stats.pitches.newThisMonth} subtle={`${stats.pitches.total} all-time`} />
                <ActivityCard label="New Deals This Month" value={stats.deals.newThisMonth} subtle={`${stats.deals.total} all-time`} />
                <ActivityCard label="Support Conversations" value={stats.engagement.supportConversations} subtle={`${stats.engagement.communityTopics} community topics`} />
            </div>
        </div>
    );
}

/* --- UI Subcomponents --- */

function KpiCard({ title, value, sub, color, icon, delta, deltaPositive, actionHref, actionLabel }: {
    title: string;
    value: string | number;
    sub: string;
    color: 'blue' | 'emerald' | 'indigo' | 'amber';
    icon: React.ReactNode;
    delta?: string;
    deltaPositive?: boolean;
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
        <div className={`bg-white p-6 rounded-2xl shadow-sm border-l-4 ${t.border} hover:shadow-md transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group`}>
            <div className="flex items-start justify-between mb-3">
                <div className={`p-2.5 rounded-xl ${t.bg} ${t.text}`}>{icon}</div>
                {delta && (
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${deltaPositive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {delta}
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

function MiniStat({ label, value, hint, tone }: { label: string; value: string | number; hint: string; tone: 'green' | 'emerald' | 'purple' | 'blue' | 'pink' | 'indigo' }) {
    const tones = {
        green: 'text-green-600',
        emerald: 'text-emerald-600',
        purple: 'text-purple-600',
        blue: 'text-blue-600',
        pink: 'text-pink-600',
        indigo: 'text-indigo-600',
    };
    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow transition">
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
            <div className="pb-4">{children}</div>
        </div>
    );
}

function ActivityCard({ label, value, subtle }: { label: string; value: number; subtle: string }) {
    return (
        <div className="bg-linear-to-br from-[#0B2C4A] to-[#173b62] text-white p-5 rounded-2xl shadow-md">
            <p className="text-xs font-bold uppercase tracking-wider opacity-70">{label}</p>
            <p className="text-3xl font-extrabold my-1">{value.toLocaleString()}</p>
            <p className="text-xs opacity-60">{subtle}</p>
        </div>
    );
}

function EmptyState() {
    return (
        <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-gray-400">
            <svg className="w-12 h-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
function UsersIcon() {
    return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
}
function RocketIcon() {
    return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
}
function ClockIcon() {
    return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
}
