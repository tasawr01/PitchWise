import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Entrepreneur from '@/models/Entrepreneur';
import Investor from '@/models/Investor';
import Pitch from '@/models/Pitch';
import Deal from '@/models/Deal';
import { jwtVerify } from 'jose';

// Helper to verify admin
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

export async function GET(req: Request) {
    try {
        if (!await verifyAdminAuth(req)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        // 1. User Stats (Only counting APPROVED users as requested)
        const userQuery = { status: 'approved' };

        const totalEntrepreneurs = await Entrepreneur.countDocuments(userQuery);
        const totalInvestors = await Investor.countDocuments(userQuery);

        // 2. Pitch Stats
        const totalPitches = await Pitch.countDocuments();
        const pendingPitches = await Pitch.countDocuments({ status: 'pending' });
        const approvedPitches = await Pitch.countDocuments({ status: 'approved' });
        const rejectedPitches = await Pitch.countDocuments({ status: 'rejected' });

        // 3. Deal Stats
        const totalDeals = await Deal.countDocuments();
        const completedDeals = await Deal.countDocuments({ status: 'approved' });
        const discardedDeals = await Deal.countDocuments({ status: 'rejected' });
        const pendingDeals = await Deal.countDocuments({ status: 'pending' });

        // 4. Chart Data: User Growth (Last 6 Months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1);
        sixMonthsAgo.setHours(0, 0, 0, 0);

        const getGrowthData = async (Model: any) => {
            return await Model.aggregate([
                {
                    $match: {
                        createdAt: { $gte: sixMonthsAgo },
                        ...userQuery
                    }
                },
                {
                    $group: {
                        _id: {
                            month: { $month: "$createdAt" },
                            year: { $year: "$createdAt" }
                        },
                        count: { $sum: 1 }
                    }
                }
            ]);
        };

        const entGrowth = await getGrowthData(Entrepreneur);
        const invGrowth = await getGrowthData(Investor);

        // Combine and format for chart
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const growthChartData = [];

        for (let i = 0; i < 6; i++) {
            const d = new Date();
            d.setMonth(d.getMonth() - (5 - i));
            const monthIdx = d.getMonth();
            const year = d.getFullYear();

            const eCount = entGrowth.find(g => g._id.month === (monthIdx + 1) && g._id.year === year)?.count || 0;
            const iCount = invGrowth.find(g => g._id.month === (monthIdx + 1) && g._id.year === year)?.count || 0;

            growthChartData.push({
                label: months[monthIdx],
                value: eCount + iCount
            });
        }

        // 5. Chart Data: Deal Trends
        const dealTrendsData = [
            { label: 'Pending', value: pendingDeals, color: '#f59e0b' },
            { label: 'Completed', value: completedDeals, color: '#10b981' },
            { label: 'Discarded', value: discardedDeals, color: '#ef4444' },
        ];

        return NextResponse.json({
            users: {
                total: totalEntrepreneurs + totalInvestors,
                entrepreneurs: totalEntrepreneurs,
                investors: totalInvestors
            },
            pitches: {
                total: totalPitches,
                pending: pendingPitches,
                approved: approvedPitches,
                rejected: rejectedPitches
            },
            deals: {
                total: totalDeals,
                completed: completedDeals,
                discarded: discardedDeals,
                pending: pendingDeals
            },
            charts: {
                userGrowth: growthChartData,
                dealTrends: dealTrendsData
            }
        });

    } catch (error: any) {
        console.error('Stats API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
