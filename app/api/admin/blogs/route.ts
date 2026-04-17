import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Blog from '@/models/Blog';
import { jwtVerify } from 'jose';

async function verifyAdminAuth(req: Request) {
    const token = req.headers.get('cookie')?.match(/token=([^;]+)/)?.[1];
    if (!token) return null;
    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        return payload.role === 'admin' ? payload : null;
    } catch {
        return null;
    }
}

export async function GET(req: Request) {
    try {
        await dbConnect();
        
        // Admin routes might need auth, but it's fine
        const admin = await verifyAdminAuth(req);
        if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const blogs = await Blog.find({}).sort({ createdAt: -1 });
        return NextResponse.json({ blogs });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

import { uploadToCloudinary } from '@/lib/cloudinary';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const admin = await verifyAdminAuth(req);
        if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const formData = await req.formData();
        
        let imageUrl = formData.get('imageUrl') as string;
        
        // Handle file upload
        const imageFile = formData.get('imageFile') as File | null;
        if (imageFile && imageFile.size > 0) {
            const buffer = Buffer.from(await imageFile.arrayBuffer());
            const uploadRes = await uploadToCloudinary(buffer, 'pitchwise/blogs', imageFile.name);
            imageUrl = uploadRes.secure_url;
        }

        const data = {
            title: formData.get('title'),
            excerpt: formData.get('excerpt'),
            content: formData.get('content'),
            author: formData.get('author') || 'Admin',
            imageUrl: imageUrl || '/assets/sample-blog.jpg',
        };

        const newBlog = await Blog.create(data);
        
        return NextResponse.json({ message: 'Blog created successfully', blog: newBlog });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
