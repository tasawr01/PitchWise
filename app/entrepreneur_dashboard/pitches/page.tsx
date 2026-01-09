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
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                    <h2 className="text-3xl font-extrabold text-[#0B2C4A] tracking-tight">My Pitches</h2>
                    <p className="text-gray-500 mt-2 text-lg">Manage and track your startup proposals.</p>
                </div>
                <Link
                    href="/entrepreneur_dashboard/pitches/create"
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-[#0B2C4A] hover:bg-[#09223a] transition-all hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0B2C4A]"
                >
                    <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create New Pitch
                </Link>
            </header>

            {pitches.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-dashed border-gray-300">
                    <div className="w-20 h-20 bg-[#0B2C4A]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="h-10 w-10 text-[#0B2C4A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <h3 className="mt-2 text-xl font-bold text-gray-900">No pitches found</h3>
                    <p className="mt-2 text-gray-500 max-w-sm mx-auto">Get started by creating a new pitch to showcase your startup to investors.</p>
                    <div className="mt-8">
                        <Link
                            href="/entrepreneur_dashboard/pitches/create"
                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-[#0B2C4A] hover:bg-[#09223a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0B2C4A] transition-all"
                        >
                            Start your first pitch
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {pitches.map((pitch: any) => (
                        <div key={pitch._id} className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col h-full group">
                            {/* Card Image */}
                            <Link href={`/entrepreneur_dashboard/pitches/${pitch._id}`} className="block h-52 bg-gray-100 relative overflow-hidden group-hover:opacity-90 transition-opacity">
                                {pitch.demoUrl ? (
                                    <Image
                                        src={pitch.demoUrl}
                                        alt={pitch.title}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-[#0B2C4A]/5 to-[#0B2C4A]/10 flex items-center justify-center text-[#0B2C4A]/30">
                                        <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                )}
                                <div className="absolute top-4 right-4 z-10">
                                    <StatusBadge status={pitch.status} />
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                                    <span className="text-white text-xs font-bold uppercase tracking-wider bg-black/30 backdrop-blur-sm px-2 py-1 rounded-md border border-white/20">
                                        {pitch.industry}
                                    </span>
                                </div>
                            </Link>

                            <div className="p-6 flex-1 flex flex-col">
                                <Link href={`/entrepreneur_dashboard/pitches/${pitch._id}`} className="flex-1 block">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-xl font-bold text-gray-900 line-clamp-1 group-hover:text-[#0B2C4A] transition-colors">{pitch.title}</h3>
                                    </div>
                                    <span className="inline-block text-lg font-bold text-green-600 mb-3">
                                        ${pitch.amountRequired.toLocaleString()}
                                    </span>
                                    <p className="text-gray-500 text-sm line-clamp-3 mb-6 leading-relaxed">
                                        {pitch.problemStatement}
                                    </p>
                                </Link>

                                <div className="pt-4 border-t border-gray-50 flex items-center gap-3">
                                    <DeletePitchButton pitchId={pitch._id} />
                                    <Link
                                        href={`/entrepreneur_dashboard/pitches/${pitch._id}`}
                                        className="flex-1 inline-flex justify-center items-center px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-200 hover:text-[#0B2C4A] transition-all"
                                    >
                                        View Details
                                    </Link>
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
