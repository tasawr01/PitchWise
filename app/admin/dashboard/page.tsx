import dbConnect from '@/lib/db';
import Entrepreneur from '@/models/Entrepreneur';
import Investor from '@/models/Investor';
import Pitch from '@/models/Pitch';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import LineChart from '@/components/charts/LineChart';
import BarChart from '@/components/charts/BarChart';

// Helper to fetch stats on server
async function getStats() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return getZeroStats();

    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        await jwtVerify(token, secret); // Just verify validity

        await dbConnect();

        // 1. User Stats
        const totalEntrepreneurs = await Entrepreneur.countDocuments();
        const totalInvestors = await Investor.countDocuments();

        // 2. Pitch Stats
        const totalPitches = await Pitch.countDocuments();
        const pendingPitches = await Pitch.countDocuments({ status: 'pending' });
        const approvedPitches = await Pitch.countDocuments({ status: 'approved' });
        const rejectedPitches = await Pitch.countDocuments({ status: 'rejected' });

        return {
            users: {
                total: totalEntrepreneurs + totalInvestors,
                entrepreneurs: totalEntrepreneurs,
                investors: totalInvestors
            },
            pitches: {
                total: totalPitches,
                pending: pendingPitches,
                approved: approvedPitches,
                rejected: rejectedPitches
            },
            deals: {
                completed: 12, // Placeholder
                discarded: 5   // Placeholder
            }
        };
    } catch {
        return getZeroStats();
    }
}

function getZeroStats() {
    return {
        users: { total: 0, entrepreneurs: 0, investors: 0 },
        pitches: { total: 0, pending: 0, approved: 0, rejected: 0 },
        deals: { completed: 0, discarded: 0 }
    };
}

export default async function AdminOverview() {
    const stats = await getStats();

    // DUMMY CHART DATA (Visual Only)
    const userGrowthData = [
        { label: 'Jan', value: 120 },
        { label: 'Feb', value: 150 },
        { label: 'Mar', value: 240 },
        { label: 'Apr', value: 200 },
        { label: 'May', value: 280 },
        { label: 'Jun', value: 350 },
    ];

    const dealTrendsData = [
        { label: 'Q1', value: 12, color: '#10b981' }, // Green
        { label: 'Q2', value: 19, color: '#10b981' },
        { label: 'Q3', value: 15, color: '#f59e0b' }, // Orange (Pending)
        { label: 'Q4', value: 8, color: '#ef4444' },  // Red (Dropped)
    ];

    return (
        <div className="space-y-8">
            <header className="mb-8">
                <h2 className="text-3xl font-extrabold text-[#0B2C4A] tracking-tight">System Overview</h2>
                <p className="text-gray-500 mt-2 text-lg">Real-time insights and performance metrics.</p>
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Users"
                    value={stats.users.total}
                    sub={`${stats.users.entrepreneurs} Entrepreneurs, ${stats.users.investors} Investors`}
                    color="blue"
                    icon={<svg className="w-6 h-6 text-[#0B2C4A]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
                />
                <StatCard
                    title="Total Pitches"
                    value={stats.pitches.total}
                    sub={`${stats.pitches.pending} Pending Review`}
                    color="orange"
                    icon={<svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
                />
                <StatCard
                    title="Approved Pitches"
                    value={stats.pitches.approved}
                    sub={`+${stats.pitches.rejected} Rejected`}
                    color="green"
                    icon={<svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                />
                <StatCard
                    title="Completed Deals"
                    value={stats.deals.completed}
                    sub="Active Deals"
                    color="purple"
                    icon={<svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Admin Charts */}
                <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 h-[420px] transition-shadow hover:shadow-xl">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-[#0B2C4A]">User Growth</h3>
                            <p className="text-sm text-gray-500">New registrations over time</p>
                        </div>
                        <span className="bg-[#0B2C4A] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Monthly</span>
                    </div>
                    <div className="h-full pb-10">
                        <LineChart data={userGrowthData} color="#0B2C4A" height={280} />
                    </div>
                </div>
                <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 h-[420px] transition-shadow hover:shadow-xl">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-[#0B2C4A]">Deal Trends</h3>
                            <p className="text-sm text-gray-500">Quarterly deal performance</p>
                        </div>
                        <span className="bg-purple-50 text-purple-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">2026</span>
                    </div>
                    <div className="h-full pb-10">
                        <BarChart data={dealTrendsData} color="#0B2C4A" height={280} />
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, sub, color, icon }: any) {
    const colors: any = {
        blue: 'bg-blue-50 border-l-4 border-blue-500 text-blue-700',
        orange: 'bg-orange-50 border-l-4 border-orange-500 text-orange-700',
        green: 'bg-green-50 border-l-4 border-green-500 text-green-700',
        purple: 'bg-purple-50 border-l-4 border-purple-500 text-purple-700',
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group">
            {/* Background Icon Decoration */}
            <div className={`absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity`}>
                <div className="transform scale-150 text-[#0B2C4A]">
                    {icon}
                </div>
            </div>

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg ${colors[color].split(' ')[0]}`}>
                        {icon}
                    </div>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">{title}</p>
                </div>
                <h3 className="text-3xl font-extrabold text-[#0B2C4A] my-1">{value}</h3>
                <p className="text-xs text-gray-400 font-medium">{sub}</p>
            </div>
        </div>
    );
}
