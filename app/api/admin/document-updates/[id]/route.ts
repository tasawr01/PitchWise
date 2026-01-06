import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import DocumentUpdate from '@/models/DocumentUpdate';
import Entrepreneur from '@/models/Entrepreneur';
import Notification from '@/models/Notification';
import { deleteFromCloudinary } from '@/lib/cloudinary';
import { jwtVerify } from 'jose';

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

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    if (!await verifyAdmin(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;
    const { action } = await req.json(); // 'approve' | 'reject'

    const request = await DocumentUpdate.findById(id).populate('entrepreneur');
    if (!request) {
        return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    const user = request.entrepreneur;

    if (action === 'approve') {
        // 1. Delete USER'S OLD Cloudinary files
        if (request.cnicFront && user.cnicFront) await deleteFromCloudinary(user.cnicFront);
        if (request.cnicBack && user.cnicBack) await deleteFromCloudinary(user.cnicBack);
        if (request.passportScan && user.passportScan) await deleteFromCloudinary(user.passportScan);

        // 2. Update User with NEW data
        if (request.documentType) user.documentType = request.documentType;
        if (request.cnicNumber) user.cnicNumber = request.cnicNumber;
        if (request.passportNumber) user.passportNumber = request.passportNumber;
        if (request.cnicFront) user.cnicFront = request.cnicFront;
        if (request.cnicBack) user.cnicBack = request.cnicBack;
        if (request.passportScan) user.passportScan = request.passportScan;

        await user.save();

        request.status = 'approved';
        await request.save(); // Keep history or delete? Let's keep history for now or just delete.
        // User said "delete old documents... update new one". 
        // Keeping the request record is fine, but maybe redundant if we don't show history.
        // I'll delete the request record to keep DB clean as typical for "Inbox" style.
        await DocumentUpdate.findByIdAndDelete(id);

        // Notify Entrepreneur
        await Notification.create({
            userId: user._id,
            userRole: 'entrepreneur',
            title: 'Document Verification Approved',
            message: 'Your document verification request has been Approved.',
            type: 'success',
            link: '/entrepreneur_dashboard/settings',
            isRead: false
        });

        return NextResponse.json({ message: 'Request approved and profile updated.' });

    } else if (action === 'reject') {
        // 1. Delete REQUEST'S NEW Cloudinary files (since they are rejected/unused)
        if (request.cnicFront) await deleteFromCloudinary(request.cnicFront);
        if (request.cnicBack) await deleteFromCloudinary(request.cnicBack);
        if (request.passportScan) await deleteFromCloudinary(request.passportScan);

        request.status = 'rejected';
        await DocumentUpdate.findByIdAndDelete(id);

        // Notify Entrepreneur
        await Notification.create({
            userId: user._id,
            userRole: 'entrepreneur',
            title: 'Document Verification Rejected',
            message: 'Your document verification request has been Rejected.',
            type: 'error',
            link: '/entrepreneur_dashboard/settings',
            isRead: false
        });

        return NextResponse.json({ message: 'Request rejected and temporary files deleted.' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
