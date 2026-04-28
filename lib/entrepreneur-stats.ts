import dbConnect from '@/lib/db';
import Pitch from '@/models/Pitch';
import Deal from '@/models/Deal';
import Conversation from '@/models/Conversation';
import Investor from '@/models/Investor';
import Notification from '@/models/Notification';
import mongoose from 'mongoose';

export interface ChartPoint { label: string; value: number; color: string }
export interface TrendPoint { label: string; value: number }

export interface EntrepreneurStats {
    pitches: {
        total: number;
        draft: number;
        pending: number;
        approved: number;
        rejected: number;
        totalViews: number;
        avgViews: number;
        topPitch: { businessName: string; views: number; industry: string } | null;
    };
    deals: {
        total: number;
        pending: number;
        approved: number;
        rejected: number;
        totalRaised: number;
        avgDealSize: number;
        avgEquityGiven: number;
    };
    pipeline: {
        activeChats: number;
        completedChats: number;
        discardedChats: number;
        uniqueInvestors: number;
        watchlistedBy: number;
        unreadMessages: number;
    };
    funding: {
        targetTotal: number;
        raisedPercent: number;
        avgValuation: number;
    };
    trends: {
        pitchViewsTrend: TrendPoint[];
        dealsTrend: TrendPoint[];
        fundingTrend: TrendPoint[];
    };
    distributions: {
        pitchStatus: ChartPoint[];
        dealStatus: ChartPoint[];
        investorTypes: ChartPoint[];
        viewsPerPitch: ChartPoint[];
    };
    pitches_list: { businessName: string; status: string; views: number; industry: string; amountRequired: number }[];
    activity: { type: string; message: string; date: Date; isRead: boolean }[];
}

const STATUS_COLORS: Record<string, string> = {
    draft: '#9ca3af',
    pending: '#f59e0b',
    approved: '#10b981',
    rejected: '#ef4444',
    permanently_rejected: '#7f1d1d',
};

const PALETTE = ['#0B2C4A', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

function startOfMonth(d: Date) {
    return new Date(d.getFullYear(), d.getMonth(), 1);
}
function monthLabel(d: Date) {
    return d.toLocaleString('en-US', { month: 'short' });
}

export async function getEntrepreneurStats(entrepreneurId: string): Promise<EntrepreneurStats> {
    await dbConnect();
    const eId = new mongoose.Types.ObjectId(entrepreneurId);

    const [
        pitches,
        viewsAgg,
        topPitchRaw,
        totalDeals,
        pendingDeals,
        approvedDeals,
        rejectedDeals,
        approvedDealsList,
        equityAvgAgg,
        valuationAgg,
        activeChats,
        completedChats,
        discardedChats,
        uniqueInvestorIds,
        watchlistedBy,
        unreadConvos,
        notifications,
    ] = await Promise.all([
        Pitch.find({ entrepreneur: eId }).select('businessName status views industry amountRequired createdAt').lean(),
        Pitch.aggregate([
            { $match: { entrepreneur: eId } },
            { $group: { _id: null, total: { $sum: '$views' } } },
        ]),
        Pitch.findOne({ entrepreneur: eId }).sort({ views: -1 }).select('businessName views industry').lean(),
        Deal.countDocuments({ entrepreneur: eId }),
        Deal.countDocuments({ entrepreneur: eId, status: 'pending' }),
        Deal.countDocuments({ entrepreneur: eId, status: 'approved' }),
        Deal.countDocuments({ entrepreneur: eId, status: 'rejected' }),
        Deal.find({ entrepreneur: eId, status: 'approved' }).select('amount equity createdAt investor').lean(),
        Deal.aggregate([
            { $match: { entrepreneur: eId, status: 'approved' } },
            { $group: { _id: null, avg: { $avg: '$equity' } } },
        ]),
        Pitch.aggregate([
            { $match: { entrepreneur: eId, valuation: { $ne: null } } },
            { $group: { _id: null, avg: { $avg: '$valuation' } } },
        ]),
        Conversation.countDocuments({
            type: 'pitch',
            dealStatus: 'in_progress',
            'participants.user': eId,
        }),
        Conversation.countDocuments({
            type: 'pitch',
            dealStatus: 'completed',
            'participants.user': eId,
        }),
        Conversation.countDocuments({
            type: 'pitch',
            dealStatus: 'discarded',
            'participants.user': eId,
        }),
        Deal.distinct('investor', { entrepreneur: eId }),
        Pitch.find({ entrepreneur: eId }).select('_id').lean().then(async ps => {
            const ids = ps.map(p => p._id);
            return Investor.countDocuments({ watchlist: { $in: ids } });
        }),
        Conversation.find({ type: 'pitch', 'participants.user': eId }).select('unreadCounts').lean(),
        Notification.find({ recipient: eId, recipientModel: 'Entrepreneur' })
            .sort({ createdAt: -1 })
            .limit(8)
            .lean(),
    ]);

    const total = pitches.length;
    const draft = pitches.filter((p: any) => p.status === 'draft').length;
    const pending = pitches.filter((p: any) => p.status === 'pending').length;
    const approved = pitches.filter((p: any) => p.status === 'approved').length;
    const rejected = pitches.filter((p: any) => p.status === 'rejected' || p.status === 'permanently_rejected').length;
    const totalViews = viewsAgg[0]?.total || 0;
    const avgViews = total > 0 ? Math.round(totalViews / total) : 0;
    const topPitch = topPitchRaw
        ? { businessName: (topPitchRaw as any).businessName || 'Untitled', views: (topPitchRaw as any).views || 0, industry: (topPitchRaw as any).industry || '—' }
        : null;

    const totalRaised = approvedDealsList.reduce((acc: number, d: any) => acc + (d.amount || 0), 0);
    const avgDealSize = approvedDeals > 0 ? Math.round(totalRaised / approvedDeals) : 0;
    const avgEquityGiven = Math.round((equityAvgAgg[0]?.avg || 0) * 10) / 10;

    const targetTotal = pitches.reduce((acc: number, p: any) => acc + (p.amountRequired || 0), 0);
    const raisedPercent = targetTotal > 0 ? Math.round((totalRaised / targetTotal) * 100) : 0;
    const avgValuation = Math.round(valuationAgg[0]?.avg || 0);

    // Trends (last 6 months)
    const now = new Date();
    const months: { start: Date; end: Date; label: string }[] = [];
    for (let i = 5; i >= 0; i--) {
        const start = startOfMonth(new Date(now.getFullYear(), now.getMonth() - i, 1));
        const end = startOfMonth(new Date(now.getFullYear(), now.getMonth() - i + 1, 1));
        months.push({ start, end, label: monthLabel(start) });
    }

    const dealsTrend: TrendPoint[] = await Promise.all(months.map(async m => {
        const c = await Deal.countDocuments({ entrepreneur: eId, status: 'approved', createdAt: { $gte: m.start, $lt: m.end } });
        return { label: m.label, value: c };
    }));

    const fundingTrend: TrendPoint[] = await Promise.all(months.map(async m => {
        const agg = await Deal.aggregate([
            { $match: { entrepreneur: eId, status: 'approved', createdAt: { $gte: m.start, $lt: m.end } } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
        ]);
        return { label: m.label, value: agg[0]?.total || 0 };
    }));

    // Pitch view trend approximated via createdAt of pitches (not real per-day views, but new-pitches per month)
    const pitchViewsTrend: TrendPoint[] = await Promise.all(months.map(async m => {
        const c = await Pitch.countDocuments({ entrepreneur: eId, createdAt: { $gte: m.start, $lt: m.end } });
        return { label: m.label, value: c };
    }));

    const pitchStatus: ChartPoint[] = [
        { label: 'Draft', value: draft, color: STATUS_COLORS.draft },
        { label: 'Pending', value: pending, color: STATUS_COLORS.pending },
        { label: 'Approved', value: approved, color: STATUS_COLORS.approved },
        { label: 'Rejected', value: rejected, color: STATUS_COLORS.rejected },
    ].filter(p => p.value > 0);

    const dealStatus: ChartPoint[] = [
        { label: 'Pending', value: pendingDeals, color: STATUS_COLORS.pending },
        { label: 'Approved', value: approvedDeals, color: STATUS_COLORS.approved },
        { label: 'Rejected', value: rejectedDeals, color: STATUS_COLORS.rejected },
    ].filter(p => p.value > 0);

    // Investor type distribution among approved deal investors
    let investorTypes: ChartPoint[] = [];
    if (uniqueInvestorIds.length > 0) {
        const typeAgg = await Investor.aggregate([
            { $match: { _id: { $in: uniqueInvestorIds }, investorType: { $ne: null } } },
            { $group: { _id: '$investorType', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);
        investorTypes = typeAgg.map((r: any, i: number) => ({
            label: r._id,
            value: r.count,
            color: PALETTE[i % PALETTE.length],
        }));
    }

    const viewsPerPitch: ChartPoint[] = pitches
        .filter((p: any) => (p.views || 0) > 0)
        .sort((a: any, b: any) => (b.views || 0) - (a.views || 0))
        .slice(0, 6)
        .map((p: any, i: number) => ({
            label: (p.businessName || 'Untitled').slice(0, 14),
            value: p.views || 0,
            color: PALETTE[i % PALETTE.length],
        }));

    const pitches_list = pitches
        .sort((a: any, b: any) => (b.views || 0) - (a.views || 0))
        .slice(0, 5)
        .map((p: any) => ({
            businessName: p.businessName || 'Untitled',
            status: p.status,
            views: p.views || 0,
            industry: p.industry || '—',
            amountRequired: p.amountRequired || 0,
        }));

    const activity = (notifications as any[]).map(n => ({
        type: n.type,
        message: n.message,
        date: n.createdAt,
        isRead: n.isRead,
    }));

    return {
        pitches: {
            total,
            draft,
            pending,
            approved,
            rejected,
            totalViews,
            avgViews,
            topPitch,
        },
        deals: {
            total: totalDeals,
            pending: pendingDeals,
            approved: approvedDeals,
            rejected: rejectedDeals,
            totalRaised,
            avgDealSize,
            avgEquityGiven,
        },
        pipeline: {
            activeChats,
            completedChats,
            discardedChats,
            uniqueInvestors: uniqueInvestorIds.length,
            watchlistedBy,
            unreadMessages: (unreadConvos as any[]).reduce((sum, c) => {
                const counts = c.unreadCounts;
                if (!counts) return sum;
                if (counts instanceof Map) return sum + (counts.get(entrepreneurId) || 0);
                return sum + (counts[entrepreneurId] || 0);
            }, 0),
        },
        funding: {
            targetTotal,
            raisedPercent,
            avgValuation,
        },
        trends: {
            pitchViewsTrend,
            dealsTrend,
            fundingTrend,
        },
        distributions: {
            pitchStatus,
            dealStatus,
            investorTypes,
            viewsPerPitch,
        },
        pitches_list,
        activity,
    };
}
