'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export default function PitchStatusFilter() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentStatus = searchParams.get('status') || 'all';

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        if (val === 'all') {
            router.push('/entrepreneur_dashboard/pitches');
        } else {
            router.push(`/entrepreneur_dashboard/pitches?status=${val}`);
        }
    };

    return (
        <div className="flex items-center gap-3">
            <div className="relative">
                <select
                    value={currentStatus}
                    onChange={handleChange}
                    className="appearance-none bg-white border border-gray-300 text-gray-700 text-sm font-bold rounded-xl focus:ring-[#0B2C4A] focus:border-[#0B2C4A] block w-40 pl-4 pr-10 py-3 shadow-sm hover:border-gray-400 transition-colors cursor-pointer"
                >
                    <option value="all">All Pitches</option>
                    <option value="draft">Drafts</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>
        </div>
    );
}
