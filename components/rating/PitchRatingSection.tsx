import StarsDisplay from './StarsDisplay';
import RatingsList from './RatingsList';
import PitchRatingForm from './PitchRatingForm';
import { getPitchRatingSummary, hasInvestorRatedPitch } from '@/app/actions/rating';
import { CheckCircle2 } from 'lucide-react';

interface PitchRatingSectionProps {
    pitchId: string;
    investorId?: string;
}

export default async function PitchRatingSection({ pitchId, investorId }: PitchRatingSectionProps) {
    const summary = await getPitchRatingSummary(pitchId);
    const alreadyRated = investorId ? await hasInvestorRatedPitch(investorId, pitchId) : false;

    return (
        <section className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
                <h3 className="text-xl font-bold text-[#0B2C4A]">Investor Reviews</h3>
                <StarsDisplay avg={summary.avg || 0} count={summary.count || 0} />
            </div>

            <div className="space-y-6">
                {investorId && !alreadyRated && (
                    <PitchRatingForm pitchId={pitchId} />
                )}

                {investorId && alreadyRated && (
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex items-center gap-3 text-blue-800">
                        <CheckCircle2 className="w-5 h-5 shrink-0" />
                        <p className="font-semibold text-sm">You have already reviewed this pitch. Thanks for the feedback!</p>
                    </div>
                )}

                <RatingsList ratings={summary.ratings || []} emptyLabel="No reviews yet — be the first to share your perspective." />
            </div>
        </section>
    );
}
