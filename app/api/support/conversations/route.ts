import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Conversation from '@/models/Conversation';
import { verifyToken } from '@/lib/auth';
import '@/models/Message';
import '@/models/Entrepreneur';
import '@/models/Investor';
import '@/models/Admin';

export async function GET(req: NextRequest) {
    try {
        await dbConnect();

        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const payload = await verifyToken(token);
        if (!payload || payload.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Find all support conversations
        const conversations = await Conversation.find({
            type: 'support',
            status: 'active'
        })
        .populate('participants.user', 'name fullName profilePhoto email')
        .populate('lastMessage')
        .sort({ updatedAt: -1 });

        return NextResponse.json({ conversations });

    } catch (error) {
        console.error('Error fetching support conversations:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
