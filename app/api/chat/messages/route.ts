import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Message from '@/models/Message';
import { verifyToken } from '@/lib/auth';

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

        const messages = await Message.find({ conversation: conversationId })
            .sort({ createdAt: 1 }) // Oldest first
            .populate('sender.user', 'fullName profilePhoto');

        return NextResponse.json({ messages });

    } catch (error) {
        console.error('Error fetching messages:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
