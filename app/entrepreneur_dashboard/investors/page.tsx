export default function MyInvestors() {
    // Dummy Data
    const investors = [
        { id: 1, name: 'Alex Morgan', pitch: 'Ecoify', amount: '$50,000', status: 'In Progress', date: '2025-01-02' },
        { id: 2, name: 'Sarah Tech', pitch: 'HealthAI', amount: '$120,000', status: 'Completed', date: '2024-12-15' },
        { id: 3, name: 'Global Ventures', pitch: 'Ecoify', amount: '$0', status: 'Discarded', date: '2024-11-20' },
    ];

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800">My Investors</h2>
                <p className="text-gray-500">Track your conversations and deal progress.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-[#0B2C4A]">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Investor Name</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Pitch</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Deal Amount</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {investors.map((investor) => (
                                <tr key={investor.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{investor.name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">{investor.pitch}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-bold text-gray-800">{investor.amount}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${investor.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                                investor.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-gray-100 text-gray-800'}`}>
                                            {investor.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {investor.date}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button className="text-blue-600 hover:text-blue-900">Chat</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
