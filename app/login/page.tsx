'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Spinner from '@/components/Spinner';

export default function Login() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Login failed');
            }

            // Redirect based on role
            if (data.role === 'entrepreneur') {
                router.push('/entrepreneur_dashboard');
            } else if (data.role === 'investor') {
                router.push('/investor_dashboard');
            } else {
                router.push('/');
            }

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
                            Welcome back
                        </h2>
                        <p className="mt-1 text-sm text-gray-600">
                            Please enter your details to sign in.
                        </p>
                    </div>

                    <div className="mt-6">
                        {error && (
                            <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-md text-sm">
                                {error}
                            </div>
                        )}
                        <form onSubmit={handleLogin} className="mt-6 space-y-4">
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
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    Password
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="current-password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2.5 placeholder-gray-400 shadow-sm focus:border-[#0B2C4A] focus:outline-none focus:ring-[#0B2C4A] sm:text-sm transition-colors"
                                        placeholder="Enter your password"
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="text-red-500 text-sm bg-red-50 p-2 rounded border border-red-200">
                                    {error}
                                </div>
                            )}

                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input
                                        id="remember-me"
                                        name="remember-me"
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-gray-300 text-[#0B2C4A] focus:ring-[#0B2C4A]"
                                    />
                                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                                        Remember me
                                    </label>
                                </div>

                                <div className="text-sm">
                                    <a href="#" className="font-medium text-[#0B2C4A] hover:text-[#0B2C4A]/80">
                                        Forgot your password?
                                    </a>
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
                                            <span>Signing in...</span>
                                        </div>
                                    ) : (
                                        'Sign in'
                                    )}
                                </button>
                            </div>
                        </form>

                        <p className="mt-8 text-center text-sm text-gray-600">
                            Don't have an account?{' '}
                            <Link href="/signup" className="font-medium text-[#0B2C4A] hover:text-[#0B2C4A]/80">
                                Sign up for free
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Side - Image/Branding */}
            <div className="hidden lg:block relative w-0 flex-1">
                <Image
                    className="absolute inset-0 h-full w-full object-cover"
                    src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1932&q=80"
                    alt="Team collaboration"
                    fill
                    priority
                />
                <div className="absolute inset-0 bg-[#0B2C4A]/40 mix-blend-multiply" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B2C4A]/90 via-[#0B2C4A]/20 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-12 text-white">
                    <h2 className="text-4xl font-bold mb-4 font-heading">Connect. Pitch. Grow.</h2>
                    <p className="text-lg text-gray-200 max-w-lg leading-relaxed">
                        "PitchWise has completely transformed how we connect with investors. The platform is intuitive, professional, and effective."
                    </p>
                </div>
            </div>
        </div>
    );
}
