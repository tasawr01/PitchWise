import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import dbConnect from '@/lib/db';
import Deal from '@/models/Deal';
import Payment from '@/models/Payment';
import { getPaidDealQuery } from '@/lib/deal-status';
import { buildDummyReceiptNumber } from '@/lib/dummy-payment';
import { generatePaymentReceiptBuffer } from '@/lib/pdfGenerator';
import { uploadToCloudinary } from '@/lib/cloudinary';

async function verifyAdminAuth(req: Request) {
    const token = req.headers.get('cookie')?.match(/token=([^;]+)/)?.[1];
    if (!token) return false;
    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        return payload.role === 'admin';
    } catch {
        return false;
    }
}

async function uploadReceiptForPayment(payment: any) {
    const dealRef = payment.deal?._id?.toString() || payment.deal?.toString() || 'N/A';
    const pdfBuffer = await generatePaymentReceiptBuffer({
        paymentId: payment._id.toString(),
        receiptNumber: payment.receiptNumber,
        dealId: dealRef,
        startupName: payment.pitch?.businessName || 'Startup',
        investorName: payment.investor?.fullName || 'Investor',
        entrepreneurName: payment.entrepreneur?.fullName || 'Entrepreneur',
        amount: payment.amount || 0,
        processedAt: new Date(payment.processedAt || payment.createdAt || Date.now()).toLocaleString(),
        cardLast4: payment.cardLast4 || '0000',
    });

    const uploadResult: any = await uploadToCloudinary(
        pdfBuffer,
        'pitchwise/receipts',
        `${payment.receiptNumber}.pdf`
    );

    if (!uploadResult?.secure_url) {
        throw new Error('Cloudinary did not return a secure_url.');
    }

    return uploadResult.secure_url as string;
}

export async function POST(req: Request) {
    try {
        if (!await verifyAdminAuth(req)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const url = new URL(req.url);
        const force = url.searchParams.get('force') === 'true';

        const created: { dealId: string; paymentId: string; receiptNumber: string; status: 'created' | 'failed'; error?: string }[] = [];

        const legacyDeals: any[] = await Deal.find({
            $and: [
                getPaidDealQuery(),
                { $or: [{ paymentRecord: { $exists: false } }, { paymentRecord: null }] },
            ],
        })
            .populate('pitch', 'businessName')
            .populate('investor', 'fullName')
            .populate('entrepreneur', 'fullName');

        for (const deal of legacyDeals) {
            try {
                let payment: any = await Payment.findOne({ deal: deal._id });

                if (!payment) {
                    const processedAt = deal.paidAt || deal.updatedAt || deal.createdAt || new Date();
                    payment = await Payment.create({
                        deal: deal._id,
                        pitch: deal.pitch?._id || deal.pitch,
                        investor: deal.investor?._id || deal.investor,
                        entrepreneur: deal.entrepreneur?._id || deal.entrepreneur,
                        amount: deal.amount,
                        intentId: deal.paymentIntentId || `pi_legacy_${deal._id.toString()}_${Date.now()}`,
                        cardLast4: '0000',
                        receiptNumber: buildDummyReceiptNumber(),
                        processedAt,
                    });
                }

                deal.paymentRecord = payment._id;
                deal.paymentStatus = 'paid';
                deal.paidAt = deal.paidAt || payment.processedAt || new Date();
                await deal.save();

                created.push({
                    dealId: deal._id.toString(),
                    paymentId: payment._id.toString(),
                    receiptNumber: payment.receiptNumber,
                    status: 'created',
                });
            } catch (error: any) {
                created.push({
                    dealId: deal._id.toString(),
                    paymentId: '',
                    receiptNumber: '',
                    status: 'failed',
                    error: error.message || 'Unknown error',
                });
            }
        }

        const paymentQuery = force
            ? {}
            : { $or: [{ receiptUrl: { $exists: false } }, { receiptUrl: null }, { receiptUrl: '' }] };

        const payments: any[] = await Payment.find(paymentQuery)
            .populate('deal', '_id')
            .populate('pitch', 'businessName')
            .populate('investor', 'fullName')
            .populate('entrepreneur', 'fullName');

        const receipts: { paymentId: string; receiptNumber: string; status: 'updated' | 'failed'; error?: string }[] = [];

        for (const payment of payments) {
            try {
                const url = await uploadReceiptForPayment(payment);
                payment.receiptUrl = url;
                await payment.save();

                receipts.push({
                    paymentId: payment._id.toString(),
                    receiptNumber: payment.receiptNumber,
                    status: 'updated',
                });
            } catch (error: any) {
                receipts.push({
                    paymentId: payment._id.toString(),
                    receiptNumber: payment.receiptNumber,
                    status: 'failed',
                    error: error.message || 'Unknown error',
                });
            }
        }

        return NextResponse.json({
            success: true,
            legacyDealsScanned: legacyDeals.length,
            paymentsCreated: created.filter((r) => r.status === 'created').length,
            paymentsCreationFailed: created.filter((r) => r.status === 'failed').length,
            receiptsScanned: payments.length,
            receiptsUpdated: receipts.filter((r) => r.status === 'updated').length,
            receiptsFailed: receipts.filter((r) => r.status === 'failed').length,
            created,
            receipts,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Backfill failed.' }, { status: 500 });
    }
}
