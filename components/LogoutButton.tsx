'use client';

import { useRouter } from 'next/navigation';

export default function LogoutButton() {
    const router = useRouter();

    const handleLogout = async () => {
        try {
            // Call the logout API to clear secure httpOnly cookies
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            // Redirect to main landing page
            router.push('/login');
        }
    };

    return (
        <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-500 hover:text-red-600 transition-colors text-sm font-medium px-3 py-2 rounded-md hover:bg-red-50"
            title="Log Out"
        >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="hidden sm:inline">Logout</span>
        </button>
    );
}
