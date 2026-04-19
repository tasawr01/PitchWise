import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Conversation from '@/models/Conversation';
import Admin from '@/models/Admin';
import { verifyToken } from '@/lib/auth';
import '@/models/Message';
import '@/models/Entrepreneur';
import '@/models/Investor';

export async function GET(req: NextRequest) {
    console.log('GET /api/support/conversation - Start');
    try {
        await dbConnect();

        const token = req.cookies.get('token')?.value;
        if (!token) {
            console.warn('No token found in cookies');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = await verifyToken(token);
        if (!payload) {
            console.warn('Invalid token payload');
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const userId = payload.id;
        const userRole = payload.role;
        console.log(`User ID: ${userId}, Role: ${userRole}`);

        // Map role to Model name
        const userModel = userRole === 'investor' ? 'Investor' : userRole === 'entrepreneur' ? 'Entrepreneur' : 'Admin';

        // Fetch or Create logic
        if (userRole === 'admin') {
            return NextResponse.json({ error: 'Admins should use /api/support/conversations to list all support chats' }, { status: 400 });
        }

        // Search for existing support conversation for this user
        let conversation = await Conversation.findOne({
            type: 'support',
            'participants.user': userId
        })
        .populate('participants.user', 'name fullName profilePhoto email')
        .populate('lastMessage')
        .sort({ updatedAt: -1 })
        .lean();

        console.log('Existing conversation search result:', conversation ? conversation._id : 'None');

        if (!conversation) {
            console.log('Creating new support conversation');
            // Find an admin to be the other party
            const admin = await Admin.findOne().lean() as any;
            if (!admin) {
                console.error('No admin found in database');
                return NextResponse.json({ error: 'No support admin available' }, { status: 500 });
            }

            const newConversation = await Conversation.create({
                type: 'support',
                participants: [
                    { user: userId, userModel: userModel },
                    { user: admin._id, userModel: 'Admin' }
                ],
                status: 'active'
            });
            console.log('New conversation created:', newConversation._id);

            // Re-fetch to populate correctly
            conversation = await Conversation.findById(newConversation._id)
                .populate('participants.user', 'name fullName profilePhoto email')
                .lean();
        }

        console.log('Final conversation object status:', conversation ? 'Found' : 'Missing');

        if (!conversation) {
            console.error('Failed to find or create conversation - returning error');
            return NextResponse.json({ error: 'Failed to initialize support conversation' }, { status: 500 });
        }

        // Clean serialization
        const cleanConversation = JSON.parse(JSON.stringify(conversation));
        
        console.log('Sending response with conversation:', cleanConversation._id);
        return NextResponse.json({ conversation: cleanConversation });

    } catch (error: any) {
        console.error('Error in support conversation API:', error);
        return NextResponse.json({ 
            error: 'Server error', 
            details: error.message 
        }, { status: 500 });
    }
}
