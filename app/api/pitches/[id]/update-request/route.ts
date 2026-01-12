import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Pitch from '@/models/Pitch';
import PitchUpdate from '@/models/PitchUpdate';
import { uploadToCloudinary, deleteFromCloudinary } from '@/lib/cloudinary';
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

export async function GET(req: Request, context: any) {
    try {
        await dbConnect();
        const { params } = context;
        const user = await verifyAuth(req);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = await params;
        const pendingUpdate = await PitchUpdate.findOne({ pitch: id, status: 'pending' });

        return NextResponse.json({ pendingUpdate });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
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

        // Upload Files or Use Existing (New uploads return URL, else null)
        const newLogoUrl = await uploadFile('logo', 'pitchwise/logos');
        const newPitchDeckUrl = await uploadFile('pitchDeck', 'pitchwise/pitches/decks');
        const newDemoUrl = await uploadFile('demo', 'pitchwise/pitches/demos');

        // For array files, we blindly upload new ones. Merging logic: append new ones to existing? 
        // Or replace? 
        // Typically, "update" might mean "replace" or "add". 
        // In the UI, the user sees "existing files" as links? No, the update form UI for files is "Upload New". 
        // It doesn't show existing files in the file input. 
        // So any files sent here are NEW additions or replacements.
        // For simplicity: if new files are sent, we might want to REPLACE the list or APPEND.
        // Given the UI shows "Traction Proof (If Any)" as a fresh upload, let's assume if they upload, they might want to ADD.
        // But usually update forms replace the list. Let's assume replacement if new files provided, else keep old.
        // Actually, for arrays, handling "remove one file" is hard without complex UI. 
        // Let's assume: If new files uploaded -> REPLACE old list (or merge). 
        // Let's just APPEND for now, or use the newly uploaded list if present.
        // However, the user might want to KEEP old files.
        // If formData has 'tractionProof' files, use them. If not, use currentPitch.tractionProofUrls.
        // But what if they want to DELETE old ones?
        // Current UI doesn't support deleting individual old files in the update form easily (it resets to empty [] in state).
        // Let's assume if new files are provided, we USE THE NEW FILES. If empty, we KEEP THE OLD FILES.
        // Users can "clear" by uploading a dummy? No that sucks.
        // Ideally, we'd have a way to signal "clear".
        // For now: If files uploaded, they become the new list associated with the update. 
        // If NO files uploaded, we copy the current pitch's files to the update.

        const newTractionUrls = await uploadFiles('tractionProof', 'pitchwise/pitches/traction');
        const newFinancialsUrls = await uploadFiles('financials', 'pitchwise/pitches/financials');

        // Check for existing pending request to clean up
        const existingUpdate = await PitchUpdate.findOne({ pitch: id, status: 'pending' });

        // Cleanup logic could be complex with arrays, skipping deeply for now to avoid accidental deletions of shared files.
        // In a real app, strict ref counting or orphan cleanup job is better.

        const logoUrl = newLogoUrl || currentPitch.logoUrl;
        const pitchDeckUrl = newPitchDeckUrl || currentPitch.pitchDeckUrl;
        const demoUrl = newDemoUrl || currentPitch.demoUrl;
        // If new list has items, use it. Else fall back to current pitch.
        const tractionProofUrls = newTractionUrls.length > 0 ? newTractionUrls : currentPitch.tractionProofUrls;
        const financialsUrls = newFinancialsUrls.length > 0 ? newFinancialsUrls : currentPitch.financialsUrls;

        // Construct Data Object
        const updateData: any = {
            pitch: id,
            entrepreneur: user.id,
            status: 'pending',
            logoUrl,
            pitchDeckUrl,
            demoUrl,
            tractionProofUrls,
            financialsUrls
        };

        const keysToSkip = ['logo', 'pitchDeck', 'demo', 'tractionProof', 'financials'];

        for (const [key, value] of formData.entries()) {
            if (!keysToSkip.includes(key)) {
                if (['amountRequired', 'equityOffered', 'valuation'].includes(key)) {
                    updateData[key] = Number(value);
                } else {
                    updateData[key] = value;
                }
            }
        }

        // Upsert the Update Request
        const updateRequest = await PitchUpdate.findOneAndUpdate(
            { pitch: id, status: 'pending' },
            updateData,
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        // Notify Admins
        await notifyAdmins(
            `Pitch Update Request: ${updateData.title || currentPitch.title}`,
            'info',
            id, // Link to the pitch (admin will see update tab)
            'PitchUpdate'
        );

        return NextResponse.json({ message: 'Update request submitted successfully', requestId: updateRequest._id });

    } catch (error: any) {
        console.error('Pitch Update Request Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to submit update request' }, { status: 500 });
    }
}
