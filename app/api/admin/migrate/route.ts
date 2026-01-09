import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Pitch from '@/models/Pitch';
import PitchUpdate from '@/models/PitchUpdate';
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

        // Rename linkedinUrl to websiteUrl in Pitch collection
        const pitchesResult = await Pitch.updateMany(
            {},
            { $rename: { 'linkedinUrl': 'websiteUrl' } }
        );

        // Rename linkedinUrl to websiteUrl in PitchUpdate collection
        const updatesResult = await PitchUpdate.updateMany(
            {},
            { $rename: { 'linkedinUrl': 'websiteUrl' } }
        );

        return NextResponse.json({
            message: 'Migration completed successfully',
            pitches: pitchesResult,
            updates: updatesResult
        });
    } catch (error: any) {
        console.error('Migration Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
