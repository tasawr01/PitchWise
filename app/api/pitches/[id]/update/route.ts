import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Pitch from '@/models/Pitch';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { jwtVerify } from 'jose';
import { notifyAdmins } from '@/lib/notification';

// Helper to verify entrepreneur
async function verifyAuth(req: Request) {
    const token = req.headers.get('cookie')?.match(/token=([^;]+)/)?.[1];
    if (!token) return null;
    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        return payload.role === 'entrepreneur' ? payload : null;
    } catch {
        return null;
    }
}

export async function POST(req: Request, context: any) {
    try {
        await dbConnect();
        const { params } = context;
        const user = await verifyAuth(req);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = await params;
        const currentPitch = await Pitch.findOne({ _id: id, entrepreneur: user.id });
        if (!currentPitch) {
            return NextResponse.json({ error: 'Pitch not found' }, { status: 404 });
        }

        // 1. Check if Update is Allowed
        // 1. Check if Update is Allowed
        // Allowed if 'rejected' OR 'draft'
        if (currentPitch.status !== 'rejected' && currentPitch.status !== 'draft') {
            return NextResponse.json({ error: 'You can only update pitches that are rejected or drafts.' }, { status: 403 });
        }

        // 2. Check Rejection Limit (3 updates allowed)
        // If it was rejected 3 times, it allows a 3rd update. 
        // If it was rejected 4 times (count > 3), it's permanent.
        if (currentPitch.rejectionCount > 3) {
            return NextResponse.json({ error: 'Maximum update limit reached. Pitch is permanently rejected.' }, { status: 403 });
        }

        const formData = await req.formData();

        // Helper to upload file
        const uploadFile = async (field: string, folder: string) => {
            const file = formData.get(field) as File | null;
            if (file && file.size > 0) {
                const buffer = Buffer.from(await file.arrayBuffer());
                const res = await uploadToCloudinary(buffer, folder, file.name);
                return res.secure_url;
            }
            return null;
        };

        // Helper to upload multiple files
        const uploadFiles = async (field: string, folder: string) => {
            const files = formData.getAll(field) as File[];
            const urls: string[] = [];
            for (const file of files) {
                if (file && file.size > 0) {
                    const buffer = Buffer.from(await file.arrayBuffer());
                    const res = await uploadToCloudinary(buffer, folder, file.name);
                    urls.push(res.secure_url);
                }
            }
            return urls;
        }

        // Upload new files
        const newLogoUrl = await uploadFile('logo', 'pitchwise/logos');
        const newPitchDeckUrl = await uploadFile('pitchDeck', 'pitchwise/pitches/decks');
        const newDemoUrl = await uploadFile('demo', 'pitchwise/pitches/demos');
        const newTractionUrls = await uploadFiles('tractionProof', 'pitchwise/pitches/traction');
        const newFinancialsUrls = await uploadFiles('financials', 'pitchwise/pitches/financials');

        // Construct Update Data
        // Use new files if present, else keep old
        const updateData: any = {
            logoUrl: newLogoUrl || currentPitch.logoUrl,
            pitchDeckUrl: newPitchDeckUrl || currentPitch.pitchDeckUrl,
            demoUrl: newDemoUrl || currentPitch.demoUrl,
            // If new list has items, use it. Else fall back to current
            tractionProofUrls: newTractionUrls.length > 0 ? newTractionUrls : currentPitch.tractionProofUrls,
            financialsUrls: newFinancialsUrls.length > 0 ? newFinancialsUrls : currentPitch.financialsUrls,

            // Set status to PENDING
            // If saving as draft, keep draft. If submitting, set to 'pending'.
            status: formData.get('status') === 'draft' ? 'draft' : 'pending'
        };

        if (updateData.status === 'draft') {
            const hasName = updateData.businessName || currentPitch.businessName;
            if (!hasName) {
                return NextResponse.json({ error: 'Business Name is required to save a draft.' }, { status: 400 });
            }
        }

        const keysToSkip = ['logo', 'pitchDeck', 'demo', 'tractionProof', 'financials', 'entrepreneur', '_id', 'rejectionCount', 'history', 'createdAt', 'updatedAt', 'status'];

        for (const [key, value] of formData.entries()) {
            if (!keysToSkip.includes(key) && value) {
                if (['amountRequired', 'equityOffered', 'valuation'].includes(key)) {
                    updateData[key] = Number(value);
                } else {
                    updateData[key] = value;
                }
            } else {
                console.log(`Skipping key: ${key}`);
            }
        }

        // Update the pitch directly
        console.log('Final Update Data:', updateData);
        const updatedPitch = await Pitch.findByIdAndUpdate(id, { $set: updateData }, { new: true });
        console.log('Pitch Updated Successfully:', updatedPitch._id, updatedPitch.status);

        // Notify Admins
        // Notify Admins ONLY if Submit (pending) and not Draft
        if (updateData.status === 'pending') {
            await notifyAdmins(
                `Pitch Resubmitted: ${updatedPitch.title}`,
                'info',
                id,
                'Pitch'
            );
        }

        return NextResponse.json({ message: 'Pitch updated and resubmitted for review', pitch: updatedPitch });

    } catch (error: any) {
        console.error('Pitch Update Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to update pitch' }, { status: 500 });
    }
}
