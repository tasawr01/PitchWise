import { getInvestorDeals } from '@/app/actions/investor';
// getSession import removed
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import DocumentCard from '@/components/investor/DocumentCard';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

async function getUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return null;
    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        if (payload.role !== 'investor') return null;
        return payload;
    } catch {
        return null;
    }
}

export default async function PortfolioPage() {
    const user = await getUser();
    if (!user) redirect('/login');

    const deals = await getInvestorDeals(user.id as string);
    const approvedDeals = deals.filter((d: any) => d.status === 'approved');

    // Calculate generic stats
    const totalInvested = approvedDeals.reduce((sum: number, d: any) => sum + (d.amount || 0), 0);

    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-[#0B2C4A] tracking-tight">My Portfolio</h1>
                <p className="text-gray-500 mt-2 text-lg">Your active investments and performance.</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <span className="text-gray-500 text-sm font-medium uppercase">Total Invested</span>
                    <p className="text-3xl font-bold text-[#0B2C4A] mt-2">Rs. {totalInvested.toLocaleString()}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <span className="text-gray-500 text-sm font-medium uppercase">Active Ventures</span>
                    <p className="text-3xl font-bold text-[#0B2C4A] mt-2">{approvedDeals.length}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <span className="text-gray-500 text-sm font-medium uppercase">Avg. Equity Stake</span>
                    <p className="text-3xl font-bold text-green-600 mt-2">
                        {approvedDeals.length > 0
                            ? (approvedDeals.reduce((sum: number, d: any) => sum + (d.equity || 0), 0) / approvedDeals.length).toFixed(1)
                            : 0}%
                    </p>
                </div>
            </div>

            {approvedDeals.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {approvedDeals.map((deal: any) => (
                        <DocumentCard key={deal._id} deal={deal} isReadOnly />
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No active investments yet</h3>
                    <p className="text-gray-500">Once your deals are approved, they will appear here.</p>
                </div>
            )}
        </div>
    );
}
