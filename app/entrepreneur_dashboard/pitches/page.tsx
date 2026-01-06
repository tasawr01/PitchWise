import Link from 'next/link';
import dbConnect from '@/lib/db';
import Pitch from '@/models/Pitch';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import Image from 'next/image';
import DeletePitchButton from '@/components/DeletePitchButton';

async function getPitches() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return [];

    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        await dbConnect();

        // Return raw lean objects serialization manually if needed, or map
        const pitches = await Pitch.find({ entrepreneur: payload.id }).sort({ createdAt: -1 });
        return JSON.parse(JSON.stringify(pitches));
    } catch {
        return [];
    }
}

export default async function MyPitches() {
    const pitches = await getPitches();

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">My Pitches</h2>
                    <p className="text-gray-500">Manage your startup listings and view their status.</p>
                </div>
                <Link
                    href="/entrepreneur_dashboard/pitches/create"
                    className="fixed bottom-6 right-6 z-50 md:static bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 md:py-2.5 md:rounded-lg rounded-full shadow-lg md:shadow-sm transition-all flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Create New Pitch
                </Link>
            </div>

            {pitches.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
                        🚀
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">No Pitches Yet</h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                        You haven't listed any startups yet. Create your first pitch to start connecting with investors under the 9-Step Verification process.
                    </p>
                    <Link
                        href="/entrepreneur_dashboard/pitches/create"
                        className="text-blue-600 font-medium hover:text-blue-800"
                    >
                        Start your first pitch &rarr;
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pitches.map((pitch: any) => (
                        <div key={pitch._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group">
                            <div className="h-40 bg-gray-100 relative">
                                {pitch.demoUrl ? (
                                    <Image src={pitch.demoUrl} alt={pitch.title} fill className="object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    </div>
                                )}
                                <div className="absolute top-3 right-3">
                                    <StatusBadge status={pitch.status} />
                                </div>
                            </div>
                            <div className="p-5">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex-1 min-w-0 mr-2">
                                        <h3 className="font-bold text-lg text-gray-800 line-clamp-1">{pitch.title}</h3>
                                    </div>
                                    <DeletePitchButton pitchId={pitch._id} />
                                </div>
                                <span className="block text-sm font-semibold text-gray-500 mb-2">${pitch.amountRequired.toLocaleString()}</span>
                                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{pitch.problemStatement}</p>

                                <div className="flex items-center justify-between text-xs text-gray-400 pt-4 border-t border-gray-50">
                                    <span>{pitch.industry}</span>
                                    <span>{new Date(pitch.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: any = {
        pending: 'bg-yellow-100 text-yellow-800',
        approved: 'bg-green-100 text-green-800',
        rejected: 'bg-red-100 text-red-800',
    };
    return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm ${styles[status]}`}>
            {status}
        </span>
    );
}
