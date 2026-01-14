import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Entrepreneur from '@/models/Entrepreneur';
import Investor from '@/models/Investor';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const token = searchParams.get('token');

        if (!token) {
            return NextResponse.json(
                { error: 'Verification token is required' },
                { status: 400 }
            );
        }

        // Hash the token to compare with stored hash
        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        // Try to find user in Entrepreneur collection
        let user = await Entrepreneur.findOne({
            emailVerificationToken: hashedToken,
            emailVerificationExpiry: { $gt: Date.now() },
        });

        let userType: 'entrepreneur' | 'investor' | null = 'entrepreneur';

        // If not found, try Investor collection
        if (!user) {
            user = await Investor.findOne({
                emailVerificationToken: hashedToken,
                emailVerificationExpiry: { $gt: Date.now() },
            });
            userType = user ? 'investor' : null;
        }

        if (!user) {
            return NextResponse.json(
                {
                    error: 'Invalid or expired verification token',
                    expired: true
                },
                { status: 400 }
            );
        }

        // Check if already verified
        if (user.isEmailVerified) {
            return NextResponse.json(
                {
                    message: 'Email already verified',
                    alreadyVerified: true,
                    status: user.status
                },
                { status: 200 }
            );
        }

        // Update user - mark email as verified
        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpiry = undefined;
        await user.save();

        return NextResponse.json(
            {
                success: true,
                message: 'Email verified successfully! Your profile is now pending admin approval.',
                userType,
                status: user.status,
                userName: user.fullName,
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Email verification error:', error);
        return NextResponse.json(
            { error: 'Email verification failed', details: error.message },
            { status: 500 }
        );
    }
}
