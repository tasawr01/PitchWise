'use client';

import React, { useState } from 'react';

// Shared Dummy Data
const initialActivities = [
    { id: 1, text: "Investor Alex viewed your 'AI Health' pitch", time: "2h ago", type: "view" },
    { id: 2, text: "New message from Sarah regarding 'GreenEnergy'", time: "5h ago", type: "message" },
    { id: 3, text: "Pitch 'TechEdu' was approved by Admin", time: "1d ago", type: "success" },
    { id: 4, text: "Profile updated successfully", time: "2d ago", type: "info" },
];

const allActivities = [
    ...initialActivities,
    { id: 5, text: "Investor John viewed your 'TechEdu' pitch", time: "3d ago", type: "view" },
    { id: 6, text: "System maintenance scheduled for weekend", time: "4d ago", type: "info" },
    { id: 7, text: "Pitch 'GreenEnergy' submitted for review", time: "5d ago", type: "info" },
    { id: 8, text: "Welcome to PitchWise!", time: "1w ago", type: "success" },
];

export default function RecentActivity() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 h-full">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-800">Recent Activity</h3>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    >
                        View All
                    </button>
                </div>
                <ul className="divide-y divide-gray-50">
                    {initialActivities.map(activity => (
                        <ActivityItem key={activity.id} {...activity} />
                    ))}
                </ul>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-all" onClick={() => setIsModalOpen(false)}>
                    <div
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all scale-100"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">All Activity</h3>
                                <p className="text-sm text-gray-500 mt-1">History of interactions and updates.</p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-0 max-h-[60vh] overflow-y-auto">
                            <ul className="divide-y divide-gray-50">
                                {allActivities.map(activity => (
                                    <div key={activity.id} className="px-8 hover:bg-gray-50/50 transition-colors">
                                        <ActivityItem {...activity} />
                                    </div>
                                ))}
                            </ul>
                        </div>

                        {/* Footer */}
                        <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-6 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg shadow-sm hover:bg-gray-50 transition-all"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

function ActivityItem({ text, time, type }: any) {
    let icon;
    let iconBg;
    let iconColor;

    switch (type) {
        case 'view':
            iconBg = 'bg-blue-50';
            iconColor = 'text-blue-600';
            icon = <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;
            break;
        case 'message':
            iconBg = 'bg-purple-50';
            iconColor = 'text-purple-600';
            icon = <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>;
            break;
        case 'success':
            iconBg = 'bg-green-50';
            iconColor = 'text-green-600';
            icon = <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;
            break;
        default: // info
            iconBg = 'bg-gray-50';
            iconColor = 'text-gray-600';
            icon = <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    }

    return (
        <li className="flex items-center gap-4 py-4">
            <div className={`p-2.5 rounded-full ${iconBg} ${iconColor} flex-shrink-0`}>
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-gray-800 text-sm font-medium truncate">{text}</p>
                <div className="flex items-center mt-0.5">
                    <span className="text-xs text-gray-400">{time}</span>
                </div>
            </div>
            <div className="text-gray-300">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </div>
        </li>
    );
}
