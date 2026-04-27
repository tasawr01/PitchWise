"use client";

import React, { useEffect, useState } from 'react';
import { useChat } from '@/context/ChatContext';
import { useRouter } from 'next/navigation';

export default function ChatSidebar({ userId, userRole, targetUserId, fetchUrl = '/api/chat/conversations', basePath = '/chat' }: { userId: string, userRole: string, targetUserId?: string, fetchUrl?: string, basePath?: string }) {
    const { conversations, setConversations, setActiveConversation, activeConversation, setMessages, interceptNavigation } = useChat();
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null); // conversation ID to confirm delete
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        // Fetch conversations
        const fetchConversations = async () => {
            try {
                const res = await fetch(fetchUrl);
                const data = await res.json();
                if (data.conversations) {
                    setConversations(data.conversations);
                    
                    // Auto-select conversation based on targetUserId
                    if (targetUserId) {
                        const targetConv = data.conversations.find((c: any) => 
                            c.participants.some((p: any) => p.user._id === targetUserId || p.user === targetUserId)
                        );
                        if (targetConv) {
                            setActiveConversation(targetConv);
                            router.replace(`${basePath}?conversationId=${targetConv._id}`);
                        }
                    }
                }
            } catch (error) {
                console.error('Failed to load conversations', error);
            }
        };

        fetchConversations();
    }, [setConversations, targetUserId, setActiveConversation, router, basePath]);

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
                router.push(`${basePath}?conversationId=${conversation._id}`);
            });
        } else {
            setActiveConversation(conversation);
            router.push(`${basePath}?conversationId=${conversation._id}`);
        }
    };

    const handleDeleteConversation = async (conversationId: string) => {
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/chat/conversations/${conversationId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                // Remove from local state
                setConversations(prev => prev.filter(c => c._id !== conversationId));

                // Clear active conversation if it was the deleted one
                if (activeConversation?._id === conversationId) {
                    setActiveConversation(null);
                    setMessages([]);
                    router.replace(basePath);
                }
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to delete conversation');
            }
        } catch (error) {
            console.error('Failed to delete conversation', error);
            alert('Failed to delete conversation');
        } finally {
            setIsDeleting(false);
            setDeleteConfirm(null);
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
                            } else if (userRole === 'admin') {
                                router.push('/admin/dashboard');
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
                                className={`group relative p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-all ${isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden shrink-0">
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
                                            <div className="shrink-0 ml-2">
                                                {/* Date - hidden on hover, delete icon shown instead */}
                                                <span className="text-xs text-gray-400 group-hover:hidden">
                                                    {conversation.lastMessage ? new Date(conversation.lastMessage.createdAt).toLocaleDateString() : ''}
                                                </span>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setDeleteConfirm(conversation._id);
                                                    }}
                                                    className="hidden group-hover:flex p-1 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
                                                    title="Delete conversation"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="3 6 5 6 21 6" />
                                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                                        <line x1="10" y1="11" x2="10" y2="17" />
                                                        <line x1="14" y1="11" x2="14" y2="17" />
                                                    </svg>
                                                </button>
                                            </div>
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

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setDeleteConfirm(null)}>
                    <div className="bg-white rounded-2xl p-6 w-80 shadow-2xl mx-4 animate-in fade-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Delete Conversation</h3>
                        <p className="text-sm text-gray-500 text-center mb-6">
                            Are you sure you want to delete this conversation? All messages will be permanently removed. This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDeleteConversation(deleteConfirm)}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isDeleting ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                        </svg>
                                        Deleting...
                                    </>
                                ) : (
                                    'Delete'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
