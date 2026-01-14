import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Entrepreneur from '@/models/Entrepreneur';
import Investor from '@/models/Investor';
import { sendApprovalEmail } from '@/lib/email';
import { createNotification } from '@/lib/notification';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();

        const { id } = await params;
        const { userType } = await request.json();

        if (!userType || !['entrepreneur', 'investor'].includes(userType)) {
            return NextResponse.json(
                { error: 'Valid user type is required (entrepreneur or investor)' },
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

        // Check if email is verified
        if (!user.isEmailVerified) {
            return NextResponse.json(
                { error: 'User email must be verified before approval' },
                { status: 400 }
            );
        }

        // Update user status to approved
        user.status = 'approved';
        user.adminComments = undefined; // Clear any previous rejection comments
        await user.save();

        // Send approval email
        await sendApprovalEmail(user.email, user.fullName);

        // Create notification for user
        await createNotification(
            user._id,
            userType === 'entrepreneur' ? 'Entrepreneur' : 'Investor',
            'Your profile has been approved! You can now access your dashboard.',
            'success',
            user._id,
            userType === 'entrepreneur' ? 'Entrepreneur' : 'Investor'
        );

        return NextResponse.json(
            {
                success: true,
                message: 'User approved successfully',
                user: {
                    id: user._id,
                    name: user.fullName,
                    email: user.email,
                    status: user.status,
                },
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('User approval error:', error);
        return NextResponse.json(
            { error: 'Failed to approve user', details: error.message },
            { status: 500 }
        );
    }
}
