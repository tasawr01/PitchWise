import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Entrepreneur from '@/models/Entrepreneur';
import { jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';

async function verifyEntrepreneur(req: Request) {
    const token = req.headers.get('cookie')?.match(/token=([^;]+)/)?.[1];
    if (!token) return null;
    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        if (payload.role !== 'entrepreneur') return null;
        return payload.id;
    } catch {
        return null;
    }
}

export async function POST(req: Request) {
    try {
        const userId = await verifyEntrepreneur(req);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { fullName, phone, password, oldPassword } = body;

        await dbConnect();
        const user = await Entrepreneur.findById(userId);

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Update basic info
        if (fullName) user.fullName = fullName;
        if (phone) user.phone = phone;

        // Handle password update
        if (password) {
            if (!oldPassword) {
                return NextResponse.json({ error: 'Old password is required to set a new password' }, { status: 400 });
            }

            // Verify old password
            const isMatch = await bcrypt.compare(oldPassword, user.password);
            if (!isMatch) {
                return NextResponse.json({ error: 'Incorrect old password' }, { status: 400 });
            }

            // Set new password
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        await user.save();

        return NextResponse.json({
            message: 'Profile updated successfully',
            user: {
                fullName: user.fullName,
                phone: user.phone,
                email: user.email,
                profilePhoto: user.profilePhoto
            }
        });

    } catch (error) {
        console.error('Profile update error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
