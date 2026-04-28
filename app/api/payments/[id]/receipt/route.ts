import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Payment from '@/models/Payment';
import { verifyToken } from '@/lib/auth';
import { generatePaymentReceiptBuffer } from '@/lib/pdfGenerator';

async function getCurrentUser(req: Request) {
    try {
        const token = req.headers.get('cookie')?.match(/token=([^;]+)/)?.[1];
        if (!token) return null;
        return await verifyToken(token);
    } catch {
        return null;
    }
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const user = await getCurrentUser(req);

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const payment: any = await Payment.findById(id)
            .populate('deal', '_id')
            .populate('pitch', 'businessName')
            .populate('investor', 'fullName')
            .populate('entrepreneur', 'fullName');

        if (!payment) {
            return NextResponse.json({ error: 'Receipt not found.' }, { status: 404 });
        }

        const isAdmin = user.role === 'admin';
        const isInvestor = payment.investor?._id?.toString() === user.id;
        const isEntrepreneur = payment.entrepreneur?._id?.toString() === user.id;

        if (!isAdmin && !isInvestor && !isEntrepreneur) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const buffer = await generatePaymentReceiptBuffer({
            paymentId: payment._id.toString(),
            receiptNumber: payment.receiptNumber,
            dealId: payment.deal?._id?.toString() || 'N/A',
            startupName: payment.pitch?.businessName || 'Startup',
            investorName: payment.investor?.fullName || 'Investor',
            entrepreneurName: payment.entrepreneur?.fullName || 'Entrepreneur',
            amount: payment.amount || 0,
            processedAt: new Date(payment.processedAt || payment.createdAt).toLocaleString(),
            cardLast4: payment.cardLast4 || '0000',
        });

        return new NextResponse(new Uint8Array(buffer), {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `inline; filename="${payment.receiptNumber}.pdf"`,
            },
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Failed to generate receipt.' }, { status: 500 });
    }
}
