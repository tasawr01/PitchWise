'use client';

import { useState } from 'react';
import { X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import StarInput from './StarInput';

interface RatingPopupProps {
    title: string;
    subtitle?: string;
    onSubmit: (data: { stars: number; feedback: string }) => Promise<{ success: boolean; error?: string }>;
    onClose: () => void;
    submitLabel?: string;
}

export default function RatingPopup({ title, subtitle, onSubmit, onClose, submitLabel = 'Submit Rating' }: RatingPopupProps) {
    const [stars, setStars] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async () => {
        if (stars < 1) {
            setError('Please select a star rating before submitting.');
            return;
        }
        setError(null);
        setIsLoading(true);
        try {
            const result = await onSubmit({ stars, feedback: feedback.trim() });
            if (result.success) {
                setSuccess(true);
                setTimeout(() => {
                    onClose();
                }, 1100);
            } else {
                setError(result.error || 'Failed to submit rating.');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to submit rating.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
            onClick={!isLoading ? onClose : undefined}
        >
            <div
                className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="px-7 pt-7 pb-2 flex items-start justify-between">
                    <div>
                        <h2 className="text-xl font-extrabold text-[#0B2C4A]">{title}</h2>
                        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500 disabled:opacity-50"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="px-7 py-5 space-y-5">
                    <div className="flex flex-col items-center gap-3 py-3">
                        <StarInput value={stars} onChange={setStars} size={40} disabled={isLoading || success} />
                        <p className="text-sm text-gray-500">
                            {stars === 0 && 'Tap a star to rate'}
                            {stars === 1 && 'Poor'}
                            {stars === 2 && 'Fair'}
                            {stars === 3 && 'Good'}
                            {stars === 4 && 'Very Good'}
                            {stars === 5 && 'Excellent'}
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Your feedback (optional)</label>
                        <textarea
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            disabled={isLoading || success}
                            rows={4}
                            maxLength={2000}
                            placeholder="Share details of your experience..."
                            className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#0B2C4A]/30 focus:border-[#0B2C4A] outline-none disabled:bg-gray-50"
                        />
                        <div className="text-xs text-gray-400 text-right mt-1">{feedback.length}/2000</div>
                    </div>

                    {error && (
                        <div className="flex items-start gap-2 p-3 rounded-xl border bg-red-50 border-red-200 text-red-700 text-sm">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="flex items-center gap-2 p-3 rounded-xl border bg-green-50 border-green-200 text-green-700 text-sm">
                            <CheckCircle className="w-4 h-4 shrink-0" />
                            Thank you! Your rating has been submitted.
                        </div>
                    )}
                </div>

                <div className="px-7 pb-7 flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 py-2.5 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-bold text-sm disabled:opacity-50 transition-colors"
                    >
                        {success ? 'Close' : 'Skip'}
                    </button>
                    {!success && (
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="flex-1 py-2.5 bg-[#0B2C4A] text-white rounded-xl hover:bg-[#09223a] font-bold text-sm disabled:opacity-60 flex items-center justify-center gap-2 transition-colors"
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : submitLabel}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
