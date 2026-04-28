import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { redirect } from 'next/navigation';
import LineChart from '@/components/charts/LineChart';
import BarChart from '@/components/charts/BarChart';
import PieChart from '@/components/charts/PieChart';
import { getEntrepreneurStats, EntrepreneurStats } from '@/lib/entrepreneur-stats';
import { formatCurrency } from '@/lib/utils';

export const dynamic = 'force-dynamic';

async function loadStats(): Promise<EntrepreneurStats | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return null;
    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        if (payload.role !== 'entrepreneur') return null;
        return await getEntrepreneurStats(payload.id as string);
    } catch {
        return null;
    }
}

export default async function Analytics() {
    const stats = await loadStats();
    if (!stats) redirect('/login');

    const peakFunding = stats.trends.fundingTrend.reduce((acc, p) => p.value > acc.value ? p : acc, { label: '—', value: 0 });

    return (
        <div className="space-y-8">
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold text-[#0B2C4A] tracking-tight">Analytics</h2>
                    <p className="text-gray-500 mt-2 text-lg">Deep dive into how your pitches and deals are performing.</p>
                </div>
                <div className="bg-[#E8F1F8] text-[#0B2C4A] px-4 py-2 rounded-lg font-semibold text-sm">
                    Generated · {new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                </div>
            </div>

            {/* Headline */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Headline label="Total Views" value={stats.pitches.totalViews.toLocaleString()} sub={`${stats.pitches.avgViews} avg per pitch`} />
                <Headline label="Capital Raised" value={`Rs. ${formatCurrency(stats.deals.totalRaised)}`} sub={`${stats.deals.approved} closed deals`} />
                <Headline label="Avg Equity Given" value={`${stats.deals.avgEquityGiven}%`} sub="Per deal" />
                <Headline label="Avg Valuation" value={`Rs. ${formatCurrency(stats.funding.avgValuation)}`} sub="Across pitches" />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ChartCard title="Funding Raised Over Time" subtitle="Monthly capital received (last 6 months)">
                    <LineChart data={stats.trends.fundingTrend} color="#10b981" height={280} />
                </ChartCard>

                <ChartCard title="New Deals Closed" subtitle="Approved deals per month">
                    <BarChart data={stats.trends.dealsTrend} color="#0B2C4A" height={280} />
                </ChartCard>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ChartCard title="Investor Composition" subtitle="Type of investors who funded you">
                    {stats.distributions.investorTypes.length > 0 ? (
                        <PieChart data={stats.distributions.investorTypes} height={250} showLegend={true} />
                    ) : <EmptyState label="No closed deals yet" />}
                </ChartCard>

                <ChartCard title="Pitch Pipeline" subtitle="Status of all your pitches">
                    {stats.distributions.pitchStatus.length > 0 ? (
                        <PieChart data={stats.distributions.pitchStatus} height={250} showLegend={true} />
                    ) : <EmptyState label="No pitches yet" />}
                </ChartCard>

                <ChartCard title="Deal Outcomes" subtitle="Investor responses">
                    {stats.distributions.dealStatus.length > 0 ? (
                        <PieChart data={stats.distributions.dealStatus} height={250} showLegend={true} />
                    ) : <EmptyState label="No deals yet" />}
                </ChartCard>
            </div>

            {/* Pipeline Health */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ChartCard title="Conversation Pipeline" subtitle="Where deal conversations stand">
                    <PipelineHealth stats={stats} />
                </ChartCard>

                <ChartCard title="Views Per Pitch" subtitle="Top 6 pitches by view count">
                    {stats.distributions.viewsPerPitch.length > 0 ? (
                        <BarChart data={stats.distributions.viewsPerPitch} height={260} />
                    ) : <EmptyState label="Pitches need to go live to gain views" />}
                </ChartCard>
            </div>

            {/* Insights */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <h3 className="font-bold text-[#0B2C4A] mb-2 text-lg">Key Insights</h3>
                <p className="text-sm text-gray-500 mb-6">Auto-generated highlights from your data</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {buildInsights(stats, peakFunding).map((it, i) => (
                        <div key={i} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <span className="text-2xl shrink-0">{it.icon}</span>
                            <p className="text-gray-700 font-medium text-sm leading-relaxed">{it.text}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function Headline({ label, value, sub }: { label: string; value: string; sub: string }) {
    return (
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">{label}</p>
            <p className="text-2xl font-extrabold text-[#0B2C4A] my-1">{value}</p>
            <p className="text-xs text-gray-400">{sub}</p>
        </div>
    );
}

function ChartCard({ title, subtitle, children, className = '' }: {
    title: string;
    subtitle: string;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={`bg-white p-8 rounded-2xl shadow-lg border border-gray-100 ${className}`}>
            <div className="mb-4">
                <h3 className="text-lg font-bold text-[#0B2C4A]">{title}</h3>
                <p className="text-sm text-gray-500">{subtitle}</p>
            </div>
            {children}
        </div>
    );
}

function PipelineHealth({ stats }: { stats: EntrepreneurStats }) {
    const total = stats.pipeline.activeChats + stats.pipeline.completedChats + stats.pipeline.discardedChats;
    if (total === 0) return <EmptyState label="No conversations yet" />;
    const items = [
        { label: 'In Progress', value: stats.pipeline.activeChats, color: '#f59e0b' },
        { label: 'Completed', value: stats.pipeline.completedChats, color: '#10b981' },
        { label: 'Discarded', value: stats.pipeline.discardedChats, color: '#ef4444' },
    ];
    return (
        <div className="space-y-3 pt-2">
            {items.map((it, i) => {
                const pct = Math.round((it.value / total) * 100);
                return (
                    <div key={i}>
                        <div className="flex items-center justify-between text-sm mb-1">
                            <span className="font-medium text-gray-700">{it.label}</span>
                            <span className="font-bold text-[#0B2C4A]">{it.value} <span className="text-gray-400 font-normal">({pct}%)</span></span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: it.color }} />
                        </div>
                    </div>
                );
            })}
            <div className="pt-3 mt-3 border-t border-gray-100 text-xs text-gray-500">
                <span className="font-bold text-[#0B2C4A]">{total}</span> total conversations · {stats.pipeline.uniqueInvestors} unique investors
            </div>
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

function buildInsights(stats: EntrepreneurStats, peakFunding: { label: string; value: number }): { icon: string; text: string }[] {
    const out: { icon: string; text: string }[] = [];

    if (stats.pitches.topPitch) {
        out.push({
            icon: '🏆',
            text: `Your top pitch "${stats.pitches.topPitch.businessName}" leads with ${stats.pitches.topPitch.views.toLocaleString()} views in the ${stats.pitches.topPitch.industry} industry.`,
        });
    }

    if (stats.deals.approved > 0) {
        out.push({
            icon: '💰',
            text: `You've raised Rs. ${formatCurrency(stats.deals.totalRaised)} across ${stats.deals.approved} deal${stats.deals.approved === 1 ? '' : 's'}, giving up an average ${stats.deals.avgEquityGiven}% equity per deal.`,
        });
    }

    if (stats.funding.targetTotal > 0) {
        out.push({
            icon: '🎯',
            text: `${stats.funding.raisedPercent}% of your total funding target (Rs. ${formatCurrency(stats.funding.targetTotal)}) has been raised so far.`,
        });
    }

    if (stats.pipeline.watchlistedBy > 0) {
        out.push({
            icon: '👁️',
            text: `${stats.pipeline.watchlistedBy} investor${stats.pipeline.watchlistedBy === 1 ? ' has' : 's have'} added your pitches to their watchlist — warm leads worth re-engaging.`,
        });
    }

    if (stats.pipeline.activeChats > 0) {
        out.push({
            icon: '💬',
            text: `${stats.pipeline.activeChats} active deal conversation${stats.pipeline.activeChats === 1 ? ' is' : 's are'} in progress${stats.pipeline.unreadMessages > 0 ? `, with ${stats.pipeline.unreadMessages} unread message${stats.pipeline.unreadMessages === 1 ? '' : 's'} waiting on you` : ''}.`,
        });
    }

    if (peakFunding.value > 0) {
        out.push({
            icon: '📈',
            text: `Your strongest funding month was ${peakFunding.label} with Rs. ${formatCurrency(peakFunding.value)} raised.`,
        });
    }

    if (stats.pitches.pending > 0) {
        out.push({
            icon: '⏳',
            text: `${stats.pitches.pending} of your pitches ${stats.pitches.pending === 1 ? 'is' : 'are'} pending admin review.`,
        });
    }

    if (out.length === 0) {
        out.push({ icon: '🚀', text: 'Submit your first pitch to start receiving investor interest and analytics.' });
    }

    return out.slice(0, 6);
}
