'use server';

import dbConnect from '@/lib/db';
import Rating from '@/models/Rating';
import Conversation from '@/models/Conversation';
import Pitch from '@/models/Pitch';
import Investor from '@/models/Investor';
import Deal from '@/models/Deal';
import { getPaidDealQuery } from '@/lib/deal-status';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { revalidatePath } from 'next/cache';

async function getAuth() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return null;
    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        return payload as { id: string; role: string };
    } catch {
        return null;
    }
}

function serialize<T>(value: T): T {
    return JSON.parse(JSON.stringify(value));
}

function clampStars(stars: any): number | null {
    const n = Number(stars);
    if (!Number.isFinite(n)) return null;
    const rounded = Math.round(n);
    if (rounded < 1 || rounded > 5) return null;
    return rounded;
}

export async function submitInvestorRating(input: {
    conversationId: string;
    dealId?: string;
    closureType: 'completed' | 'discarded';
    stars: number;
    feedback?: string;
}) {
    try {
        const auth = await getAuth();
        if (!auth || auth.role !== 'entrepreneur') {
            return { success: false, error: 'Only entrepreneurs can rate investors.' };
        }

        const stars = clampStars(input.stars);
        if (!stars) return { success: false, error: 'Please select a rating between 1 and 5 stars.' };
        if (!input.conversationId) return { success: false, error: 'Missing conversation reference.' };
        if (input.closureType !== 'completed' && input.closureType !== 'discarded') {
            return { success: false, error: 'Invalid closure type.' };
        }

        await dbConnect();
        const convo: any = await Conversation.findById(input.conversationId).lean();
        if (!convo) return { success: false, error: 'Conversation not found.' };

        const entrepreneurParticipant = (convo.participants || []).find((p: any) => p.userModel === 'Entrepreneur');
        const investorParticipant = (convo.participants || []).find((p: any) => p.userModel === 'Investor');
        if (!entrepreneurParticipant || !investorParticipant) {
            return { success: false, error: 'Conversation is missing required participants.' };
        }
        if (String(entrepreneurParticipant.user) !== String(auth.id)) {
            return { success: false, error: 'You can only rate your own conversations.' };
        }

        try {
            await Rating.create({
                kind: 'investor',
                stars,
                feedback: input.feedback || '',
                raterRole: 'entrepreneur',
                raterId: auth.id,
                investor: investorParticipant.user,
                entrepreneur: entrepreneurParticipant.user,
                conversation: convo._id,
                deal: input.dealId || undefined,
                closureType: input.closureType,
            });
        } catch (err: any) {
            if (err?.code === 11000) {
                return { success: false, error: 'You have already rated this conversation.' };
            }
            throw err;
        }

        revalidatePath('/entrepreneur_dashboard/deals');
        revalidatePath('/entrepreneur_dashboard/investors');
        revalidatePath(`/investors/${String(investorParticipant.user)}`);

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message || 'Failed to submit rating.' };
    }
}

export async function submitPitchRating(input: {
    pitchId: string;
    stars: number;
    feedback?: string;
}) {
    try {
        const auth = await getAuth();
        if (!auth || auth.role !== 'investor') {
            return { success: false, error: 'Only investors can rate pitches.' };
        }

        const stars = clampStars(input.stars);
        if (!stars) return { success: false, error: 'Please select a rating between 1 and 5 stars.' };

        await dbConnect();
        const pitch: any = await Pitch.findById(input.pitchId).lean();
        if (!pitch) return { success: false, error: 'Pitch not found.' };
        if (pitch.status !== 'approved') {
            return { success: false, error: 'You can only rate approved pitches.' };
        }

        try {
            await Rating.create({
                kind: 'pitch',
                stars,
                feedback: input.feedback || '',
                raterRole: 'investor',
                raterId: auth.id,
                pitch: pitch._id,
            });
        } catch (err: any) {
            if (err?.code === 11000) {
                return { success: false, error: 'You have already rated this pitch.' };
            }
            throw err;
        }

        revalidatePath(`/investor_dashboard/explore/${input.pitchId}`);

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message || 'Failed to submit rating.' };
    }
}

export async function getInvestorRatingSummary(investorId: string) {
    try {
        await dbConnect();
        const ratings = await Rating.find({ kind: 'investor', investor: investorId })
            .populate('entrepreneur', 'fullName profilePhoto startupName')
            .sort({ createdAt: -1 })
            .lean();

        const count = ratings.length;
        const avg = count === 0
            ? 0
            : ratings.reduce((s: number, r: any) => s + r.stars, 0) / count;

        return {
            success: true,
            avg: Number(avg.toFixed(2)),
            count,
            ratings: serialize(ratings),
        };
    } catch (error: any) {
        return { success: false, avg: 0, count: 0, ratings: [], error: error.message };
    }
}

export async function getPitchRatingSummary(pitchId: string) {
    try {
        await dbConnect();
        const ratings = await Rating.find({ kind: 'pitch', pitch: pitchId })
            .sort({ createdAt: -1 })
            .lean();

        const investorIds = Array.from(new Set(ratings.map((r: any) => String(r.raterId))));
        const investors = investorIds.length
            ? await Investor.find({ _id: { $in: investorIds } })
                .select('fullName profilePhoto organizationName')
                .lean()
            : [];
        const investorById = new Map(investors.map((i: any) => [String(i._id), i]));

        const enriched = ratings.map((r: any) => ({
            ...r,
            rater: investorById.get(String(r.raterId)) || null,
        }));

        const count = ratings.length;
        const avg = count === 0
            ? 0
            : ratings.reduce((s: number, r: any) => s + r.stars, 0) / count;

        return {
            success: true,
            avg: Number(avg.toFixed(2)),
            count,
            ratings: serialize(enriched),
        };
    } catch (error: any) {
        return { success: false, avg: 0, count: 0, ratings: [], error: error.message };
    }
}

export async function hasInvestorRatedPitch(investorId: string, pitchId: string) {
    try {
        await dbConnect();
        const existing = await Rating.findOne({ kind: 'pitch', pitch: pitchId, raterId: investorId }).lean();
        return !!existing;
    } catch {
        return false;
    }
}

export async function hasEntrepreneurRatedConversation(conversationId: string) {
    try {
        await dbConnect();
        const existing = await Rating.findOne({ kind: 'investor', conversation: conversationId }).lean();
        return !!existing;
    } catch {
        return false;
    }
}

export async function getInvestorPortfolio(investorId: string) {
    try {
        await dbConnect();
        const deals: any[] = await Deal.find(getPaidDealQuery({ investor: investorId }))
            .populate('pitch', 'businessName logoUrl industry stage')
            .populate('entrepreneur', 'fullName profilePhoto')
            .sort({ paidAt: -1, createdAt: -1 })
            .lean();

        const totalAmount = deals.reduce((sum, d) => sum + (Number(d.finalAmount) || Number(d.amount) || 0), 0);
        const industries = Array.from(
            new Set(deals.map((d) => d.pitch?.industry).filter(Boolean))
        );
        const uniquePitchIds = new Set(deals.map((d) => String(d.pitch?._id || d.pitch)));

        return {
            success: true,
            count: deals.length,
            uniquePitches: uniquePitchIds.size,
            totalAmount,
            industries,
            deals: serialize(deals),
        };
    } catch (error: any) {
        return {
            success: false,
            count: 0,
            uniquePitches: 0,
            totalAmount: 0,
            industries: [] as string[],
            deals: [],
            error: error.message,
        };
    }
}

export async function getInvestorPublicProfile(investorId: string) {
    try {
        await dbConnect();
        const investor: any = await Investor.findById(investorId)
            .select('fullName profilePhoto organizationName investorType investmentMin investmentMax industryPreferences cityCountry status createdAt')
            .lean();

        if (!investor) return { success: false, error: 'Investor not found.' };

        const summary = await getInvestorRatingSummary(investorId);
        const portfolio = await getInvestorPortfolio(investorId);

        return {
            success: true,
            investor: serialize(investor),
            avg: summary.avg,
            count: summary.count,
            ratings: summary.ratings,
            portfolio: {
                count: portfolio.count,
                uniquePitches: portfolio.uniquePitches,
                totalAmount: portfolio.totalAmount,
                industries: portfolio.industries,
                deals: portfolio.deals,
            },
        };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
