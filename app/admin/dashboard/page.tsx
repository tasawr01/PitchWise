'use client';

import { useEffect, useState } from 'react';

export default function AdminOverview() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/stats')
            .then(res => res.json())
            .then(data => {
                setStats(data);
                setLoading(false);
            });
    }, []);

    if (loading) return <div>Loading Stats...</div>;

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">System Overview</h2>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="Total Users" value={stats.users.total} sub={`${stats.users.entrepreneurs} Entrepreneurs, ${stats.users.investors} Investors`} color="blue" />
                <StatCard title="Total Pitches" value={stats.pitches.total} sub={`${stats.pitches.pending} Pending Review`} color="orange" />
                <StatCard title="Approved Pitches" value={stats.pitches.approved} sub={`+${stats.pitches.rejected} Rejected`} color="green" />
                <StatCard title="Completed Deals" value={stats.deals.completed} sub="Dummy Metric" color="purple" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-80">
                    <h3 className="font-bold text-gray-700 mb-4">User Growth (Monthly)</h3>
                    <div className="h-full flex items-center justify-center text-gray-400 bg-gray-50 rounded">
                        [Line Chart Placeholder]
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-80">
                    <h3 className="font-bold text-gray-700 mb-4">Deal Trends</h3>
                    <div className="h-full flex items-center justify-center text-gray-400 bg-gray-50 rounded">
                        [Bar Chart Placeholder]
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, sub, color }: any) {
    const colors: any = {
        blue: 'border-l-4 border-blue-500',
        orange: 'border-l-4 border-orange-500',
        green: 'border-l-4 border-green-500',
        purple: 'border-l-4 border-purple-500',
    };
    return (
        <div className={`bg-white p-6 rounded-lg shadow-sm ${colors[color]}`}>
            <p className="text-gray-500 text-sm font-medium uppercase">{title}</p>
            <h3 className="text-3xl font-bold text-gray-800 my-1">{value}</h3>
            <p className="text-xs text-gray-400">{sub}</p>
        </div>
    );
}
