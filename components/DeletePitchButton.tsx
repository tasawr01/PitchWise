'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function DeletePitchButton({ pitchId, className }: { pitchId: string, className?: string }) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async (e: React.MouseEvent) => {
        // Prevent clicking the card link if customized
        e.preventDefault();
        e.stopPropagation();

        if (!confirm('Are you sure you want to delete this pitch? This action cannot be undone.')) return;

        setIsDeleting(true);
        try {
            const res = await fetch(`/api/pitches/${pitchId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                router.refresh(); // Refresh server components
                // If we are in a pure client list (like admin), we might need a callback, 
                // but router.refresh works well for hybrid
            } else {
                alert('Failed to delete pitch');
                setIsDeleting(false);
            }
        } catch (error) {
            console.error(error);
            setIsDeleting(false);
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            className={`flex items-center justify-center p-2 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors ${className}`}
            title="Delete Pitch"
        >
            {isDeleting ? (
                <span className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></span>
            ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
            )}
        </button>
    );
}
