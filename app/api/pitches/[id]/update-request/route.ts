import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Pitch from '@/models/Pitch';
import PitchUpdate from '@/models/PitchUpdate';
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

        // Upload Files or Use Existing
        const pitchDeckUrl = (await uploadFile('pitchDeck', 'pitchwise/pitches/decks')) || currentPitch.pitchDeckUrl;
        const financialsUrl = (await uploadFile('financials', 'pitchwise/pitches/financials')) || currentPitch.financialsUrl;
        const demoUrl = (await uploadFile('demo', 'pitchwise/pitches/demos')) || currentPitch.demoUrl;

        // Construct Data Object
        const updateData: any = {
            pitch: id,
            entrepreneur: user.id,
            status: 'pending',
            pitchDeckUrl,
            financialsUrl,
            demoUrl,
            // Fallbacks for fields not in formData (shouldn't happen with full form, but safe)
        };

        const simpleFields = [
            'businessName', 'title', 'industry', 'stage',
            'problemStatement', 'targetCustomer', 'solution', 'uniqueSellingPoint',
            'offeringType', 'productStatus',
            'marketType', 'revenueModel', 'pricingModel',
            'founderName', 'founderRole', 'websiteUrl',
            'fundingType', 'useOfFunds'
        ];

        const numberFields = [
            'customerCount', 'monthlyRevenue', 'totalUsers', 'monthlyGrowthRate',
            'founderExpYears', 'teamSize', 'amountRequired', 'equityOffered'
        ];

        const boolFields = ['hasExistingCustomers'];


        // Process simple fields
        for (const field of simpleFields) {
            if (formData.has(field)) updateData[field] = formData.get(field);
            else updateData[field] = currentPitch[field];
        }

        console.log('DEBUG: formData keys:', Array.from(formData.keys()));
        console.log('DEBUG: updateData.websiteUrl:', updateData.websiteUrl);

        // Process number fields
        for (const field of numberFields) {
            if (formData.has(field)) updateData[field] = Number(formData.get(field));
            else updateData[field] = currentPitch[field];
        }

        // Process boolean fields
        for (const field of boolFields) {
            if (formData.has(field)) updateData[field] = formData.get(field) === 'true';
            else updateData[field] = currentPitch[field];
        }

        // Arrays
        const keyFeatures = formData.getAll('keyFeatures');
        if (keyFeatures.length > 0) updateData.keyFeatures = keyFeatures;
        else if (formData.get('keyFeatures')) updateData.keyFeatures = (formData.get('keyFeatures') as string).split(',');
        else updateData.keyFeatures = currentPitch.keyFeatures;

        const majorMilestones = formData.getAll('majorMilestones');
        if (majorMilestones.length > 0) updateData.majorMilestones = majorMilestones;
        else if (formData.get('majorMilestones')) updateData.majorMilestones = (formData.get('majorMilestones') as string).split(',');
        else updateData.majorMilestones = currentPitch.majorMilestones;


        // Upsert the Update Request
        const updateRequest = await PitchUpdate.findOneAndUpdate(
            { pitch: id, status: 'pending' },
            updateData,
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        // Notify Admins
        await notifyAdmins(
            `Pitch Update Request: ${updateData.title}`,
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
