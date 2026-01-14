import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Entrepreneur from '@/models/Entrepreneur';
import Investor from '@/models/Investor';
import { sendRejectionEmail } from '@/lib/email';
import { createNotification } from '@/lib/notification';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();

        const { id } = await params;
        const { userType, adminComments } = await request.json();

        if (!userType || !['entrepreneur', 'investor'].includes(userType)) {
            return NextResponse.json(
                { error: 'Valid user type is required (entrepreneur or investor)' },
                { status: 400 }
            );
        }

        if (!adminComments || adminComments.trim().length === 0) {
            return NextResponse.json(
                { error: 'Admin comments are required for rejection' },
                { status: 400 }
            );
        }

        // Find user based on type
        const Model = userType === 'entrepreneur' ? Entrepreneur : Investor;
        const user = await Model.findById(id);

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Update user status to rejected and save comments
        user.status = 'rejected';
        user.adminComments = adminComments;
        await user.save();

        // Send rejection email with feedback
        await sendRejectionEmail(user.email, user.fullName, adminComments);

        // Create notification for user
        await createNotification(
            user._id,
            userType === 'entrepreneur' ? 'Entrepreneur' : 'Investor',
            `Your profile was rejected. Reason: ${adminComments.substring(0, 100)}${adminComments.length > 100 ? '...' : ''}`,
            'error',
            user._id,
            userType === 'entrepreneur' ? 'Entrepreneur' : 'Investor'
        );

        return NextResponse.json(
            {
                success: true,
                message: 'User rejected successfully',
                user: {
                    id: user._id,
                    name: user.fullName,
                    email: user.email,
                    status: user.status,
                    adminComments: user.adminComments,
                },
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('User rejection error:', error);
        return NextResponse.json(
            { error: 'Failed to reject user', details: error.message },
            { status: 500 }
        );
    }
}
