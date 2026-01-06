import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Entrepreneur from '@/models/Entrepreneur';
import Investor from '@/models/Investor';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { email, password } = await req.json();

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

        // Check Verification Status
        if (user.status !== 'approved') {
            if (user.status === 'rejected') {
                return NextResponse.json({ error: 'Your account has been rejected. Please contact support.' }, { status: 403 });
            }
            return NextResponse.json({ error: 'Your account is pending verification. Please wait for admin approval.' }, { status: 403 });
        }

        // Create JWT
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const token = await new SignJWT({ id: user._id.toString(), role: role, email: user.email })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('7d')
            .sign(secret);

        const response = NextResponse.json({ message: 'Login successful', role: role });

        // Set HTTP-only cookie
        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
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
