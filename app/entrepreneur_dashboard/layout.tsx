import { cookies } from 'next/headers';
import dbConnect from '@/lib/db';
import Entrepreneur from '@/models/Entrepreneur';
import { jwtVerify } from 'jose';
import { redirect } from 'next/navigation';
import EntrepreneurDashboardLayout from '@/components/EntrepreneurDashboardLayout';

async function getUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return null;
    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        if (payload.role !== 'entrepreneur') return null;
        await dbConnect();
        const user = await Entrepreneur.findById(payload.id).select('profilePhoto fullName').lean();
        return JSON.parse(JSON.stringify(user));
    } catch {
        return null;
    }
}

export default async function Layout({ children }: { children: React.ReactNode }) {
    const user = await getUser();

    if (!user) {
        redirect('/login');
    }

    return (
        <EntrepreneurDashboardLayout user={user}>
            {children}
        </EntrepreneurDashboardLayout>
    );
}
