import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Pitch from '@/models/Pitch';
import Entrepreneur from '@/models/Entrepreneur'; // Used for population
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

        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');

        let query: any = { status: { $ne: 'draft' } }; // Default: Exclude drafts

        if (status && status !== 'all') {
            // If explicit status requested (e.g. pending), use it. 
            // If status is 'all', we keep the default exclusion.
            query = { status };
        }

        const pitches = await Pitch.find(query)
            .populate('entrepreneur', 'fullName') // Populate entrepreneur name
            .sort({ createdAt: -1 });

        return NextResponse.json({ pitches });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
