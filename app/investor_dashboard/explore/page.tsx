import { getPitches } from '@/app/actions/investor';
import PitchCard from '@/components/investor/PitchCard';
import PitchFilters from '@/components/investor/PitchFilters';

export const dynamic = 'force-dynamic';

export default async function ExplorePitchesPage({ searchParams }: { searchParams: Promise<any> }) {
    const params = await searchParams; // Next.js 15 requires awaiting searchParams
    const filters = {
        industry: params.industry,
        stage: params.stage,
        minInvestment: params.minInvestment,
        maxInvestment: params.maxInvestment,
        search: params.search,
    };

    const { pitches, totalPitches } = await getPitches(filters);

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-[#0B2C4A] tracking-tight">Explore Pitches</h1>
                    <p className="text-gray-500 mt-2 text-lg">Discover and invest in the next big thing.</p>
                </div>
                <div className="text-sm font-medium text-gray-600 bg-gray-100 px-4 py-2 rounded-full">
                    Showing {pitches.length} of {totalPitches} pitches
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Filters Sidebar */}
                <aside className="lg:col-span-1">
                    <PitchFilters />
                </aside>

                {/* Main Content */}
                <div className="lg:col-span-3">
                    {pitches.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {pitches.map((pitch: any) => (
                                <PitchCard key={pitch._id} pitch={pitch} />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow p-12 text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No pitches found</h3>
                            <p className="text-gray-500">Try adjusting your filters or search criteria.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
