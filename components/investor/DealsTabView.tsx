'use client';

import { useState } from 'react';
import DocumentCard from './DocumentCard';
import { Clock, CheckCircle } from 'lucide-react';

interface DealsTabViewProps {
    pendingDeals: any[];
    pastDeals: any[];
}

export default function DealsTabView({ pendingDeals, pastDeals }: DealsTabViewProps) {
    const [activeTab, setActiveTab] = useState<'pending' | 'past'>('pending');

    const tabs = [
        {
            key: 'pending' as const,
            label: 'Pending Review',
            icon: <Clock className="w-4 h-4" />,
            count: pendingDeals.length,
            countColor: 'bg-yellow-100 text-yellow-700',
        },
        {
            key: 'past' as const,
            label: 'Past Deals',
            icon: <CheckCircle className="w-4 h-4" />,
            count: pastDeals.length,
            countColor: 'bg-gray-100 text-gray-600',
        },
    ];

    const currentDeals = activeTab === 'pending' ? pendingDeals : pastDeals;
    const isReadOnly = activeTab === 'past';

    return (
        <>
            {/* ── Tab Bar ─────────────────────────────── */}
            <div className="flex gap-6 border-b border-gray-200 mb-8">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-2 pb-3 px-1 font-bold text-sm uppercase tracking-wide transition-colors
                            ${activeTab === tab.key
                                ? 'border-b-2 border-[#0B2C4A] text-[#0B2C4A]'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {tab.icon}
                        {tab.label}
                        <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${tab.countColor}`}>
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* ── Tab Content ─────────────────────────── */}
            {currentDeals.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {currentDeals.map((deal: any) => (
                        <DocumentCard key={deal._id} deal={deal} isReadOnly={isReadOnly} />
                    ))}
                </div>
            ) : (
                <div className="bg-gray-50 rounded-2xl p-12 text-center border border-gray-100">
                    <div className="w-14 h-14 bg-[#0B2C4A]/5 rounded-full flex items-center justify-center mx-auto mb-4">
                        {activeTab === 'pending'
                            ? <Clock className="w-6 h-6 text-[#0B2C4A]/40" />
                            : <CheckCircle className="w-6 h-6 text-[#0B2C4A]/40" />
                        }
                    </div>
                    <p className="text-gray-500 font-medium">
                        {activeTab === 'pending'
                            ? 'No pending deals to review.'
                            : 'No past deal history yet.'
                        }
                    </p>
                </div>
            )}
        </>
    );
}
