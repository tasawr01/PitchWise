'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import NotificationBell from './NotificationBell';

interface NavbarProps {
    title: string;
    profilePhoto?: string;
}

export default function DashboardNavbar({ title, profilePhoto }: NavbarProps) {
    const router = useRouter();

    const handleLogout = () => {
        document.cookie = 'token=; Max-Age=0; path=/;';
        document.cookie = 'userRole=; Max-Age=0; path=/;';
        router.push('/');
    };

    return (
        <nav className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
            <div className="flex items-center gap-2">
                <div className="relative w-10 h-10">
                    <Image src="/assets/footerlogo.png" alt="Logo" fill className="object-contain" sizes="40px" priority />
                </div>
                <span className="font-bold text-xl text-[#0B2C4A]">{title}</span>
            </div>
            <div className="flex items-center gap-4">
                <NotificationBell />
                {profilePhoto && (
                    <div className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-200">
                        <Image src={profilePhoto} alt="Profile" fill className="object-cover" sizes="32px" />
                    </div>
                )}
                <button onClick={handleLogout} className="text-red-600 hover:text-red-800 font-medium text-sm">
                    Logout
                </button>
            </div>
        </nav>
    );
}
