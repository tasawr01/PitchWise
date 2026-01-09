'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function PitchManagement() {
    const [pitches, setPitches] = useState<any[]>([]);
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'updates'>('all');

    const [selectedPitch, setSelectedPitch] = useState<any>(null); // For Review Modal
    const [selectedRequest, setSelectedRequest] = useState<any>(null); // For Update Request Modal

    useEffect(() => {
        setLoading(true);
        if (activeTab === 'updates') {
            fetch('/api/admin/pitches/update-requests')
                .then(res => res.json())
                .then(data => {
                    setRequests(data.requests || []);
                    setLoading(false);
                });
        } else {
            const url = activeTab === 'pending' ? '/api/admin/pitches?status=pending' : '/api/admin/pitches';
            fetch(url)
                .then(res => res.json())
                .then(data => {
                    setPitches(data.pitches || []);
                    setLoading(false);
                });
        }
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

    const handleUpdateAction = async (requestId: string, action: 'approved' | 'rejected') => {
        if (!confirm(`Are you sure you want to ${action.toUpperCase()} this update request?`)) return;

        try {
            const res = await fetch('/api/admin/pitches/update-requests/action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requestId, action })
            });
            if (res.ok) {
                alert(`Update request ${action}`);
                setRequests(prev => prev.filter(r => r._id !== requestId));
                setSelectedRequest(null);
            } else {
                alert('Failed to process request');
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred');
        }
    };

    // Pitch Review Modal Component
    const PitchReviewModal = ({ pitch, onClose, isUpdate = false, onAction }: { pitch: any, onClose: () => void, isUpdate?: boolean, onAction?: (action: 'approved' | 'rejected') => void }) => {
        if (!pitch) return null;

        // Helper to check difference
        const isChanged = (field: string) => {
            if (!isUpdate || !pitch.pitch) return false;
            // Compare stringified values to handle arrays/objects simply
            return JSON.stringify(pitch[field]) !== JSON.stringify(pitch.pitch[field]);
        };

        const pitchingHasEquity = (p: any) => {
            if (p.fundingType === 'Equity') return true;
            if (isUpdate && p.pitch && p.pitch.fundingType === 'Equity') return true;
            return false;
        };

        // Helper Component for Fields
        const Field = ({ label, field, format }: { label: string, field: string, format?: (val: any) => any }) => {
            const changed = isChanged(field);
            const val = format ? format(pitch[field]) : pitch[field];
            const oldVal = isUpdate && pitch.pitch ? (format ? format(pitch.pitch[field]) : pitch.pitch[field]) : null;

            return (
                <div className={`p-4 rounded-lg border ${changed ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-100'}`}>
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</span>
                        {changed && <span className="text-[10px] font-bold bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded">UPDATED</span>}
                    </div>
                    <p className="font-medium text-gray-900 break-words">{val}</p>
                    {changed && (
                        <div className="mt-2 text-xs text-gray-500 border-t border-amber-200 pt-2">
                            <span className="font-semibold">Previous:</span> <span className="line-through opacity-75">{oldVal}</span>
                        </div>
                    )}
                </div>
            );
        };

        return (
            <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto transition-all duration-300">
                <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
                    <div className="p-6">
                        {isUpdate && (
                            <div className="mb-4 bg-blue-50 border border-blue-200 p-3 rounded-lg flex items-center gap-2 text-blue-800">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <span className="text-sm font-semibold">Reviewing Proposed Changes. Highlights indicate modifications from the live version.</span>
                            </div>
                        )}
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">{pitch.title}</h3>
                                <p className="text-sm text-gray-500">{pitch.entrepreneur?.fullName || 'Entrepreneur'} • {pitch.businessName}</p>
                            </div>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                                <span className="text-2xl">&times;</span>
                            </button>
                        </div>

                        <div className="space-y-8">
                            {/* Section 1: Basics & Overview */}
                            <div>
                                <h4 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">1. Basics</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <Field label="Industry" field="industry" />
                                    <Field label="Stage" field="stage" />
                                    <Field label="Business Name" field="businessName" />
                                </div>
                            </div>

                            {/* Section 2: Product & Problem */}
                            <div>
                                <h4 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">2. Product & Solution</h4>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Field label="Offering Type" field="offeringType" />
                                        <Field label="Product Status" field="productStatus" />
                                    </div>
                                    <Field label="Key Features" field="keyFeatures" format={(v: any) => Array.isArray(v) ? v.join(', ') : v} />
                                    <Field label="Problem Statement" field="problemStatement" />
                                    <Field label="Solution" field="solution" />
                                    <Field label="Unique Selling Point" field="uniqueSellingPoint" />
                                </div>
                            </div>

                            {/* Section 3: Market */}
                            <div>
                                <h4 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">3. Market Analysis</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Field label="Target Customer" field="targetCustomer" />
                                    <Field label="Market Type" field="marketType" />
                                    <Field label="Has Existing Customers" field="hasExistingCustomers" format={(v: any) => v ? 'Yes' : 'No'} />
                                    <Field label="Customer Count" field="customerCount" />
                                </div>
                            </div>

                            {/* Section 4: Revenue & Traction */}
                            <div>
                                <h4 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">4. Revenue & Traction</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Field label="Revenue Model" field="revenueModel" />
                                    <Field label="Pricing Model" field="pricingModel" />
                                    <Field label="Monthly Revenue" field="monthlyRevenue" format={(v: any) => `$${v?.toLocaleString()}`} />
                                    <Field label="Total Users" field="totalUsers" format={(v: any) => v?.toLocaleString()} />
                                    <Field label="Monthly Growth" field="monthlyGrowthRate" format={(v: any) => `${v}%`} />
                                    <Field label="Major Milestones" field="majorMilestones" format={(v: any) => Array.isArray(v) ? v.join(', ') : v} />
                                </div>
                            </div>

                            {/* Section 5: Team */}
                            <div>
                                <h4 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">5. Team</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <Field label="Founder" field="founderName" />
                                    <Field label="Role" field="founderRole" />
                                    <Field label="Experience" field="founderExpYears" format={(v: any) => `${v} Years`} />
                                    <Field label="Team Size" field="teamSize" />
                                </div>
                                <div className="mt-4">
                                    <Field label="Website Profile" field="websiteUrl" format={(v: any) => v ? <a href={v.startsWith('http') ? v : `https://${v}`} target="_blank" className="text-blue-600 hover:underline">{v}</a> : 'N/A'} />
                                </div>
                            </div>

                            {/* Section 6: Funding Ask */}
                            <div>
                                <h4 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">6. Funding Ask</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <Field label="Amount Required" field="amountRequired" format={(v: any) => `$${v?.toLocaleString()}`} />
                                    <Field label="Funding Type" field="fundingType" />
                                    {/* Only show Equity Offered if applicable, but handle diff logic safely */}
                                    {(pitch.fundingType === 'Equity' || pitchingHasEquity(pitch)) && (
                                        <Field label="Equity Offered" field="equityOffered" format={(v: any) => `${v}%`} />
                                    )}
                                </div>
                                <div className="mt-4">
                                    <Field label="Use of Funds" field="useOfFunds" />
                                </div>
                            </div>

                            {/* Section 7: Documents */}
                            <div>
                                <h4 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">7. Attachments</h4>
                                <div className="flex flex-wrap gap-4">
                                    {pitch.pitchDeckUrl && (
                                        <div className={`flex items-center gap-2 px-4 py-3 bg-white border rounded-lg shadow-sm transition ${isChanged('pitchDeckUrl') ? 'border-amber-400 bg-amber-50' : 'border-gray-200'}`}>
                                            <a href={pitch.pitchDeckUrl} target="_blank" className="flex items-center gap-2 text-blue-600 hover:underline">
                                                <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" /><path d="M3 8a2 2 0 012-2v10h8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" /></svg>
                                                <span className="font-medium text-sm">Pitch Deck</span>
                                            </a>
                                            {isChanged('pitchDeckUrl') && <span className="text-[10px] font-bold bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded ml-2">UPDATED</span>}
                                        </div>
                                    )}
                                    {pitch.financialsUrl && (
                                        <div className={`flex items-center gap-2 px-4 py-3 bg-white border rounded-lg shadow-sm transition ${isChanged('financialsUrl') ? 'border-amber-400 bg-amber-50' : 'border-gray-200'}`}>
                                            <a href={pitch.financialsUrl} target="_blank" className="flex items-center gap-2 text-green-600 hover:underline">
                                                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
                                                <span className="font-medium text-sm">Financials</span>
                                            </a>
                                            {isChanged('financialsUrl') && <span className="text-[10px] font-bold bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded ml-2">UPDATED</span>}
                                        </div>
                                    )}
                                    {pitch.demoUrl && (
                                        <div className={`flex items-center gap-2 px-4 py-3 bg-white border rounded-lg shadow-sm transition ${isChanged('demoUrl') ? 'border-amber-400 bg-amber-50' : 'border-gray-200'}`}>
                                            <a href={pitch.demoUrl} target="_blank" className="flex items-center gap-2 text-purple-600 hover:underline">
                                                <span className="font-medium text-sm">Demo/Image</span>
                                            </a>
                                            {isChanged('demoUrl') && <span className="text-[10px] font-bold bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded ml-2">UPDATED</span>}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Actions Footer */}
                        {((pitch.status === 'pending' && !isUpdate) || isUpdate) && (
                            <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end gap-3 sticky bottom-0 bg-white/50 backdrop-blur-sm p-4 -mx-6 -mb-6 rounded-b-2xl">
                                <button
                                    onClick={() => isUpdate ? onAction?.('rejected') : handleVerify(pitch._id, 'rejected')}
                                    className="text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md shadow-sm transition-colors text-xs uppercase font-bold tracking-wide"
                                >
                                    {isUpdate ? 'Reject Update' : 'Reject Pitch'}
                                </button>
                                <button
                                    onClick={() => isUpdate ? onAction?.('approved') : handleVerify(pitch._id, 'approved')}
                                    className="text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded-md shadow-sm transition-colors text-xs uppercase font-bold tracking-wide"
                                >
                                    {isUpdate ? 'Approve Update' : 'Approve Pitch'}
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
                <button
                    onClick={() => setActiveTab('updates')}
                    className={`pb-2 px-1 ${activeTab === 'updates' ? 'border-b-2 border-[#0B2C4A] text-[#0B2C4A] font-bold' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Update Requests {activeTab !== 'updates' && requests.length > 0 && <span className="bg-red-500 text-white rounded-full px-2 py-0.5 text-xs ml-1">!</span>}
                </button>
            </div>

            {loading ? <div className="p-8 text-center text-gray-500">Loading...</div> : (
                <div className="grid grid-cols-1 gap-6">
                    {/* Render Content Based on Active Tab */}
                    {activeTab === 'updates' ? (
                        // UPDATE REQUESTS LIST
                        requests.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                                <p className="text-gray-500 font-medium">No pending update requests.</p>
                            </div>
                        ) : (
                            requests.map((req) => (
                                <div key={req._id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex flex-col md:flex-row justify-between gap-4 hover:shadow-md transition-shadow">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-xl font-bold text-[#0B2C4A]">{req.title} <span className="text-sm font-normal text-gray-400">(Update)</span></h3>
                                            <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">Pending</span>
                                        </div>
                                        <p className="text-gray-600 text-sm">
                                            Request by <span className="font-semibold">{req.entrepreneur?.fullName}</span> for pitch "{req.pitch?.title || 'Original Pitch'}"
                                        </p>
                                        <div className="text-xs text-gray-400">
                                            Submitted: {new Date(req.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <button
                                            onClick={() => setSelectedRequest(req)}
                                            className="px-4 py-2 bg-[#0B2C4A] text-white hover:bg-[#09223a] rounded-lg text-sm font-medium transition-colors shadow-sm"
                                        >
                                            Review Update
                                        </button>
                                    </div>
                                </div>
                            ))
                        )
                    ) : (
                        // PITCHES LIST
                        pitches.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                                <p className="text-gray-500 font-medium">
                                    {activeTab === 'pending' ? 'No pitches pending review.' : 'No pitches found.'}
                                </p>
                            </div>
                        ) : (
                            pitches.map((pitch) => (
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
                            ))
                        )
                    )}
                </div>
            )}

            {/* Render Modal for Pitch Review */}
            {selectedPitch && (
                <PitchReviewModal
                    pitch={selectedPitch}
                    onClose={() => setSelectedPitch(null)}
                />
            )}

            {/* Render Modal for Update Request Review */}
            {selectedRequest && (
                <PitchReviewModal
                    pitch={selectedRequest}
                    onClose={() => setSelectedRequest(null)}
                    isUpdate={true}
                    onAction={(action) => handleUpdateAction(selectedRequest._id, action)}
                />
            )}
        </div>
    );
}
