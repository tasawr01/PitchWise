import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Notification from '@/models/Notification';
import { jwtVerify } from 'jose';

// Helper to get current user from token
async function getCurrentUser(req: Request) {
    try {
        const token = req.headers.get('cookie')?.match(/token=([^;]+)/)?.[1];
        if (!token) return null;

        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        return payload;
    } catch {
        return null;
    }
}

export async function GET(req: Request) {
    try {
        await dbConnect();
        const user = await getCurrentUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get query params
        const url = new URL(req.url);
        const limit = parseInt(url.searchParams.get('limit') || '20');
        const unreadOnly = url.searchParams.get('unreadOnly') === 'true';

        const query: any = {
            recipient: user.id,
            // Depending on how we store 'role', ensuring we match the correct model if needed
            // recipients are stored by ID, so usually ID is enough if IDs are unique across collections or we don't care about collisions
        };

        if (unreadOnly) {
            query.isRead = false;
        }

        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .limit(limit);

        const totalUnread = await Notification.countDocuments({ recipient: user.id, isRead: false });

        return NextResponse.json({ notifications, totalUnread });

    } catch (error) {
        console.error('Fetch Notifications Error:', error);
        return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        await dbConnect();
        const user = await getCurrentUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { id, markAllRead } = body;

        if (markAllRead) {
            await Notification.updateMany(
                { recipient: user.id, isRead: false },
                { isRead: true }
            );
            return NextResponse.json({ message: 'All marked as read' });
        }

        if (id) {
            const notification = await Notification.findOne({ _id: id, recipient: user.id });
            if (!notification) {
                return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
            }
            notification.isRead = true;
            await notification.save();
            return NextResponse.json(notification);
        }

        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });

    } catch (error) {
        console.error('Update Notification Error:', error);
        return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        await dbConnect();
        const user = await getCurrentUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const url = new URL(req.url);
        const id = url.searchParams.get('id');

        if (id) {
            await Notification.deleteOne({ _id: id, recipient: user.id });
            return NextResponse.json({ message: 'Deleted successfully' });
        }

        // Optional: Delete all read
        const deleteAllRead = url.searchParams.get('deleteAllRead') === 'true';
        if (deleteAllRead) {
            await Notification.deleteMany({ recipient: user.id, isRead: true });
            return NextResponse.json({ message: 'Cleared read notifications' });
        }

        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });

    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }
}
