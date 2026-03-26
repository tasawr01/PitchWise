'use client';

import { useState } from 'react';
import { toggleWatchlist } from '@/app/actions/investor';
import { Bookmark, Check, Loader2 } from 'lucide-react';

interface WatchlistButtonProps {
    investorId: string;
    pitchId: string;
    initialIsWatched: boolean;
}

export default function WatchlistButton({ investorId, pitchId, initialIsWatched }: WatchlistButtonProps) {
    const [isWatched, setIsWatched] = useState(initialIsWatched);
    const [isLoading, setIsLoading] = useState(false);

    const handleToggle = async () => {
        setIsLoading(true);
        try {
            const result = await toggleWatchlist(investorId, pitchId);
            if (result.success) {
                if (typeof result.isWatched === 'boolean') {
                    setIsWatched(result.isWatched);
                }
            }
        } catch (error) {
            console.error('Failed to toggle watchlist', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleToggle}
            disabled={isLoading}
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${isWatched
                ? 'bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100'
                : 'bg-[#0B2C4A] text-white hover:bg-[#1e293b] shadow-lg hover:shadow-xl'
                }`}
        >
            {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
            ) : isWatched ? (
                <>
                    <Check className="w-5 h-5" />
                    Saved to Watchlist
                </>
            ) : (
                <>
                    <Bookmark className="w-5 h-5" />
                    Add to Watchlist
                </>
            )}
        </button>
    );
}
