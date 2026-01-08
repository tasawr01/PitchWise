import BarChart from "@/components/charts/BarChart";
import PieChart from "@/components/charts/PieChart";

export default function AdminReports() {
    // DUMMY DATA FOR REPORTS
    const funnelData = [
        { label: 'Visitors', value: 5000, color: '#3b82f6' },
        { label: 'Signups', value: 1200, color: '#6366f1' },
        { label: 'Pitches', value: 450, color: '#8b5cf6' },
        { label: 'Deals', value: 45, color: '#ec4899' },
    ];

    const industryData = [
        { label: 'Technology', value: 45, color: '#3b82f6' }, // Blue
        { label: 'Healthcare', value: 25, color: '#10b981' }, // Green
        { label: 'Finance', value: 20, color: '#f59e0b' },   // Orange
        { label: 'Consumer', value: 10, color: '#ec4899' },  // Pink
    ];

    const successRateData = [
        { label: 'Successful', value: 35, color: '#10b981' },
        { label: 'Failed', value: 65, color: '#ef4444' },
    ];

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-extrabold text-[#0B2C4A] tracking-tight">Reports & Analytics</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Conversion Funnel */}
                <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 h-96 transition-shadow hover:shadow-xl">
                    <h3 className="font-bold text-[#0B2C4A] mb-6 text-lg">Platform Conversion Funnel</h3>
                    <BarChart data={funnelData} height={280} color="#0B2C4A" />
                </div>

                {/* Industry Breakdown */}
                <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 h-96 transition-shadow hover:shadow-xl">
                    <h3 className="font-bold text-[#0B2C4A] mb-6 text-lg">Funding by Industry</h3>
                    <PieChart data={industryData} height={250} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Deal Success */}
                <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 h-96">
                    <h3 className="font-bold text-[#0B2C4A] mb-6 text-lg">Deal Success Rate</h3>
                    <PieChart data={successRateData} height={220} showLegend={true} />
                </div>

                {/* Detailed Insights */}
                <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-lg border border-gray-100 h-96 overflow-y-auto">
                    <h3 className="font-bold text-[#0B2C4A] mb-4 text-lg">Key Insights</h3>
                    <div className="space-y-3">
                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                            <span className="text-2xl">💡</span>
                            <p className="text-gray-700 font-medium">Technology sector continues to dominate funding requests (45%), indicating a strong market trend towards digital solutions.</p>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                            <span className="text-2xl">📈</span>
                            <p className="text-gray-700 font-medium">Visitor-to-Signup conversion has increased by 12% this month, showing improved landing page effectiveness.</p>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                            <span className="text-2xl">🏥</span>
                            <p className="text-gray-700 font-medium">Healthcare startups are seeing higher average investment amounts, averaging $150k per round.</p>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                            <span className="text-2xl">⏱️</span>
                            <p className="text-gray-700 font-medium">Most deals are closed within 45 days of initial contact, a 5-day improvement from last quarter.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
