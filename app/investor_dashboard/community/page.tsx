import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import * as jose from 'jose';
import CommunityChatLayout from '@/components/chat/CommunityChatLayout';

export const dynamic = 'force-dynamic';

async function getInvestorSession() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return null;

    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jose.jwtVerify(token, secret);

        // JWT might have 'investor' or 'Investor'
        if (typeof payload.role === 'string' && payload.role.toLowerCase() !== 'investor') return null;
        
        return payload;
    } catch (error) {
        return null;
    }
}

export default async function InvestorCommunityPage() {
    const session = await getInvestorSession();

    if (!session) {
        redirect('/login');
    }

    const currentUser = { id: session.id, role: 'Investor', email: session.email };

    return (
        <div className="space-y-6">
            <header className="mb-0">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-extrabold text-[#0B2C4A] tracking-tight">Investor Community</h2>
                        <p className="text-gray-500 mt-2 text-lg whitespace-nowrap">Discuss trends, pitches, and network</p>
                    </div>
                </div>
            </header>

            <div className="pt-4">
                <CommunityChatLayout currentUser={currentUser} />
            </div>
        </div>
    );
}
