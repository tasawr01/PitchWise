import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Pitch from '@/models/Pitch';
import { jwtVerify } from 'jose';

export async function GET(req: Request) {
    try {
        await dbConnect();

        // Manually verify token since it's an API route and we need User ID
        const token = req.headers.get('cookie')?.match(/token=([^;]+)/)?.[1];
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);

        if (payload.role !== 'entrepreneur') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const pitches = await Pitch.find({ entrepreneur: payload.id }).sort({ createdAt: -1 });

        return NextResponse.json({ pitches });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
