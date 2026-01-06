export default function AdminReports() {
    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Reports & Analytics</h2>
            <div className="grid grid-cols-2 gap-6">
                <div className="bg-white h-64 border rounded flex items-center justify-center text-gray-400">Conversion Funnel Chart</div>
                <div className="bg-white h-64 border rounded flex items-center justify-center text-gray-400">Industry Funding Pie Chart</div>
                <div className="bg-white h-64 border rounded flex items-center justify-center text-gray-400">Deal Success Rate</div>
            </div>
        </div>
    );
}
