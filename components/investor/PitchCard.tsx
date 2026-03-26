'use client';

import Link from 'next/link';
import Image from 'next/image';
import { formatCurrency } from '@/lib/utils';
import { Heart } from 'lucide-react';

interface PitchCardProps {
    pitch: any;
    isWatched?: boolean; // Can be passed if we load it, otherwise we might handle it inside specific pages
}

export default function PitchCard({ pitch }: PitchCardProps) {
    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group flex flex-col h-full">
            <div className="relative h-48 bg-gray-100">
                {pitch.logoUrl ? (
                    <Image
                        src={pitch.logoUrl}
                        alt={pitch.businessName}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300">
                        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z" /></svg>
                    </div>
                )}
                <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center rounded-full bg-white/90 backdrop-blur-sm px-2.5 py-0.5 text-xs font-medium text-[#0B2C4A] shadow-sm">
                        {pitch.industry}
                    </span>
                </div>
            </div>

            <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="font-bold text-lg text-gray-900 line-clamp-1">{pitch.businessName}</h3>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 py-4 border-t border-gray-100 mt-auto">
                    <div>
                        <span className="block text-gray-400 text-xs uppercase mb-1">Ask</span>
                        <span className="font-semibold text-[#0B2C4A]">Rs. {formatCurrency(pitch.amountRequired)}</span>
                    </div>
                    <div>
                        <span className="block text-gray-400 text-xs uppercase mb-1">Equity</span>
                        <span className="font-semibold text-[#0B2C4A]">{pitch.equityOffered}%</span>
                    </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-400">Stage</span>
                        <span className="text-sm font-medium text-gray-700">{pitch.stage}</span>
                    </div>
                    <div className="flex flex-col text-right">
                        <span className="text-xs text-gray-400">Valuation</span>
                        <span className="text-sm font-medium text-green-600">Rs. {formatCurrency(pitch.valuation)}</span>
                    </div>
                </div>

                <div className="mt-4">
                    <Link
                        href={`/investor_dashboard/explore/${pitch._id}`}
                        className="block w-full text-center bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium py-2 rounded-lg transition-colors text-sm"
                    >
                        View Details
                    </Link>
                </div>
            </div>
        </div>
    );
}
