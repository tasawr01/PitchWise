"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getPusherClient } from '@/lib/pusher-client';

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
    type?: string;
}

interface ChatContextType {
    isRealtimeReady: boolean;
    activeConversation: Conversation | null;
    setActiveConversation: (conv: Conversation | null) => void;
    messages: Message[];
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
    sendMessage: (content: string, type?: string) => void;
    conversations: Conversation[];
    setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
    isLoading: boolean;
    isDealPopupOpen: boolean;
    setIsDealPopupOpen: React.Dispatch<React.SetStateAction<boolean>>;
    pendingNavigation: (() => void) | null;
    setPendingNavigation: React.Dispatch<React.SetStateAction<(() => void) | null>>;
    interceptNavigation: (action: () => void) => void;
    isSupportDrawerOpen: boolean;
    setIsSupportDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
    openSupportDrawer: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
    const [isRealtimeReady, setIsRealtimeReady] = useState(false);
    const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // UI States for intercepting navigation
    const [isDealPopupOpen, setIsDealPopupOpen] = useState(false);
    const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null);

    // Support Drawer State
    const [isSupportDrawerOpen, setIsSupportDrawerOpen] = useState(false);

    // Subscribe to the active conversation through Pusher.
    useEffect(() => {
        if (!activeConversation?._id) return;

        const pusher = getPusherClient();
        if (!pusher) {
            setIsRealtimeReady(false);
            return;
        }

        const channelName = `private-conversation-${activeConversation._id}`;
        const channel = pusher.subscribe(channelName);

        channel.bind('pusher:subscription_succeeded', () => {
            setIsRealtimeReady(true);
        });

        channel.bind('pusher:subscription_error', (error: unknown) => {
            console.error('Pusher subscription error:', error);
            setIsRealtimeReady(false);
        });

        const handleNewMessage = (message: Message) => {
            setMessages((prev) => {
                if (prev.some((existing) => existing._id === message._id)) return prev;
                return [...prev, message];
            });

            setConversations(prev => prev.map(c => {
                if (c._id === message.conversation) {
                    return { ...c, lastMessage: message, updatedAt: message.createdAt };
                }
                return c;
            }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
        };

        channel.bind('new-message', handleNewMessage);
        return () => {
            channel.unbind('new-message', handleNewMessage);
            pusher.unsubscribe(channelName);
            setIsRealtimeReady(false);
        };
    }, [activeConversation?._id]);

    const sendMessage = (content: string, type = 'text') => {
        // ChatWindow posts messages through /api/chat/messages so the server can
        // authenticate, persist, and broadcast through Pusher.
    };

    const openSupportDrawer = async () => {
        console.log('Opening support drawer...');
        try {
            setIsLoading(true);
            const res = await fetch('/api/support/conversation');
            console.log('Support conversation fetch status:', res.status);
            const data = await res.json();
            if (data.conversation) {
                console.log('Support conversation found/created:', data.conversation._id);
                setActiveConversation(data.conversation);
                setIsSupportDrawerOpen(true);
            } else {
                console.error('No conversation returned from support API', data);
            }
        } catch (error) {
            console.error('Failed to open support drawer', error);
        } finally {
            setIsLoading(false);
        }
    };

    const value = {
        isRealtimeReady,
        activeConversation,
        setActiveConversation,
        messages,
        setMessages,
        sendMessage: (content: string, type = 'text') => {
            sendMessage(content, type);
        },
        conversations,
        setConversations,
        isLoading,
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
        },
        isSupportDrawerOpen,
        setIsSupportDrawerOpen,
        openSupportDrawer
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
