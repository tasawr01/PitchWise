'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

const menuItems = [
    { name: 'Overview', href: '/admin/dashboard', icon: '📊' },
    { name: 'User Management', href: '/admin/users', icon: '👥' },
    { name: 'Pitches', href: '/admin/pitches', icon: '📑' },
    { name: 'Funding', href: '/admin/funding', icon: '💸' },
    { name: 'Reports', href: '/admin/reports', icon: '📈' },
    { name: 'Settings', href: '/admin/settings', icon: '⚙️' },
];

export default function AdminSidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
    const pathname = usePathname();

    return (
        <>
            <div
                className={`fixed inset-y-0 left-0 z-30 w-64 bg-[#1e293b] text-white transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static flex-shrink-0 flex flex-col
            ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className="p-6 border-b border-gray-700 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <div className="relative w-8 h-8">
                            <Image src="/assets/footerlogo.png" alt="PitchWise" fill className="object-contain invert brightness-0 saturate-100 invert" sizes="32px" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">ADMIN</span>
                    </div>
                    {/* Close Button Mobile */}
                    <button onClick={onClose} className="md:hidden text-gray-400 hover:text-white">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-1">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={onClose}
                                className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${isActive
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                    }`}
                            >
                                <span className="mr-3 text-lg">{item.icon}</span>
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold">A</div>
                        <div>
                            <p className="text-sm font-medium">Super Admin</p>
                            <p className="text-xs text-gray-400">admin@pitchwise.com</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
