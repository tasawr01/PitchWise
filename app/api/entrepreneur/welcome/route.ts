import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import Entrepreneur from '@/models/Entrepreneur';
import { jwtVerify } from 'jose';

async function getEntrepreneurId(req: Request) {
    const token = req.headers.get('cookie')?.match(/token=([^;]+)/)?.[1];
    if (!token) return null;
    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        if (payload.role !== 'entrepreneur') return null;
        return payload.id;
    } catch {
        return null;
    }
}

export async function GET(req: Request) {
    try {
        await dbConnect();
        const id = await getEntrepreneurId(req);
        if (!id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const user = await Entrepreneur.findById(id).select('hasSeenWelcome');
        console.log(`[Welcome API] GET User ${id} hasSeenWelcome:`, user?.hasSeenWelcome);
        return NextResponse.json({ hasSeenWelcome: user?.hasSeenWelcome });
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        const id = await getEntrepreneurId(req);
        if (!id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Bypass Mongoose strict mode schema validation by using the native driver
        // This ensures the field is added even if the Schema cache is stale
        await mongoose.connection.collection('entrepreneurs').updateOne(
            { _id: new mongoose.Types.ObjectId(id as string) },
            { $set: { hasSeenWelcome: true } }
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
