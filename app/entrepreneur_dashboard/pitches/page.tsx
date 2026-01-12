import Link from 'next/link';
import dbConnect from '@/lib/db';
import Pitch from '@/models/Pitch';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import Image from 'next/image';
import DeletePitchButton from '@/components/DeletePitchButton';
import PitchStatusFilter from '@/components/PitchStatusFilter';
import { formatCurrency } from '@/lib/utils';

async function getPitches(status?: string) {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return [];

    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        await dbConnect();

        const query: any = { entrepreneur: payload.id };
        if (status && status !== 'all') {
            query.status = status;
        }

        // Return raw lean objects serialization manually if needed, or map
        const pitches = await Pitch.find(query).sort({ createdAt: -1 });
        return JSON.parse(JSON.stringify(pitches));
    } catch {
        return [];
    }
}

export default async function MyPitches({ searchParams }: { searchParams: { status?: string } }) {
    // Await searchParams before accessing properties
    const params = await searchParams;
    const status = params.status;
    const pitches = await getPitches(status);

    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                    <h2 className="text-3xl font-extrabold text-[#0B2C4A] tracking-tight">My Pitches</h2>
                    <p className="text-gray-500 mt-2 text-lg">Manage and track your startup proposals.</p>
                </div>
                <div className="flex gap-3">
                    <PitchStatusFilter />
                    <Link
                        href="/entrepreneur_dashboard/pitches/create"
                        className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-[#0B2C4A] hover:bg-[#09223a] transition-all hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0B2C4A]"
                    >
                        <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create New Pitch
                    </Link>
                </div>
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
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {pitches.map((pitch: any) => (
                        <div key={pitch._id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col h-full group">
                            {/* Header: Logo and Business Name */}
                            <div className="p-5 flex items-center gap-4 border-b border-gray-50 bg-gray-50/30">
                                <div className="relative w-14 h-14 flex-shrink-0 rounded-full overflow-hidden border border-gray-200 bg-white shadow-sm">
                                    {pitch.logoUrl ? (
                                        <Image
                                            src={pitch.logoUrl}
                                            alt={pitch.businessName}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-xs">No Logo</div>
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="font-bold text-gray-900 text-lg truncate" title={pitch.businessName}>{pitch.businessName}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <StatusBadge status={pitch.status} />
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 space-y-4 flex-1">
                                {/* Ask & Equity Row */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Ask</p>
                                        <p className="text-lg font-bold text-[#0B2C4A]">Rs. {formatCurrency(pitch.amountRequired)}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Equity</p>
                                        <p className="text-lg font-bold text-gray-900">{pitch.equityOffered}%</p>
                                    </div>
                                </div>

                                {/* Stage */}
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Stage</p>
                                    <p className="text-sm font-semibold text-gray-700">{pitch.stage}</p>
                                </div>

                                {/* Valuation (Below Stage) */}
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Valuation</p>
                                    <p className="text-sm font-semibold text-gray-700">
                                        Rs. {pitch.valuation ? formatCurrency(pitch.valuation) : 'N/A'}
                                    </p>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="p-4 border-t border-gray-100 flex items-center gap-3 bg-gray-50/30">
                                <Link
                                    href={`/entrepreneur_dashboard/pitches/${pitch._id}`}
                                    className="flex-1 inline-flex justify-center items-center px-4 py-2.5 bg-[#0B2C4A] text-white text-sm font-bold rounded-lg hover:bg-[#09223a] transition-all shadow-sm hover:shadow"
                                >
                                    View Details
                                </Link>
                                <div className="flex-shrink-0">
                                    <DeletePitchButton pitchId={pitch._id} />
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
        draft: 'bg-slate-100 text-slate-700 border border-slate-200',
    };
    return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm ${styles[status]}`}>
            {status}
        </span>
    );
}
