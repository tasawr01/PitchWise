'use server';

import dbConnect from '@/lib/db';
import Deal from '@/models/Deal';
import Pitch from '@/models/Pitch';
import Entrepreneur from '@/models/Entrepreneur';
import Investor from '@/models/Investor';

export async function getApprovedDeals() {
    try {
        await dbConnect();

        // Fetch deals where status is approved and populate references
        const deals = await Deal.find({ status: 'approved' })
            .populate('pitch', 'businessName')
            .populate('entrepreneur', 'fullName profilePhoto')
            .populate('investor', 'fullName profilePhoto')
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
