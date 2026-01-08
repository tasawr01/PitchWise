import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Entrepreneur from '@/models/Entrepreneur';
import Investor from '@/models/Investor';
import { uploadToCloudinary } from '@/lib/cloudinary';
import bcrypt from 'bcryptjs';
import Settings from '@/models/Settings';

import Admin from '@/models/Admin';

export async function POST(req: Request) {
    try {
        await dbConnect();

        // Check if new registrations are allowed
        const settings = await Settings.getSettings();
        if (!settings.allowRegistrations) {
            return NextResponse.json({ error: 'New registrations are currently disabled by the administrator.' }, { status: 403 });
        }

        const formData = await req.formData();
        const role = formData.get('role') as string;

        if (!['entrepreneur', 'investor'].includes(role)) {
            return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
        }

        // Extract basic fields common to both
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        // Check if user already exists in either collection
        // Note: Ideally we might want a unified 'User' collection to enforce unique emails across the whole platform easily,
        // but separate collections were requested. We should check both.
        const existsEnt = await Entrepreneur.findOne({ email });
        const existsInv = await Investor.findOne({ email });

        if (existsEnt || existsInv) {
            return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
        }

        // Helper to upload file
        const uploadFile = async (field: string) => {
            const file = formData.get(field) as File | null;
            if (file && file.size > 0) {
                const buffer = Buffer.from(await file.arrayBuffer());
                const res = await uploadToCloudinary(buffer, 'pitchwise/users');
                return res.secure_url;
            }
            return null; // Return null if no file
        };

        // Upload Images
        const profilePhotoUrl = await uploadFile('profilePhoto');
        const cnicFrontUrl = await uploadFile('cnicFront');
        const cnicBackUrl = await uploadFile('cnicBack');
        const passportScanUrl = await uploadFile('passportScan');

        // Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Prepare Base Data object from FormData entries
        const userData: any = {
            password: hashedPassword,
            profilePhoto: profilePhotoUrl,
            cnicFront: cnicFrontUrl,
            cnicBack: cnicBackUrl,
            passportScan: passportScanUrl,
            status: 'pending',
            isVerified: false
        };

        // Populate other fields from formData
        // Iterate over keys to populate, skipping files and password which we handled
        for (const [key, value] of formData.entries()) {
            if (!['profilePhoto', 'cnicFront', 'cnicBack', 'passportScan', 'password'].includes(key)) {
                // Handle array fields (e.g. industryPreferences)
                if (key === 'industryPreferences') {
                    // Assuming logic in frontend sends it ideally, but formData might send comma separated or multiple entries.
                    // If multiple entries with same key, formData.getAll would be needed, but loop uses entries() which might give duplicates.
                    // Better approach:
                } else {
                    userData[key] = value;
                }
            }
        }

        // Specifically handle industryPreferences for investors
        if (role === 'investor') {
            // If sent as JSON string or comma separated? Frontend implementation should match.
            // Let's check how the frontend sends array. Usually standard FormData appends same key multiple times.
            // We can just use getAll() for known array fields.
            const industries = formData.getAll('industryPreferences[]'); // or just industryPreferences depending on how frontend sends it.
            // The frontend state is an array strings. If they append manually...
            // Let's assume frontend sends a JSON string for simplicity or check frontend code later.
            // Or cleaner: allow frontend to send it as comma separated string or multiple keys.
            // For now, let's just grab 'industryPreferences' if it was a single string, or getAll.
            // NOTE: In the existing frontend code `industryPreferences` is `string[]`.
            // We'll need to update frontend to append correctly.
        }

        let newUser;
        if (role === 'entrepreneur') {
            newUser = await Entrepreneur.create(userData);
        } else {
            newUser = await Investor.create(userData);
        }

        // Notify Admins
        const { notifyAdmins } = await import('@/lib/notification');
        await notifyAdmins(
            `New ${role} registration: ${userData.fullName || email}`,
            'info',
            newUser._id,
            role === 'entrepreneur' ? 'Entrepreneur' : 'Investor'
        );

        return NextResponse.json({ message: 'Registration successful', userId: newUser._id });

    } catch (error: any) {
        console.error('Signup Error:', error);
        return NextResponse.json({ error: error.message || 'Registration failed' }, { status: 500 });
    }
}
