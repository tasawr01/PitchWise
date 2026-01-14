'use client';
// Force rebuild

import { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import Spinner from '@/components/Spinner';

function AdminLoginContent() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Login failed');
                setLoading(false);
                return;
            }

            // Redirect to protected dashboard or return to saved URL
            const redirectUrl = searchParams.get('redirect');
            if (redirectUrl && redirectUrl.startsWith('/')) {
                router.push(redirectUrl);
            } else {
                router.push('/admin/dashboard');
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex font-sans">
            {/* Left Side - Form */}
            <div className="flex-1 flex flex-col justify-center py-6 px-4 sm:px-6 lg:flex-none lg:px-12 xl:px-16 bg-white">
                <div className="mx-auto w-full max-w-sm lg:w-80">
                    <div className="mb-6">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <div className="relative w-16 h-16">
                                <Image
                                    src="/assets/footerlogo.png"
                                    alt="PitchWise Logo"
                                    fill
                                    className="object-contain"
                                    sizes="64px"
                                    priority
                                />
                            </div>
                        </Link>
                        <h2 className="text-2xl font-bold tracking-tight text-[#0B2C4A]">
                            Admin Login
                        </h2>
                        <p className="mt-1 text-sm text-gray-600">
                            Restricted access for administrators.
                        </p>
                    </div>

                    <div className="mt-6">
                        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Email address
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2.5 placeholder-gray-400 shadow-sm focus:border-[#0B2C4A] focus:outline-none focus:ring-[#0B2C4A] sm:text-sm"
                                        placeholder="admin@example.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    Password
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2.5 placeholder-gray-400 shadow-sm focus:border-[#0B2C4A] focus:outline-none focus:ring-[#0B2C4A] sm:text-sm"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="text-red-500 text-sm bg-red-50 p-2 rounded">
                                    {error}
                                </div>
                            )}

                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex w-full justify-center rounded-md border border-transparent bg-[#0B2C4A] py-2.5 px-4 text-sm font-bold text-white shadow-sm hover:bg-[#0B2C4A]/90 focus:outline-none focus:ring-2 focus:ring-[#0B2C4A] focus:ring-offset-2 transition-all disabled:opacity-50"
                                >
                                    {loading ? (
                                        <div className="flex items-center gap-2">
                                            <Spinner className="w-4 h-4 text-white" />
                                            <span>Signing in...</span>
                                        </div>
                                    ) : (
                                        'Sign in'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Right Side - Branding */}
            <div className="hidden lg:block relative w-0 flex-1 bg-[#0B2C4A]">
                <div className="absolute inset-0 flex items-center justify-center text-white">
                    <div className="text-center p-8">
                        <h1 className="text-4xl font-bold mb-4">Admin Console</h1>
                        <p className="max-w-md mx-auto text-gray-300">
                            Secure access for managing PitchWise users and content.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function AdminLogin() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Spinner /></div>}>
            <AdminLoginContent />
        </Suspense>
    );
}
