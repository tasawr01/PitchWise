import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Pitch from '@/models/Pitch';

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

export async function POST(req: Request) {
    try {
        if (!await verifyAdminAuth(req)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const { pitchId, status } = await req.json();

        if (!['approved', 'rejected'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        const pitch = await Pitch.findByIdAndUpdate(
            pitchId,
            { status },
            { new: true }
        );

        if (!pitch) {
            return NextResponse.json({ error: 'Pitch not found' }, { status: 404 });
        }

        // Trigger Notification


        return NextResponse.json({ message: `Pitch ${status} successfully`, pitch });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
