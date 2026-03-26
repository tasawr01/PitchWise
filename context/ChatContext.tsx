"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface Message {
    _id: string;
    conversation: string;
    content: string;
    sender: {
        user: string | { _id: string, fullName: string, profilePhoto: string }; // Populated or ID
        userModel: string;
    };
    createdAt: string;
    type: string;
}

interface Conversation {
    _id: string;
    participants: any[];
    pitch: any;
    lastMessage?: any;
    updatedAt: string;
}

interface ChatContextType {
    socket: Socket | null;
    activeConversation: Conversation | null;
    setActiveConversation: (conv: Conversation | null) => void;
    messages: Message[];
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
    sendMessage: (content: string, type?: string) => void;
    joinConversation: (conversationId: string) => void;
    conversations: Conversation[];
    setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
    isLoading: boolean;
    isDealPopupOpen: boolean;
    setIsDealPopupOpen: React.Dispatch<React.SetStateAction<boolean>>;
    pendingNavigation: (() => void) | null;
    setPendingNavigation: React.Dispatch<React.SetStateAction<(() => void) | null>>;
    interceptNavigation: (action: () => void) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // UI States for intercepting navigation
    const [isDealPopupOpen, setIsDealPopupOpen] = useState(false);
    const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null);

    // Initialize socket
    useEffect(() => {
        // In dev, we might need a specific URL if port differs, but relative path works if proxying or custom server
        // If we run `dev:socket`, port is 3000, same as next.js usually.
        // But if next.js is just serving frontend and custom server is separate...
        // With custom server, `window.location.origin` should work.

        const socketInstance = io({
            path: '/socket.io', // Default
            // add auth query if needed: query: { token }
        });

        socketInstance.on('connect', () => {
            console.log('Connected to socket server');
        });

        socketInstance.on('receive_message', (message: Message) => {
            setMessages((prev) => [...prev, message]);

            // Update conversation list preview if needed
            setConversations(prev => prev.map(c => {
                if (c._id === message.conversation) {
                    return { ...c, lastMessage: message, updatedAt: message.createdAt };
                }
                return c;
            }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, []);

    const joinConversation = (conversationId: string) => {
        if (socket) {
            socket.emit('join_conversation', conversationId);
        }
    };

    const sendMessage = (content: string, type = 'text') => {
        if (socket && activeConversation) {
            // Optimistic update? Or wait for server?
            // Let's emit and let server broadcast back. 
            // Better: server broadcasts to sender too, or we append locally.
            // For now, relying on server broadcast for consistency.

            // We need userId for sender. We can get it from auth context or cookie, 
            // but socket event usually just sends data. 
            // The server needs to know WHO sent it. 
            // We should pass sender info in the emit data.
            // Ideally we decode token on server to verify sender.
            // For MVP, we pass it from frontend state (UserContext).
            // But here I don't have UserContext handy in this file.
            // I will require `sendMessage` to take sender info or retrieve it.
            // actually, let's fetch user info once and store in context?

            // Assume the caller of sendMessage provides necessary ID or we handle it.
            // Wait, standard practice: Client emits, Server uses socket.request.user (if auth middleware).
            // Without auth middleware, client must send user ID.

            // I'll make sendMessage take the sender object for now.
        }
    };

    const value = {
        socket,
        activeConversation,
        setActiveConversation,
        messages,
        setMessages,
        sendMessage: (content: string, type = 'text') => {
            if (socket && activeConversation) {
                // Component will call this
            }
        },
        conversations,
        setConversations,
        isLoading,
        joinConversation,
        isDealPopupOpen,
        setIsDealPopupOpen,
        pendingNavigation,
        setPendingNavigation,
        interceptNavigation: (action: () => void) => {
            if (activeConversation) {
                setPendingNavigation(() => action);
                setIsDealPopupOpen(true);
            } else {
                action();
            }
        }
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
}

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) throw new Error("useChat must be used within ChatProvider");
    return context;
};
