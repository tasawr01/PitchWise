import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import CommunityMessage from '@/models/CommunityMessage';
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

export async function GET(
    req: Request,
    { params }: { params: Promise<{ topicId: string }> }
) {
    try {
        await dbConnect();
        const session = await getSession();

        // Only Admin and Investor can view messages
        if (!session || !session.role || !['admin', 'investor'].includes((session.role as string).toLowerCase())) {
            return NextResponse.json({ success: false, message: 'Unauthorized access' }, { status: 401 });
        }

        const { topicId } = await params;

        // Verify topic exists
        const topic = await CommunityTopic.findById(topicId);
        if (!topic) {
            return NextResponse.json({ success: false, message: 'Topic not found' }, { status: 404 });
        }

        // Fetch messages and populate sender info
        const messages = await CommunityMessage.find({ topic: topicId })
            .sort({ createdAt: 1 })
            .populate({
                path: 'sender.user',
                select: 'name fullName email profileImage company avatar' 
                // Using common fields that Admin/Investor might have
            });

        return NextResponse.json({ success: true, count: messages.length, data: messages });
    } catch (error: any) {
        console.error('Error fetching messages:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
