import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import BarChart from '@/components/charts/BarChart';
import PieChart from '@/components/charts/PieChart';
import LineChart from '@/components/charts/LineChart';
import { getAdminStats, AdminStats } from '@/lib/admin-stats';
import { formatCurrency } from '@/lib/utils';

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

export default async function AdminReports() {
    const stats = await safeGetStats();

    if (!stats) {
        return (
            <div className="p-8 text-center text-red-500">
                Unable to load reports. Please re-authenticate.
            </div>
        );
    }

    const insights = buildInsights(stats);

    const peakFunding = stats.trends.fundingVolume.reduce((acc, p) => p.value > acc.value ? p : acc, { label: '—', value: 0 });
    const peakSignups = stats.trends.userGrowth.reduce((acc, p) => p.value > acc.value ? p : acc, { label: '—', value: 0 });

    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold text-[#0B2C4A] tracking-tight">Reports & Analytics</h2>
                    <p className="text-gray-500 mt-2 text-lg">Conversion, distribution, and performance analytics across the platform.</p>
                </div>
                <div className="bg-[#E8F1F8] text-[#0B2C4A] px-4 py-2 rounded-lg font-semibold text-sm">
                    Generated · {new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                </div>
            </header>

            {/* Headline Numbers */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Headline
                    label="Total Funded"
                    value={`$${formatCurrency(stats.deals.totalVolume)}`}
                    sub="Across all approved deals"
                />
                <Headline
                    label="Avg. Deal Size"
                    value={`$${formatCurrency(stats.deals.avgDealSize)}`}
                    sub={`${stats.deals.avgEquity}% avg equity`}
                />
                <Headline
                    label="Approval Rate"
                    value={`${stats.pitches.approvalRate}%`}
                    sub={`${stats.pitches.approved}/${stats.pitches.approved + stats.pitches.rejected + stats.pitches.permanentlyRejected} reviewed`}
                />
                <Headline
                    label="Deal Success"
                    value={`${stats.deals.successRate}%`}
                    sub={`${stats.deals.approved} won · ${stats.deals.rejected} lost`}
                />
            </div>

            {/* Conversion Funnel + Industry */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard title="Platform Conversion Funnel" subtitle="From sign-up to closed deal">
                    {stats.funnel.some(p => p.value > 0) ? (
                        <>
                            <BarChart data={stats.funnel} height={260} color="#0B2C4A" />
                            <FunnelStats funnel={stats.funnel} />
                        </>
                    ) : <EmptyState />}
                </ChartCard>

                <ChartCard title="Pitch Distribution by Industry" subtitle="Top sectors on the platform">
                    {stats.distributions.industries.length > 0 ? (
                        <PieChart data={stats.distributions.industries} height={260} showLegend={true} />
                    ) : <EmptyState />}
                </ChartCard>
            </div>

            {/* Funding trend + Stage distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <ChartCard
                    title="Funding Volume Over Time"
                    subtitle="Capital deployed via approved deals (last 6 months)"
                    className="lg:col-span-2"
                >
                    <LineChart data={stats.trends.fundingVolume} color="#10b981" height={260} />
                </ChartCard>

                <ChartCard title="Pitches by Stage" subtitle="Where startups are in their journey">
                    {stats.distributions.pitchStages.length > 0 ? (
                        <BarChart data={stats.distributions.pitchStages} height={260} />
                    ) : <EmptyState />}
                </ChartCard>
            </div>

            {/* Deal Outcome + Investor Type + Acquisition */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <ChartCard title="Deal Outcomes" subtitle="Success vs failure">
                    {stats.distributions.dealsStatus.length > 0 ? (
                        <PieChart data={stats.distributions.dealsStatus} height={220} showLegend={true} />
                    ) : <EmptyState />}
                </ChartCard>

                <ChartCard title="Investor Types" subtitle="Composition of investor base">
                    {stats.distributions.investorTypes.length > 0 ? (
                        <PieChart data={stats.distributions.investorTypes} height={220} showLegend={true} />
                    ) : <EmptyState />}
                </ChartCard>

                <ChartCard title="Acquisition Channels" subtitle="How entrepreneurs found us">
                    {stats.acquisitionSources.length > 0 ? (
                        <BarChart data={stats.acquisitionSources} height={220} />
                    ) : <EmptyState />}
                </ChartCard>
            </div>

            {/* Conversation health + Top pitches */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <ChartCard title="Deal Pipeline Health" subtitle="Status of all pitch conversations">
                    <ConversationHealth stats={stats} />
                </ChartCard>

                <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                    <h3 className="font-bold text-[#0B2C4A] mb-2 text-lg">Top Performing Pitches</h3>
                    <p className="text-sm text-gray-500 mb-4">Most-viewed approved pitches</p>
                    {stats.topPitches.length === 0 ? (
                        <div className="py-12 text-center text-gray-400">No approved pitches yet.</div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead className="text-xs text-gray-500 uppercase border-b border-gray-100">
                                <tr>
                                    <th className="text-left py-2 font-semibold">Business</th>
                                    <th className="text-left py-2 font-semibold">Industry</th>
                                    <th className="text-right py-2 font-semibold">Asking</th>
                                    <th className="text-right py-2 font-semibold">Views</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {stats.topPitches.map((p, i) => (
                                    <tr key={i} className="hover:bg-gray-50/60">
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
                    )}
                </div>
            </div>

            {/* Key Insights */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <h3 className="font-bold text-[#0B2C4A] mb-2 text-lg">Key Insights</h3>
                <p className="text-sm text-gray-500 mb-6">Auto-generated highlights from current platform data</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {insights.map((it, i) => (
                        <div key={i} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <span className="text-2xl shrink-0">{it.icon}</span>
                            <p className="text-gray-700 font-medium text-sm leading-relaxed">{it.text}</p>
                        </div>
                    ))}
                    <div className="flex items-start gap-3 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                        <span className="text-2xl shrink-0">📈</span>
                        <p className="text-gray-700 font-medium text-sm leading-relaxed">
                            Peak sign-up month: <strong>{peakSignups.label}</strong> with <strong>{peakSignups.value}</strong> new users.
                            Peak funding month: <strong>{peakFunding.label}</strong> at <strong>${formatCurrency(peakFunding.value)}</strong>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* --- Subcomponents --- */

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
        <div className={`bg-white p-8 rounded-2xl shadow-lg border border-gray-100 transition-shadow hover:shadow-xl ${className}`}>
            <div className="mb-4">
                <h3 className="text-lg font-bold text-[#0B2C4A]">{title}</h3>
                <p className="text-sm text-gray-500">{subtitle}</p>
            </div>
            <div>{children}</div>
        </div>
    );
}

function FunnelStats({ funnel }: { funnel: { label: string; value: number }[] }) {
    if (funnel.length < 2 || funnel[0].value === 0) return null;
    const overall = Math.round((funnel[funnel.length - 1].value / funnel[0].value) * 100 * 100) / 100;
    return (
        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-4 text-xs">
            {funnel.slice(1).map((step, i) => {
                const prev = funnel[i].value;
                const rate = prev > 0 ? Math.round((step.value / prev) * 100) : 0;
                return (
                    <div key={i} className="flex flex-col">
                        <span className="text-gray-400 font-medium">{funnel[i].label} → {step.label}</span>
                        <span className="font-bold text-[#0B2C4A]">{rate}%</span>
                    </div>
                );
            })}
            <div className="ml-auto flex flex-col">
                <span className="text-gray-400 font-medium">Overall</span>
                <span className="font-bold text-emerald-600">{overall}%</span>
            </div>
        </div>
    );
}

function ConversationHealth({ stats }: { stats: AdminStats }) {
    const total = stats.engagement.activeConversations + stats.engagement.completedConversations + stats.engagement.discardedConversations;
    const items = [
        { label: 'In Progress', value: stats.engagement.activeConversations, color: '#f59e0b' },
        { label: 'Completed', value: stats.engagement.completedConversations, color: '#10b981' },
        { label: 'Discarded', value: stats.engagement.discardedConversations, color: '#ef4444' },
    ];
    if (total === 0) return <EmptyState />;
    return (
        <div className="space-y-3 pt-2">
            {items.map((it, i) => {
                const pct = total > 0 ? Math.round((it.value / total) * 100) : 0;
                return (
                    <div key={i}>
                        <div className="flex items-center justify-between text-sm mb-1">
                            <span className="font-medium text-gray-700">{it.label}</span>
                            <span className="font-bold text-[#0B2C4A]">{it.value} <span className="text-gray-400 font-normal">({pct}%)</span></span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: it.color }} />
                        </div>
                    </div>
                );
            })}
            <div className="pt-3 mt-3 border-t border-gray-100 text-xs text-gray-500">
                <span className="font-bold text-[#0B2C4A]">{total}</span> total deal conversations · {stats.engagement.totalMessages.toLocaleString()} messages exchanged
            </div>
        </div>
    );
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

function buildInsights(stats: AdminStats): { icon: string; text: string }[] {
    const out: { icon: string; text: string }[] = [];

    const topIndustry = stats.distributions.industries[0];
    if (topIndustry) {
        const totalIndustryPitches = stats.distributions.industries.reduce((acc, p) => acc + p.value, 0);
        const pct = totalIndustryPitches > 0 ? Math.round((topIndustry.value / totalIndustryPitches) * 100) : 0;
        out.push({
            icon: '💡',
            text: `${topIndustry.label} dominates pitch submissions at ${pct}% (${topIndustry.value} pitches), signaling where the platform's strongest deal flow lives.`,
        });
    }

    const growth = stats.users.userGrowthPct;
    if (stats.users.newThisMonth > 0 || stats.users.newLastMonth > 0) {
        out.push({
            icon: growth >= 0 ? '🚀' : '📉',
            text: `User sign-ups are ${growth >= 0 ? 'up' : 'down'} ${Math.abs(growth)}% month-over-month — ${stats.users.newThisMonth} new users this month vs ${stats.users.newLastMonth} last month.`,
        });
    }

    if (stats.deals.approved > 0) {
        out.push({
            icon: '💰',
            text: `Average deal closes at $${formatCurrency(stats.deals.avgDealSize)} for ${stats.deals.avgEquity}% equity, deploying $${formatCurrency(stats.deals.totalVolume)} in total capital.`,
        });
    }

    if (stats.pitches.approved + stats.pitches.rejected > 0) {
        out.push({
            icon: '✅',
            text: `${stats.pitches.approvalRate}% of reviewed pitches make it through approval (${stats.pitches.approved} approved · ${stats.pitches.rejected + stats.pitches.permanentlyRejected} rejected).`,
        });
    }

    if (stats.users.pendingApproval > 0 || stats.pitches.pending > 0) {
        out.push({
            icon: '⏱️',
            text: `${stats.users.pendingApproval} user${stats.users.pendingApproval === 1 ? '' : 's'} and ${stats.pitches.pending} pitch${stats.pitches.pending === 1 ? '' : 'es'} are awaiting admin review.`,
        });
    }

    const topStage = stats.distributions.pitchStages[0];
    if (topStage) {
        out.push({
            icon: '🏗️',
            text: `Most pitches are at the "${topStage.label}" stage (${topStage.value} startups), shaping the typical investor opportunity.`,
        });
    }

    if (stats.engagement.activeConversations > 0) {
        out.push({
            icon: '💬',
            text: `${stats.engagement.activeConversations} active deal conversations in progress, with ${stats.engagement.totalMessages.toLocaleString()} messages exchanged platform-wide.`,
        });
    }

    if (stats.pitches.totalViews > 0) {
        out.push({
            icon: '👁️',
            text: `Pitches have been viewed ${stats.pitches.totalViews.toLocaleString()} times in total — averaging ${stats.pitches.avgViews} views per pitch.`,
        });
    }

    return out.slice(0, 5);
}
