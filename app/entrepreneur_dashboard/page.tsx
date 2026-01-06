import dbConnect from '@/lib/db';
import Pitch from '@/models/Pitch';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

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
        <div>
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
                <p className="text-gray-500">Welcome back! Here's what's happening with your startup.</p>
            </div>

            {/* Stats Grid - Matching Admin Style */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="Total Pitches" value={pitchCount} sub="Live and Pending" color="blue" />
                <StatCard title="Active Chats" value={activeChats} sub="Investor Interest" color="green" />
                <StatCard title="Completed Deals" value={completedDeals} sub="Funding Secured" color="purple" />
                <StatCard title="Total Views" value={views} sub="All Time Reach" color="orange" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Chart Area */}
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="font-bold text-gray-700 mb-4">Pitch Performance</h3>
                    <div className="h-64 flex items-end justify-between px-4 space-x-2">
                        {/* Dummy Bar Chart */}
                        {[40, 65, 45, 80, 55, 90, 70].map((height, i) => (
                            <div key={i} className="w-full bg-blue-50 rounded-t-md relative group">
                                <div
                                    className="absolute bottom-0 w-full bg-blue-500 rounded-t-md transition-all duration-500 hover:bg-blue-600"
                                    style={{ height: `${height}%` }}
                                ></div>
                                <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded transition-opacity">
                                    {height * 10} Views
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-4 text-xs text-gray-400">
                        <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="font-bold text-gray-700 mb-4">Recent Activity</h3>
                    <ul className="space-y-4">
                        <ActivityItem text="Investor Alex viewed your 'AI Health' pitch" time="2h ago" />
                        <ActivityItem text="New message from Sarah regarding 'GreenEnergy'" time="5h ago" />
                        <ActivityItem text="Pitch 'TechEdu' was approved by Admin" time="1d ago" />
                        <ActivityItem text="Profile updated successfully" time="2d ago" />
                    </ul>
                </div>
            </div>
        </div>
    );
}

// Updated StatCard to match Admin dashboard style (Colored Left Border)
function StatCard({ title, value, sub, color }: any) {
    const colors: any = {
        blue: 'border-l-4 border-blue-500',
        green: 'border-l-4 border-green-500',
        purple: 'border-l-4 border-purple-500',
        orange: 'border-l-4 border-orange-500',
    };

    return (
        <div className={`bg-white p-6 rounded-lg shadow-sm ${colors[color]}`}>
            <p className="text-gray-500 text-sm font-medium uppercase">{title}</p>
            <h3 className="text-3xl font-bold text-gray-800 my-1">{value}</h3>
            <p className="text-xs text-gray-400">{sub}</p>
        </div>
    );
}

function ActivityItem({ text, time }: any) {
    return (
        <li className="flex items-start space-x-3 text-sm">
            <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-400 flex-shrink-0"></div>
            <div>
                <p className="text-gray-700">{text}</p>
                <span className="text-gray-400 text-xs">{time}</span>
            </div>
        </li>
    );
}
