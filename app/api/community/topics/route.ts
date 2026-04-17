import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import CommunityTopic from '@/models/CommunityTopic';
import { cookies } from 'next/headers';
import * as jose from 'jose';

// Helper to get session and verify role
async function getSession() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return null;

    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret');
        const { payload } = await jose.jwtVerify(token, secret);
        return payload;
    } catch (e) {
        return null;
    }
}

export async function GET(req: Request) {
    try {
        await dbConnect();
        const session = await getSession();

        // Only Admin and Investor can view topics
        if (!session || !session.role || !['admin', 'investor'].includes((session.role as string).toLowerCase())) {
            return NextResponse.json({ success: false, message: 'Unauthorized access' }, { status: 401 });
        }

        const topics = await CommunityTopic.find()
            .sort({ lastMessageAt: -1, createdAt: -1 })
            .select('-__v');

        return NextResponse.json({ success: true, count: topics.length, data: topics });
    } catch (error: any) {
        console.error('Error fetching topics:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        const session = await getSession();

        // Only Admin can create topics
        if (!session || !session.role || (session.role as string).toLowerCase() !== 'admin') {
            return NextResponse.json({ success: false, message: 'Unauthorized access. Only Admins can create topics.' }, { status: 401 });
        }

        const body = await req.json();
        const { title } = body;

        if (!title) {
            return NextResponse.json({ success: false, message: 'Topic title is required' }, { status: 400 });
        }

        const topic = await CommunityTopic.create({
            title,
            createdBy: session.id
        });

        return NextResponse.json({ success: true, data: topic }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating topic:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
