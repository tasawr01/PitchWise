import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import DocumentUpdate from '@/models/DocumentUpdate';
import Entrepreneur from '@/models/Entrepreneur';
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

export async function GET(req: Request) {
    if (!await verifyAdmin(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const updates = await DocumentUpdate.find({ status: 'pending' })
        .populate('entrepreneur', 'fullName email')
        .sort({ createdAt: -1 });

    return NextResponse.json({ updates });
}

export async function PUT(req: Request) {
    if (!await verifyAdmin(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { requestId, action, adminComment } = body;

    if (!requestId || !['approved', 'rejected'].includes(action)) {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    await dbConnect();
    const updateRequest = await DocumentUpdate.findById(requestId); // don't populate here if not needed, or simpler to just use ID

    if (!updateRequest) {
        return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    if (updateRequest.status !== 'pending') {
        return NextResponse.json({ error: 'Request is already processed' }, { status: 400 });
    }

    updateRequest.status = action;
    updateRequest.adminComment = adminComment || '';

    if (action === 'approved') {
        // Update Entrepreneur Profile
        const entrepreneur = await Entrepreneur.findById(updateRequest.entrepreneur);
        if (entrepreneur) {
            entrepreneur.documentType = updateRequest.documentType;
            if (updateRequest.documentType === 'cnic') {
                entrepreneur.cnicNumber = updateRequest.cnicNumber;
                entrepreneur.cnicFront = updateRequest.cnicFront;
                entrepreneur.cnicBack = updateRequest.cnicBack;
                // Clear passport fields to ensure mutual exclusivity logic works or just update what's new
                // User said they are mutually exclusive, so we might want to clear others.
                entrepreneur.passportNumber = undefined;
                entrepreneur.passportScan = undefined;
            } else {
                entrepreneur.passportNumber = updateRequest.passportNumber;
                entrepreneur.passportScan = updateRequest.passportScan;
                // Clear cnic fields
                entrepreneur.cnicNumber = undefined;
                entrepreneur.cnicFront = undefined;
                entrepreneur.cnicBack = undefined;
            }
            // Ensure verified status is consistent? If they update doc, are they verified immediately? 
            // "documents... must be updated after admin approval".
            // If admin approves it, presumably it's verified.
            // entrepreneur.isVerified = true; // Maybe? Keep it safe. 
            // But if they were already verified and just updating, still true.
            // If they were pending/unverified, now they are verified.
            entrepreneur.isVerified = true;

            await entrepreneur.save();
        }
    }

    await updateRequest.save();

    return NextResponse.json({ message: `Request ${action} successfully` });
}
