import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { getPusherServer } from '@/lib/pusher';
import { verifyToken } from '@/lib/auth';
import Conversation from '@/models/Conversation';
import CommunityTopic from '@/models/CommunityTopic';

export async function POST(req: NextRequest) {
    try {
        const pusher = getPusherServer();
        if (!pusher) {
            return NextResponse.json({ error: 'Pusher is not configured' }, { status: 500 });
        }

        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const payload = await verifyToken(token);
        if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        const formData = await req.formData();
        const socketId = String(formData.get('socket_id') || '');
        const channelName = String(formData.get('channel_name') || '');

        if (!socketId || !channelName) {
            return NextResponse.json({ error: 'Missing Pusher auth data' }, { status: 400 });
        }

        await dbConnect();

        if (channelName.startsWith('private-conversation-')) {
            const conversationId = channelName.replace('private-conversation-', '');
            const conversation = await Conversation.findOne({
                _id: conversationId,
                'participants.user': payload.id,
                status: 'active',
            }).select('_id');

            if (!conversation) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
        } else if (channelName.startsWith('private-community-topic-')) {
            const role = String(payload.role || '').toLowerCase();
            if (!['admin', 'investor'].includes(role)) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }

            const topicId = channelName.replace('private-community-topic-', '');
            const topic = await CommunityTopic.findById(topicId).select('_id');
            if (!topic) {
                return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
            }
        } else {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const authResponse = pusher.authorizeChannel(socketId, channelName);
        return NextResponse.json(authResponse);
    } catch (error) {
        console.error('Pusher auth error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
