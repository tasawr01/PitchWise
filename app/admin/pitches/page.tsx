'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { formatCurrency } from '@/lib/utils';

export default function PitchManagement() {
    const [pitches, setPitches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'all' | 'pending'>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    const [selectedPitch, setSelectedPitch] = useState<any>(null); // For Review Modal
    const [viewingDoc, setViewingDoc] = useState<{ url: string, title: string } | null>(null); // For PDF Modal
    const [stats, setStats] = useState({ total: 0, pending: 0 });

    const [error, setError] = useState<string | null>(null);

    // Rejection Modal State
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [rejectPitchId, setRejectPitchId] = useState<string | null>(null);
    const [rejectRemarks, setRejectRemarks] = useState('');
    const [rejecting, setRejecting] = useState(false);

    useEffect(() => {
        fetch('/api/admin/pitches/stats')
            .then(res => res.json())
            .then(data => {
                if (data.stats) {
                    // Filter out 'updates' if it exists in the response
                    const { updates, ...rest } = data.stats;
                    setStats(rest);
                }
            })
            .catch(err => console.error('Failed to load stats', err));
    }, [pitches]);

    useEffect(() => {
        setLoading(true);
        setError(null);

        let url = '/api/admin/pitches';

        if (activeTab === 'pending') {
            url += '?status=pending';
        } else if (filterStatus !== 'all') {
            url += `?status=${filterStatus}`;
        }

        fetch(url)
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch pitches');
                return res.json();
            })
            .then(data => {
                setPitches(data.pitches || []);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setError('Failed to load pitches. Please refresh the page.');
                setLoading(false);
            });
    }, [activeTab, filterStatus]);

    const handleApprove = async (pitchId: string) => {
        if (!confirm(`Are you sure you want to approve this pitch?`)) return;

        try {
            const res = await fetch('/api/admin/pitches/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pitchId, status: 'approved' })
            });

            if (res.ok) {
                alert(`Pitch approved successfully!`);
                setPitches(prev => prev.map(p => p._id === pitchId ? { ...p, status: 'approved' } : p));
                setStats(prev => ({ ...prev, pending: Math.max(0, prev.pending - 1) }));
                setSelectedPitch(null);
            } else {
                alert('Failed to approve pitch.');
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred.');
        }
    };

    const initiateRejection = (pitchId: string) => {
        setRejectPitchId(pitchId);
        setRejectRemarks('');
        setRejectModalOpen(true);
    };

    const submitRejection = async () => {
        if (!rejectPitchId || !rejectRemarks.trim()) return;

        setRejecting(true);
        try {
            const res = await fetch('/api/admin/pitches/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pitchId: rejectPitchId,
                    status: 'rejected',
                    remarks: rejectRemarks
                })
            });

            if (res.ok) {
                alert('Pitch rejected and remarks sent to entrepreneur.');
                setPitches(prev => prev.map(p => p._id === rejectPitchId ? {
                    ...p,
                    status: 'rejected',
                    rejectionCount: (p.rejectionCount || 0) + 1
                } : p));
                setStats(prev => ({ ...prev, pending: Math.max(0, prev.pending - 1) }));
                setRejectModalOpen(false);
                setSelectedPitch(null); // Close review modal if open
            } else {
                alert('Failed to reject pitch.');
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred.');
        } finally {
            setRejecting(false);
        }
    };

    const handleDelete = async (pitchId: string) => {
        if (!confirm(`Are you sure you want to DELETE this pitch? This action cannot be undone.`)) return;
        try {
            const res = await fetch(`/api/pitches/${pitchId}`, { method: 'DELETE' });
            if (res.ok) {
                setPitches(prev => prev.filter(p => p._id !== pitchId));
                setStats(prev => ({ ...prev, total: Math.max(0, prev.total - 1) }));
                if (selectedPitch?._id === pitchId) setSelectedPitch(null);
            } else {
                alert('Failed to delete pitch');
            }
        } catch (error) {
            console.error(error);
        }
    };

    // Pitch Review Modal Component
    const PitchReviewModal = ({ pitch, onClose, onViewDocument, onApprove, onReject }: {
        pitch: any,
        onClose: () => void,
        onViewDocument: (doc: { url: string, title: string }) => void,
        onApprove: () => void,
        onReject: () => void
    }) => {
        if (!pitch) return null;

        const Field = ({ label, field, format }: { label: string, field: string, format?: (val: any) => any }) => {
            const val = format ? format(pitch[field]) : pitch[field];
            if (!val) return null;
            return (
                <div className="p-4 rounded-lg border border-gray-100 bg-gray-50 flex-1 min-w-[200px]">
                    <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{label}</span>
                    <p className="font-medium text-gray-900 whitespace-pre-wrap text-sm">{val}</p>
                </div>
            );
        };

        return (
            <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto transition-all duration-300">
                <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-white/20 relative flex flex-col">
                    <div className="p-6 md:p-8">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-8 border-b border-gray-100 pb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
                                    {pitch.logoUrl ? (
                                        <img src={pitch.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-2xl font-bold text-gray-400">{pitch.businessName?.[0]}</span>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-extrabold text-[#0B2C4A] tracking-tight">{pitch.businessName}</h3>
                                    <p className="text-gray-500 font-medium">{pitch.title}</p>
                                    <div className="flex gap-2 mt-1">
                                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium">{pitch.industry}</span>
                                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium">{pitch.stage}</span>
                                        {pitch.rejectionCount > 0 && (
                                            <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md font-bold">Attempts: {pitch.rejectionCount}/3</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <span className="text-2xl leading-none">&times;</span>
                            </button>
                        </div>

                        <div className="space-y-10 mb-20">
                            {/* PART 1: THE IDEA */}
                            <div>
                                <h4 className="text-lg font-bold text-[#0B2C4A] mb-4 flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-lg bg-[#0B2C4A]/10 flex items-center justify-center text-[#0B2C4A] text-sm">01</span>
                                    The Idea & Market
                                </h4>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Field label="Problem Statement" field="problemStatement" />
                                        <Field label="Target Customer" field="targetCustomer" />
                                    </div>
                                    <Field label="Problem Urgency" field="problemUrgency" />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Field label="Solution" field="solution" />
                                        <Field label="How It Works" field="solutionMechanism" />
                                    </div>
                                    <Field label="Unique Selling Point" field="uniqueSellingPoint" />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Field label="Competitors" field="competitors" />
                                        <Field label="Alternatives" field="currentAlternatives" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Field label="Market Size" field="marketSizeLocation" />
                                        <Field label="Growth" field="marketGrowth" />
                                    </div>
                                </div>
                            </div>

                            {/* PART 2: BUSINESS & EXECUTION */}
                            <div>
                                <h4 className="text-lg font-bold text-[#0B2C4A] mb-4 flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-lg bg-[#0B2C4A]/10 flex items-center justify-center text-[#0B2C4A] text-sm">02</span>
                                    Business & Execution
                                </h4>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <Field label="Stage" field="stage" />
                                        <Field label="Revenue Model" field="revenueModel" />
                                        <Field label="Pricing" field="pricingModel" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Field label="Traction" field="traction" />
                                        <Field label="Customer Validation" field="customerValidation" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Field label="Key Technology" field="keyTechnology" />
                                        <Field label="Moat" field="moat" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Field label="Risks" field="risks" />
                                        <Field label="Risk Mitigation" field="riskMitigation" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Field label="Founder Bio" field="founderBackground" />
                                        <Field label="Why This Team?" field="teamFit" />
                                    </div>
                                </div>
                            </div>

                            {/* PART 3: THE DEAL */}
                            <div>
                                <h4 className="text-lg font-bold text-[#0B2C4A] mb-4 flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-lg bg-[#0B2C4A]/10 flex items-center justify-center text-[#0B2C4A] text-sm">03</span>
                                    The Deal & Future
                                </h4>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <Field label="Ask (PKR)" field="amountRequired" format={(v: any) => `Rs. ${formatCurrency(v)}`} />
                                        <Field label="Equity (%)" field="equityOffered" format={(v: any) => `${v}%`} />
                                        <Field label="Valuation (PKR)" field="valuation" format={(v: any) => `Rs. ${formatCurrency(v)}`} />
                                    </div>
                                    <Field label="Use of Funds" field="useOfFunds" />
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <Field label="Expenses" field="monthlyExpenses" />
                                        <Field label="Break-Even" field="breakEvenPoint" />
                                        <Field label="Profitability" field="profitabilityTimeline" />
                                    </div>
                                    <Field label="5-Year Vision" field="vision" />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Field label="Exit Plan" field="exitPlan" />
                                        <Field label="Plan B" field="noInvestmentPlan" />
                                    </div>
                                </div>
                            </div>

                            {/* PART 4: DOCUMENTS */}
                            <div>
                                <h4 className="text-lg font-bold text-[#0B2C4A] mb-4 flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-lg bg-[#0B2C4A]/10 flex items-center justify-center text-[#0B2C4A] text-sm">04</span>
                                    Documents
                                </h4>
                                <div className="space-y-4">
                                    {pitch.pitchDeckUrl && (
                                        <button
                                            onClick={() => onViewDocument({ url: pitch.pitchDeckUrl, title: 'Pitch Deck' })}
                                            className="w-full flex items-center p-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors group text-left"
                                        >
                                            <div className="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center text-red-500 mr-4 group-hover:scale-105 transition-transform">
                                                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-bold text-gray-900 text-sm">Pitch Deck</p>
                                                </div>
                                                <p className="text-xs text-gray-500">PDF Document • Click to Preview</p>
                                            </div>
                                        </button>
                                    )}

                                    {pitch.demoUrl && (
                                        <a href={pitch.demoUrl} target="_blank" className="w-full flex items-center p-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors group text-left">
                                            <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 mr-4 group-hover:scale-105 transition-transform">
                                                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-bold text-gray-900 text-sm">Demo / Prototype</p>
                                                </div>
                                                <p className="text-xs text-gray-500">External Link</p>
                                            </div>
                                        </a>
                                    )}

                                    {pitch.financialsUrls && pitch.financialsUrls.length > 0 && (
                                        <div className="space-y-2">
                                            <p className="text-sm font-semibold text-gray-700">Financial Documents</p>
                                            {pitch.financialsUrls.map((url: string, i: number) => (
                                                <button
                                                    key={i}
                                                    onClick={() => onViewDocument({ url, title: `Financials ${i + 1}` })}
                                                    className="w-full flex items-center p-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors group text-left"
                                                >
                                                    <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-green-500 mr-3">
                                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 text-sm">Financials Doc {i + 1}</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {pitch.tractionProofUrls && pitch.tractionProofUrls.length > 0 && (
                                        <div className="space-y-2">
                                            <p className="text-sm font-semibold text-gray-700">Traction Proof</p>
                                            {pitch.tractionProofUrls.map((url: string, i: number) => (
                                                <button
                                                    key={i}
                                                    onClick={() => onViewDocument({ url, title: `Traction Proof ${i + 1}` })}
                                                    className="w-full flex items-center p-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors group text-left"
                                                >
                                                    <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-500 mr-3">
                                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 text-sm">Traction Proof {i + 1}</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Actions Footer - STICKY */}
                        {pitch.status === 'pending' && (
                            <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-200 flex justify-end gap-3 rounded-b-2xl">
                                <button
                                    onClick={onReject}
                                    className="text-white bg-red-600 hover:bg-red-700 px-5 py-2.5 rounded-xl shadow-md transition-all text-sm font-bold tracking-wide hover:-translate-y-0.5"
                                >
                                    Reject Pitch
                                </button>
                                <button
                                    onClick={onApprove}
                                    className="text-white bg-green-600 hover:bg-green-700 px-5 py-2.5 rounded-xl shadow-md transition-all text-sm font-bold tracking-wide hover:-translate-y-0.5"
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

                {/* Header Filter Actions */}
                {activeTab === 'all' && (
                    <div className="flex items-center gap-3">
                        <label className="text-sm font-semibold text-gray-500">Filter:</label>
                        <div className="relative">
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="appearance-none bg-white border border-gray-300 text-gray-700 text-sm font-bold rounded-xl focus:ring-[#0B2C4A] focus:border-[#0B2C4A] block w-40 pl-4 pr-10 py-2.5 shadow-sm hover:border-gray-400 transition-colors cursor-pointer"
                            >
                                <option value="all">All Statuses</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                                <option value="pending">Pending</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('all')}
                    className={`pb-2 px-1 ${activeTab === 'all' ? 'border-b-2 border-[#0B2C4A] text-[#0B2C4A] font-bold' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    All Pitches <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs ml-1">{stats.total}</span>
                </button>
                <button
                    onClick={() => setActiveTab('pending')}
                    className={`pb-2 px-1 ${activeTab === 'pending' ? 'border-b-2 border-[#0B2C4A] text-[#0B2C4A] font-bold' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Pending Approvals <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs ml-1">{stats.pending}</span>
                </button>

                {/* Filter REMOVED from here, moved to Header */}
                {activeTab === 'all' && (
                    null
                )}
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
                    <span className="block sm:inline">{error}</span>
                </div>
            )}

            {loading ? <div className="p-8 text-center text-gray-500">Loading...</div> : (
                <div className="grid grid-cols-1 gap-6">
                    {/* PITCHES LIST */}
                    {pitches.length === 0 ? (
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
                                        <h3 className="text-xl font-bold text-[#0B2C4A]">{pitch.businessName}</h3>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${pitch.status === 'approved' ? 'bg-green-100 text-green-800' :
                                            pitch.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                pitch.status === 'permanently_rejected' ? 'bg-gray-800 text-white' :
                                                    'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {pitch.status === 'permanently_rejected' ? 'PERMANENTLY REJECTED' : pitch.status}
                                        </span>
                                        {pitch.rejectionCount > 0 && pitch.status !== 'approved' && (
                                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200" title="Rejection Count">
                                                Attempts: {pitch.rejectionCount}/3
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-gray-600 text-sm line-clamp-2 max-w-2xl">{pitch.title}</p>
                                    <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                                        <span className="flex items-center bg-gray-50 px-2 py-1 rounded border border-gray-200">
                                            <span className="font-semibold mr-1">Industry:</span> {pitch.industry}
                                        </span>
                                        <span className="flex items-center bg-gray-50 px-2 py-1 rounded border border-gray-200">
                                            <span className="font-semibold mr-1">Ask:</span> Rs. {formatCurrency(pitch.amountRequired)}
                                        </span>
                                        <span className="flex items-center bg-gray-50 px-2 py-1 rounded border border-gray-200">
                                            <span className="font-semibold mr-1">By:</span> {pitch.entrepreneur?.fullName}
                                        </span>
                                    </div>
                                    <div className="pt-2 flex gap-3">
                                        {pitch.pitchDeckUrl && (
                                            <button
                                                onClick={() => setViewingDoc({ url: pitch.pitchDeckUrl, title: 'Pitch Deck' })}
                                                className="text-[#0B2C4A] text-xs font-semibold hover:underline flex items-center"
                                            >
                                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" /></svg>
                                                View Pitch Deck
                                            </button>
                                        )}
                                        {pitch.financialsUrl && (
                                            <button
                                                onClick={() => setViewingDoc({ url: pitch.financialsUrl, title: 'Financials' })}
                                                className="text-[#0B2C4A] text-xs font-semibold hover:underline flex items-center"
                                            >
                                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" /></svg>
                                                View Financials
                                            </button>
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
                                    {pitch.status === 'pending' && (
                                        <>
                                            <button
                                                onClick={() => handleApprove(pitch._id)}
                                                className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg text-sm font-medium transition-colors shadow-sm"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => initiateRejection(pitch._id)}
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
                    )}
                </div>
            )}

            {/* Render Modal for Pitch Review */}
            {selectedPitch && (
                <PitchReviewModal
                    pitch={selectedPitch}
                    onClose={() => setSelectedPitch(null)}
                    onViewDocument={setViewingDoc}
                    onApprove={() => handleApprove(selectedPitch._id)}
                    onReject={() => initiateRejection(selectedPitch._id)}
                />
            )}

            {/* Rejection Modal */}
            {rejectModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60] animate-fadeIn">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100 p-8">
                        <h3 className="text-2xl font-black text-[#0B2C4A] mb-2">Reject Pitch</h3>
                        <p className="text-gray-500 mb-6">Please provide a reason for this rejection. The entrepreneur will see this.</p>

                        <textarea
                            value={rejectRemarks}
                            onChange={(e) => setRejectRemarks(e.target.value)}
                            placeholder="Enter rejection remarks (Mandatory)..."
                            className="w-full h-32 p-4 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-red-500 mb-6 resize-none bg-gray-50"
                        />

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setRejectModalOpen(false)}
                                className="px-5 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={submitRejection}
                                disabled={rejecting || !rejectRemarks.trim()}
                                className="px-6 py-2.5 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-lg hover:shadow-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {rejecting ? 'Rejecting...' : 'Confirm Rejection'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* PDF Viewing Modal (Separate from Pitch Modal) */}
            {viewingDoc && (
                <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-md flex items-center justify-center p-4 z-[100] animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-full max-h-[95vh] flex flex-col overflow-hidden">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <div>
                                <h3 className="text-xl font-bold text-[#0B2C4A]">{viewingDoc.title}</h3>
                                <a href={viewingDoc.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-0.5">
                                    Open in new tab
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                </a>
                            </div>
                            <button
                                onClick={() => setViewingDoc(null)}
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 text-gray-600 hover:bg-red-100 hover:text-red-500 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Content - Iframe */}
                        <div className="flex-1 bg-gray-100 relative">
                            <iframe
                                src={`${viewingDoc.url}#toolbar=0`}
                                className="w-full h-full border-0"
                                title={viewingDoc.title}
                            >
                                <div className="flex items-center justify-center h-full flex-col p-8 text-center text-gray-500">
                                    <p className="mb-2">Your browser does not support inline PDF viewing.</p>
                                    <a
                                        href={viewingDoc.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-4 py-2 bg-[#0B2C4A] text-white rounded-lg hover:bg-[#09223a] transition-colors"
                                    >
                                        Download PDF
                                    </a>
                                </div>
                            </iframe>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
