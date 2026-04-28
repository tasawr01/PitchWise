import dbConnect from '@/lib/db';
import Pitch from '@/models/Pitch';
import Deal from '@/models/Deal';
import Conversation from '@/models/Conversation';
import Investor from '@/models/Investor';
import Notification from '@/models/Notification';
import mongoose from 'mongoose';
import { getPaidDealQuery, isDealPaid, isDealAwaitingPayment } from '@/lib/deal-status';

export interface ChartPoint { label: string; value: number; color: string }
export interface TrendPoint { label: string; value: number }

export interface InvestorStats {
    portfolio: {
        totalInvested: number;
        activeInvestments: number;
        avgCheckSize: number;
        avgEquity: number;
        totalEquityHeld: number;
    };
    deals: {
        total: number;
        pending: number;
        approved: number;
        rejected: number;
        winRate: number;
    };
    discovery: {
        watchlistCount: number;
        availablePitches: number;
        matchingPitches: number;
        activeChats: number;
        completedChats: number;
        unreadMessages: number;
    };
    market: {
        avgPitchAsk: number;
        totalCapitalSeeking: number;
    };
    trends: {
        investmentTrend: TrendPoint[];
        dealsTrend: TrendPoint[];
        marketActivity: TrendPoint[];
    };
    distributions: {
        portfolioByIndustry: ChartPoint[];
        portfolioByStage: ChartPoint[];
        dealStatus: ChartPoint[];
        watchlistByIndustry: ChartPoint[];
    };
    portfolioList: { businessName: string; industry: string; amount: number; equity: number; date: Date | string }[];
    activity: { type: string; message: string; date: Date; isRead: boolean }[];
}

const STATUS_COLORS = {
    pending: '#f59e0b',
    paid: '#10b981',
    rejected: '#ef4444',
};

const PALETTE = ['#0B2C4A', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

function startOfMonth(d: Date) {
    return new Date(d.getFullYear(), d.getMonth(), 1);
}
function monthLabel(d: Date) {
    return d.toLocaleString('en-US', { month: 'short' });
}

export async function getInvestorStats(investorId: string): Promise<InvestorStats> {
    await dbConnect();
    const iId = new mongoose.Types.ObjectId(investorId);

    const [
        investor,
        deals,
        totalDealsCount,
        paidDealsCount,
        rejectedDealsCount,
        availablePitches,
        marketAvgAgg,
        marketTotalAgg,
        activeChats,
        completedChats,
        unreadConvos,
        notifications,
    ] = await Promise.all([
        Investor.findById(iId).populate({ path: 'watchlist', select: 'industry stage businessName amountRequired' }).lean() as any,
        Deal.find({ investor: iId }).populate('pitch', 'industry stage businessName').lean() as any,
        Deal.countDocuments({ investor: iId }),
        Deal.countDocuments(getPaidDealQuery({ investor: iId })),
        Deal.countDocuments({ investor: iId, status: 'rejected' }),
        Pitch.countDocuments({ status: 'approved' }),
        Pitch.aggregate([
            { $match: { status: 'approved', amountRequired: { $gt: 0 } } },
            { $group: { _id: null, avg: { $avg: '$amountRequired' } } },
        ]),
        Pitch.aggregate([
            { $match: { status: 'approved', amountRequired: { $gt: 0 } } },
            { $group: { _id: null, total: { $sum: '$amountRequired' } } },
        ]),
        Conversation.countDocuments({
            type: 'pitch',
            dealStatus: 'in_progress',
            'participants.user': iId,
        }),
        Conversation.countDocuments({
            type: 'pitch',
            dealStatus: 'completed',
            'participants.user': iId,
        }),
        Conversation.find({ type: 'pitch', 'participants.user': iId }).select('unreadCounts').lean(),
        Notification.find({ recipient: iId, recipientModel: 'Investor' })
            .sort({ createdAt: -1 })
            .limit(8)
            .lean(),
    ]);

    const paidDeals = (deals as any[]).filter(d => isDealPaid(d));
    const awaitingPaymentCount = (deals as any[]).filter(d => isDealAwaitingPayment(d)).length;

    const totalInvested = paidDeals.reduce((acc: number, d: any) => acc + (d.amount || 0), 0);
    const avgCheckSize = paidDeals.length > 0 ? Math.round(totalInvested / paidDeals.length) : 0;
    const equitySum = paidDeals.reduce((acc: number, d: any) => acc + (d.equity || 0), 0);
    const avgEquity = paidDeals.length > 0 ? Math.round((equitySum / paidDeals.length) * 10) / 10 : 0;

    const totalDeals = totalDealsCount;
    const closedCount = paidDealsCount + rejectedDealsCount;
    const winRate = closedCount > 0 ? Math.round((paidDealsCount / closedCount) * 100) : 0;

    const watchlist = (investor?.watchlist || []) as any[];
    const watchlistCount = watchlist.length;

    const prefs: string[] = investor?.industryPreferences || [];
    let matchingPitches = 0;
    if (prefs.length > 0) {
        matchingPitches = await Pitch.countDocuments({ status: 'approved', industry: { $in: prefs } });
    }

    const avgPitchAsk = Math.round(marketAvgAgg[0]?.avg || 0);
    const totalCapitalSeeking = marketTotalAgg[0]?.total || 0;

    const now = new Date();
    const months: { start: Date; end: Date; label: string }[] = [];
    for (let i = 5; i >= 0; i--) {
        const start = startOfMonth(new Date(now.getFullYear(), now.getMonth() - i, 1));
        const end = startOfMonth(new Date(now.getFullYear(), now.getMonth() - i + 1, 1));
        months.push({ start, end, label: monthLabel(start) });
    }

    const investmentTrend: TrendPoint[] = await Promise.all(months.map(async m => {
        const agg = await Deal.aggregate([
            { $match: getPaidDealQuery({ investor: iId, paidAt: { $gte: m.start, $lt: m.end } }) },
            { $group: { _id: null, total: { $sum: '$amount' } } },
        ]);
        // Fallback for legacy deals with no paidAt — use createdAt
        if (!agg[0]?.total) {
            const fallback = await Deal.aggregate([
                {
                    $match: {
                        investor: iId,
                        status: 'approved',
                        paidAt: { $exists: false },
                        createdAt: { $gte: m.start, $lt: m.end },
                    },
                },
                { $group: { _id: null, total: { $sum: '$amount' } } },
            ]);
            return { label: m.label, value: fallback[0]?.total || 0 };
        }
        return { label: m.label, value: agg[0].total };
    }));

    const dealsTrend: TrendPoint[] = await Promise.all(months.map(async m => {
        const c = await Deal.countDocuments({ investor: iId, createdAt: { $gte: m.start, $lt: m.end } });
        return { label: m.label, value: c };
    }));

    const marketActivity: TrendPoint[] = await Promise.all(months.map(async m => {
        const c = await Pitch.countDocuments({ status: 'approved', createdAt: { $gte: m.start, $lt: m.end } });
        return { label: m.label, value: c };
    }));

    const portfolioByIndustryMap = new Map<string, number>();
    const portfolioByStageMap = new Map<string, number>();
    for (const d of paidDeals) {
        const industry = (d.pitch as any)?.industry || 'Other';
        const stage = (d.pitch as any)?.stage || 'Unknown';
        portfolioByIndustryMap.set(industry, (portfolioByIndustryMap.get(industry) || 0) + (d.amount || 0));
        portfolioByStageMap.set(stage, (portfolioByStageMap.get(stage) || 0) + 1);
    }
    const portfolioByIndustry: ChartPoint[] = Array.from(portfolioByIndustryMap.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([label, value], i) => ({ label, value, color: PALETTE[i % PALETTE.length] }));

    const portfolioByStage: ChartPoint[] = Array.from(portfolioByStageMap.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([label, value], i) => ({ label, value, color: PALETTE[i % PALETTE.length] }));

    const watchlistByIndustryMap = new Map<string, number>();
    for (const w of watchlist) {
        const industry = w.industry || 'Other';
        watchlistByIndustryMap.set(industry, (watchlistByIndustryMap.get(industry) || 0) + 1);
    }
    const watchlistByIndustry: ChartPoint[] = Array.from(watchlistByIndustryMap.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([label, value], i) => ({ label, value, color: PALETTE[i % PALETTE.length] }));

    const dealStatus: ChartPoint[] = [
        { label: 'Awaiting Payment', value: awaitingPaymentCount, color: STATUS_COLORS.pending },
        { label: 'Paid', value: paidDealsCount, color: STATUS_COLORS.paid },
        { label: 'Rejected', value: rejectedDealsCount, color: STATUS_COLORS.rejected },
    ].filter(p => p.value > 0);

    const portfolioList = paidDeals
        .sort((a: any, b: any) => {
            const aDate = a.paidAt ? new Date(a.paidAt).getTime() : new Date(a.createdAt).getTime();
            const bDate = b.paidAt ? new Date(b.paidAt).getTime() : new Date(b.createdAt).getTime();
            return bDate - aDate;
        })
        .slice(0, 5)
        .map((d: any) => ({
            businessName: d.pitch?.businessName || 'Unknown',
            industry: d.pitch?.industry || '—',
            amount: d.amount || 0,
            equity: d.equity || 0,
            date: d.paidAt || d.createdAt,
        }));

    const activity = (notifications as any[]).map(n => ({
        type: n.type,
        message: n.message,
        date: n.createdAt,
        isRead: n.isRead,
    }));

    const unreadMessages = (unreadConvos as any[]).reduce((sum, c) => {
        const counts = c.unreadCounts;
        if (!counts) return sum;
        if (counts instanceof Map) return sum + (counts.get(investorId) || 0);
        return sum + (counts[investorId] || 0);
    }, 0);

    return {
        portfolio: {
            totalInvested,
            activeInvestments: paidDeals.length,
            avgCheckSize,
            avgEquity,
            totalEquityHeld: Math.round(equitySum * 10) / 10,
        },
        deals: {
            total: totalDeals,
            pending: awaitingPaymentCount,
            approved: paidDealsCount,
            rejected: rejectedDealsCount,
            winRate,
        },
        discovery: {
            watchlistCount,
            availablePitches,
            matchingPitches,
            activeChats,
            completedChats,
            unreadMessages,
        },
        market: {
            avgPitchAsk,
            totalCapitalSeeking,
        },
        trends: {
            investmentTrend,
            dealsTrend,
            marketActivity,
        },
        distributions: {
            portfolioByIndustry,
            portfolioByStage,
            dealStatus,
            watchlistByIndustry,
        },
        portfolioList,
        activity,
    };
}
