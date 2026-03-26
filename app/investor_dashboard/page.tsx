import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/db';
import Investor from '@/models/Investor';
import Deal from '@/models/Deal';
import { jwtVerify } from 'jose';
import { formatCurrency } from '@/lib/utils';
import LineChart from '@/components/charts/LineChart';
import InvestorRecentActivity from '@/components/investor/InvestorRecentActivity';

export const dynamic = 'force-dynamic';

// Fetch Investor Stats
async function getInvestorStats() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return null;

    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);

        if (payload.role !== 'investor') return null;

        await dbConnect();

        // Fetch User with watchlist
        const user = await Investor.findById(payload.id).select('-password');

        // Fetch Deals
        const deals = await Deal.find({ investor: payload.id });

        // Calculate Stats
        const totalInvested = deals
            .filter(d => d.status === 'approved' || d.status === 'completed')
            .reduce((acc, curr) => acc + (curr.amount || 0), 0);

        const pendingDeals = deals.filter(d => d.status === 'pending').length;
        const completedDeals = deals.filter(d => d.status === 'approved' || d.status === 'completed').length;
        const watchlistCount = user.watchlist ? user.watchlist.length : 0;

        return {
            user: JSON.parse(JSON.stringify(user)),
            stats: {
                totalInvested,
                pendingDeals,
                completedDeals,
                watchlistCount
            }
        };
    } catch (error) {
        return null;
    }
}

export default async function InvestorDashboard() {
    const data = await getInvestorStats();

    if (!data) {
        redirect('/login');
    }

    const { user, stats } = data;

    return (
        <div className="space-y-8">
            <header className="mb-8">
                <h2 className="text-3xl font-extrabold text-[#0B2C4A] tracking-tight">Dashboard Overview</h2>
                <p className="text-gray-500 mt-2 text-lg">Welcome back, {user.fullName}! Here's your investment portfolio summary.</p>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Invested"
                    value={`Rs. ${formatCurrency(stats.totalInvested)}`}
                    sub="Deployment"
                    color="blue"
                    icon={<svg className="w-6 h-6 text-[#0B2C4A]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                />
                <StatCard
                    title="Pending Deals"
                    value={stats.pendingDeals}
                    sub="Awaiting Your Signature"
                    color="green"
                    icon={<svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                />
                <StatCard
                    title="Watchlist"
                    value={stats.watchlistCount}
                    sub="Saved Pitches"
                    color="purple"
                    icon={<svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>}
                />
                <StatCard
                    title="Completed Deals"
                    value={stats.completedDeals}
                    sub="Funding Secured"
                    color="orange"
                    icon={<svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Main Chart Area */}
                <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 h-[420px] transition-shadow hover:shadow-xl">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-[#0B2C4A]">Portfolio Growth</h3>
                            <p className="text-sm text-gray-500">Projected vs Actual Returns</p>
                        </div>
                        <span className="bg-[#0B2C4A] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">YTD</span>
                    </div>
                    <div className="h-full pb-10">
                        {/* Dummy Data for Investor View */}
                        <LineChart
                            data={[
                                { label: 'Jan', value: 1000 },
                                { label: 'Feb', value: 3000 },
                                { label: 'Mar', value: 4500 },
                                { label: 'Apr', value: 4000 },
                                { label: 'May', value: 6000 },
                                { label: 'Jun', value: 8500 },
                                { label: 'Jul', value: 9000 },
                            ]}
                            color="#0B2C4A"
                            height={280}
                        />
                    </div>
                </div>

                {/* Recent Activity */}
                <InvestorRecentActivity />
            </div>
        </div>
    );
}

// Reusable StatCard (Same as Entrepreneur Dashboard)
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
