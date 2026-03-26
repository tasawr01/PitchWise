"use client";

import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface TalkNowButtonProps {
    pitchId: string;
    entrepreneurId: string;
    investorId: string;
}

export default function TalkNowButton({ pitchId, entrepreneurId, investorId }: TalkNowButtonProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleTalkNow = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/chat/conversations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pitchId,
                    participantId: entrepreneurId,
                    participantModel: 'Entrepreneur'
                })
            });
            const data = await res.json();

            if (data.conversation) {
                router.push(`/chat?conversationId=${data.conversation._id}`);
            } else {
                console.error('Failed to create conversation', data.error);
                // Optionally show error toast
            }
        } catch (error) {
            console.error('Error starting chat:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleTalkNow}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-[#0B2C4A] text-white rounded-lg font-semibold hover:bg-[#154670] transition-colors disabled:opacity-50"
        >
            <MessageCircle className="w-5 h-5" />
            {loading ? 'Starting...' : 'Talk Now'}
        </button>
    );
}
