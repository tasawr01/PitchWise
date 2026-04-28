'use client';

import React, { useState } from 'react';

interface ActivityItem {
    type: string;
    message: string;
    date: string | Date;
    isRead: boolean;
}

interface Props {
    activities: ActivityItem[];
}

function timeAgo(date: string | Date) {
    const d = typeof date === 'string' ? new Date(date) : date;
    const diff = Date.now() - d.getTime();
    const min = Math.floor(diff / 60000);
    if (min < 1) return 'just now';
    if (min < 60) return `${min}m ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h ago`;
    const days = Math.floor(hr / 24);
    if (days < 7) return `${days}d ago`;
    const wks = Math.floor(days / 7);
    if (wks < 4) return `${wks}w ago`;
    return d.toLocaleDateString();
}

export default function RecentActivity({ activities }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const visible = activities.slice(0, 4);

    return (
        <>
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 h-full">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">Recent Activity</h3>
                        <p className="text-xs text-gray-500 mt-1">{activities.length === 0 ? 'No notifications yet' : `${activities.filter(a => !a.isRead).length} unread`}</p>
                    </div>
                    {activities.length > 4 && (
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                        >
                            View All
                        </button>
                    )}
                </div>
                {visible.length === 0 ? (
                    <div className="py-10 text-center text-gray-400">
                        <svg className="w-12 h-12 mx-auto mb-3 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        <p className="text-sm">When new things happen, they'll appear here.</p>
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-50">
                        {visible.map((activity, i) => (
                            <ActivityRow key={i} {...activity} />
                        ))}
                    </ul>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">All Activity</h3>
                                <p className="text-sm text-gray-500 mt-1">Recent notifications and platform events.</p>
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
                        <div className="p-0 max-h-[60vh] overflow-y-auto">
                            <ul className="divide-y divide-gray-50">
                                {activities.map((activity, i) => (
                                    <div key={i} className="px-8 hover:bg-gray-50/50 transition-colors">
                                        <ActivityRow {...activity} />
                                    </div>
                                ))}
                            </ul>
                        </div>
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

function ActivityRow({ message, date, type, isRead }: ActivityItem) {
    const tones: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
        success: { bg: 'bg-green-50', text: 'text-green-600', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> },
        warning: { bg: 'bg-amber-50', text: 'text-amber-600', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg> },
        error: { bg: 'bg-red-50', text: 'text-red-600', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg> },
        info: { bg: 'bg-blue-50', text: 'text-blue-600', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    };
    const tone = tones[type] || tones.info;

    return (
        <li className="flex items-center gap-4 py-4">
            <div className={`p-2.5 rounded-full ${tone.bg} ${tone.text} shrink-0`}>{tone.icon}</div>
            <div className="flex-1 min-w-0">
                <p className={`text-sm ${isRead ? 'text-gray-600 font-medium' : 'text-gray-900 font-semibold'}`}>{message}</p>
                <span className="text-xs text-gray-400">{timeAgo(date)}</span>
            </div>
            {!isRead && <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />}
        </li>
    );
}
