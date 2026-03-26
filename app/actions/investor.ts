'use server';

import dbConnect from '@/lib/db';
import Pitch from '@/models/Pitch';
import Investor from '@/models/Investor';
import Entrepreneur from '@/models/Entrepreneur';
import { revalidatePath } from 'next/cache';

export async function getPitches(filters: any = {}, page = 1, limit = 9) {
    try {
        await dbConnect();

        const query: any = { status: 'approved' };

        if (filters.industry && filters.industry !== 'All') {
            query.industry = filters.industry;
        }

        if (filters.stage && filters.stage !== 'All') {
            query.stage = filters.stage;
        }

        // Search by name or title
        if (filters.search) {
            query.$or = [
                { businessName: { $regex: filters.search, $options: 'i' } },
                { title: { $regex: filters.search, $options: 'i' } }
            ];
        }

        // Min/Max Investment Amount
        if (filters.minInvestment || filters.maxInvestment) {
            query.amountRequired = {};
            if (filters.minInvestment) query.amountRequired.$gte = Number(filters.minInvestment);
            if (filters.maxInvestment) query.amountRequired.$lte = Number(filters.maxInvestment);
        }

        const skip = (page - 1) * limit;

        const pitches = await Pitch.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('entrepreneur', 'fullName profilePhoto')
            .lean();

        const total = await Pitch.countDocuments(query);

        // Convert _id to string to serve to client
        const safePitches = JSON.parse(JSON.stringify(pitches));

        return {
            pitches: safePitches,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            totalPitches: total
        };

    } catch (error: any) {
        console.error('Error fetching pitches:', error);
        return { pitches: [], totalPages: 0, currentPage: 1, totalPitches: 0, error: error.message };
    }
}

export async function getPitchById(id: string) {
    try {
        await dbConnect();
        const pitch = await Pitch.findById(id).populate('entrepreneur', 'fullName profilePhoto email phone').lean();
        if (!pitch) return null;
        return JSON.parse(JSON.stringify(pitch));
    } catch (error) {
        return null;
    }
}

export async function getInvestorWatchlist(investorId: string) {
    try {
        await dbConnect();
        const investor: any = await Investor.findById(investorId).populate({
            path: 'watchlist',
            match: { status: 'approved' }, // Only show approved pitches even if they were added before
            populate: { path: 'entrepreneur', select: 'fullName profilePhoto' }
        }).lean();

        if (!investor) return [];
        return JSON.parse(JSON.stringify(investor.watchlist || []));
    } catch (error) {
        console.error('Error fetching watchlist:', error);
        return [];
    }
}

export async function toggleWatchlist(investorId: string, pitchId: string) {
    try {
        await dbConnect();
        const investor: any = await Investor.findById(investorId);

        if (!investor) throw new Error('Investor not found');

        const isWatched = investor.watchlist.includes(pitchId);

        if (isWatched) {
            investor.watchlist = investor.watchlist.filter((id: any) => id.toString() !== pitchId);
        } else {
            investor.watchlist.push(pitchId);
        }

        await investor.save();
        revalidatePath('/investor_dashboard/watchlist');
        revalidatePath(`/investor_dashboard/explore/${pitchId}`);

        return { success: true, isWatched: !isWatched };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function checkWatchlistStatus(investorId: string, pitchId: string) {
    try {
        await dbConnect();
        const investor: any = await Investor.findById(investorId).select('watchlist');
        if (!investor) return false;

        return investor.watchlist.includes(pitchId);
    } catch (error) {
        return false;
    }
}

import Deal from '@/models/Deal';

export async function getInvestorDeals(investorId: string) {
    try {
        await dbConnect();
        const deals = await Deal.find({ investor: investorId })
            .populate('pitch', 'businessName logoUrl')
            .populate('entrepreneur', 'fullName email')
            .sort({ createdAt: -1 })
            .lean();

        return JSON.parse(JSON.stringify(deals));
    } catch (error) {
        console.error('Error fetching deals:', error);
        return [];
    }
}

import { uploadToCloudinary } from '@/lib/cloudinary';
import { generateDealPDFBuffer } from '@/lib/pdfGenerator';

export async function updateDealStatus(dealId: string, status: 'approved' | 'rejected', reason?: string) {
    try {
        await dbConnect();
        const deal = await Deal.findById(dealId)
            .populate('pitch', 'businessName')
            .populate('entrepreneur', 'fullName')
            .populate('investor', 'fullName');

        if (!deal) throw new Error('Deal not found');

        deal.status = status;
        if (reason) deal.rejectionReason = reason;

        if (status === 'approved') {
            // Generate PDF Buffer
            const dealInfo = {
                _id: deal._id.toString(),
                startupName: deal.pitch?.businessName || 'Unknown Startup',
                entrepreneurName: deal.entrepreneur?.fullName || 'Unknown Entrepreneur',
                investorName: deal.investor?.fullName || 'Unknown Investor',
                amount: deal.amount || 0,
                equity: deal.equity || 0,
                terms: deal.terms || 'Standard terms.',
                date: new Date().toLocaleDateString()
            };

            const pdfBuffer = await generateDealPDFBuffer(dealInfo);

            // Upload PDF to Cloudinary
            const uploadResult = await uploadToCloudinary(pdfBuffer, 'agreements', `deal_${deal._id}`);

            // Save the secure url
            deal.documentUrl = uploadResult.secure_url;
        }

        await deal.save();
        revalidatePath('/investor_dashboard/deals');
        revalidatePath('/investor_dashboard/portfolio');

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

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
            status: 'pending'
        });

        revalidatePath('/investor_dashboard/deals');
        return { success: true, dealId: deal._id.toString() };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateInvestorProfile(investorId: string, data: any) {
    try {
        await dbConnect();
        const investor = await Investor.findByIdAndUpdate(
            investorId,
            {
                $set: {
                    fullName: data.fullName,
                    phone: data.phone,
                    cityCountry: data.cityCountry,
                    organizationName: data.organizationName,
                    investorType: data.investorType,
                    investmentMin: data.investmentMin,
                    investmentMax: data.investmentMax,
                    industryPreferences: data.industryPreferences,
                    profilePhoto: data.profilePhoto
                }
            },
            { new: true }
        );

        if (!investor) throw new Error('Investor not found');

        revalidatePath('/investor_dashboard');
        revalidatePath('/investor_dashboard/settings');

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
