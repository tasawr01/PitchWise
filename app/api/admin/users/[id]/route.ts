import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Entrepreneur from '@/models/Entrepreneur';
import Investor from '@/models/Investor';
import Pitch from '@/models/Pitch';
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

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        if (!await verifyAdmin(req)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const { id } = await params;
        const body = await req.json();
        const { status, rejectionReason } = body;

        let user: any = await Entrepreneur.findById(id);
        let role = 'entrepreneur';

        if (!user) {
            user = await Investor.findById(id);
            role = 'investor';
        }

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Update fields
        if (status) user.status = status;
        if (status === 'approved') user.isVerified = true;
        if (status === 'rejected') user.isVerified = false;

        await user.save();

        // Send Notification
        let title = 'Profile Update';
        let message = 'Your profile has been updated by the admin.';
        let type = 'info';

        if (status === 'approved') {
            title = 'Profile Approved';
            message = 'Congratulations! Your profile has been verified and approved.';
            type = 'success';
        } else if (status === 'rejected') {
            title = 'Profile Rejected';
            message = `Your profile has been rejected. Reason: ${rejectionReason || 'Not specified'}`;
            type = 'error';
        }

        await Notification.create({
            userId: user._id,
            userRole: role,
            title,
            message,
            type,
            isRead: false
        });

        return NextResponse.json({ message: 'User updated successfully', user });

    } catch (error: any) {
        console.error('Update User Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        if (!await verifyAdmin(req)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const { id } = await params;

        // Determine user type and fetch
        let user: any = await Entrepreneur.findById(id);
        let role = 'entrepreneur';

        if (!user) {
            user = await Investor.findById(id);
            role = 'investor';
        }

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // 1. Delete User Identity Files
        const identityFiles = [user.profilePhoto, user.cnicFront, user.cnicBack, user.passportScan];
        for (const url of identityFiles) {
            if (url) await deleteFromCloudinary(url);
        }

        // 2. If Entrepreneur, Delete All Pitches and their Files
        if (role === 'entrepreneur') {
            const pitches = await Pitch.find({ entrepreneur: id });

            for (const pitch of pitches) {
                // Delete pitch files
                if (pitch.pitchDeckUrl) await deleteFromCloudinary(pitch.pitchDeckUrl);
                if (pitch.financialsUrl) await deleteFromCloudinary(pitch.financialsUrl);
                if (pitch.demoUrl) await deleteFromCloudinary(pitch.demoUrl);
            }

            // Delete pitch records
            await Pitch.deleteMany({ entrepreneur: id });
        }

        // 3. Delete the User Record
        if (role === 'entrepreneur') {
            await Entrepreneur.findByIdAndDelete(id);
        } else {
            await Investor.findByIdAndDelete(id);
        }

        return NextResponse.json({ message: 'User and all associated data deleted successfully.' });

    } catch (error: any) {
        console.error('Delete User Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
