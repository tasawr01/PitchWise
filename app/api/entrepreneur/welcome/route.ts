import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import Entrepreneur from '@/models/Entrepreneur';
import Investor from '@/models/Investor';
import { jwtVerify } from 'jose';

async function getUserFromToken(req: Request) {
    const token = req.headers.get('cookie')?.match(/token=([^;]+)/)?.[1];
    if (!token) return null;
    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        return { id: payload.id, role: payload.role };
    } catch {
        return null;
    }
}

export async function GET(req: Request) {
    try {
        await dbConnect();
        const userInfo = await getUserFromToken(req);
        if (!userInfo) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const Model = userInfo.role === 'entrepreneur' ? Entrepreneur : Investor;
        const user = await Model.findById(userInfo.id).select('hasSeenWelcome');
        console.log(`[Welcome API] GET User ${userInfo.id} (${userInfo.role}) hasSeenWelcome:`, user?.hasSeenWelcome);
        return NextResponse.json({ hasSeenWelcome: user?.hasSeenWelcome });
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        const userInfo = await getUserFromToken(req);
        if (!userInfo) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Determine collection name based on user role
        const collectionName = userInfo.role === 'entrepreneur' ? 'entrepreneurs' : 'investors';
        
        // Update using native MongoDB driver to bypass Mongoose schema cache
        await mongoose.connection.collection(collectionName).updateOne(
            { _id: new mongoose.Types.ObjectId(userInfo.id as string) },
            { $set: { hasSeenWelcome: true } }
        );

        console.log(`[Welcome API] POST User ${userInfo.id} (${userInfo.role}) marked hasSeenWelcome: true`);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
