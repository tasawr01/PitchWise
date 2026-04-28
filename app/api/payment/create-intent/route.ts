import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Deal from '@/models/Deal';
import { verifyToken } from '@/lib/auth';
import { buildDummyPaymentIntentId } from '@/lib/dummy-payment';
import { isDealPaid, isDealRejected } from '@/lib/deal-status';

async function getCurrentUser(req: Request) {
    try {
        const token = req.headers.get('cookie')?.match(/token=([^;]+)/)?.[1];
        if (!token) return null;
        return await verifyToken(token);
    } catch {
        return null;
    }
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        const user = await getCurrentUser(req);

        if (!user || user.role !== 'investor') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { dealId } = await req.json();
        if (!dealId) {
            return NextResponse.json({ success: false, error: 'Deal id is required.' }, { status: 400 });
        }

        const deal: any = await Deal.findById(dealId)
            .populate('pitch', 'businessName')
            .populate('entrepreneur', 'fullName');

        if (!deal || deal.investor?.toString() !== user.id) {
            return NextResponse.json({ success: false, error: 'Deal not found.' }, { status: 404 });
        }

        if (isDealRejected(deal)) {
            return NextResponse.json({ success: false, error: 'This deal has been rejected.' }, { status: 400 });
        }

        if (isDealPaid(deal)) {
            return NextResponse.json({
                success: true,
                alreadyPaid: true,
                redirectTo: `/investor_dashboard/deals/${deal._id}`,
            });
        }

        if (deal.status === 'pending') {
            deal.status = 'accepted';
        }

        if (!deal.paymentIntentId) {
            deal.paymentIntentId = buildDummyPaymentIntentId(deal._id.toString());
            deal.paymentIntentCreatedAt = new Date();
        }

        if (!deal.paymentStatus || deal.paymentStatus === 'failed') {
            deal.paymentStatus = 'unpaid';
        }

        deal.lastPaymentError = undefined;
        await deal.save();

        return NextResponse.json({
            success: true,
            clientSecret: deal.paymentIntentId,
            amount: deal.amount,
            currency: 'PKR',
            startupName: deal.pitch?.businessName || 'Startup',
            entrepreneurName: deal.entrepreneur?.fullName || 'Entrepreneur',
            dummyCard: '4242 4242 4242 4242',
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message || 'Failed to create payment intent.' }, { status: 500 });
    }
}
