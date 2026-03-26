import { getInvestorWatchlist } from '@/app/actions/investor';
// getSession import removed
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import PitchCard from '@/components/investor/PitchCard';
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
        return payload;
    } catch {
        return null;
    }
}

export default async function WatchlistPage() {
    const user = await getUser();
    if (!user) redirect('/login');

    const watchlist = await getInvestorWatchlist(user.id as string);

    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-[#0B2C4A] tracking-tight">My Watchlist</h1>
                <p className="text-gray-500 mt-2 text-lg">Pitches you've saved for later review.</p>
            </div>

            {watchlist.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {watchlist.map((pitch: any) => (
                        <PitchCard key={pitch._id} pitch={pitch} isWatched={true} />
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Your watchlist is empty</h3>
                    <p className="text-gray-500 mb-6">Start exploring pitches and save the ones you're interested in.</p>
                    <a href="/investor_dashboard/explore" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                        Explore Pitches
                    </a>
                </div>
            )}
        </div>
    );
}
