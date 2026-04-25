import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import CommunityMessage from '@/models/CommunityMessage';
import CommunityTopic from '@/models/CommunityTopic';
import { cookies } from 'next/headers';
import * as jose from 'jose';
import { communityTopicChannel, getPusherServer } from '@/lib/pusher';

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

function roleToUserModel(role: string) {
    const normalizedRole = role.toLowerCase();
    if (normalizedRole === 'admin') return 'Admin';
    if (normalizedRole === 'investor') return 'Investor';
    return null;
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

export async function POST(
    req: Request,
    { params }: { params: Promise<{ topicId: string }> }
) {
    try {
        await dbConnect();
        const session = await getSession();

        if (!session || !session.role || !['admin', 'investor'].includes((session.role as string).toLowerCase())) {
            return NextResponse.json({ success: false, message: 'Unauthorized access' }, { status: 401 });
        }

        const userModel = roleToUserModel(session.role as string);
        if (!userModel) {
            return NextResponse.json({ success: false, message: 'Invalid role' }, { status: 403 });
        }

        const { topicId } = await params;
        const { content, type = 'text' } = await req.json();

        if (!String(content || '').trim()) {
            return NextResponse.json({ success: false, message: 'Message content is required' }, { status: 400 });
        }

        const topic = await CommunityTopic.findById(topicId);
        if (!topic) {
            return NextResponse.json({ success: false, message: 'Topic not found' }, { status: 404 });
        }

        const message = await CommunityMessage.create({
            topic: topicId,
            sender: {
                user: session.id,
                userModel,
            },
            content: String(content).trim(),
            type,
        });

        await message.populate({
            path: 'sender.user',
            select: 'name fullName email profileImage company avatar',
        });

        await CommunityTopic.findByIdAndUpdate(topicId, {
            lastMessageAt: new Date(),
        });

        const pusher = getPusherServer();
        if (pusher) {
            await pusher.trigger(communityTopicChannel(topicId), 'new-community-message', message.toObject());
        }

        return NextResponse.json({ success: true, data: message }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating community message:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
