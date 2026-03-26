import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Conversation from '@/models/Conversation';
import Pitch from '@/models/Pitch';
import '@/models/Message';
import '@/models/Entrepreneur';
import '@/models/Investor';
import '@/models/Admin';
import { verifyToken } from '@/lib/auth'; // Ensure this path is correct
import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
    try {
        await dbConnect();

        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const payload = await verifyToken(token);
        if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        const userId = payload.id;

        // Find conversations where user is a participant
        const conversations = await Conversation.find({
            'participants.user': userId,
            status: 'active'
        })
            .populate('pitch', 'title logoUrl businessName')
            .populate('participants.user', 'fullName profilePhoto') // Need to know which model to populate from?
            .populate('lastMessage')
            .sort({ updatedAt: -1 });

        // We need to populate participants intelligently because they can be diff models.
        // Mongoose refPath should handle it if 'participants.userModel' is set correctly.
        // But populate() with refPath works automatically if schema is set up right.

        return NextResponse.json({ conversations });
    } catch (error) {
        console.error('Error fetching conversations:', error);
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

        const { pitchId, participantId, participantModel } = await req.json();

        // payload.id is the initiator (e.g. Investor)
        // participantId is the other party (e.g. Entrepreneur)

        // Check if conversation already exists
        let conversation = await Conversation.findOne({
            pitch: pitchId,
            $and: [
                { 'participants.user': payload.id },
                { 'participants.user': participantId }
            ]
        });

        if (conversation) {
            return NextResponse.json({ conversation });
        }

        // Create new
        conversation = await Conversation.create({
            pitch: pitchId,
            participants: [
                { user: payload.id, userModel: payload.role === 'investor' ? 'Investor' : 'Entrepreneur' }, // Simplify logic as needed
                { user: participantId, userModel: participantModel }
            ],
            status: 'active'
        });

        // Populate for return
        await conversation.populate('pitch', 'title logoUrl');
        // Populating newly created doc might need separate query or exec

        return NextResponse.json({ conversation });

    } catch (error) {
        console.error('Error creating conversation:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
