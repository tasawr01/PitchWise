import dbConnect from '@/lib/db';
import Entrepreneur from '@/models/Entrepreneur';
import Investor from '@/models/Investor';
import Pitch from '@/models/Pitch';
import Deal from '@/models/Deal';
import Conversation from '@/models/Conversation';
import Message from '@/models/Message';
import Blog from '@/models/Blog';
import Newsletter from '@/models/Newsletter';
import CommunityTopic from '@/models/CommunityTopic';
import { getPaidDealQuery } from '@/lib/deal-status';

export interface ChartPoint { label: string; value: number; color: string }
export interface TrendPoint { label: string; value: number }

export interface AdminStats {
    users: {
        total: number;
        entrepreneurs: number;
        investors: number;
        pendingApproval: number;
        verified: number;
        emailVerified: number;
        newThisMonth: number;
        newLastMonth: number;
        userGrowthPct: number;
    };
    pitches: {
        total: number;
        draft: number;
        pending: number;
        approved: number;
        rejected: number;
        permanentlyRejected: number;
        totalViews: number;
        avgViews: number;
        newThisMonth: number;
        approvalRate: number;
    };
    deals: {
        total: number;
        pending: number;
        approved: number;
        rejected: number;
        totalVolume: number;
        avgDealSize: number;
        avgEquity: number;
        newThisMonth: number;
        successRate: number;
    };
    engagement: {
        activeConversations: number;
        completedConversations: number;
        discardedConversations: number;
        totalMessages: number;
        messagesThisMonth: number;
        communityTopics: number;
        newsletterSubs: number;
        blogPosts: number;
        supportConversations: number;
    };
    trends: {
        userGrowth: TrendPoint[];
        pitchTrend: TrendPoint[];
        fundingVolume: TrendPoint[];
        dealsTrend: TrendPoint[];
    };
    distributions: {
        industries: ChartPoint[];
        pitchStages: ChartPoint[];
        pitchStatus: ChartPoint[];
        investorTypes: ChartPoint[];
        dealsStatus: ChartPoint[];
        userRoles: ChartPoint[];
    };
    funnel: ChartPoint[];
    topPitches: { businessName: string; industry: string; views: number; status: string; amountRequired: number }[];
    acquisitionSources: ChartPoint[];
}

const PALETTE = ['#0B2C4A', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316'];

const STATUS_COLORS: Record<string, string> = {
    draft: '#9ca3af',
    pending: '#f59e0b',
    approved: '#10b981',
    rejected: '#ef4444',
    permanently_rejected: '#7f1d1d',
};

function startOfMonth(d: Date) {
    return new Date(d.getFullYear(), d.getMonth(), 1);
}

function monthLabel(d: Date) {
    return d.toLocaleString('en-US', { month: 'short' });
}

async function buildMonthlyTrend(
    fetchByRange: (start: Date, end: Date) => Promise<number>,
    months: number = 6
): Promise<TrendPoint[]> {
    const result: TrendPoint[] = [];
    const now = new Date();
    for (let i = months - 1; i >= 0; i--) {
        const start = startOfMonth(new Date(now.getFullYear(), now.getMonth() - i, 1));
        const end = startOfMonth(new Date(now.getFullYear(), now.getMonth() - i + 1, 1));
        const value = await fetchByRange(start, end);
        result.push({ label: monthLabel(start), value });
    }
    return result;
}

export async function getAdminStats(): Promise<AdminStats> {
    await dbConnect();

    const now = new Date();
    const thisMonthStart = startOfMonth(now);
    const lastMonthStart = startOfMonth(new Date(now.getFullYear(), now.getMonth() - 1, 1));

    const [
        totalEntrepreneurs,
        totalInvestors,
        pendingEntrepreneurs,
        pendingInvestors,
        verifiedEntrepreneurs,
        verifiedInvestors,
        emailVerifiedEntrepreneurs,
        emailVerifiedInvestors,
        entrepreneursThisMonth,
        investorsThisMonth,
        entrepreneursLastMonth,
        investorsLastMonth,
        totalPitches,
        draftPitches,
        pendingPitches,
        approvedPitches,
        rejectedPitches,
        permRejectedPitches,
        pitchesThisMonth,
        viewsAgg,
        totalDeals,
        pendingDeals,
        approvedDeals,
        rejectedDeals,
        dealsThisMonth,
        volumeAgg,
        equityAgg,
        activeConvos,
        completedConvos,
        discardedConvos,
        supportConvos,
        totalMessages,
        messagesThisMonth,
        topicsCount,
        newsletterCount,
        blogCount,
        topPitchesRaw,
        industryAgg,
        stageAgg,
        investorTypeAgg,
        acquisitionAgg,
    ] = await Promise.all([
        Entrepreneur.countDocuments(),
        Investor.countDocuments(),
        Entrepreneur.countDocuments({ status: 'pending' }),
        Investor.countDocuments({ status: 'pending' }),
        Entrepreneur.countDocuments({ status: 'approved' }),
        Investor.countDocuments({ status: 'approved' }),
        Entrepreneur.countDocuments({ isEmailVerified: true }),
        Investor.countDocuments({ isEmailVerified: true }),
        Entrepreneur.countDocuments({ createdAt: { $gte: thisMonthStart } }),
        Investor.countDocuments({ createdAt: { $gte: thisMonthStart } }),
        Entrepreneur.countDocuments({ createdAt: { $gte: lastMonthStart, $lt: thisMonthStart } }),
        Investor.countDocuments({ createdAt: { $gte: lastMonthStart, $lt: thisMonthStart } }),
        Pitch.countDocuments(),
        Pitch.countDocuments({ status: 'draft' }),
        Pitch.countDocuments({ status: 'pending' }),
        Pitch.countDocuments({ status: 'approved' }),
        Pitch.countDocuments({ status: 'rejected' }),
        Pitch.countDocuments({ status: 'permanently_rejected' }),
        Pitch.countDocuments({ createdAt: { $gte: thisMonthStart } }),
        Pitch.aggregate([{ $group: { _id: null, total: { $sum: '$views' } } }]),
        Deal.countDocuments(),
        // Awaiting payment: not paid and not rejected
        Deal.countDocuments({
            status: { $ne: 'rejected' },
            paymentStatus: { $ne: 'paid' },
            // Exclude legacy already-paid deals (status approved/completed without paymentStatus)
            $nor: [{ status: { $in: ['approved', 'completed'] } }],
        }),
        Deal.countDocuments(getPaidDealQuery()),
        Deal.countDocuments({ status: 'rejected' }),
        Deal.countDocuments({ createdAt: { $gte: thisMonthStart } }),
        Deal.aggregate([
            { $match: getPaidDealQuery() },
            { $group: { _id: null, total: { $sum: '$amount' }, avg: { $avg: '$amount' } } },
        ]),
        Deal.aggregate([
            { $match: getPaidDealQuery() },
            { $group: { _id: null, avg: { $avg: '$equity' } } },
        ]),
        Conversation.countDocuments({ type: 'pitch', dealStatus: 'in_progress' }),
        Conversation.countDocuments({ type: 'pitch', dealStatus: 'completed' }),
        Conversation.countDocuments({ type: 'pitch', dealStatus: 'discarded' }),
        Conversation.countDocuments({ type: 'support' }),
        Message.countDocuments(),
        Message.countDocuments({ createdAt: { $gte: thisMonthStart } }),
        CommunityTopic.countDocuments(),
        Newsletter.countDocuments(),
        Blog.countDocuments(),
        Pitch.find({ status: 'approved' })
            .sort({ views: -1 })
            .limit(5)
            .select('businessName industry views status amountRequired')
            .lean(),
        Pitch.aggregate([
            { $match: { industry: { $ne: null, $exists: true } } },
            { $group: { _id: '$industry', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 6 },
        ]),
        Pitch.aggregate([
            { $match: { stage: { $ne: null, $exists: true } } },
            { $group: { _id: '$stage', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]),
        Investor.aggregate([
            { $match: { investorType: { $ne: null, $exists: true } } },
            { $group: { _id: '$investorType', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 6 },
        ]),
        Entrepreneur.aggregate([
            { $match: { howDidYouHear: { $ne: null, $exists: true } } },
            { $group: { _id: '$howDidYouHear', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
        ]),
    ]);

    const totalUsers = totalEntrepreneurs + totalInvestors;
    const newThisMonth = entrepreneursThisMonth + investorsThisMonth;
    const newLastMonth = entrepreneursLastMonth + investorsLastMonth;
    const userGrowthPct = newLastMonth === 0
        ? (newThisMonth > 0 ? 100 : 0)
        : Math.round(((newThisMonth - newLastMonth) / newLastMonth) * 100);

    const totalViews = viewsAgg[0]?.total || 0;
    const avgViews = totalPitches > 0 ? Math.round(totalViews / totalPitches) : 0;
    const reviewedPitches = approvedPitches + rejectedPitches + permRejectedPitches;
    const approvalRate = reviewedPitches > 0 ? Math.round((approvedPitches / reviewedPitches) * 100) : 0;

    const totalVolume = volumeAgg[0]?.total || 0;
    const avgDealSize = volumeAgg[0]?.avg || 0;
    const avgEquity = equityAgg[0]?.avg || 0;
    const closedDeals = approvedDeals + rejectedDeals;
    const successRate = closedDeals > 0 ? Math.round((approvedDeals / closedDeals) * 100) : 0;

    // Trend lines (last 6 months)
    const userGrowth = await buildMonthlyTrend(async (start, end) => {
        const [e, i] = await Promise.all([
            Entrepreneur.countDocuments({ createdAt: { $gte: start, $lt: end } }),
            Investor.countDocuments({ createdAt: { $gte: start, $lt: end } }),
        ]);
        return e + i;
    });

    const pitchTrend = await buildMonthlyTrend(async (start, end) => {
        return Pitch.countDocuments({ createdAt: { $gte: start, $lt: end } });
    });

    const fundingVolume = await buildMonthlyTrend(async (start, end) => {
        // Bucket by paidAt when available, falling back to createdAt for legacy deals
        const agg = await Deal.aggregate([
            {
                $match: {
                    $or: [
                        { paymentStatus: 'paid', paidAt: { $gte: start, $lt: end } },
                        { paymentStatus: 'paid', paidAt: { $exists: false }, createdAt: { $gte: start, $lt: end } },
                        { status: { $in: ['approved', 'completed'] }, paymentStatus: { $ne: 'paid' }, createdAt: { $gte: start, $lt: end } },
                    ],
                },
            },
            { $group: { _id: null, total: { $sum: '$amount' } } },
        ]);
        return agg[0]?.total || 0;
    });

    const dealsTrend = await buildMonthlyTrend(async (start, end) => {
        return Deal.countDocuments({
            $or: [
                { paymentStatus: 'paid', paidAt: { $gte: start, $lt: end } },
                { paymentStatus: 'paid', paidAt: { $exists: false }, createdAt: { $gte: start, $lt: end } },
                { status: { $in: ['approved', 'completed'] }, paymentStatus: { $ne: 'paid' }, createdAt: { $gte: start, $lt: end } },
            ],
        });
    });

    const industries: ChartPoint[] = industryAgg.map((r: any, i: number) => ({
        label: r._id,
        value: r.count,
        color: PALETTE[i % PALETTE.length],
    }));

    const pitchStages: ChartPoint[] = stageAgg.map((r: any, i: number) => ({
        label: r._id,
        value: r.count,
        color: PALETTE[i % PALETTE.length],
    }));

    const pitchStatus: ChartPoint[] = [
        { label: 'Draft', value: draftPitches, color: STATUS_COLORS.draft },
        { label: 'Pending', value: pendingPitches, color: STATUS_COLORS.pending },
        { label: 'Approved', value: approvedPitches, color: STATUS_COLORS.approved },
        { label: 'Rejected', value: rejectedPitches, color: STATUS_COLORS.rejected },
        { label: 'Perm. Rejected', value: permRejectedPitches, color: STATUS_COLORS.permanently_rejected },
    ].filter(s => s.value > 0);

    const investorTypes: ChartPoint[] = investorTypeAgg.map((r: any, i: number) => ({
        label: r._id,
        value: r.count,
        color: PALETTE[i % PALETTE.length],
    }));

    const dealsStatus: ChartPoint[] = [
        { label: 'Awaiting Payment', value: pendingDeals, color: STATUS_COLORS.pending },
        { label: 'Paid', value: approvedDeals, color: STATUS_COLORS.approved },
        { label: 'Rejected', value: rejectedDeals, color: STATUS_COLORS.rejected },
    ].filter(s => s.value > 0);

    const userRoles: ChartPoint[] = [
        { label: 'Entrepreneurs', value: totalEntrepreneurs, color: '#3b82f6' },
        { label: 'Investors', value: totalInvestors, color: '#10b981' },
    ].filter(s => s.value > 0);

    const verifiedUsers = verifiedEntrepreneurs + verifiedInvestors;
    const emailVerified = emailVerifiedEntrepreneurs + emailVerifiedInvestors;

    const funnel: ChartPoint[] = [
        { label: 'Sign-ups', value: totalUsers, color: '#3b82f6' },
        { label: 'Email Verified', value: emailVerified, color: '#6366f1' },
        { label: 'Approved Users', value: verifiedUsers, color: '#8b5cf6' },
        { label: 'Pitches Submitted', value: totalPitches, color: '#a855f7' },
        { label: 'Deals Closed', value: approvedDeals, color: '#ec4899' },
    ];

    const acquisitionSources: ChartPoint[] = acquisitionAgg.map((r: any, i: number) => ({
        label: r._id,
        value: r.count,
        color: PALETTE[i % PALETTE.length],
    }));

    const topPitches = (topPitchesRaw as any[]).map(p => ({
        businessName: p.businessName || 'Untitled',
        industry: p.industry || '—',
        views: p.views || 0,
        status: p.status,
        amountRequired: p.amountRequired || 0,
    }));

    return {
        users: {
            total: totalUsers,
            entrepreneurs: totalEntrepreneurs,
            investors: totalInvestors,
            pendingApproval: pendingEntrepreneurs + pendingInvestors,
            verified: verifiedUsers,
            emailVerified,
            newThisMonth,
            newLastMonth,
            userGrowthPct,
        },
        pitches: {
            total: totalPitches,
            draft: draftPitches,
            pending: pendingPitches,
            approved: approvedPitches,
            rejected: rejectedPitches,
            permanentlyRejected: permRejectedPitches,
            totalViews,
            avgViews,
            newThisMonth: pitchesThisMonth,
            approvalRate,
        },
        deals: {
            total: totalDeals,
            pending: pendingDeals,
            approved: approvedDeals,
            rejected: rejectedDeals,
            totalVolume,
            avgDealSize: Math.round(avgDealSize),
            avgEquity: Math.round(avgEquity * 10) / 10,
            newThisMonth: dealsThisMonth,
            successRate,
        },
        engagement: {
            activeConversations: activeConvos,
            completedConversations: completedConvos,
            discardedConversations: discardedConvos,
            totalMessages,
            messagesThisMonth,
            communityTopics: topicsCount,
            newsletterSubs: newsletterCount,
            blogPosts: blogCount,
            supportConversations: supportConvos,
        },
        trends: {
            userGrowth,
            pitchTrend,
            fundingVolume,
            dealsTrend,
        },
        distributions: {
            industries,
            pitchStages,
            pitchStatus,
            investorTypes,
            dealsStatus,
            userRoles,
        },
        funnel,
        topPitches,
        acquisitionSources,
    };
}
