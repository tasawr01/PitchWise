'use client';

import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export default function CommunityChatRoom({ topic, currentUser }: { topic: any, currentUser: any }) {
    const [messages, setMessages] = useState<any[]>([]);
    const [messageInput, setMessageInput] = useState('');
    const [socket, setSocket] = useState<Socket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Fetch existing messages
        fetchMessages();

        // Connect Socket
        const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin);
        setSocket(newSocket);

        // Emit immediately; socket.io will buffer it until connected
        newSocket.emit("join_community_topic", topic._id);

        newSocket.on("receive_community_message", (message: any) => {
            const msgTopicId = message.topic?._id || message.topic;
            if (String(msgTopicId) === String(topic._id)) {
                setMessages(prev => [...prev, message]);
            }
        });

        return () => {
            newSocket.disconnect();
        };
    }, [topic._id]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchMessages = async () => {
        try {
            const res = await fetch(`/api/community/topics/${topic._id}/messages`);
            const data = await res.json();
            if (data.success) {
                setMessages(data.data);
            }
        } catch (error) {
            console.error('Error fetching messages', error);
        }
    };

    const sendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageInput.trim() || !socket) return;

        const messageData = {
            topicId: topic._id,
            sender: {
                user: currentUser.id,
                userModel: currentUser.role
            },
            content: messageInput,
            type: 'text'
        };

        socket.emit("send_community_message", messageData);
        setMessageInput('');
    };

    return (
        <div className="flex flex-col h-full bg-white relative">
            <div className="p-4 border-b border-gray-200 bg-white/80 backdrop-blur shadow-sm z-10">
                <h3 className="font-bold text-lg text-[#0B2C4A]">#{topic.title}</h3>
                <p className="text-xs text-gray-400">Community Discussion</p>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
                {messages.length === 0 ? (
                    <div className="text-center text-gray-400 mt-10">
                        <p>No messages yet. Be the first to start the conversation!</p>
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const isMe = msg.sender.user?._id === currentUser.id || msg.sender.user === currentUser.id;
                        return (
                            <div key={msg._id || index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                {!isMe && (
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-800 text-xs mr-2 shadow-sm uppercase flex-shrink-0">
                                        {(msg.sender.user?.name || msg.sender.user?.fullName || msg.sender.userModel).charAt(0)}
                                    </div>
                                )}
                                <div className={`max-w-[70%] group flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                    <div className="flex items-baseline gap-2 mx-1 mb-1 relative">
                                        {!isMe && <span className="text-xs font-semibold text-gray-600">{msg.sender.user?.name || msg.sender.user?.fullName || msg.sender.userModel}</span>}
                                        {!isMe && msg.sender.userModel === 'Admin' && (
                                            <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-bold tracking-wider">ADMIN</span>
                                        )}
                                        <span className={`text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity ${isMe ? 'mr-0' : 'ml-0'}`}>
                                            {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div className={`px-4 py-2.5 rounded-2xl shadow-sm ${
                                        isMe 
                                        ? 'bg-[#0B2C4A] text-white rounded-tr-sm' 
                                        : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm'
                                    }`}>
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-white border-t border-gray-200">
                <form onSubmit={sendMessage} className="flex gap-3">
                    <input 
                        type="text" 
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        placeholder="Message the community..."
                        className="flex-1 px-4 py-3 bg-gray-100 border-none rounded-full focus:outline-none focus:ring-2 focus:ring-[#0B2C4A]/50 transition-shadow"
                    />
                    <button 
                        type="submit" 
                        disabled={!messageInput.trim()}
                        className="bg-[#0B2C4A] text-white w-12 h-12 rounded-full flex items-center justify-center hover:bg-blue-900 disabled:opacity-50 transition-colors shadow-md"
                    >
                        <svg className="w-5 h-5 ml-1 transform rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    );
}
