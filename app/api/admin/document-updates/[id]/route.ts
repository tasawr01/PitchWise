import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import DocumentUpdate from '@/models/DocumentUpdate';
import Entrepreneur from '@/models/Entrepreneur';

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

    // Fetch Request WITHOUT populate first to get the raw ID matching schema type
    const request = await DocumentUpdate.findById(id);
    if (!request) {
        return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    // Explicitly fetch the Entrepreneur using the ID from the request
    // This assumes request.entrepreneur is stored as an ObjectId in the DB
    const entrepreneurId = request.entrepreneur;
    const user = await Entrepreneur.findById(entrepreneurId);

    if (!user) {
        console.error(`DEBUG: Entrepreneur not found for ID: ${entrepreneurId}`);
        return NextResponse.json({ error: 'Associated Entrepreneur not found' }, { status: 404 });
    }

    console.log(`DEBUG: Processing ${action} for Request ${id}, User ${entrepreneurId}`);

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
        await request.save();

        await DocumentUpdate.findByIdAndDelete(id);

        // Notify Entrepreneur
        const { createNotification } = await import('@/lib/notification');
        await createNotification(
            entrepreneurId,
            'Entrepreneur',
            'Your document update request has been approved and your profile updated.',
            'success',
            undefined, // No ID since it's deleted
            'DocumentUpdate'
        );

        return NextResponse.json({ message: 'Request approved and profile updated.' });

    } else if (action === 'reject') {
        // 1. Delete REQUEST'S NEW Cloudinary files (since they are rejected/unused)
        if (request.cnicFront) await deleteFromCloudinary(request.cnicFront);
        if (request.cnicBack) await deleteFromCloudinary(request.cnicBack);
        if (request.passportScan) await deleteFromCloudinary(request.passportScan);

        request.status = 'rejected';

        // Notify Entrepreneur
        const { createNotification } = await import('@/lib/notification');
        await createNotification(
            entrepreneurId,
            'Entrepreneur',
            'Your document update request has been rejected.',
            'error',
            undefined,
            'DocumentUpdate'
        );

        await DocumentUpdate.findByIdAndDelete(id);

        return NextResponse.json({ message: 'Request rejected and temporary files deleted.' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
