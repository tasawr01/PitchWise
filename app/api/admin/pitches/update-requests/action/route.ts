import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Pitch from '@/models/Pitch';
import PitchUpdate from '@/models/PitchUpdate';
import { jwtVerify } from 'jose';
// Import notification helper
import { createNotification } from '@/lib/notification';

// Helper to verify admin
async function verifyAdmin(req: Request) {
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

export async function POST(req: Request) {
    try {
        await dbConnect();
        const isAdmin = await verifyAdmin(req);
        if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { requestId, action } = await req.json();

        const updateRequest = await PitchUpdate.findById(requestId);
        if (!updateRequest) return NextResponse.json({ error: 'Request not found' }, { status: 404 });

        if (action === 'approved') {
            // MERGE Logic
            // We want to copy almost all fields from updateRequest to Pitch
            // Excluding system fields: _id, pitch, entrepreneur, status, adminComment, createdAt, updatedAt

            const fieldsToExclude = ['_id', 'pitch', 'entrepreneur', 'status', 'adminComment', 'createdAt', 'updatedAt', '__v'];
            const updateData: any = {};

            // Iterate over updateRequest schema paths or just properties
            const schemaPaths = Object.keys(PitchUpdate.schema.paths);

            // Or simpler: use toObject and filter
            const requestObj = updateRequest.toObject();
            for (const key in requestObj) {
                if (!fieldsToExclude.includes(key)) {
                    updateData[key] = requestObj[key];
                }
            }

            // Also ensure we keep the pitch status as is? Or does update reset moderation? 
            // Usually updates might need re-moderation, but since Admin IS approving it, it's implicitly moderated.
            // If the pitch was 'rejected', and they assume 'pending' on update?
            // The Update Request has its own status. The PITCH has its own status. 
            // If the pitch allows updates, we probably just update the content. 
            // If the pitch was "approved", it stays "approved".
            // If the pitch was "rejected", maybe this update fixes it?
            // Let's assume content update doesn't change pitch status unless explicitly requested.
            // But usually an update to a live pitch keeps it live.

            await Pitch.findByIdAndUpdate(updateRequest.pitch, { $set: updateData });

            updateRequest.status = 'approved';
            await updateRequest.save();

            // Notify Entrepreneur
            await createNotification(
                updateRequest.entrepreneur,
                'Entrepreneur',
                `Your pitch update for "${updateData.title || 'Pitch'}" has been approved.`,
                'info',
                updateRequest.pitch,
                'Pitch'
            );

        } else if (action === 'rejected') {
            updateRequest.status = 'rejected';
            await updateRequest.save();

            // Notify Entrepreneur
            await createNotification(
                updateRequest.entrepreneur,
                'Entrepreneur',
                `Your pitch update request for "${updateRequest.title || 'Pitch'}" has been rejected.`,
                'warning',
                updateRequest.pitch, // Link to original pitch
                'Pitch'
            );
        } else {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        return NextResponse.json({ message: `Request ${action} successfully` });
    } catch (error: any) {
        console.error('Update Request Action Error:', error);
        return NextResponse.json({ error: error.message || 'Action failed' }, { status: 500 });
    }
}
