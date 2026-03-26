"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useChat } from '@/context/ChatContext';
import { Send, Paperclip, MoreVertical } from 'lucide-react';

export default function ChatWindow({ userId, userRole }: { userId: string, userRole: string }) {
    const {
        activeConversation,
        messages,
        setMessages,
        socket,
        joinConversation,
        isDealPopupOpen,
        setIsDealPopupOpen,
        pendingNavigation,
        setPendingNavigation
    } = useChat();
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (activeConversation) {
            joinConversation(activeConversation._id);
            // Fetch messages
            fetch(`/api/chat/messages?conversationId=${activeConversation._id}`)
                .then(res => res.json())
                .then(data => {
                    if (data.messages) setMessages(data.messages);
                })
                .catch(err => console.error(err));
        }
    }, [activeConversation, joinConversation, setMessages]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!newMessage.trim() || !activeConversation || !socket) return;

        const messageData = {
            conversationId: activeConversation._id,
            sender: {
                user: userId,
                userModel: userRole === 'investor' ? 'Investor' : 'Entrepreneur' // Adjust based on props
            },
            content: newMessage,
            type: 'text'
        };

        socket.emit('send_message', messageData);
        setNewMessage('');
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    if (!activeConversation) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center text-gray-500">
                    <h3 className="text-xl font-medium">Select a conversation to start chatting</h3>
                </div>
            </div>
        );
    }

    const otherParticipant = activeConversation.participants.find((p: any) => p.user._id !== userId)?.user;

    const handleNavigationComplete = () => {
        setIsDealPopupOpen(false);
        if (pendingNavigation) {
            pendingNavigation();
            setPendingNavigation(null);
        }
    };

    const handleNavigationCancel = () => {
        setIsDealPopupOpen(false);
        setPendingNavigation(null);
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-gray-50">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-white flex justify-between items-center shadow-sm">
                <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden">
                        {otherParticipant?.profilePhoto ? (
                            <img src={otherParticipant.profilePhoto} alt={otherParticipant.fullName} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-600 font-bold">
                                {otherParticipant?.fullName?.charAt(0)}
                            </div>
                        )}
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">{otherParticipant?.fullName}</h2>
                        <p className="text-sm text-blue-600 font-medium">{activeConversation.pitch?.businessName || activeConversation.pitch?.title || 'Pitch Discussion'}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    {userRole === 'entrepreneur' && (
                        <button
                            onClick={() => setIsDealPopupOpen(true)}
                            className="p-2 hover:bg-gray-100 rounded-full text-gray-600"
                        >
                            <MoreVertical size={20} />
                        </button>
                    )}
                    {/* Add to Watchlist button logic here for Investor */}
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((msg, index) => {
                    const isOwn = msg.sender.user === userId || (typeof msg.sender.user === 'object' && (msg.sender.user as any)._id === userId);
                    return (
                        <div key={index} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                            <div
                                className={`max-w-[70%] px-4 py-2 rounded-2xl shadow-sm ${isOwn
                                    ? 'bg-blue-600 text-white rounded-br-none'
                                    : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'
                                    }`}
                            >
                                <p className="text-sm">{msg.content}</p>
                                <span className={`text-[10px] block mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-400'}`}>
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-gray-200">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                    <button type="button" className="p-2 text-gray-400 hover:text-gray-600">
                        <Paperclip size={20} />
                    </button>
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message..."
                        className="flex-1 p-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500 px-4"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                        <Send size={20} />
                    </button>
                </form>
            </div>

            {/* Deal Popup Modal */}
            {isDealPopupOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-96 shadow-xl">
                        <h3 className="text-xl font-bold mb-4 text-gray-900">What is the progress of this chat?</h3>
                        <div className="space-y-3">
                            <button
                                onClick={() => handleNavigationComplete()}
                                className="w-full p-3 text-left border rounded-lg hover:bg-gray-50 flex justify-between items-center"
                            >
                                <span className="font-medium">In Progress</span>
                                <span className="text-green-600 text-sm">Continue Chatting</span>
                            </button>
                            <button
                                onClick={async () => {
                                    if (!activeConversation) return;

                                    try {
                                        // Update status in specific Conversation API
                                        await fetch(`/api/chat/conversations/${activeConversation._id}`, {
                                            method: 'PATCH',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ dealStatus: 'discarded' })
                                        });
                                        handleNavigationComplete();
                                        // Optionally show feedback
                                        alert("Conversation marked as discarded.");
                                    } catch (err) {
                                        console.error(err);
                                    }
                                }}
                                className="w-full p-3 text-left border rounded-lg hover:bg-gray-50 border-red-200 hover:bg-red-50"
                            >
                                <span className="font-medium text-red-700">Discarded</span>
                                <span className="text-red-500 text-sm">No Deal</span>
                            </button>
                            <button
                                onClick={async () => {
                                    if (!activeConversation) return;

                                    try {
                                        // Update status
                                        await fetch(`/api/chat/conversations/${activeConversation._id}`, {
                                            method: 'PATCH',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ dealStatus: 'completed' })
                                        });

                                        handleNavigationComplete();

                                        const pitchId = typeof activeConversation.pitch === 'object' ? activeConversation.pitch._id : activeConversation.pitch;
                                        const investor = activeConversation.participants.find((p: any) => p.userModel === 'Investor')?.user;
                                        const investorId = typeof investor === 'object' ? investor._id : investor;

                                        if (userRole === 'entrepreneur') {
                                            window.location.href = `/entrepreneur_dashboard/deals/create?pitchId=${pitchId}&investorId=${investorId}&entrepreneurId=${userId}`;
                                        }

                                    } catch (err) {
                                        console.error(err);
                                    }
                                }}
                                className="w-full p-3 text-left border rounded-lg hover:bg-gray-50 border-blue-200 hover:bg-blue-50"
                            >
                                <span className="font-medium text-blue-700">Completed</span>
                                <span className="text-blue-500 text-sm">Create Deal</span>
                            </button>
                        </div>
                        <button
                            onClick={() => handleNavigationCancel()}
                            className="mt-4 w-full text-center text-gray-500 hover:text-gray-700 text-sm"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
