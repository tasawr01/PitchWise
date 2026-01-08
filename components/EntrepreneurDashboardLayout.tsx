'use client';

import { useState } from 'react';
import EntrepreneurSidebar from '@/components/EntrepreneurSidebar';
import LogoutButton from '@/components/LogoutButton';
import Image from 'next/image';

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
                        {/* Chat Icon - Hidden on very small screens if needed, or keep */}
                        <button className="p-2 text-gray-400 hover:text-blue-600 transition relative hidden sm:block">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                        </button>

                        {/* Notification Icon */}
                        <div className="p-2 text-gray-400 hover:text-blue-600 transition relative">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </div>

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
            </div>
        </div>
    );
}
