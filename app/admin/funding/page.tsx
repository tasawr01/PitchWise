export default function AdminFunding() {
    // Dummy Deals
    const deals = [
        { id: 1, investor: 'Global VC', entrepreneur: 'Alex Morgan', startup: 'Ecoify', amount: '$50,000', date: '2025-01-02' },
        { id: 2, investor: 'Sarah Tech', entrepreneur: 'John Doe', startup: 'HealthAI', amount: '$120,000', date: '2024-12-15' },
    ];

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Funding & Deals</h2>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-[#1e293b] text-white">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold uppercase">Startup</th>
                            <th className="px-6 py-3 text-left text-xs font-bold uppercase">Entrepreneur</th>
                            <th className="px-6 py-3 text-left text-xs font-bold uppercase">Investor</th>
                            <th className="px-6 py-3 text-left text-xs font-bold uppercase">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-bold uppercase">Date</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {deals.map(deal => (
                            <tr key={deal.id}>
                                <td className="px-6 py-4 font-medium">{deal.startup}</td>
                                <td className="px-6 py-4 text-gray-500">{deal.entrepreneur}</td>
                                <td className="px-6 py-4 text-gray-500">{deal.investor}</td>
                                <td className="px-6 py-4 font-bold text-green-600">{deal.amount}</td>
                                <td className="px-6 py-4 text-gray-500">{deal.date}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
