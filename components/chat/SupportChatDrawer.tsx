'use client';

import React from 'react';
import { useChat } from '@/context/ChatContext';
import { X, Send } from 'lucide-react';
import ChatWindow from './ChatWindow';

export default function SupportChatDrawer({ userId, userRole }: { userId: string, userRole: string }) {
    const { isSupportDrawerOpen, setIsSupportDrawerOpen } = useChat();

    return (
        <>
            {/* Backdrop */}
            {isSupportDrawerOpen && (
                <div 
                    className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-[998] transition-opacity duration-300"
                    onClick={() => setIsSupportDrawerOpen(false)}
                />
            )}

            {/* Side Drawer */}
            <div className={`fixed top-0 right-0 h-screen w-full sm:w-[450px] bg-white shadow-2xl z-[999] transform transition-transform duration-500 ease-in-out flex flex-col ${isSupportDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-[#1e293b] text-white">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold text-xs ring-2 ring-blue-400">
                            P
                        </div>
                        <div>
                            <h3 className="font-bold text-sm">PitchWise Support</h3>
                            <p className="text-[10px] text-blue-200">Usually responds in minutes</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setIsSupportDrawerOpen(false)}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {/* Chat Contents */}
                <div className="flex-1 overflow-hidden relative">
                    {isSupportDrawerOpen && (
                        <ChatWindow 
                            userId={userId} 
                            userRole={userRole} 
                            hideHeader={true} 
                        />
                    )}
                </div>
            </div>
        </>
    );
}
