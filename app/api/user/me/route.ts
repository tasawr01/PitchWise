import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Entrepreneur from '@/models/Entrepreneur';
import Investor from '@/models/Investor';
import { jwtVerify } from 'jose';

export async function GET(req: Request) {
    try {
        await dbConnect();

        // Extract token from cookie manually since we aren't using a middleware helper yet for this specific file read
        const cookieHeader = req.headers.get('cookie');
        if (!cookieHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const tokenMatch = cookieHeader.match(/token=([^;]+)/);
        const token = tokenMatch ? tokenMatch[1] : null;

        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);

        if (!payload.id || !payload.role) {
            return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });
        }

        let user;
        if (payload.role === 'entrepreneur') {
            user = await Entrepreneur.findById(payload.id).select('-password');
        } else if (payload.role === 'investor') {
            user = await Investor.findById(payload.id).select('-password');
        }

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ user, role: payload.role });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
