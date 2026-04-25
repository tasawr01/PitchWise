import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Message from '@/models/Message';
import Conversation from '@/models/Conversation';
import { verifyToken } from '@/lib/auth';
import { conversationChannel, getPusherServer } from '@/lib/pusher';

function roleToUserModel(role: string) {
    const normalizedRole = role.toLowerCase();
    if (normalizedRole === 'investor') return 'Investor';
    if (normalizedRole === 'entrepreneur') return 'Entrepreneur';
    if (normalizedRole === 'admin') return 'Admin';
    return null;
}

export async function GET(req: NextRequest) {
    try {
        await dbConnect();

        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const conversationId = searchParams.get('conversationId');

        if (!conversationId) {
            return NextResponse.json({ error: 'Missing conversationId' }, { status: 400 });
        }

        const payload = await verifyToken(token);
        if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        const conversation = await Conversation.findOne({
            _id: conversationId,
            'participants.user': payload.id,
            status: 'active',
        }).select('_id');

        if (!conversation) {
            return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
        }

        const messages = await Message.find({ conversation: conversationId })
            .sort({ createdAt: 1 }) // Oldest first
            .populate('sender.user', 'fullName profilePhoto');

        return NextResponse.json({ messages });

    } catch (error) {
        console.error('Error fetching messages:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await dbConnect();

        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const payload = await verifyToken(token);
        if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        const userModel = roleToUserModel(payload.role);
        if (!userModel) return NextResponse.json({ error: 'Invalid role' }, { status: 403 });

        const { conversationId, content, type = 'text', fileUrl, fileName } = await req.json();

        if (!conversationId) {
            return NextResponse.json({ error: 'Missing conversationId' }, { status: 400 });
        }

        if (!String(content || '').trim() && !fileUrl) {
            return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
        }

        const conversation = await Conversation.findOne({
            _id: conversationId,
            'participants.user': payload.id,
            status: 'active',
        });

        if (!conversation) {
            return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
        }

        const message = await Message.create({
            conversation: conversationId,
            sender: {
                user: payload.id,
                userModel,
            },
            content: String(content || fileName || '').trim(),
            type,
            fileUrl: fileUrl || null,
            fileName: fileName || null,
            readBy: [payload.id],
        });

        await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: message._id,
            updatedAt: new Date(),
        });

        await message.populate('sender.user', 'fullName profilePhoto');

        const pusher = getPusherServer();
        if (pusher) {
            await pusher.trigger(conversationChannel(conversationId), 'new-message', message.toObject());
        }

        return NextResponse.json({ message }, { status: 201 });
    } catch (error) {
        console.error('Error creating message:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
