'use client';

import { useEffect, useState } from 'react';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatWindow from '@/components/chat/ChatWindow';
import { ChatProvider } from '@/context/ChatContext';
import { Suspense } from 'react';

function SupportChatContent() {
    const [user, setUser] = useState<{ _id: string, role: string } | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch('/api/user/me');
                const data = await res.json();
                if (data.user) {
                    setUser(data.user);
                }
            } catch (error) {
                console.error('Failed to fetch profile', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-50 px-4 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
                <p className="text-gray-600 mb-6">Please log in to contact support.</p>
                <a href="/login" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition">Go to Login</a>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-white overflow-hidden">
            <ChatSidebar 
                userId={user._id} 
                userRole={user.role} 
                fetchUrl="/api/support/conversation" 
                basePath="/support-chat" 
            />
            <ChatWindow userId={user._id} userRole={user.role} />
        </div>
    );
}

export default function SupportChatPage() {
    return (
        <ChatProvider>
            <Suspense fallback={<div>Loading...</div>}>
                <SupportChatContent />
            </Suspense>
        </ChatProvider>
    );
}
