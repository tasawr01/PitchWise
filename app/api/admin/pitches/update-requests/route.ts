import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import PitchUpdate from '@/models/PitchUpdate';
import '@/models/Pitch'; // Ensure Pitch model is registered for population
import { jwtVerify } from 'jose';

// Helper to verify admin
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
    try {
        await dbConnect();
        const isAdmin = await verifyAdmin(req);
        if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const requests = await PitchUpdate.find({ status: 'pending' })
            .populate('entrepreneur', 'fullName email') // Populate basic entrepreneur info
            .populate('pitch') // Populate FULL original pitch for comparison
            .sort({ createdAt: -1 });

        return NextResponse.json({ requests });
    } catch (error: any) {
        console.error('Fetch Update Requests Error:', error);
        return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 });
    }
}
