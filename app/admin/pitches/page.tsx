'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function PitchManagement() {
    const [pitches, setPitches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'all' | 'pending'>('all');

    const [selectedPitch, setSelectedPitch] = useState<any>(null); // For Review Modal

    useEffect(() => {
        setLoading(true);
        // Fetch pitches based on active tab
        const url = activeTab === 'pending' ? '/api/admin/pitches?status=pending' : '/api/admin/pitches';

        fetch(url)
            .then(res => res.json())
            .then(data => {
                setPitches(data.pitches || []);
                setLoading(false);
            });
    }, [activeTab]);

    const handleVerify = async (pitchId: string, status: 'approved' | 'rejected') => {
        if (!confirm(`Are you sure you want to ${status} this pitch?`)) return;

        try {
            const res = await fetch('/api/admin/pitches/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pitchId, status })
            });
            if (res.ok) {
                alert(`Pitch ${status}`);
                setPitches(prev => prev.filter(p => p._id !== pitchId));
                setSelectedPitch(null); // Close modal
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (pitchId: string) => {
        if (!confirm(`Are you sure you want to DELETE this pitch? This action cannot be undone.`)) return;
        try {
            const res = await fetch(`/api/pitches/${pitchId}`, { method: 'DELETE' });
            if (res.ok) {
                setPitches(prev => prev.filter(p => p._id !== pitchId));
            } else {
                alert('Failed to delete pitch');
            }
        } catch (error) {
            console.error(error);
        }
    };

    // Pitch Review Modal Component
    const PitchReviewModal = ({ pitch, onClose }: { pitch: any, onClose: () => void }) => {
        if (!pitch) return null;
        return (
            <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto transition-all duration-300">
                <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">{pitch.title}</h3>
                                <p className="text-sm text-gray-500">{pitch.entrepreneur?.fullName} • {pitch.businessName}</p>
                            </div>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                                <span className="text-2xl">&times;</span>
                            </button>
                        </div>

                        <div className="space-y-8">
                            {/* Section 1: Overview */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Industry</span>
                                    <p className="font-medium text-gray-900">{pitch.industry}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Stage</span>
                                    <p className="font-medium text-gray-900">{pitch.stage}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Ask Amount</span>
                                    <p className="font-medium text-blue-600 text-lg">${pitch.amountRequired?.toLocaleString()}</p>
                                </div>
                            </div>

                            <hr className="border-gray-200" />

                            {/* Section 2: The Core Pitch */}
                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-lg font-semibold text-gray-800 mb-2">Problem Statement</h4>
                                    <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100">{pitch.problemStatement}</p>
                                </div>
                                <div>
                                    <h4 className="text-lg font-semibold text-gray-800 mb-2">Solution</h4>
                                    <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100">{pitch.solution}</p>
                                </div>
                                <div>
                                    <h4 className="text-lg font-semibold text-gray-800 mb-2">Unique Selling Point</h4>
                                    <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100">{pitch.uniqueSellingPoint}</p>
                                </div>
                            </div>

                            <hr className="border-gray-200" />

                            {/* Section 3: Market & Traction */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <h4 className="text-lg font-semibold text-gray-800 mb-3">Market Info</h4>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between border-b pb-2">
                                            <span className="text-gray-500">Target Customer</span>
                                            <span className="font-medium">{pitch.targetCustomer}</span>
                                        </div>
                                        <div className="flex justify-between border-b pb-2">
                                            <span className="text-gray-500">Market Type</span>
                                            <span className="font-medium">{pitch.marketType}</span>
                                        </div>
                                        <div className="flex justify-between border-b pb-2">
                                            <span className="text-gray-500">Existing Customers</span>
                                            <span className="font-medium">{pitch.hasExistingCustomers ? 'Yes' : 'No'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-lg font-semibold text-gray-800 mb-3">Traction & Revenue</h4>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between border-b pb-2">
                                            <span className="text-gray-500">Monthly Revenue</span>
                                            <span className="font-medium">${pitch.monthlyRevenue?.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between border-b pb-2">
                                            <span className="text-gray-500">Total Users</span>
                                            <span className="font-medium">{pitch.totalUsers?.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between border-b pb-2">
                                            <span className="text-gray-500">Revenue Model</span>
                                            <span className="font-medium">{pitch.revenueModel}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <hr className="border-gray-200" />

                            {/* Section 4: Team */}
                            <div>
                                <h4 className="text-lg font-semibold text-gray-800 mb-3">Team Information</h4>
                                <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 flex flex-wrap gap-6 text-sm">
                                    <div>
                                        <span className="block text-gray-500 text-xs uppercase mb-1">Founder</span>
                                        <p className="font-semibold text-gray-900">{pitch.founderName}</p>
                                    </div>
                                    <div>
                                        <span className="block text-gray-500 text-xs uppercase mb-1">Role</span>
                                        <p className="font-semibold text-gray-900">{pitch.founderRole}</p>
                                    </div>
                                    <div>
                                        <span className="block text-gray-500 text-xs uppercase mb-1">Experience</span>
                                        <p className="font-semibold text-gray-900">{pitch.founderExpYears} Years</p>
                                    </div>
                                    <div>
                                        <span className="block text-gray-500 text-xs uppercase mb-1">Team Size</span>
                                        <p className="font-semibold text-gray-900">{pitch.teamSize} Members</p>
                                    </div>
                                </div>
                            </div>

                            {/* Section 5: Documents */}
                            <div>
                                <h4 className="text-lg font-semibold text-gray-800 mb-3">Attachments</h4>
                                <div className="flex gap-4">
                                    <a
                                        href={pitch.pitchDeckUrl}
                                        target="_blank"
                                        className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-blue-400 hover:text-blue-600 transition"
                                    >
                                        <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" /><path d="M3 8a2 2 0 012-2v10h8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" /></svg>
                                        <span className="font-medium text-sm">Pitch Deck</span>
                                    </a>
                                    {pitch.financialsUrl && (
                                        <a
                                            href={pitch.financialsUrl}
                                            target="_blank"
                                            className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-green-400 hover:text-green-600 transition"
                                        >
                                            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
                                            <span className="font-medium text-sm">Financials</span>
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Actions Footer */}
                        {pitch.status === 'pending' && (
                            <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end gap-3 sticky bottom-0 bg-white/50 backdrop-blur-sm p-4 -mx-6 -mb-6 rounded-b-2xl">
                                <button
                                    onClick={() => handleVerify(pitch._id, 'rejected')}
                                    className="text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md shadow-sm transition-colors text-xs uppercase font-bold tracking-wide"
                                >
                                    Reject Pitch
                                </button>
                                <button
                                    onClick={() => handleVerify(pitch._id, 'approved')}
                                    className="text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded-md shadow-sm transition-colors text-xs uppercase font-bold tracking-wide"
                                >
                                    Approve Pitch
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-extrabold text-[#0B2C4A] tracking-tight">Pitch Management</h2>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('all')}
                    className={`pb-2 px-1 ${activeTab === 'all' ? 'border-b-2 border-[#0B2C4A] text-[#0B2C4A] font-bold' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    All Pitches
                </button>
                <button
                    onClick={() => setActiveTab('pending')}
                    className={`pb-2 px-1 ${activeTab === 'pending' ? 'border-b-2 border-[#0B2C4A] text-[#0B2C4A] font-bold' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Pending Approvals
                </button>
            </div>

            {loading ? <div className="p-8 text-center text-gray-500">Loading...</div> : (
                <div className="grid grid-cols-1 gap-6">
                    {pitches.map((pitch) => (
                        <div key={pitch._id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex flex-col md:flex-row justify-between gap-4 hover:shadow-md transition-shadow">
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-xl font-bold text-[#0B2C4A]">{pitch.title}</h3>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${pitch.status === 'approved' ? 'bg-green-100 text-green-800' :
                                        pitch.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {pitch.status}
                                    </span>
                                </div>
                                <p className="text-gray-600 text-sm line-clamp-2 max-w-2xl">{pitch.problemStatement}</p>
                                <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                                    <span className="flex items-center bg-gray-50 px-2 py-1 rounded border border-gray-200">
                                        <span className="font-semibold mr-1">Industry:</span> {pitch.industry}
                                    </span>
                                    <span className="flex items-center bg-gray-50 px-2 py-1 rounded border border-gray-200">
                                        <span className="font-semibold mr-1">Stage:</span> {pitch.stage}
                                    </span>
                                    <span className="flex items-center bg-gray-50 px-2 py-1 rounded border border-gray-200">
                                        <span className="font-semibold mr-1">Ask:</span> ${pitch.amountRequired?.toLocaleString()}
                                    </span>
                                    <span className="flex items-center bg-gray-50 px-2 py-1 rounded border border-gray-200">
                                        <span className="font-semibold mr-1">By:</span> {pitch.entrepreneur?.fullName}
                                    </span>
                                </div>
                                <div className="pt-2 flex gap-3">
                                    <a href={pitch.pitchDeckUrl} target="_blank" className="text-[#0B2C4A] text-xs font-semibold hover:underline flex items-center">
                                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" /></svg>
                                        View Pitch Deck
                                    </a>
                                    {pitch.financialsUrl && (
                                        <a href={pitch.financialsUrl} target="_blank" className="text-[#0B2C4A] text-xs font-semibold hover:underline flex items-center">
                                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" /></svg>
                                            View Financials
                                        </a>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center gap-3">
                                {/* Review Button */}
                                <button
                                    onClick={() => setSelectedPitch(pitch)}
                                    className="px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors shadow-sm"
                                >
                                    Review Details
                                </button>

                                {activeTab === 'pending' && (
                                    <>
                                        <button
                                            onClick={() => handleVerify(pitch._id, 'approved')}
                                            className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg text-sm font-medium transition-colors shadow-sm"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleVerify(pitch._id, 'rejected')}
                                            className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg text-sm font-medium transition-colors shadow-sm"
                                        >
                                            Reject
                                        </button>
                                    </>
                                )}
                                <button
                                    onClick={() => handleDelete(pitch._id)}
                                    className="text-gray-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors"
                                    title="Delete Permanently"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}

                    {pitches.length === 0 && (
                        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                            <p className="text-gray-500 font-medium">
                                {activeTab === 'pending' ? 'No pitches pending review.' : 'No pitches found.'}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Render Modal */}
            {selectedPitch && <PitchReviewModal pitch={selectedPitch} onClose={() => setSelectedPitch(null)} />}
        </div>
    );
}
