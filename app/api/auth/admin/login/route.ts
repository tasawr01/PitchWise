import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Admin from '@/models/Admin';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Please provide email and password' }, { status: 400 });
        }

        const admin = await Admin.findOne({ email });
        if (!admin) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Create JWT
        const token = await signToken({
            id: admin._id.toString(),
            role: 'admin',
            email: admin.email
        });

        const response = NextResponse.json({ message: 'Login successful' });

        // Set HTTP-only cookie
        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 30 * 60, // 30 minutes
            path: '/',
        });

        // Also set a visible cookie to help middleware or client know we have a session
        response.cookies.set('userRole', 'admin', {
            httpOnly: false, // Accessible to client
            path: '/'
        });

        return response;

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
