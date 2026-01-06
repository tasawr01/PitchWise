import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Pitch from '@/models/Pitch';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { jwtVerify } from 'jose';
import Settings from '@/models/Settings';

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

        // Upload Files
        const pitchDeckUrl = await uploadFile('pitchDeck', 'pitchwise/pitches/decks');
        const financialsUrl = await uploadFile('financials', 'pitchwise/pitches/financials');
        const demoUrl = await uploadFile('demo', 'pitchwise/pitches/demos');

        if (!pitchDeckUrl) {
            return NextResponse.json({ error: 'Pitch Deck is required' }, { status: 400 });
        }

        // Construct Data Object (Manual parsing since formData val is string)
        const pitchData: any = {
            entrepreneur: user.id,
            status: 'pending',
            pitchDeckUrl,
            financialsUrl,
            demoUrl,
        };

        // Auto-Moderation Check
        const settings = await Settings.getSettings();
        if (settings.forbiddenKeywords) {
            const keywords = settings.forbiddenKeywords.split(',').map((k: string) => k.trim().toLowerCase());
            const contentToCheck = `${formData.get('title')} ${formData.get('problemStatement')} ${formData.get('solution')}`.toLowerCase();

            const hasForbiddenContent = keywords.some((k: string) => k && contentToCheck.includes(k));
            if (hasForbiddenContent) {
                pitchData.status = 'rejected'; // Auto-reject
            }
        }

        const keysToSkip = ['pitchDeck', 'financials', 'demo', 'keyFeatures', 'majorMilestones'];
        for (const [key, value] of formData.entries()) {
            if (!keysToSkip.includes(key)) {
                // Determine if number or boolean needs conversion? 
                // Mongoose usually casts string "123" to Number 123 automatically unless STRICT.
                // We'll pass as is.
                pitchData[key] = value;
            }
        }

        // Handle Array Fields securely
        // Expecting keys like 'keyFeatures' to come in multiple times or as JSON? 
        // Standard FormData append usually results in multiple entries.
        // Let's support both comma separated or multiple entries.

        const keyFeatures = formData.getAll('keyFeatures');
        if (keyFeatures.length > 0) pitchData.keyFeatures = keyFeatures;
        else if (formData.get('keyFeatures')) {
            // Fallback if sent as one string
            pitchData.keyFeatures = (formData.get('keyFeatures') as string).split(',');
        }

        const majorMilestones = formData.getAll('majorMilestones');
        if (majorMilestones.length > 0) pitchData.majorMilestones = majorMilestones;
        else if (formData.get('majorMilestones')) {
            pitchData.majorMilestones = (formData.get('majorMilestones') as string).split(',');
        }

        const newPitch = await Pitch.create(pitchData);
        return NextResponse.json({ message: 'Pitch submitted successfully', pitchId: newPitch._id });

    } catch (error: any) {
        console.error('Pitch Creation Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to create pitch' }, { status: 500 });
    }
}
