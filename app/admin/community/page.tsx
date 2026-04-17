import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import * as jose from 'jose';
import CommunityChatLayout from '@/components/chat/CommunityChatLayout';

export const dynamic = 'force-dynamic';

async function getAdminSession() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return null;

    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jose.jwtVerify(token, secret);

        if (payload.role !== 'Admin' && payload.role !== 'admin') return null;
        return payload;
    } catch (error) {
        return null;
    }
}

export default async function AdminCommunityPage() {
    const session = await getAdminSession();

    if (!session) {
        redirect('/admin_login');
    }

    const currentUser = { id: session.id, role: 'Admin', email: session.email };

    return (
        <div className="space-y-6">
            <header className="mb-8">
                <h2 className="text-3xl font-extrabold text-[#0B2C4A] tracking-tight">Community Forums</h2>
                <p className="text-gray-500 mt-2 text-lg">Manage topics and engage with investors</p>
            </header>

            <CommunityChatLayout currentUser={currentUser} />
        </div>
    );
}
