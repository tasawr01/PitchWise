"use client";

import React, { useEffect, useState } from 'react';
import { useChat } from '@/context/ChatContext';
import { useRouter } from 'next/navigation';

export default function ChatSidebar({ userId, userRole }: { userId: string, userRole: string }) {
    const { conversations, setConversations, setActiveConversation, activeConversation, interceptNavigation } = useChat();
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        // Fetch conversations
        const fetchConversations = async () => {
            try {
                const res = await fetch('/api/chat/conversations');
                const data = await res.json();
                if (data.conversations) {
                    setConversations(data.conversations);
                }
            } catch (error) {
                console.error('Failed to load conversations', error);
            }
        };

        fetchConversations();
    }, [setConversations]);

    const filteredConversations = conversations.filter(c => {
        // Filter by pitch title or other participant name
        const pitchTitle = c.pitch?.title || '';
        const otherParticipant = c.participants.find((p: any) => p.user._id !== userId)?.user.fullName || '';
        return pitchTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
            otherParticipant.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const handleSelectConversation = (conversation: any) => {
        if (userRole === 'entrepreneur') {
            interceptNavigation(() => {
                setActiveConversation(conversation);
                router.push(`/chat?conversationId=${conversation._id}`);
            });
        } else {
            setActiveConversation(conversation);
            router.push(`/chat?conversationId=${conversation._id}`);
        }
    };

    return (
        <div className="w-1/4 h-full border-r border-gray-200 bg-white flex flex-col">
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                    <button
                        onClick={() => {
                            if (userRole === 'entrepreneur') {
                                interceptNavigation(() => router.push('/entrepreneur_dashboard'));
                            } else {
                                router.push('/investor_dashboard');
                            }
                        }}
                        className="p-2 -ml-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                        title="Back to Dashboard"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
                    </button>
                    <h2 className="text-xl font-bold">Messages</h2>
                </div>
                <input
                    type="text"
                    placeholder="Search conversations..."
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="flex-1 overflow-y-auto">
                {filteredConversations.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">No conversations found.</div>
                ) : (
                    filteredConversations.map(conversation => {
                        const otherParticipant = conversation.participants.find((p: any) => p.user._id !== userId)?.user;
                        const isSelected = activeConversation?._id === conversation._id;

                        return (
                            <div
                                key={conversation._id}
                                onClick={() => handleSelectConversation(conversation)}
                                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 translation-all ${isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden">
                                        {otherParticipant?.profilePhoto ? (
                                            <img src={otherParticipant.profilePhoto} alt={otherParticipant.fullName} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-600 font-bold">
                                                {otherParticipant?.fullName?.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline">
                                            <h3 className="text-sm font-semibold truncate text-gray-900">{otherParticipant?.fullName || 'Unknown'}</h3>
                                            <span className="text-xs text-gray-400">
                                                {conversation.lastMessage ? new Date(conversation.lastMessage.createdAt).toLocaleDateString() : ''}
                                            </span>
                                        </div>
                                        <p className="text-xs font-medium text-blue-600 truncate mt-0.5">
                                            {conversation.pitch?.businessName || conversation.pitch?.title || 'Pitch Discussion'}
                                        </p>
                                        <p className="text-sm text-gray-600 truncate mt-1">
                                            {conversation.lastMessage?.content || 'No messages yet'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
