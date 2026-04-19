'use client';

import { useEffect, useState } from 'react';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatWindow from '@/components/chat/ChatWindow';
import { useChat, ChatProvider } from '@/context/ChatContext';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function SupportChatsContent() {
    const { conversations, setActiveConversation, activeConversation } = useChat();
    const searchParams = useSearchParams();
    const conversationId = searchParams.get('conversationId');
    const [adminId, setAdminId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Fetch current admin profile to get ID
        const fetchProfile = async () => {
            try {
                const res = await fetch('/api/user/me'); 
                const data = await res.json();
                if (data.user) {
                    setAdminId(data.user._id);
                }
            } catch (error) {
                console.error('Failed to fetch admin profile', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, []);

    // Effect to set active conversation when conversationId param changes
    useEffect(() => {
        if (conversationId && conversations.length > 0) {
            const found = conversations.find(c => c._id === conversationId);
            if (found) {
                setActiveConversation(found);
            }
        }
    }, [conversationId, conversations, setActiveConversation]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!adminId) {
        return (
            <div className="p-8 text-center bg-white rounded-xl shadow-sm border border-gray-100">
                <p className="text-gray-500">Please log in as an administrator.</p>
            </div>
        );
    }

    return (
        <div className="flex h-full bg-white overflow-hidden">
            <ChatSidebar 
                userId={adminId} 
                userRole="admin" 
                fetchUrl="/api/support/conversations" 
                basePath="/admin_dashboard/support-chats"
            />
            <ChatWindow userId={adminId} userRole="admin" />
        </div>
    );
}

export default function AdminSupportChatsPage() {
    return (
        <ChatProvider>
            <div className="h-screen flex flex-col bg-gray-50">

                <div className="flex-1 overflow-hidden">
                    <Suspense fallback={<div>Loading...</div>}>
                        <SupportChatsContent />
                    </Suspense>
                </div>
            </div>
        </ChatProvider>
    );
}
