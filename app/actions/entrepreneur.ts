'use server';

import dbConnect from '@/lib/db';
import Deal from '@/models/Deal';
import { revalidatePath } from 'next/cache';

export async function createDealProposal(data: { pitchId: string, investorId: string, entrepreneurId: string, amount: number, equity: number, terms: string }) {
    try {
        await dbConnect();

        // Check if deal already exists
        const existing = await Deal.findOne({
            pitch: data.pitchId,
            investor: data.investorId,
            status: { $ne: 'rejected' }
        });

        if (existing) {
            return { success: false, error: 'A deal is already in progress for this pitch.' };
        }

        const deal = await Deal.create({
            pitch: data.pitchId,
            investor: data.investorId,
            entrepreneur: data.entrepreneurId,
            amount: data.amount,
            equity: data.equity,
            terms: data.terms,
            status: 'pending' // Pending Investor approval
        });

        // Revalidate the entrepreneur deals page if it exists
        revalidatePath('/entrepreneur_dashboard');
        revalidatePath('/entrepreneur_dashboard/deals');
        return { success: true, dealId: deal._id.toString() };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getMyInvestors(entrepreneurId: string) {
    try {
        await dbConnect();

        // Fetch approved deals for this entrepreneur
        const deals = await Deal.find({ entrepreneur: entrepreneurId, status: 'approved' })
            .populate('investor', 'fullName profilePhoto')
            .populate('pitch', 'businessName')
            .sort({ createdAt: -1 })
            .lean();

        // Format and aggregate if an investor invested in multiple pitches?
        // Let's just return each deal as a distinct investor card for now, representing an "investment".
        const formattedInvestors = deals.map((deal: any) => ({
            id: deal._id.toString(),
            name: deal.investor?.fullName || 'Unknown Investor',
            pitchName: deal.pitch?.businessName || 'Unknown Pitch',
            amountInvested: deal.amount || 0,
            profileImage: deal.investor?.profilePhoto || '',
            investorId: deal.investor?._id?.toString()
        }));

        return { success: true, investors: formattedInvestors };
    } catch (error: any) {
        console.error('Error fetching my investors:', error);
        return { success: false, error: error.message, investors: [] };
    }
}
