import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Entrepreneur from '@/models/Entrepreneur';
import { uploadToCloudinary, deleteFromCloudinary } from '@/lib/cloudinary';
import { jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';

async function verifyEntrepreneur(req: Request) {
    const token = req.headers.get('cookie')?.match(/token=([^;]+)/)?.[1];
    if (!token) return null;
    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        if (payload.role !== 'entrepreneur') return null;
        return payload;
    } catch {
        return null;
    }
}

export async function GET(req: Request) {
    const decoded = await verifyEntrepreneur(req);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const user = await Entrepreneur.findById(decoded.id).select('-password');
    return NextResponse.json({ user });
}

export async function POST(req: Request) {
    try {
        const decoded = await verifyEntrepreneur(req);
        if (!decoded) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const entrepreneur = await Entrepreneur.findById(decoded.id);
        if (!entrepreneur) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const formData = await req.formData();

        // 1. Handle Profile Photo
        const file = formData.get('profilePhoto') as File | null;
        if (file) {
            if (entrepreneur.profilePhoto) {
                await deleteFromCloudinary(entrepreneur.profilePhoto);
            }
            const buffer = Buffer.from(await file.arrayBuffer());
            const uploadResult = await uploadToCloudinary(buffer, 'pitchwise/users', file.name);
            entrepreneur.profilePhoto = uploadResult.secure_url;
        }

        // 2. Handle Text Fields
        const fullName = formData.get('fullName');
        const phone = formData.get('phone');
        if (fullName) entrepreneur.fullName = fullName;
        if (phone) entrepreneur.phone = phone;

        // 3. Handle Password
        const password = formData.get('password') as string;
        if (password && password.trim().length > 0) {
            entrepreneur.password = await bcrypt.hash(password, 10);
        }

        await entrepreneur.save();

        return NextResponse.json({ message: 'Profile updated successfully', user: entrepreneur });

    } catch (error: any) {
        console.error('Update Request Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
