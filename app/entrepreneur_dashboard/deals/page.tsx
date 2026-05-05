import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Briefcase } from 'lucide-react';
import { getEntrepreneurDeals } from '@/app/actions/entrepreneur';
import EntrepreneurDealCard from '@/components/entrepreneur/EntrepreneurDealCard';

export const dynamic = 'force-dynamic';

async function getUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return null;
    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        if (payload.role !== 'entrepreneur') return null;
        return payload;
    } catch {
        return null;
    }
}

export default async function EntrepreneurDealsPage() {
    const user = await getUser();
    if (!user) redirect('/login');

    const deals = await getEntrepreneurDeals(user.id as string);

    const openDeals = deals.filter((d: any) => d.status !== 'completed' && d.status !== 'rejected');
    const closedDeals = deals.filter((d: any) => d.status === 'completed' || d.status === 'rejected');

    return (
        <div className="max-w-7xl mx-auto space-y-10">
            <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-[#0B2C4A] tracking-tight">My Deals</h1>
                    <p className="text-gray-500 mt-2 text-lg">
                        All deals you have created with investors. Closure happens from your chat with the investor.
                    </p>
                </div>
                <Link
                    href="/entrepreneur_dashboard/investors"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                    <Briefcase className="w-4 h-4" /> View My Investors
                </Link>
            </header>

            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-[#0B2C4A]">Open Deals</h2>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{openDeals.length} active</span>
                </div>
                {openDeals.length === 0 ? (
                    <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-10 text-center text-gray-500">
                        No open deals right now.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {openDeals.map((d: any) => (
                            <EntrepreneurDealCard key={d._id} deal={d} />
                        ))}
                    </div>
                )}
            </section>

            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-[#0B2C4A]">Closed Deals</h2>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{closedDeals.length} closed</span>
                </div>
                {closedDeals.length === 0 ? (
                    <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-10 text-center text-gray-500">
                        No closed deals yet.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {closedDeals.map((d: any) => (
                            <EntrepreneurDealCard key={d._id} deal={d} />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
