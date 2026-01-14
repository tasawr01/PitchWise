import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Entrepreneur from '@/models/Entrepreneur';
import Investor from '@/models/Investor';
import bcrypt from 'bcryptjs';
import { sendPasswordChangeConfirmationEmail } from '@/lib/email';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { token, password, confirmPassword } = await req.json();

        if (!token) {
            return NextResponse.json({ error: 'Invalid or missing token' }, { status: 400 });
        }

        if (!password || !confirmPassword) {
            return NextResponse.json({ error: 'Please provide both password and confirm password' }, { status: 400 });
        }

        if (password !== confirmPassword) {
            return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 });
        }

        // Validate Password Strength (Same as Signup)
        if (password.length < 8) {
            return NextResponse.json({ error: 'Password must be at least 8 characters long' }, { status: 400 });
        }
        // Add more rigorous checks if needed matching signup exactly

        // Find user with valid token and not expired
        // $gt matches date greater than (after) now
        let user: any = await Entrepreneur.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            user = await Investor.findOne({
                resetPasswordToken: token,
                resetPasswordExpires: { $gt: Date.now() },
            });
        }

        if (!user) {
            return NextResponse.json({ error: 'Password reset token is invalid or has expired' }, { status: 400 });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // Clear reset fields
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        // Send Confirmation Email
        await sendPasswordChangeConfirmationEmail(user.email, user.fullName);

        return NextResponse.json({ message: 'Password reset successful. You can now login.' });

    } catch (error: any) {
        console.error('Reset Password Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
