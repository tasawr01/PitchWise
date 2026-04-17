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

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await dbConnect();
        
        const admin = await verifyAdminAuth(req);
        if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const blog = await Blog.findById(id);
        if (!blog) {
            return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
        }
        return NextResponse.json({ blog });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

import { uploadToCloudinary } from '@/lib/cloudinary';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
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

        const data: any = {
            title: formData.get('title'),
            excerpt: formData.get('excerpt'),
            content: formData.get('content'),
            author: formData.get('author'),
        };

        if (imageUrl) {
            data.imageUrl = imageUrl;
        }

        const updatedBlog = await Blog.findByIdAndUpdate(id, data, { new: true });
        
        if (!updatedBlog) {
            return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
        }
        return NextResponse.json({ message: 'Blog updated successfully', blog: updatedBlog });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await dbConnect();
        const admin = await verifyAdminAuth(req);
        if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const deletedBlog = await Blog.findByIdAndDelete(id);
        
        if (!deletedBlog) {
            return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
        }
        return NextResponse.json({ message: 'Blog deleted successfully' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
