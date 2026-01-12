import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Pitch from '@/models/Pitch';

import { jwtVerify } from 'jose';

async function verifyAdminAuth(req: Request) {
    const token = req.headers.get('cookie')?.match(/token=([^;]+)/)?.[1];
    if (!token) return false;
    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        return payload.role === 'admin';
    } catch {
        return false;
    }
}

// Helper to get user ID from token
async function getUserIdFromToken(token: string | undefined) {
    if (!token) return null;
    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        return payload.id as string; // Return ID instead of just role
    } catch {
        return null;
    }
}

export async function POST(req: Request) {
    try {
        if (!await verifyAdminAuth(req)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const { pitchId, status, remarks } = await req.json();
        const adminId = await getUserIdFromToken(req.headers.get('cookie')?.match(/token=([^;]+)/)?.[1]);

        if (!['approved', 'rejected'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        const pitch = await Pitch.findById(pitchId);
        if (!pitch) {
            return NextResponse.json({ error: 'Pitch not found' }, { status: 404 });
        }

        const updates: any = {};
        let finalStatus = status;

        if (status === 'rejected') {
            if (!remarks || remarks.trim() === '') {
                return NextResponse.json({ error: 'Remarks are mandatory for rejection' }, { status: 400 });
            }
            updates.rejectionCount = (pitch.rejectionCount || 0) + 1;
            updates.remarks = remarks;

            // Check if this is the 4th Rejection
            if (updates.rejectionCount > 3) {
                finalStatus = 'permanently_rejected';
            }
        } else if (status === 'approved') {
            updates.remarks = '';
        }

        updates.status = finalStatus;

        // Add to history
        const historyEntry = {
            action: finalStatus,
            remarks: remarks || '',
            by: adminId,
            date: new Date()
        };

        const updatedPitch = await Pitch.findByIdAndUpdate(
            pitchId,
            {
                $set: updates,
                $push: { history: historyEntry }
            },
            { new: true }
        );

        // Trigger Notification
        const { createNotification } = await import('@/lib/notification');
        const notificationMessage = finalStatus === 'permanently_rejected'
            ? `Your pitch "${pitch.title}" has been PERMANENTLY REJECTED.`
            : `Your pitch "${pitch.title}" has been ${finalStatus}.`;

        await createNotification(
            pitch.entrepreneur,
            'Entrepreneur',
            notificationMessage,
            finalStatus === 'approved' ? 'success' : 'error',
            pitch._id,
            'Pitch'
        );

        return NextResponse.json({ message: `Pitch ${finalStatus} successfully`, pitch: updatedPitch });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
