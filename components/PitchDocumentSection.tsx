'use client';

import { useState } from 'react';

interface PitchDocumentSectionProps {
    pitchDeckUrl?: string;
    financialsUrl?: string;
    demoUrl?: string; // Kept for completeness, though mainly for images
}

export default function PitchDocumentSection({ pitchDeckUrl, financialsUrl, demoUrl }: PitchDocumentSectionProps) {
    const [viewingDoc, setViewingDoc] = useState<{ url: string, title: string } | null>(null);

    return (
        <>
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-md font-bold text-[#0B2C4A] mb-4">Documents</h3>
                <div className="space-y-3">
                    {/* Pitch Deck Button */}
                    {pitchDeckUrl && (
                        <button
                            onClick={() => setViewingDoc({ url: pitchDeckUrl, title: 'Pitch Deck' })}
                            className="w-full flex items-center p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors group text-left"
                        >
                            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-500 mr-3 group-hover:scale-110 transition-transform">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div className="overflow-hidden">
                                <p className="font-semibold text-gray-900 text-sm truncate">Pitch Deck</p>
                                <p className="text-xs text-gray-500">PDF Document • Click to View</p>
                            </div>
                        </button>
                    )}

                    {/* Financials Button */}
                    {financialsUrl && (
                        <button
                            onClick={() => setViewingDoc({ url: financialsUrl, title: 'Financials' })}
                            className="w-full flex items-center p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors group text-left"
                        >
                            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-green-500 mr-3 group-hover:scale-110 transition-transform">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div className="overflow-hidden">
                                <p className="font-semibold text-gray-900 text-sm truncate">Financials</p>
                                <p className="text-xs text-gray-500">PDF Document • Click to View</p>
                            </div>
                        </button>
                    )}
                </div>
            </div>

            {/* PDF Modal */}
            {viewingDoc && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 md:p-8">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-full max-h-[90vh] flex flex-col overflow-hidden animate-fadeIn">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <div>
                                <h3 className="text-lg font-bold text-[#0B2C4A]">{viewingDoc.title}</h3>
                                <a href={viewingDoc.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-0.5">
                                    Open in new tab
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                </a>
                            </div>
                            <button
                                onClick={() => setViewingDoc(null)}
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-gray-500 hover:bg-gray-300 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
        </>
    );
}
