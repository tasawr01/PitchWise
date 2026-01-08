import dbConnect from '@/lib/db';
import Pitch from '@/models/Pitch';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import LineChart from '@/components/charts/LineChart';
import RecentActivity from '@/components/entrepreneur/RecentActivity';

// Fetch specific stats
async function getStats() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return { props: { pitchCount: 0, views: 0 } };

    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        await dbConnect();

        const pitchCount = await Pitch.countDocuments({ entrepreneur: payload.id });
        // Aggregate views (Basic sum)
        const pitches = await Pitch.find({ entrepreneur: payload.id }).select('views');
        const views = pitches.reduce((acc, curr) => acc + (curr.views || 0), 0);

        return { pitchCount, views };
    } catch {
        return { pitchCount: 0, views: 0 };
    }
}

export default async function EntrepreneurOverview() {
    const { pitchCount, views } = await getStats();

    // DUMMY DATA for "Active Chats" and "Completed Deals"
    const activeChats = 3;
    const completedDeals = 1;

    return (
        <div className="space-y-8">
            <header className="mb-8">
                <h2 className="text-3xl font-extrabold text-[#0B2C4A] tracking-tight">Dashboard Overview</h2>
                <p className="text-gray-500 mt-2 text-lg">Welcome back! Here's what's happening with your startup.</p>
            </header>

            {/* Stats Grid - Matching Admin Style */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Pitches"
                    value={pitchCount}
                    sub="Live and Pending"
                    color="blue"
                    icon={<svg className="w-6 h-6 text-[#0B2C4A]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
                />
                <StatCard
                    title="Active Chats"
                    value={activeChats}
                    sub="Investor Interest"
                    color="green"
                    icon={<svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>}
                />
                <StatCard
                    title="Completed Deals"
                    value={completedDeals}
                    sub="Funding Secured"
                    color="purple"
                    icon={<svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                />
                <StatCard
                    title="Total Views"
                    value={views}
                    sub="All Time Reach"
                    color="orange"
                    icon={<svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Main Chart Area */}
                <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 h-[420px] transition-shadow hover:shadow-xl">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-[#0B2C4A]">Pitch Performance</h3>
                            <p className="text-sm text-gray-500">Weekly view analytics</p>
                        </div>
                        <span className="bg-[#0B2C4A] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Weekly</span>
                    </div>
                    <div className="h-full pb-10">
                        {/* Dummy Data for Entrepreneur View */}
                        <LineChart
                            data={[
                                { label: 'Mon', value: 40 },
                                { label: 'Tue', value: 65 },
                                { label: 'Wed', value: 45 },
                                { label: 'Thu', value: 80 },
                                { label: 'Fri', value: 55 },
                                { label: 'Sat', value: 90 },
                                { label: 'Sun', value: 70 },
                            ]}
                            color="#0B2C4A"
                            height={280}
                        />
                    </div>
                </div>

                {/* Recent Activity */}
                <RecentActivity />
            </div>
        </div>
    );
}

// Updated StatCard to match Admin dashboard style (Colored Left Border)
function StatCard({ title, value, sub, color, icon }: any) {
    const colors: any = {
        blue: 'bg-blue-50 border-l-4 border-blue-500 text-blue-700',
        orange: 'bg-orange-50 border-l-4 border-orange-500 text-orange-700',
        green: 'bg-green-50 border-l-4 border-green-500 text-green-700',
        purple: 'bg-purple-50 border-l-4 border-purple-500 text-purple-700',
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group">
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
