'use client';

import { useState, useEffect } from 'react';
import EntrepreneurSidebar from '@/components/EntrepreneurSidebar';
import LogoutButton from '@/components/LogoutButton';
import NotificationBell from '@/components/NotificationBell';
import Image from 'next/image';
import WelcomeGuidanceModal from './WelcomeGuidanceModal';

import Link from 'next/link';

interface LayoutProps {
    children: React.ReactNode;
    user: {
        fullName: string;
        profilePhoto?: string;
    };
}

export default function EntrepreneurDashboardLayout({ children, user }: LayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showWelcomeModal, setShowWelcomeModal] = useState(false);

    // Automatic welcome modal removed by user request
    // useEffect(() => {
    //     // Check if user has seen welcome modal
    //     fetch('/api/entrepreneur/welcome', { cache: 'no-store' })
    //         .then(res => res.json())
    //         .then(data => {
    //             if (!data.hasSeenWelcome) {
    //                 setShowWelcomeModal(true);
    //             }
    //         })
    //         .catch(err => console.error('Failed to check welcome status', err));
    // }, []);

    const handleCloseWelcome = async () => {
        setShowWelcomeModal(false);
        // Update status so it doesn't show again automatically
        try {
            await fetch('/api/entrepreneur/welcome', { method: 'POST' });
        } catch (err) {
            console.error('Failed to update welcome status', err);
        }
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm z-20 md:hidden transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <EntrepreneurSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-6 shadow-sm z-10 sticky top-0">
                    <div className="flex items-center gap-3">
                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 -ml-2 text-gray-500 hover:text-gray-700 md:hidden focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 rounded-md"
                        >
                            <span className="sr-only">Open sidebar</span>
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        <h1 className="text-lg font-semibold text-gray-800 truncate">
                            <span className="hidden sm:inline">Welcome, </span>
                            {user.fullName}
                        </h1>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4">
                        {/* Guidance Button */}
                        <button
                            onClick={() => setShowWelcomeModal(true)}
                            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-semibold"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Guidance
                        </button>
                        {/* Chat Icon - Hidden on very small screens if needed, or keep */}
                        <button className="p-2 text-gray-400 hover:text-blue-600 transition relative hidden sm:block">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                        </button>

                        <NotificationBell />

                        <LogoutButton />

                        {/* Profile Dropdown Trigger */}
                        <Link href="/entrepreneur_dashboard/profile" className="ml-2 w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 hover:ring-2 hover:ring-blue-500 transition-all cursor-pointer">
                            {user.profilePhoto ? (
                                <Image src={user.profilePhoto} alt="Profile" width={32} height={32} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-800 text-xs font-bold">
                                    {user.fullName.charAt(0)}
                                </div>
                            )}
                        </Link>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
                {/* Welcome Modal */}
                <WelcomeGuidanceModal
                    isOpen={showWelcomeModal}
                    onClose={handleCloseWelcome}
                />
            </div>
        </div>
    );
}
