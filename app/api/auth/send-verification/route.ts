import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Entrepreneur from '@/models/Entrepreneur';
import Investor from '@/models/Investor';
import { sendVerificationEmail } from '@/lib/email';
import crypto from 'crypto';

// Rate limiting storage (in production, use Redis or database)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT = 3; // emails per hour
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds

function checkRateLimit(email: string): boolean {
    const now = Date.now();
    const userLimit = rateLimitStore.get(email);

    if (!userLimit || now > userLimit.resetTime) {
        // Reset or create new rate limit entry
        rateLimitStore.set(email, {
            count: 1,
            resetTime: now + RATE_LIMIT_WINDOW,
        });
        return true;
    }

    if (userLimit.count >= RATE_LIMIT) {
        return false; // Rate limit exceeded
    }

    userLimit.count++;
    return true;
}

export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        const { email } = await request.json();

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        // Check rate limit
        if (!checkRateLimit(email)) {
            return NextResponse.json(
                {
                    error: 'Too many verification emails sent. Please try again after 1 hour.',
                    rateLimitExceeded: true
                },
                { status: 429 }
            );
        }

        // Find user in either collection
        let user = await Entrepreneur.findOne({ email });
        let userType: 'entrepreneur' | 'investor' = 'entrepreneur';

        if (!user) {
            user = await Investor.findOne({ email });
            userType = 'investor';
        }

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Check if already verified
        if (user.isEmailVerified) {
            return NextResponse.json(
                { error: 'Email already verified' },
                { status: 400 }
            );
        }

        // Generate new verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto
            .createHash('sha256')
            .update(verificationToken)
            .digest('hex');

        // Set token and expiry (24 hours)
        user.emailVerificationToken = hashedToken;
        user.emailVerificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await user.save();

        // Send verification email
        await sendVerificationEmail(email, verificationToken, user.fullName);

        return NextResponse.json(
            {
                success: true,
                message: 'Verification email sent successfully',
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Send verification email error:', error);
        return NextResponse.json(
            { error: 'Failed to send verification email', details: error.message },
            { status: 500 }
        );
    }
}
