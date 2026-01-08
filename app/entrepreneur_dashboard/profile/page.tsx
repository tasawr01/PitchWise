'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function EntrepreneurProfile() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/entrepreneur/profile-picture')
            .then(res => res.json())
            .then(data => {
                if (data.user) {
                    setUser(data.user);
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="p-12 text-center text-gray-500">Loading Profile...</div>;
    if (!user) return <div className="p-12 text-center text-red-500">Failed to load profile.</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12">
            {/* Header Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
                <div className="h-32 bg-[#0B2C4A]"></div>
                <div className="px-8 pb-8">
                    <div className="relative flex justify-between items-end -mt-12 mb-6">
                        <div className="flex items-end gap-6">
                            <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 overflow-hidden shadow-md">
                                {user.profilePhoto ? (
                                    <Image
                                        src={user.profilePhoto}
                                        alt={user.fullName}
                                        width={128}
                                        height={128}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-400 bg-gray-100">
                                        {user.fullName?.[0]}
                                    </div>
                                )}
                            </div>
                            <div className="mb-2">
                                <h1 className="text-3xl font-extrabold text-[#0B2C4A] tracking-tight">{user.fullName}</h1>
                                <p className="text-gray-500">{user.email}</p>
                            </div>
                        </div>
                        <Link
                            href="/entrepreneur_dashboard/settings"
                            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            Edit Profile
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-gray-100 pt-6">
                        <div>
                            <span className="block text-sm font-medium text-gray-500">Phone</span>
                            <span className="block text-lg text-gray-900">{user.phone}</span>
                        </div>
                        <div>
                            <span className="block text-sm font-medium text-gray-500">Status</span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${user.isVerified
                                ? 'bg-green-100 text-green-800'
                                : 'bg-amber-100 text-amber-800'
                                }`}>
                                {user.isVerified ? 'Verified' : user.status || 'Pending'}
                            </span>
                        </div>
                        <div>
                            <span className="block text-sm font-medium text-gray-500">Member Since</span>
                            <span className="block text-lg text-gray-900">
                                {new Date(user.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Right Column: Identity Documents */}
                <div className="lg:col-span-3 space-y-8">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <span className="bg-[#0B2C4A]/10 p-1.5 rounded-md text-[#0B2C4A]">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0c0 .884.223 1.636.568 2.33M15 6a3 3 0 00-6 0M9 20h6" /></svg>
                            </span>
                            Identity Verification
                        </h3>

                        {user.documentType === 'cnic' ? (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                                    <div>
                                        <span className="block text-xs font-semibold text-gray-500 uppercase">Document Type</span>
                                        <span className="font-bold text-gray-900">National ID (CNIC)</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="block text-xs font-semibold text-gray-500 uppercase">CNIC Number</span>
                                        <span className="font-mono text-gray-900 font-medium">{user.cnicNumber}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <span className="text-sm font-medium text-gray-700">Front Side</span>
                                        <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                            {user.cnicFront ? (
                                                <Image src={user.cnicFront} alt="CNIC Front" fill className="object-cover" />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-gray-400 text-sm">No Image</div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <span className="text-sm font-medium text-gray-700">Back Side</span>
                                        <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                            {user.cnicBack ? (
                                                <Image src={user.cnicBack} alt="CNIC Back" fill className="object-cover" />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-gray-400 text-sm">No Image</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : user.documentType === 'passport' ? (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                                    <div>
                                        <span className="block text-xs font-semibold text-gray-500 uppercase">Document Type</span>
                                        <span className="font-bold text-gray-900">Passport</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="block text-xs font-semibold text-gray-500 uppercase">Passport Number</span>
                                        <span className="font-mono text-gray-900 font-medium">{user.passportNumber}</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <span className="text-sm font-medium text-gray-700">Passport Scan</span>
                                    <div className="relative aspect-[3/2] bg-gray-100 rounded-lg overflow-hidden border border-gray-200 max-w-md">
                                        {user.passportScan ? (
                                            <Image src={user.passportScan} alt="Passport Scan" fill className="object-cover" />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-gray-400 text-sm">No Image</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                <p className="text-gray-500 mb-2">No identity documents updated yet.</p>
                                <Link href="/entrepreneur_dashboard/settings" className="text-[#0B2C4A] hover:underline font-medium">Verify Identity Now</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
