import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Pitch from '@/models/Pitch';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { jwtVerify } from 'jose';
import Settings from '@/models/Settings';

import Admin from '@/models/Admin';

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

export async function POST(req: Request) {
    try {
        await dbConnect();
        const user = await verifyAuth(req);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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

        // Upload Files
        console.log('Received FormData Keys:', Array.from(formData.keys()));
        const logoUrl = await uploadFile('logo', 'pitchwise/logos');
        const pitchDeckUrl = await uploadFile('pitchDeck', 'pitchwise/pitches/decks');
        const demoUrl = await uploadFile('demo', 'pitchwise/pitches/demos');
        const tractionProofUrls = await uploadFiles('tractionProof', 'pitchwise/pitches/traction');
        const financialsUrls = await uploadFiles('financials', 'pitchwise/pitches/financials');

        console.log('Upload results:', { logoUrl, pitchDeckUrl, tractionCount: tractionProofUrls.length });

        // DETERMINE STATUS
        const isDraft = formData.get('status') === 'draft';
        const status = isDraft ? 'draft' : 'pending';

        // STRICT VALIDATION FOR NON-DRAFTS
        if (isDraft) {
            if (!formData.get('businessName')) {
                return NextResponse.json({ error: 'Business Name is required to save a draft.' }, { status: 400 });
            }
        } else {
            const missingFields = [];
            if (!pitchDeckUrl) missingFields.push('Pitch Deck');
            if (!logoUrl) missingFields.push('Company Logo');
            // Additional checks handled below or via validation helper if imported

            // Basic required file check
            if (missingFields.length > 0) {
                return NextResponse.json({ error: `Missing required files: ${missingFields.join(', ')}` }, { status: 400 });
            }
        }



        // Construct Data Object (Manual parsing since formData val is string)
        const pitchData: any = {
            entrepreneur: user.id,
            entrepreneur: user.id,
            status,
            logoUrl,
            pitchDeckUrl,
            demoUrl,
            tractionProofUrls,
            financialsUrls,
        };

        // Auto-Moderation Check (Skip for Drafts?) - Let's keep it but maybe not reject drafts automatically
        // Or if it's draft, we just save it. 
        if (!isDraft) {
            const settings = await Settings.getSettings();
            if (settings.forbiddenKeywords) {
                const keywords = settings.forbiddenKeywords.split(',').map((k: string) => k.trim().toLowerCase());
                const contentToCheck = `${formData.get('title')} ${formData.get('problemStatement')} ${formData.get('solution')}`.toLowerCase();

                const hasForbiddenContent = keywords.some((k: string) => k && contentToCheck.includes(k));
                if (hasForbiddenContent) {
                    pitchData.status = 'rejected'; // Auto-reject
                }
            }
        }

        const keysToSkip = ['logo', 'pitchDeck', 'financials', 'tractionProof', 'demo'];
        for (const [key, value] of formData.entries()) {
            if (!keysToSkip.includes(key)) {
                // Determine if number or boolean needs conversion? 
                // Mongoose cast handles most, but let's be safe for required numbers
                if (['amountRequired', 'equityOffered', 'valuation'].includes(key)) {
                    pitchData[key] = Number(value);
                } else {
                    pitchData[key] = value;
                }
            }
        }

        const newPitch = await Pitch.create(pitchData);

        // Notify Admins ONLY if NOT draft
        if (!isDraft && pitchData.status !== 'rejected') {
            const { notifyAdmins } = await import('@/lib/notification');
            await notifyAdmins(
                `New Pitch Submitted: ${pitchData.title}`,
                'info',
                newPitch._id,
                'Pitch'
            );
        }

        return NextResponse.json({ message: isDraft ? 'Pitch saved as draft' : 'Pitch submitted successfully', pitchId: newPitch._id });

    } catch (error: any) {
        console.error('Pitch Creation Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to create pitch' }, { status: 500 });
    }
}
