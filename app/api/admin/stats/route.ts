import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Entrepreneur from '@/models/Entrepreneur';
import Investor from '@/models/Investor';
import Pitch from '@/models/Pitch';
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

        // 1. User Stats
        const totalEntrepreneurs = await Entrepreneur.countDocuments();
        const totalInvestors = await Investor.countDocuments();

        // 2. Pitch Stats
        const totalPitches = await Pitch.countDocuments();
        const pendingPitches = await Pitch.countDocuments({ status: 'pending' });
        const approvedPitches = await Pitch.countDocuments({ status: 'approved' });
        const rejectedPitches = await Pitch.countDocuments({ status: 'rejected' });

        // 3. Deal Stats (Dummy for now as per plan, or derived if we had Deal model)
        const completedDeals = 12; // Placeholder
        const discardedDeals = 5;  // Placeholder

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
                completed: completedDeals,
                discarded: discardedDeals
            }
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
