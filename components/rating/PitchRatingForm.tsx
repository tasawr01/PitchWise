'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle, CheckCircle2, Star } from 'lucide-react';
import StarInput from './StarInput';
import { submitPitchRating } from '@/app/actions/rating';

interface PitchRatingFormProps {
    pitchId: string;
}

export default function PitchRatingForm({ pitchId }: PitchRatingFormProps) {
    const router = useRouter();
    const [stars, setStars] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [done, setDone] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (stars < 1) {
            setError('Please pick a star rating.');
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const result = await submitPitchRating({
                pitchId,
                stars,
                feedback: feedback.trim(),
            });
            if (!result.success) {
                setError(result.error || 'Failed to submit rating.');
                return;
            }
            setDone(true);
            router.refresh();
        } catch (err: any) {
            setError(err.message || 'Failed to submit rating.');
        } finally {
            setIsLoading(false);
        }
    };

    if (done) {
        return (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 flex items-center gap-3 text-green-800">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <p className="font-semibold text-sm">Thank you! Your review has been published.</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-[#0B2C4A] flex items-center gap-2 mb-2">
                <Star className="w-5 h-5 fill-yellow-400 stroke-yellow-500" />
                Rate this pitch
            </h3>
            <p className="text-sm text-gray-500 mb-5">Share what you think about this opportunity to help other investors.</p>

            <div className="flex flex-col items-start gap-3 mb-5">
                <StarInput value={stars} onChange={setStars} disabled={isLoading} size={32} />
                <p className="text-sm text-gray-500">
                    {stars === 0 && 'Tap a star to rate'}
                    {stars === 1 && 'Poor'}
                    {stars === 2 && 'Fair'}
                    {stars === 3 && 'Good'}
                    {stars === 4 && 'Very Good'}
                    {stars === 5 && 'Excellent'}
                </p>
            </div>

            <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Your review (optional)</label>
                <textarea
                    rows={4}
                    maxLength={2000}
                    placeholder="What stood out about this pitch?"
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#0B2C4A]/30 focus:border-[#0B2C4A] outline-none"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    disabled={isLoading}
                />
                <div className="text-xs text-gray-400 text-right mt-1">{feedback.length}/2000</div>
            </div>

            {error && (
                <div className="flex items-start gap-2 p-3 rounded-xl border bg-red-50 border-red-200 text-red-700 text-sm mb-4">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    {error}
                </div>
            )}

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={isLoading || stars === 0}
                    className="px-6 py-2.5 bg-[#0B2C4A] text-white rounded-xl hover:bg-[#09223a] font-bold text-sm flex items-center gap-2 disabled:opacity-60 transition-colors"
                >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Star className="w-4 h-4" />}
                    Submit Review
                </button>
            </div>
        </form>
    );
}
