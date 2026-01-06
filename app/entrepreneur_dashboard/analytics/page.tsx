export default function Analytics() {
    return (
        <div>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Analytics</h2>
                <p className="text-gray-500">Deep dive into your startup's performance.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-4">Total Views vs. Engagement</h3>
                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded text-gray-400">
                        [Graph Placeholder: Line Chart]
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-4">Investor Demographics</h3>
                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded text-gray-400">
                        [Graph Placeholder: Pie Chart]
                    </div>
                </div>
            </div>
        </div>
    );
}
