import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Entrepreneur from '@/models/Entrepreneur';
import Investor from '@/models/Investor';
import bcrypt from 'bcryptjs';
import { signToken, SESSION_REMEMBER_TIMEOUT, SESSION_INACTIVITY_TIMEOUT } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { email, password, remember } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Please provide email and password' }, { status: 400 });
        }

        // Check both collections
        let user: any = await Entrepreneur.findOne({ email });
        let role = 'entrepreneur';

        if (!user) {
            user = await Investor.findOne({ email });
            role = 'investor';
        }

        if (!user) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Check Email Verification Status
        if (!user.isEmailVerified) {
            return NextResponse.json({
                error: 'Please verify your email address before logging in. Check your inbox for the verification link.',
                needsVerification: true,
                email: user.email
            }, { status: 403 });
        }

        // Check Verification Status
        if (user.status !== 'approved') {
            if (user.status === 'rejected') {
                return NextResponse.json({
                    error: user.adminComments
                        ? `Your account has been rejected. Reason: ${user.adminComments}`
                        : 'Your account has been rejected. Please contact support.',
                    rejected: true
                }, { status: 403 });
            }
            return NextResponse.json({
                error: 'Your account is pending admin approval. You will receive an email once approved.',
                pending: true
            }, { status: 403 });
        }

        // Create JWT
        const token = await signToken({
            id: user._id.toString(),
            role: role,
            email: user.email,
            remember: remember
        });

        const response = NextResponse.json({ message: 'Login successful', role: role });

        // Calculate maxAge
        const maxAge = remember ? SESSION_REMEMBER_TIMEOUT : SESSION_INACTIVITY_TIMEOUT;

        // Set HTTP-only cookie
        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: maxAge,
            path: '/',
        });

        // Visible cookie for client-side routing helpers
        response.cookies.set('userRole', role, {
            httpOnly: false,
            path: '/'
        });

        return response;

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
