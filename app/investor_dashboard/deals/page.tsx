import { getInvestorDeals } from '@/app/actions/investor';
// getSession import removed
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import DocumentCard from '@/components/investor/DocumentCard'; // We'll create this helper
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

export default async function DealsPage() {
    const user = await getUser();
    if (!user) redirect('/login');

    const deals = await getInvestorDeals(user.id as string);
    const pendingDeals = deals.filter((d: any) => d.status === 'pending');
    const pastDeals = deals.filter((d: any) => d.status !== 'pending');

    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-[#0B2C4A] tracking-tight">My Deals</h1>
                <p className="text-gray-500 mt-2 text-lg">Manage your investment contracts and agreements.</p>
            </div>

            <div className="space-y-8">
                <section>
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Pending Review</h2>
                    {pendingDeals.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Map deals to a card component */}
                            {pendingDeals.map((deal: any) => (
                                <DocumentCard key={deal._id} deal={deal} />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500 text-sm">
                            No pending deals to review.
                        </div>
                    )}
                </section>

                <section>
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Past Deals</h2>
                    {pastDeals.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {pastDeals.map((deal: any) => (
                                <DocumentCard key={deal._id} deal={deal} isReadOnly />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500 text-sm">
                            No past deal history.
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
