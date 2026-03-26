import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Deal from '@/models/Deal';
import { redirect } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

export default async function AdminDealsPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) redirect('/auth/login');
    const user = await verifyToken(token);
    if (!user || user.role !== 'admin') redirect('/auth/login');

    await dbConnect();
    const deals = await Deal.find({})
        .populate('pitch', 'businessName')
        .populate('entrepreneur', 'fullName email')
        .populate('investor', 'fullName email')
        .sort({ createdAt: -1 })
        .lean();

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold text-[#0B2C4A] mb-6">Deals Archive</h1>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Pitch</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Investor</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Entrepreneur</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {deals.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">No deals found.</td>
                            </tr>
                        ) : (
                            deals.map((deal: any) => (
                                <tr key={deal._id.toString()} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm text-gray-600">{new Date(deal.createdAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{deal.pitch?.businessName || 'Unknown'}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        <div>{deal.investor?.fullName}</div>
                                        <div className="text-xs text-gray-400">{deal.investor?.email}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        <div>{deal.entrepreneur?.fullName}</div>
                                        <div className="text-xs text-gray-400">{deal.entrepreneur?.email}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatCurrency(deal.amount)}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${deal.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                deal.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                            }`}>
                                            {deal.status === 'approved' ? 'Verified' : deal.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        {/* Link to view document if we had a dedicated admin view, for now just basic details */}
                                        <button className="text-blue-600 hover:underline">View Details</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
