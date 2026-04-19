"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useChat } from '@/context/ChatContext';
import { Send, Paperclip, MoreVertical, FileText, ImageIcon, X, Loader2 } from 'lucide-react';

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
    const [filePreview, setFilePreview] = useState<{ file: File; previewUrl: string | null } | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (activeConversation) {
            joinConversation(activeConversation._id);
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

    // ── File picking ──────────────────────────────────────
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Image preview
        const isImage = file.type.startsWith('image/');
        const previewUrl = isImage ? URL.createObjectURL(file) : null;
        setFilePreview({ file, previewUrl });

        // Reset input so same file can be re-selected
        e.target.value = '';
    };

    const clearFilePreview = () => {
        if (filePreview?.previewUrl) URL.revokeObjectURL(filePreview.previewUrl);
        setFilePreview(null);
    };

    // ── Send (text or file) ───────────────────────────────
    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!activeConversation || !socket) return;
        if (!newMessage.trim() && !filePreview) return;

        // If there's a file, upload first
        if (filePreview) {
            setIsUploading(true);
            try {
                const formData = new FormData();
                formData.append('file', filePreview.file);

                const res = await fetch('/api/chat/messages/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (!res.ok) {
                    const err = await res.json();
                    alert(err.error || 'Upload failed');
                    setIsUploading(false);
                    return;
                }

                const { url, fileName } = await res.json();
                if (!url) {
                    alert('File upload failed: No file URL returned.');
                    setIsUploading(false);
                    return;
                }
                const isImage = filePreview.file.type.startsWith('image/');

                // Always send as file or image, never as plain text
                const messageData = {
                    conversationId: activeConversation._id,
                    sender: {
                        user: userId,
                        userModel: userRole === 'investor' ? 'Investor' : 'Entrepreneur',
                    },
                    content: newMessage.trim() || fileName,  // fallback caption = filename
                    type: isImage ? 'image' : 'file',
                    fileUrl: url,
                    fileName: fileName,
                };

                console.log('Sending messageData:', messageData);
                socket.emit('send_message', messageData);
                clearFilePreview();
                setNewMessage('');
            } catch (err) {
                alert('Upload failed');
            } finally {
                setIsUploading(false);
            }
            return;
        }

        // Plain text message
        const messageData = {
            conversationId: activeConversation._id,
            sender: {
                user: userId,
                userModel: userRole === 'investor' ? 'Investor' : 'Entrepreneur',
            },
            content: newMessage,
            type: 'text',
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

    // ── Message bubble renderer ───────────────────────────
    const renderMessageContent = (msg: any, isOwn: boolean) => {
        if (msg.type === 'image' && msg.fileUrl) {
            return (
                <div>
                    <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={msg.fileUrl}
                            alt={msg.fileName || 'Image'}
                            className="max-w-[220px] rounded-lg mb-1 cursor-pointer hover:opacity-90 transition-opacity"
                        />
                    </a>
                    {msg.content && msg.content !== msg.fileName && (
                        <p className="text-sm mt-1">{msg.content}</p>
                    )}
                </div>
            );
        }

        if (msg.type === 'file' && msg.fileUrl) {
            return (
                <a
                    href={msg.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg max-w-[220px] transition-colors ${
                        isOwn ? 'bg-blue-700 hover:bg-blue-800' : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                >
                    <FileText className={`w-5 h-5 shrink-0 ${isOwn ? 'text-blue-200' : 'text-gray-500'}`} />
                    <span className={`text-sm font-medium truncate ${isOwn ? 'text-white' : 'text-gray-700'}`}>
                        {msg.fileName || msg.content || 'File'}
                    </span>
                </a>
            );
        }

        // Default: plain text
        return <p className="text-sm">{msg.content}</p>;
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
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((msg: any, index: number) => {
                    const isOwn = msg.sender.user === userId || (typeof msg.sender.user === 'object' && (msg.sender.user as any)._id === userId);
                    return (
                        <div key={index} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                            <div
                                className={`max-w-[70%] px-4 py-2 rounded-2xl shadow-sm ${isOwn
                                    ? 'bg-blue-600 text-white rounded-br-none'
                                    : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'
                                }`}
                            >
                                {renderMessageContent(msg, isOwn)}
                                <span className={`text-[10px] block mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-400'}`}>
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* File Preview Strip */}
            {filePreview && (
                <div className="px-4 pb-2 bg-white border-t border-gray-100">
                    <div className="flex items-center gap-3 mt-2 p-2 bg-gray-50 rounded-xl border border-gray-200">
                        {filePreview.previewUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={filePreview.previewUrl} alt="preview" className="w-12 h-12 object-cover rounded-lg shrink-0" />
                        ) : (
                            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                                <FileText className="w-6 h-6 text-blue-500" />
                            </div>
                        )}
                        <span className="flex-1 text-sm text-gray-700 font-medium truncate">{filePreview.file.name}</span>
                        <button onClick={clearFilePreview} className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Input */}
            <div className="p-4 bg-white border-t border-gray-200">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                    {/* Hidden File Input */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip"
                        onChange={handleFileSelect}
                    />

                    {/* Paperclip Button */}
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors disabled:opacity-40"
                        title="Attach file"
                    >
                        <Paperclip size={20} />
                    </button>

                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={filePreview ? 'Add a caption (optional)…' : 'Type a message…'}
                        className="flex-1 p-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500 px-4"
                    />

                    <button
                        type="submit"
                        disabled={isUploading || (!newMessage.trim() && !filePreview)}
                        className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                        {isUploading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
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
                                        await fetch(`/api/chat/conversations/${activeConversation._id}`, {
                                            method: 'PATCH',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ dealStatus: 'discarded' })
                                        });
                                        handleNavigationComplete();
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
