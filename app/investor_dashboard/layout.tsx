import { cookies } from 'next/headers';
import dbConnect from '@/lib/db';
import Investor from '@/models/Investor';
import { jwtVerify } from 'jose';
import { redirect } from 'next/navigation';
import InvestorDashboardLayout from '@/components/InvestorDashboardLayout';

async function getUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return null;
    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        if (payload.role !== 'investor') return null;
        await dbConnect();
        const user = await Investor.findById(payload.id).select('_id profilePhoto fullName').lean();
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
        <InvestorDashboardLayout user={user}>
            {children}
        </InvestorDashboardLayout>
    );
}
