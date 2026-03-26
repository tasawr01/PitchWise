import React from 'react';
import Image from 'next/image';
import { getMyInvestors } from '@/app/actions/entrepreneur';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { redirect } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

async function getUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return null;
    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        if (payload.role !== 'entrepreneur') return null;
        return payload;
    } catch {
        return null;
    }
}

export default async function MyInvestors() {
    const user = await getUser();
    if (!user) redirect('/login');

    const { success, investors } = await getMyInvestors(user.id as string);

    // Filter out duplicates if an investor invested multiple times? 
    // Or just group by investor ID and sum the amounts. Let's group them by investor to provide a unified card per investor.
    const uniqueInvestorsMap = new Map();
    if (success && investors) {
        for (const inv of investors) {
            if (uniqueInvestorsMap.has(inv.investorId)) {
                // Combine the investments
                const existing = uniqueInvestorsMap.get(inv.investorId);
                existing.amountInvested += inv.amountInvested;
                // Append pitch names
                if (!existing.pitchName.includes(inv.pitchName)) {
                    existing.pitchName += `, ${inv.pitchName}`;
                }
            } else {
                uniqueInvestorsMap.set(inv.investorId, { ...inv });
            }
        }
    }

    const aggregatedInvestors = Array.from(uniqueInvestorsMap.values());

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                    <h2 className="text-3xl font-extrabold text-[#0B2C4A] tracking-tight">Active Investors</h2>
                    <p className="text-gray-500 mt-2 text-lg">Manage relationships with investors who have backed your pitches.</p>
                </div>
            </header>

            {!success || aggregatedInvestors.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-dashed border-gray-300">
                    <div className="w-20 h-20 bg-[#0B2C4A]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="h-10 w-10 text-[#0B2C4A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <h3 className="mt-2 text-xl font-bold text-[#0B2C4A]">No Investors Found</h3>
                    <p className="mt-2 text-gray-500 max-w-sm mx-auto">Currently, there are no approved investment deals backing any of your active pitches.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {aggregatedInvestors.map((investor: any) => (
                        <div key={investor.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col items-center p-8 overflow-hidden group relative">
                            {/* Avatar */}
                            <div className="w-24 h-24 relative mb-4">
                                <div className="w-full h-full rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100 relative">
                                    {investor.profileImage ? (
                                        <Image
                                            src={investor.profileImage}
                                            alt={investor.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-[#0B2C4A] to-slate-900 flex items-center justify-center text-white font-bold text-3xl">
                                            {investor.name.charAt(0)}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Name */}
                            <h3 className="text-xl font-bold text-[#0B2C4A] mb-1 group-hover:text-blue-800 transition-colors">{investor.name}</h3>

                            {/* Pitch Name */}
                            <div className="mb-2 flex flex-col items-center gap-1 text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                                <span className="text-xs uppercase font-semibold text-gray-400">Total Invested In</span>
                                <span className="font-bold text-[#0B2C4A] text-center">{investor.pitchName}</span>
                            </div>

                            {/* Amount Invested */}
                            <div className="mb-6 mt-2 flex flex-col items-center">
                                <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Total Capital Received</span>
                                <span className="text-3xl font-bold text-green-600 drop-shadow-sm mt-1">Rs. {formatCurrency(investor.amountInvested)}</span>
                            </div>

                            {/* Actions */}
                            <div className="w-full mt-auto pt-4 border-t border-gray-100">
                                <Link
                                    href={`/messages?userId=${investor.investorId}`}
                                    className="w-full py-3 bg-[#0B2C4A] text-white font-semibold rounded-xl hover:bg-[#09223a] transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                    Chat with Investor
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
