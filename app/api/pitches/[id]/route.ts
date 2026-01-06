import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Pitch from '@/models/Pitch';
import { deleteFromCloudinary } from '@/lib/cloudinary';
import { jwtVerify } from 'jose';

// Helper to verify auth and return payload
async function verifyAuth(req: Request) {
    const token = req.headers.get('cookie')?.match(/token=([^;]+)/)?.[1];
    if (!token) return null;
    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        return payload;
    } catch {
        return null;
    }
}

// DELETE /api/pitches/[id]
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await verifyAuth(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        // Await params as it is a Promise in recent Next.js versions
        const { id } = await params;
        const pitch = await Pitch.findById(id);

        if (!pitch) {
            return NextResponse.json({ error: 'Pitch not found' }, { status: 404 });
        }

        // Authorization Check
        const isOwner = pitch.entrepreneur.toString() === user.id;
        const isAdmin = user.role === 'admin';

        if (!isOwner && !isAdmin) {
            return NextResponse.json({ error: 'Forbidden: You can only delete your own pitches' }, { status: 403 });
        }

        // Delete Cloudinary Files
        if (pitch.pitchDeckUrl) await deleteFromCloudinary(pitch.pitchDeckUrl);
        if (pitch.financialsUrl) await deleteFromCloudinary(pitch.financialsUrl);
        if (pitch.demoUrl) await deleteFromCloudinary(pitch.demoUrl);

        // Delete the pitch
        await Pitch.findByIdAndDelete(id);

        return NextResponse.json({ message: 'Pitch deleted successfully' });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
