import { getApprovedDeals } from '@/app/actions/admin';
import Link from 'next/link';

export default async function AdminFunding() {
    // Fetch actual approved deals
    const { success, deals, error } = await getApprovedDeals();

    if (!success) {
        return (
            <div className="p-8 text-center text-red-500">
                <p>Error loading fundings: {error}</p>
            </div>
        );
    }

    // Calculate total volume
    const totalVolume = deals.reduce((acc: number, deal: any) => acc + (deal.amount || 0), 0);
    const formattedVolume = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(totalVolume);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold text-[#0B2C4A] tracking-tight">Funding & Deals</h2>
                    <p className="text-gray-500 mt-1">Track recent investment activities active on the platform.</p>
                </div>
                <div className="bg-[#E8F1F8] text-[#0B2C4A] px-4 py-2 rounded-lg font-semibold text-sm">
                    Total Volume: <span className="font-bold">{formattedVolume}</span>
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
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Agreement</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {deals.map((deal: any) => {
                                const startupName = deal.pitch?.businessName || 'Unknown Startup';
                                const entrepreneurName = deal.entrepreneur?.fullName || 'Unknown';
                                const investorName = deal.investor?.fullName || 'Unknown';
                                const formattedAmount = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(deal.amount || 0);
                                const dateStr = new Date(deal.updatedAt || deal.createdAt).toLocaleDateString();

                                return (
                                    <tr key={deal._id} className="hover:bg-blue-50/50 transition-colors duration-200">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-gray-900">{startupName}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-[#0B2C4A] font-bold text-xs mr-3">
                                                    {entrepreneurName.charAt(0)}
                                                </div>
                                                <div className="text-sm font-medium text-gray-700">{entrepreneurName}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="text-sm text-gray-600">{investorName}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                {formattedAmount}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {dateStr}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {deal.documentUrl ? (
                                                <Link href={deal.documentUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 font-medium hover:underline inline-flex items-center gap-1">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                                                    View Agreement
                                                </Link>
                                            ) : (
                                                <span className="text-gray-400 italic">Not attached</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
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
