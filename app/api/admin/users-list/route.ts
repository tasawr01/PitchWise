import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Entrepreneur from '@/models/Entrepreneur';
import Investor from '@/models/Investor';
import { jwtVerify } from 'jose';

async function verifyAdmin(req: Request) {
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
    if (!await verifyAdmin(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status'); // 'pending', 'approved', 'rejected', or null for all

    try {
        const baseQuery: any = {};
        if (status && status !== 'all') {
            baseQuery.status = status;
        }

        // Always exclude unverified pending users
        // Users are included if:
        // 1. Their status is NOT pending
        // OR
        // 2. Their status IS pending AND they are verified
        const query = {
            $and: [
                baseQuery,
                {
                    $or: [
                        { status: { $ne: 'pending' } },
                        { status: 'pending', isEmailVerified: true }
                    ]
                }
            ]
        };

        const entrepreneurs = await Entrepreneur.find(query).select('-password').sort({ createdAt: -1 }).lean();
        const investors = await Investor.find(query).select('-password').sort({ createdAt: -1 }).lean();

        const formattedEntrepreneurs = entrepreneurs.map((user: any) => ({ ...user, role: 'entrepreneur' }));
        const formattedInvestors = investors.map((user: any) => ({ ...user, role: 'investor' }));

        // Merge and sort by date
        const allUsers = [...formattedEntrepreneurs, ...formattedInvestors].sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        return NextResponse.json({ users: allUsers });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
