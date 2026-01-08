'use client';

import React from 'react';
import Image from 'next/image';

export default function MyInvestors() {
    // Dummy Data reflecting real schema
    const investors = [
        {
            id: 1,
            name: 'Alex Morgan',
            pitchName: 'Ecoify',
            amountInvested: '$50,000',
            profileImage: '',
        },
        {
            id: 2,
            name: 'Sarah Tech',
            pitchName: 'HealthAI',
            amountInvested: '$120,000',
            profileImage: '',
        },
        {
            id: 3,
            name: 'Global Ventures',
            pitchName: 'SolarPower',
            amountInvested: '$250,000',
            profileImage: '',
        },
    ];

    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                    <h2 className="text-3xl font-extrabold text-[#0B2C4A] tracking-tight">Active Investors</h2>
                    <p className="text-gray-500 mt-2 text-lg">Manage your investor relationships per pitch.</p>
                </div>
            </header>

            {investors.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-dashed border-gray-300">
                    <div className="w-20 h-20 bg-[#0B2C4A]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="h-10 w-10 text-[#0B2C4A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <h3 className="mt-2 text-xl font-bold text-[#0B2C4A]">No Investors Found</h3>
                    <p className="mt-2 text-gray-500 max-w-sm mx-auto">It seems there are no active investors matching your criteria at the moment.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {investors.map((investor: any) => (
                        <div key={investor.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col items-center p-8 overflow-hidden group">

                            {/* Avatar */}
                            <div className="w-24 h-24 relative mb-4">
                                <div className="w-full h-full rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100">
                                    {investor.profileImage ? (
                                        <Image
                                            src={investor.profileImage}
                                            alt={investor.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-[#0B2C4A] to-slate-900 flex items-center justify-center text-white font-bold text-2xl">
                                            {investor.name.charAt(0)}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Name */}
                            <h3 className="text-xl font-bold text-[#0B2C4A] mb-1 group-hover:text-[#0B2C4A] transition-colors">{investor.name}</h3>

                            {/* Pitch Name */}
                            <div className="mb-2 flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
                                <span className="font-medium text-gray-400">Invested in:</span>
                                <span className="font-bold text-[#0B2C4A]">{investor.pitchName}</span>
                            </div>

                            {/* Amount Invested - NEW */}
                            <div className="mb-6 flex flex-col items-center">
                                <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Amount Invested</span>
                                <span className="text-2xl font-bold text-green-600">{investor.amountInvested}</span>
                            </div>

                            {/* Actions */}
                            <div className="w-full grid grid-cols-2 gap-3 mt-auto">
                                <button className="flex-1 py-2.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl shadow-sm hover:bg-gray-50 transition-colors text-sm">
                                    View Profile
                                </button>
                                <button className="flex-1 py-2.5 bg-[#0B2C4A] border border-transparent text-white font-semibold rounded-xl shadow-sm hover:bg-[#09223a] hover:shadow-md transition-all text-sm flex items-center justify-center gap-2">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                    Chat
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
