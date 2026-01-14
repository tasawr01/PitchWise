'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Spinner from '@/components/Spinner';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Something went wrong');
            }

            setMessage(data.message);
        } catch (err: any) {
            setError(err.message);
        } finally {
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
                            Forgot Password?
                        </h2>
                        <p className="mt-1 text-sm text-gray-600">
                            Enter your email and we'll send you a link to reset your password.
                        </p>
                    </div>

                    <div className="mt-6">
                        {error && (
                            <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-200">
                                {error}
                            </div>
                        )}
                        {message && (
                            <div className="mb-4 bg-green-50 text-green-600 p-3 rounded-md text-sm border border-green-200">
                                {message}
                            </div>
                        )}

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
                                        autoComplete="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2.5 placeholder-gray-400 shadow-sm focus:border-[#0B2C4A] focus:outline-none focus:ring-[#0B2C4A] sm:text-sm transition-colors"
                                        placeholder="Enter your email"
                                    />
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex w-full justify-center rounded-md border border-transparent bg-[#0B2C4A] py-2.5 px-4 text-sm font-bold text-white shadow-sm hover:bg-[#0B2C4A]/90 focus:outline-none focus:ring-2 focus:ring-[#0B2C4A] focus:ring-offset-2 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                                >
                                    {loading ? (
                                        <div className="flex items-center gap-2">
                                            <Spinner className="w-4 h-4 text-white" />
                                            <span>Sending...</span>
                                        </div>
                                    ) : (
                                        'Send Reset Link'
                                    )}
                                </button>
                            </div>

                            <div className="text-center mt-4">
                                <Link
                                    href="/login"
                                    className="font-medium text-sm text-[#0B2C4A] hover:text-[#0B2C4A]/80 hover:underline"
                                >
                                    Back to Sign In
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Right Side - Premium Animated Background (Same as Login) */}
            <div className="hidden lg:block relative w-0 flex-1 overflow-hidden bg-[#0B2C4A]">
                {/* Simplified visual for forgot password to maintain consistency but slightly toned down if desired, 
                    or exact copy of login. Using exact copy for premium feel. */}
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#05090f] via-[#0a1628] to-[#0f1a2e]"></div>
                    <div className="absolute inset-0 opacity-20">
                        {/* Simple pattern */}
                        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent"></div>
                    </div>
                </div>

                <div className="absolute inset-0 flex items-center justify-center p-12">
                    <div className="text-center space-y-6">
                        <h1 className="text-5xl font-light text-white leading-tight tracking-tight drop-shadow-2xl">
                            Account Recovery
                        </h1>
                        <p className="text-lg text-white/70 font-light tracking-wide">
                            Securely restore access to your account.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
