import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import dbConnect from '@/lib/db';
import Deal from '@/models/Deal';
import { verifyToken } from '@/lib/auth';
import DealPaymentForm from '@/components/investor/DealPaymentForm';
import { isDealRejected } from '@/lib/deal-status';

export const dynamic = 'force-dynamic';

export default async function DealPaymentPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) redirect('/login');
    const user = await verifyToken(token);
    if (!user || user.role !== 'investor') redirect('/login');

    await dbConnect();
    const deal = await Deal.findById(id)
        .populate('pitch', 'businessName')
        .populate('entrepreneur', 'fullName')
        .populate('investor', 'fullName')
        .populate('paymentRecord', '_id')
        .lean() as any;

    if (!deal || deal.investor?._id?.toString() !== user.id) {
        return <div className="p-8">Deal not found.</div>;
    }

    if (isDealRejected(deal)) {
        redirect(`/investor_dashboard/deals/${deal._id}`);
    }

    return (
        <div className="mx-auto max-w-6xl space-y-6">
            <Link href={`/investor_dashboard/deals/${deal._id}`} className="inline-flex items-center text-sm font-semibold text-gray-500 transition-colors hover:text-[#0B2C4A]">
                ← Back to deal details
            </Link>

            <DealPaymentForm
                deal={{
                    _id: deal._id.toString(),
                    amount: deal.amount || 0,
                    equity: deal.equity || 0,
                    pitchName: deal.pitch?.businessName || 'Startup',
                    entrepreneurName: deal.entrepreneur?.fullName || 'Entrepreneur',
                    investorName: deal.investor?.fullName || 'Investor',
                }}
            />
        </div>
    );
}
