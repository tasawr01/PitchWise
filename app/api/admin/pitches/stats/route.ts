
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Pitch from '@/models/Pitch';
import PitchUpdate from '@/models/PitchUpdate';
import { jwtVerify } from 'jose';

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

        const [totalPitches, pendingPitches, updateRequests] = await Promise.all([
            Pitch.countDocuments({}),
            Pitch.countDocuments({ status: 'pending' }),
            PitchUpdate.countDocuments({ status: 'pending' })
        ]);

        return NextResponse.json({
            stats: {
                total: totalPitches,
                pending: pendingPitches,
                updates: updateRequests
            }
        });
    } catch (error) {
        console.error('Stats Fetch Error:', error);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}
