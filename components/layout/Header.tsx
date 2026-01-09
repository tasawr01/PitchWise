"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navigation = [
        { name: 'Explore', href: '#' },
        { name: 'Community', href: '#' },
        { name: 'Blog', href: '#' },
        { name: 'Contact Us', href: '#' },
    ];

    return (
        <header className="relative z-50 bg-primary border-b border-white/10">
            <nav className="container mx-auto flex items-center justify-between py-2 px-4 lg:px-8" aria-label="Global">
                <div className="flex lg:flex-1">
                    <Link href="/" className="-m-1.5 p-1.5 flex flex-col items-center gap-1">
                        {/* Logo Image */}
                        <div className="relative w-24 h-24">
                            <Image
                                src="/assets/logo.png"
                                alt="PitchWise Logo"
                                fill
                                className="object-contain"
                                sizes="96px"
                                priority
                            />
                        </div>
                    </Link>
                </div>
                <div className="flex lg:hidden">
                    <button
                        type="button"
                        className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-white"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        <span className="sr-only">Open main menu</span>
                        {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
                <div className="hidden lg:flex lg:gap-x-8 items-center">
                    {navigation.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="text-sm font-medium leading-6 text-white hover:text-accent-blue transition-colors"
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>
                <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-4 items-center">
                    <Link
                        href="/login"
                        className="text-sm font-semibold leading-6 text-white hover:bg-white/10 px-6 py-2 transition-all border border-white/30 rounded-md"
                    >
                        Login
                    </Link>
                    <Link
                        href="/signup"
                        className="rounded-md bg-white px-6 py-2 text-sm font-semibold text-primary shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-all"
                    >
                        Get Started
                    </Link>
                </div>
            </nav>

            {/* Mobile menu */}
            {isMenuOpen && (
                <div className="lg:hidden">
                    <div className="fixed inset-0 z-50" />
                    <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-primary px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-white/10 shadow-xl">
                        <div className="flex items-center justify-between">
                            <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-2">
                                <div className="relative w-8 h-8">
                                    <Image
                                        src="/assets/logo.png"
                                        alt="PitchWise Logo"
                                        fill
                                        className="object-contain"
                                        sizes="32px"
                                        priority
                                    />
                                </div>
                            </Link>
                            <button
                                type="button"
                                className="-m-2.5 rounded-md p-2.5 text-white"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <span className="sr-only">Close menu</span>
                                <X className="h-6 w-6" aria-hidden="true" />
                            </button>
                        </div>
                        <div className="mt-6 flow-root">
                            <div className="-my-6 divide-y divide-white/10">
                                <div className="space-y-2 py-6">
                                    {navigation.map((item) => (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-white hover:bg-white/10"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            {item.name}
                                        </Link>
                                    ))}
                                </div>
                                <div className="py-6 space-y-4">
                                    <Link
                                        href="/login"
                                        className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-white hover:bg-white/10"
                                    >
                                        Log In
                                    </Link>
                                    <Link
                                        href="/signup"
                                        className="block w-full rounded-md bg-white px-3 py-2.5 text-center text-base font-semibold leading-7 text-primary hover:bg-gray-100"
                                    >
                                        Get Started
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
