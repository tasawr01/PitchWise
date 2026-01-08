import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import DocumentUpdate from '@/models/DocumentUpdate';
import { jwtVerify } from 'jose';
import { uploadToCloudinary } from '@/lib/cloudinary';

import Admin from '@/models/Admin';
import Entrepreneur from '@/models/Entrepreneur';

async function verifyEntrepreneur(req: Request) {
    const token = req.headers.get('cookie')?.match(/token=([^;]+)/)?.[1];
    if (!token) return null;
    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        if (payload.role !== 'entrepreneur') return null;
        return payload.id;
    } catch {
        return null;
    }
}

export async function GET(req: Request) {
    try {
        const userId = await verifyEntrepreneur(req);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const pendingRequest = await DocumentUpdate.findOne({
            entrepreneur: userId,
            status: 'pending'
        });

        return NextResponse.json({ pendingRequest });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const userId = await verifyEntrepreneur(req);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await req.formData();
        const documentType = formData.get('documentType') as string;

        if (!documentType) {
            return NextResponse.json({ error: 'Document type is required' }, { status: 400 });
        }

        await dbConnect();

        // Check for existing pending request
        const existingRequest = await DocumentUpdate.findOne({
            entrepreneur: userId,
            status: 'pending'
        });

        if (existingRequest) {
            return NextResponse.json({ error: 'You already have a pending document update request.' }, { status: 400 });
        }

        let cnicFrontUrl, cnicBackUrl, passportScanUrl;

        // Upload files
        if (documentType === 'cnic') {
            const front = formData.get('cnicFront') as File | null;
            const back = formData.get('cnicBack') as File | null;

            if (front) {
                const buffer = Buffer.from(await front.arrayBuffer());
                const res = await uploadToCloudinary(buffer, 'pitchwise/documents', front.name);
                cnicFrontUrl = res.secure_url;
            }
            if (back) {
                const buffer = Buffer.from(await back.arrayBuffer());
                const res = await uploadToCloudinary(buffer, 'pitchwise/documents', back.name);
                cnicBackUrl = res.secure_url;
            }
        } else if (documentType === 'passport') {
            const scan = formData.get('passportScan') as File | null;
            if (scan) {
                const buffer = Buffer.from(await scan.arrayBuffer());
                const res = await uploadToCloudinary(buffer, 'pitchwise/documents', scan.name);
                passportScanUrl = res.secure_url;
            }
        }

        // Create new request
        const newRequest = await DocumentUpdate.create({
            entrepreneur: userId,
            documentType,
            cnicNumber: documentType === 'cnic' ? formData.get('cnicNumber') : undefined,
            cnicFront: cnicFrontUrl,
            cnicBack: cnicBackUrl,
            passportNumber: documentType === 'passport' ? formData.get('passportNumber') : undefined,
            issuingCountry: documentType === 'passport' ? formData.get('issuingCountry') : undefined,
            expiryDate: documentType === 'passport' ? formData.get('expiryDate') : undefined,
            passportScan: passportScanUrl,
            status: 'pending'
        });

        // Fetch user details for notification
        const user = await Entrepreneur.findById(userId);



        // Notify Admins
        const { notifyAdmins } = await import('@/lib/notification');
        await notifyAdmins(
            `New Document Update Request from ${(user as any).fullName}`,
            'info',
            newRequest._id,
            'DocumentUpdate'
        );

        return NextResponse.json({
            message: 'Document update requested submitted successfully',
            request: newRequest
        });

    } catch (error) {
        console.error('Doc update request error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
