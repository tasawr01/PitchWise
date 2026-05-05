import Image from 'next/image';
import { Star } from 'lucide-react';

interface RatingItem {
    _id: string;
    stars: number;
    feedback?: string;
    createdAt: string;
    closureType?: 'completed' | 'discarded';
    entrepreneur?: {
        fullName?: string;
        profilePhoto?: string;
        startupName?: string;
    } | null;
    rater?: {
        fullName?: string;
        profilePhoto?: string;
        organizationName?: string;
    } | null;
}

interface RatingsListProps {
    ratings: RatingItem[];
    emptyLabel?: string;
}

function formatDate(d: string) {
    try {
        return new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
        return '';
    }
}

export default function RatingsList({ ratings, emptyLabel = 'No reviews yet — be the first.' }: RatingsListProps) {
    if (!ratings || ratings.length === 0) {
        return (
            <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <p className="text-gray-500 text-sm">{emptyLabel}</p>
            </div>
        );
    }

    return (
        <ul className="space-y-4">
            {ratings.map((r) => {
                const person = r.entrepreneur || r.rater || null;
                const name = person?.fullName || 'Anonymous';
                const sub = (person as any)?.startupName || (person as any)?.organizationName || '';
                const photo = person?.profilePhoto;
                const initial = name.charAt(0).toUpperCase();

                return (
                    <li key={r._id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-start gap-4">
                            <div className="relative w-11 h-11 rounded-full overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                                {photo ? (
                                    <Image src={photo} alt={name} fill className="object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[#0B2C4A] font-bold">
                                        {initial}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                    <div>
                                        <p className="font-bold text-gray-900 text-sm">{name}</p>
                                        {sub && <p className="text-xs text-gray-500">{sub}</p>}
                                    </div>
                                    <span className="text-xs text-gray-400">{formatDate(r.createdAt)}</span>
                                </div>
                                <div className="flex items-center gap-1 mt-1.5">
                                    {[1, 2, 3, 4, 5].map((n) => (
                                        <Star
                                            key={n}
                                            width={14}
                                            height={14}
                                            className={n <= r.stars ? 'fill-yellow-400 stroke-yellow-500' : 'fill-transparent stroke-gray-300'}
                                        />
                                    ))}
                                    {r.closureType && (
                                        <span className={`ml-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${r.closureType === 'completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                            {r.closureType === 'completed' ? 'Completed Deal' : 'Discarded Deal'}
                                        </span>
                                    )}
                                </div>
                                {r.feedback && (
                                    <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap leading-relaxed">{r.feedback}</p>
                                )}
                            </div>
                        </div>
                    </li>
                );
            })}
        </ul>
    );
}
