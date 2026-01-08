import LineChart from '@/components/charts/LineChart';
import PieChart from '@/components/charts/PieChart';

export default function Analytics() {
    return (
        <div className="space-y-6">
            <div className="mb-6">
                <h2 className="text-3xl font-extrabold text-[#0B2C4A] tracking-tight">Analytics</h2>
                <p className="text-gray-500 mt-2 text-lg">Deep dive into your startup's performance.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 h-96 transition-shadow hover:shadow-xl">
                    <h3 className="font-bold text-[#0B2C4A] mb-6 text-lg">Total Views vs. Engagement</h3>
                    <LineChart
                        data={[
                            { label: 'Week 1', value: 120 },
                            { label: 'Week 2', value: 180 },
                            { label: 'Week 3', value: 250 },
                            { label: 'Week 4', value: 310 },
                        ]}
                        color="#0B2C4A"
                        height={280}
                    />
                </div>
                <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 h-96 transition-shadow hover:shadow-xl">
                    <h3 className="font-bold text-[#0B2C4A] mb-6 text-lg">Investor Demographics</h3>
                    <PieChart
                        data={[
                            { label: 'Venture Capital', value: 40, color: '#0B2C4A' },
                            { label: 'Angel Investors', value: 35, color: '#10b981' },
                            { label: 'Corporate', value: 15, color: '#f59e0b' },
                            { label: 'Other', value: 10, color: '#64748b' },
                        ]}
                        height={250}
                    />
                </div>
            </div>
        </div>
    );
}
