import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import dbConnect from '@/lib/db';
import Investor from '@/models/Investor';
import SettingsForm from '@/components/investor/SettingsForm';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

async function getUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return null;
    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        if (payload.role !== 'investor') return null;

        await dbConnect();
        const user = await Investor.findById(payload.id).lean();
        return JSON.parse(JSON.stringify(user));
    } catch {
        return null;
    }
}

export default async function SettingsPage() {
    const user = await getUser();
    if (!user) redirect('/login');

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-[#0B2C4A] tracking-tight">Account Settings</h1>
                <p className="text-gray-500 mt-2 text-lg">Manage your profile and investment preferences.</p>
            </div>

            <SettingsForm user={user} />
        </div>
    );
}
