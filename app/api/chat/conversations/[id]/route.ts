import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Conversation from '@/models/Conversation';
import Message from '@/models/Message';
import { verifyToken } from '@/lib/auth';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await dbConnect();

        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const payload = await verifyToken(token);
        if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        const { dealStatus } = await req.json();

        if (!['in_progress', 'completed', 'discarded'].includes(dealStatus)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        const conversation = await Conversation.findByIdAndUpdate(
            id,
            { dealStatus },
            { new: true }
        );

        if (!conversation) return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });

        return NextResponse.json({ conversation });

    } catch (error) {
        console.error('Error updating conversation:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await dbConnect();

        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const payload = await verifyToken(token);
        if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        // Verify the user is a participant in this conversation
        const conversation = await Conversation.findOne({
            _id: id,
            'participants.user': payload.id,
        });

        if (!conversation) {
            return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
        }

        // Delete all messages belonging to this conversation
        await Message.deleteMany({ conversation: id });

        // Delete the conversation itself
        await Conversation.findByIdAndDelete(id);

        return NextResponse.json({ message: 'Conversation deleted successfully' });

    } catch (error) {
        console.error('Error deleting conversation:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
