import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Settings from '@/models/Settings';
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
    const settings = await Settings.getSettings();
    return NextResponse.json(settings);
}

export async function POST(req: Request) {
    if (!await verifyAdmin(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await dbConnect();
    const updateData = await req.json();

    // Find One and Update (Singleton concept)
    const settings = await Settings.findOneAndUpdate({}, updateData, { new: true, upsert: true });

    return NextResponse.json({ message: 'Settings saved', settings });
}
