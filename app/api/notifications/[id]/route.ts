
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import dbConnect from '@/lib/db';
import Notification from '@/models/Notification';

async function getUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return null;
    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        return payload;
    } catch {
        return null;
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> } // Params must now be awaited in Next.js 15+ if dynamic, but usually they are objects. Wait, Next.js 15 dynamic params are promise? Safest is to treat as object first, but new specs imply Promise. Let's assume standard object for App Router unless specific version dictates. The user seems to be on a recent Next.js. I'll use `params` directly for now.
    // Actually, recent Next.js changes made params a Promise in some contexts. I will await it just in case if I can, but standard signature is `params: { id: string }`.
    // Wait, let's stick to standard `params` object access. Typescript might complain if I try to await a non-promise.
    // I'll stick to standard object for now.
) {
    try {
        const { id } = await params; // Awaiting params for Next.js 15 compatibility just in case
        await dbConnect();
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const notification = await Notification.findOne({ _id: id, userId: user.id });
        if (!notification) {
            return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
        }

        notification.isRead = true;
        await notification.save();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating notification:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await dbConnect();
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await Notification.findOneAndDelete({ _id: id, userId: user.id });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting notification:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
