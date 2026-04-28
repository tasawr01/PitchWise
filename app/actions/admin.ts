'use server';

import dbConnect from '@/lib/db';
import Deal from '@/models/Deal';
import { getPaidDealQuery } from '@/lib/deal-status';

export async function getApprovedDeals() {
    try {
        await dbConnect();

        const deals = await Deal.find(getPaidDealQuery())
            .populate('pitch', 'businessName')
            .populate('entrepreneur', 'fullName profilePhoto')
            .populate('investor', 'fullName profilePhoto')
            .populate('paymentRecord', 'receiptNumber cardLast4 processedAt status')
            .sort({ createdAt: -1 })
            .lean();

        // Format to plain JSON for client components
        return {
            success: true,
            deals: JSON.parse(JSON.stringify(deals))
        };
    } catch (error: any) {
        console.error('Error fetching approved deals:', error);
        return {
            success: false,
            error: error.message,
            deals: []
        };
    }
}

export async function getDealById(dealId: string) {
    try {
        await dbConnect();

        const deal = await Deal.findById(dealId)
            .populate('pitch', 'businessName')
            .populate('entrepreneur', 'fullName')
            .populate('investor', 'fullName')
            .populate('paymentRecord', 'receiptNumber cardLast4 processedAt status')
            .lean();

        if (!deal) {
            return { success: false, error: 'Deal not found' };
        }

        return {
            success: true,
            deal: JSON.parse(JSON.stringify(deal))
        };
    } catch (error: any) {
        console.error('Error fetching deal by id:', error);
        return {
            success: false,
            error: error.message
        };
    }
}
