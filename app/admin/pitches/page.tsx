'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function PitchManagement() {
    const [pitches, setPitches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch pending pitches
        fetch('/api/admin/pitches?status=pending')
            .then(res => res.json())
            .then(data => {
                setPitches(data.pitches || []);
                setLoading(false);
            });
    }, []);

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

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Pitch Approval Queue</h2>
            </div>

            {loading ? <p>Loading...</p> : (
                <div className="grid grid-cols-1 gap-6">
                    {pitches.map((pitch) => (
                        <div key={pitch._id} className="bg-white rounded-lg shadow p-6 border border-gray-100 flex flex-col md:flex-row justify-between gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-xl font-bold text-gray-800">{pitch.title}</h3>
                                    <span className="px-2 py-0.5 rounded text-xs bg-yellow-100 text-yellow-800 font-bold uppercase">{pitch.status}</span>
                                </div>
                                <p className="text-gray-600 text-sm line-clamp-2">{pitch.problemStatement}</p>
                                <div className="text-xs text-gray-500 space-x-4">
                                    <span><strong>Industry:</strong> {pitch.industry}</span>
                                    <span><strong>Stage:</strong> {pitch.stage}</span>
                                    <span><strong>Ask:</strong> ${pitch.amountRequired?.toLocaleString()}</span>
                                    <span><strong>By:</strong> {pitch.entrepreneur?.fullName}</span>
                                </div>
                                <div className="pt-2 space-x-2">
                                    <a href={pitch.pitchDeckUrl} target="_blank" className="text-blue-600 text-xs hover:underline">View Pitch Deck</a>
                                    {pitch.financialsUrl && <a href={pitch.financialsUrl} target="_blank" className="text-blue-600 text-xs hover:underline">View Financials</a>}
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => handleVerify(pitch._id, 'approved')}
                                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                                >
                                    Approve
                                </button>
                                <button
                                    onClick={() => handleVerify(pitch._id, 'rejected')}
                                    className="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded hover:bg-red-100 transition"
                                >
                                    Reject
                                </button>
                                <button
                                    onClick={() => handleDelete(pitch._id)}
                                    className="text-gray-400 hover:text-red-600 p-2"
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
                        <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
                            <p className="text-gray-500">No pitches pending review.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
