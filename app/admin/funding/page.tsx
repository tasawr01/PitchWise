export default function AdminFunding() {
    // Dummy Deals Data
    const deals = [
        { id: 1, investor: 'Global VC', entrepreneur: 'Alex Morgan', startup: 'Ecoify', amount: '$50,000', date: '2025-01-02' },
        { id: 2, investor: 'Sarah Tech', entrepreneur: 'John Doe', startup: 'HealthAI', amount: '$120,000', date: '2024-12-15' },
        { id: 3, investor: 'NextGen Capital', entrepreneur: 'Emily Chen', startup: 'RoboWorks', amount: '$250,000', date: '2024-11-20' },
        { id: 4, investor: 'Angel Group', entrepreneur: 'Michael Ross', startup: 'FoodieApp', amount: '$15,000', date: '2024-10-05' },
        { id: 5, investor: 'Venture Partners', entrepreneur: 'David Kim', startup: 'CyberSecure', amount: '$500,000', date: '2024-09-12' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold text-[#0B2C4A] tracking-tight">Funding & Deals</h2>
                    <p className="text-gray-500 mt-1">Track recent investment activities active on the platform.</p>
                </div>
                <div className="bg-[#E8F1F8] text-[#0B2C4A] px-4 py-2 rounded-lg font-semibold text-sm">
                    Total Volume: <span className="font-bold">$935,000</span>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-[#0B2C4A] text-white">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Startup</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Entrepreneur</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Investor</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Amount</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Date</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {deals.map((deal) => (
                                <tr key={deal.id} className="hover:bg-blue-50/50 transition-colors duration-200">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-bold text-gray-900">{deal.startup}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-[#0B2C4A] font-bold text-xs mr-3">
                                                {deal.entrepreneur.charAt(0)}
                                            </div>
                                            <div className="text-sm font-medium text-gray-700">{deal.entrepreneur}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-600">{deal.investor}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                            {deal.amount}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {deal.date}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {deals.length === 0 && (
                    <div className="text-center py-10">
                        <p className="text-gray-500">No funding records found.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
