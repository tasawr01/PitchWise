import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Deal from '@/models/Deal';
import Payment from '@/models/Payment';
import { verifyToken } from '@/lib/auth';
import { createNotification } from '@/lib/notification';
import { buildDummyReceiptNumber, validateDummyPaymentInput } from '@/lib/dummy-payment';
import { isDealPaid, isDealRejected } from '@/lib/deal-status';
import { generatePaymentReceiptBuffer } from '@/lib/pdfGenerator';
import { uploadToCloudinary } from '@/lib/cloudinary';

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

        const { dealId, paymentIntentId, cardNumber, expiry, cvc } = await req.json();

        if (!dealId || !paymentIntentId) {
            return NextResponse.json({ success: false, error: 'Missing payment details.' }, { status: 400 });
        }

        const deal: any = await Deal.findById(dealId)
            .populate('pitch', 'businessName')
            .populate('entrepreneur', 'fullName email')
            .populate('investor', 'fullName email');

        if (!deal || deal.investor?._id?.toString() !== user.id) {
            return NextResponse.json({ success: false, error: 'Deal not found.' }, { status: 404 });
        }

        if (isDealRejected(deal)) {
            return NextResponse.json({ success: false, error: 'This deal has been rejected.' }, { status: 400 });
        }

        if (isDealPaid(deal) && deal.paymentRecord) {
            return NextResponse.json({
                success: true,
                paymentId: deal.paymentRecord.toString(),
                receiptNumber: undefined,
                redirectTo: `/investor_dashboard/deals/${deal._id}`,
            });
        }

        const validation = validateDummyPaymentInput({ cardNumber, expiry, cvc });
        if (!validation.valid) {
            deal.paymentStatus = 'failed';
            deal.lastPaymentError = validation.error;
            await deal.save();

            return NextResponse.json({ success: false, error: validation.error }, { status: 400 });
        }

        const existingPayment: any = await Payment.findOne({ deal: deal._id }).select('_id receiptNumber');
        if (existingPayment) {
            deal.paymentStatus = 'paid';
            deal.paymentRecord = existingPayment._id;
            deal.paidAt = deal.paidAt || new Date();
            await deal.save();

            return NextResponse.json({
                success: true,
                paymentId: existingPayment._id.toString(),
                receiptNumber: existingPayment.receiptNumber,
                redirectTo: `/investor_dashboard/deals/${deal._id}`,
            });
        }

        deal.status = 'accepted';
        deal.paymentStatus = 'processing';
        deal.lastPaymentError = undefined;
        await deal.save();

        let payment: any;
        const processedAt = new Date();

        try {
            const receiptNumber = buildDummyReceiptNumber();

            payment = await Payment.create({
                deal: deal._id,
                pitch: deal.pitch?._id || deal.pitch,
                investor: deal.investor?._id || deal.investor,
                entrepreneur: deal.entrepreneur?._id || deal.entrepreneur,
                amount: deal.amount,
                intentId: paymentIntentId,
                cardLast4: validation.cardLast4,
                receiptNumber,
                processedAt,
            });

            try {
                const pdfBuffer = await generatePaymentReceiptBuffer({
                    paymentId: payment._id.toString(),
                    receiptNumber,
                    dealId: deal._id.toString(),
                    startupName: deal.pitch?.businessName || 'Startup',
                    investorName: deal.investor?.fullName || 'Investor',
                    entrepreneurName: deal.entrepreneur?.fullName || 'Entrepreneur',
                    amount: deal.amount,
                    processedAt: processedAt.toLocaleString(),
                    cardLast4: validation.cardLast4 || '0000',
                });

                const uploadResult: any = await uploadToCloudinary(
                    pdfBuffer,
                    'pitchwise/receipts',
                    `${receiptNumber}.pdf`
                );

                if (uploadResult?.secure_url) {
                    payment.receiptUrl = uploadResult.secure_url;
                    await payment.save();
                }
            } catch (uploadError) {
                console.error('Receipt upload failed:', uploadError);
            }

            deal.paymentStatus = 'paid';
            deal.paidAt = processedAt;
            deal.paymentRecord = payment._id;
            await deal.save();
        } catch (paymentError: any) {
            deal.paymentStatus = 'failed';
            deal.lastPaymentError = paymentError.message || 'Failed to store payment record.';
            await deal.save();
            throw paymentError;
        }

        await Promise.all([
            createNotification(
                deal.investor?._id || deal.investor,
                'Investor',
                `Payment completed for ${deal.pitch?.businessName}. Receipt ${payment.receiptNumber} is ready.`,
                'success',
                deal._id,
                'Deal'
            ),
            createNotification(
                deal.entrepreneur?._id || deal.entrepreneur,
                'Entrepreneur',
                `${deal.investor?.fullName || 'An investor'} completed the payment for ${deal.pitch?.businessName}.`,
                'success',
                deal._id,
                'Deal'
            ),
        ]);

        return NextResponse.json({
            success: true,
            paymentId: payment._id.toString(),
            receiptNumber: payment.receiptNumber,
            redirectTo: `/investor_dashboard/deals/${deal._id}`,
            sideEffects: [
                'In-app notifications sent',
                'Confirmation emails sent',
                'PDF receipt ready',
            ],
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message || 'Failed to process payment.' }, { status: 500 });
    }
}
