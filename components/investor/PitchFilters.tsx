'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Briefcase, TrendingUp, DollarSign } from 'lucide-react';

const industries = [
    'All', 'Tech', 'Health', 'Finance', 'Education', 'Retail', 'Real Estate', 'Food & Beverage', 'Transportation', 'Energy', 'Other'
];

const stages = [
    'All', 'Good Idea', 'Research & Development', 'Product Development', 'Shipping/Live', 'Revenue', 'Expansion'
];

export default function PitchFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [filters, setFilters] = useState({
        industry: searchParams.get('industry') || 'All',
        stage: searchParams.get('stage') || 'All',
        minInvestment: searchParams.get('minInvestment') || '',
        maxInvestment: searchParams.get('maxInvestment') || '',
        search: searchParams.get('search') || '',
    });

    // Update filters when URL params change (e.g. back button)
    useEffect(() => {
        setFilters({
            industry: searchParams.get('industry') || 'All',
            stage: searchParams.get('stage') || 'All',
            minInvestment: searchParams.get('minInvestment') || '',
            maxInvestment: searchParams.get('maxInvestment') || '',
            search: searchParams.get('search') || '',
        });
    }, [searchParams]);

    const handleFilterChange = (key: string, value: string) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        applyFilters(newFilters);
    };

    const applyFilters = (currentFilters: any) => {
        const params = new URLSearchParams();
        if (currentFilters.industry && currentFilters.industry !== 'All') params.set('industry', currentFilters.industry);
        if (currentFilters.stage && currentFilters.stage !== 'All') params.set('stage', currentFilters.stage);
        if (currentFilters.minInvestment) params.set('minInvestment', currentFilters.minInvestment);
        if (currentFilters.maxInvestment) params.set('maxInvestment', currentFilters.maxInvestment);
        if (currentFilters.search) params.set('search', currentFilters.search);

        router.push(`/investor_dashboard/explore?${params.toString()}`);
    };

    return (
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
            <div>
                <h3 className="text-lg font-bold text-[#0B2C4A] mb-4 flex items-center gap-2">
                    <Briefcase className="w-5 h-5" /> Filters
                </h3>

                {/* Search */}
                <div className="mb-4">
                    <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Search</label>
                    <input
                        type="text"
                        placeholder="Search by name..."
                        className="w-full text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                    />
                </div>

                {/* Industry */}
                <div className="mb-4">
                    <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Industry</label>
                    <select
                        className="w-full text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        value={filters.industry}
                        onChange={(e) => handleFilterChange('industry', e.target.value)}
                    >
                        {industries.map(ind => (
                            <option key={ind} value={ind}>{ind}</option>
                        ))}
                    </select>
                </div>

                {/* Stage */}
                <div className="mb-4">
                    <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Stage</label>
                    <select
                        className="w-full text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        value={filters.stage}
                        onChange={(e) => handleFilterChange('stage', e.target.value)}
                    >
                        {stages.map(stage => (
                            <option key={stage} value={stage}>{stage}</option>
                        ))}
                    </select>
                </div>

                {/* Investment Range */}
                <div className="mb-4">
                    <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block flex items-center gap-1">
                        <DollarSign className="w-3 h-3" /> Investment Range (Rs)
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            placeholder="Min"
                            className="w-1/2 text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            value={filters.minInvestment}
                            onChange={(e) => handleFilterChange('minInvestment', e.target.value)}
                        />
                        <input
                            type="number"
                            placeholder="Max"
                            className="w-1/2 text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            value={filters.maxInvestment}
                            onChange={(e) => handleFilterChange('maxInvestment', e.target.value)}
                        />
                    </div>
                </div>

                <button
                    onClick={() => {
                        setFilters({ industry: 'All', stage: 'All', minInvestment: '', maxInvestment: '', search: '' });
                        router.push('/investor_dashboard/explore');
                    }}
                    className="w-full bg-gray-100 text-gray-600 font-semibold py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                    Reset Filters
                </button>
            </div>
        </div>
    );
}
