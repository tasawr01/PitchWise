import { getInvestorDeals } from '@/app/actions/investor';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { redirect } from 'next/navigation';
import DealsTabView from '@/components/investor/DealsTabView';
import { isDealAwaitingPayment } from '@/lib/deal-status';

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
    const pendingDeals = deals.filter((d: any) => isDealAwaitingPayment(d));
    const pastDeals = deals.filter((d: any) => !isDealAwaitingPayment(d));

    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-[#0B2C4A] tracking-tight">My Deals</h1>
                <p className="text-gray-500 mt-2 text-lg">Manage accepted deals, complete dummy payments, and review completed transactions.</p>
            </div>

            <DealsTabView pendingDeals={pendingDeals} pastDeals={pastDeals} />
        </div>
    );
}
