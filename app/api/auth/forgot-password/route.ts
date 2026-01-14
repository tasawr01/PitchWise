import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/db';
import Entrepreneur from '@/models/Entrepreneur';
import Investor from '@/models/Investor';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: 'Please provide your email address' }, { status: 400 });
        }

        // Check Entrepreneur
        let user: any = await Entrepreneur.findOne({ email });
        let type = 'Entrepreneur';

        // Check Investor if not found
        if (!user) {
            user = await Investor.findOne({ email });
            type = 'Investor';
        }

        if (!user) {
            // Security: Don't reveal if user exists or not, but for UX we might just return success
            // or a generic message. Here we returned 404 in previous logic, 
            // but standard practice is 200 "If that email exists, we sent a link."
            // However, to mimic the user's request for "checks... similar to signup/login context", 
            // if the user expects immediate feedback:
            return NextResponse.json({ error: 'User with this email does not exist' }, { status: 404 });
        }

        // Generate Token
        // Using built-in crypto for a random hex string
        const resetToken = crypto.randomBytes(32).toString('hex');

        // Hash it before saving to DB (optional security step, but often raw token is simpler for MVP)
        // We will store raw token for simplicity as per common MVP patterns, 
        // or hash it if we want strict best practices. 
        // Given the schemas added "resetPasswordToken: String", we'll store it directly for now 
        // to match the "send password reset email" flow easily.


        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 Hour

        await user.save();

        // Send Email
        await sendPasswordResetEmail(user.email, resetToken, user.fullName);

        return NextResponse.json({ message: 'Password reset link sent to your email' });

    } catch (error: any) {
        console.error('Forgot Password Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
