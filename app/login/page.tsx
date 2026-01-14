'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import Spinner from '@/components/Spinner';

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
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

            // Redirect based on role or return to saved URL
            const redirectUrl = searchParams.get('redirect');
            if (redirectUrl && redirectUrl.startsWith('/')) {
                router.push(redirectUrl);
            } else {
                if (data.role === 'entrepreneur') {
                    router.push('/entrepreneur_dashboard');
                } else if (data.role === 'investor') {
                    router.push('/investor_dashboard');
                } else {
                    router.push('/');
                }
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
                                    <Link href="/forgot-password" className="font-medium text-[#0B2C4A] hover:text-[#0B2C4A]/80">
                                        Forgot your password?
                                    </Link>
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

            {/* Right Side - Premium Animated Background */}
            <div className="hidden lg:block relative w-0 flex-1 overflow-hidden">
                {/* Multi-layer Mesh Gradient Background */}
                <div className="absolute inset-0">
                    {/* Base gradient layer - Darker navy tones */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#05090f] via-[#0a1628] to-[#0f1a2e]"></div>

                    {/* Animated mesh gradient overlays */}
                    <div className="absolute inset-0 opacity-70">
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/20 via-transparent to-transparent animate-mesh-1"></div>
                        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-cyan-400/15 via-transparent to-transparent animate-mesh-2"></div>
                        <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-tr from-indigo-500/20 via-transparent to-transparent animate-mesh-3"></div>
                    </div>

                    {/* Floating gradient orbs with 3D effect */}
                    <div className="absolute inset-0">
                        <div className="absolute top-[10%] right-[15%] w-[450px] h-[450px] rounded-full bg-gradient-to-br from-blue-400/30 via-cyan-400/20 to-transparent blur-3xl animate-float-3d-1"></div>
                        <div className="absolute bottom-[15%] left-[10%] w-[550px] h-[550px] rounded-full bg-gradient-to-tr from-purple-400/25 via-blue-500/20 to-transparent blur-3xl animate-float-3d-2"></div>
                        <div className="absolute top-[45%] left-[40%] w-[350px] h-[350px] rounded-full bg-gradient-to-br from-indigo-400/30 via-cyan-300/15 to-transparent blur-[100px] animate-float-3d-3"></div>
                    </div>
                </div>

                {/* Floating 3D geometric shapes */}
                <div className="absolute inset-0 pointer-events-none">
                    {/* Hexagon */}
                    <div className="absolute top-[20%] right-[25%] w-20 h-20 animate-float-rotate-1">
                        <div className="w-full h-full bg-gradient-to-br from-cyan-400/20 to-blue-500/20 backdrop-blur-sm border border-white/10 rotate-45 rounded-lg shadow-2xl"></div>
                    </div>
                    {/* Circle */}
                    <div className="absolute bottom-[30%] right-[15%] w-16 h-16 animate-float-rotate-2">
                        <div className="w-full h-full bg-gradient-to-br from-blue-400/25 to-indigo-500/25 backdrop-blur-sm border border-white/10 rounded-full shadow-2xl"></div>
                    </div>
                    {/* Triangle */}
                    <div className="absolute top-[60%] right-[35%] w-14 h-14 animate-float-rotate-3">
                        <div className="w-full h-full bg-gradient-to-br from-purple-400/20 to-cyan-400/20 backdrop-blur-sm border border-white/10 rotate-12 rounded-md shadow-2xl"></div>
                    </div>
                    {/* Small accent shapes */}
                    <div className="absolute top-[35%] right-[8%] w-8 h-8 animate-float-slow">
                        <div className="w-full h-full bg-gradient-to-br from-cyan-300/30 to-blue-400/30 backdrop-blur-sm border border-white/20 rounded-full shadow-lg"></div>
                    </div>
                    <div className="absolute bottom-[50%] right-[45%] w-6 h-6 animate-float-delayed">
                        <div className="w-full h-full bg-gradient-to-br from-indigo-300/25 to-purple-400/25 backdrop-blur-sm border border-white/15 rounded-sm shadow-lg"></div>
                    </div>
                </div>

                {/* Particle effect overlay */}
                <div className="absolute inset-0 opacity-30">
                    {[...Array(20)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-1 h-1 bg-white rounded-full animate-particle"
                            style={{
                                left: `${(i * 13) % 100}%`,
                                top: `${(i * 17) % 100}%`,
                                animationDelay: `${i * 0.3}s`,
                                animationDuration: `${8 + (i % 4) * 2}s`
                            }}
                        ></div>
                    ))}
                </div>

                {/* Advanced grid pattern */}
                <div className="absolute inset-0 opacity-[0.07]" style={{
                    backgroundImage: `
                        linear-gradient(to right, white 1px, transparent 1px),
                        linear-gradient(to bottom, white 1px, transparent 1px)
                    `,
                    backgroundSize: '64px 64px'
                }}></div>

                {/* Minimalist Premium Content - Center Positioned */}
                <div className="absolute inset-0 flex items-center justify-center p-12">
                    <div className="max-w-3xl w-full animate-fade-in-up">
                        {/* Clean Headline */}
                        <div className="text-center space-y-6">
                            <h1 className="text-7xl font-light text-white leading-tight tracking-tight drop-shadow-2xl" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                                Welcome Back to
                                <br />
                                <span className="font-bold bg-gradient-to-r from-cyan-200 via-blue-200 to-indigo-200 bg-clip-text text-transparent">
                                    PitchWise
                                </span>
                            </h1>
                            <p className="text-lg text-white/70 font-light tracking-wide drop-shadow" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                                Continue building meaningful connections
                            </p>
                        </div>


                    </div>
                </div>

                {/* Premium CSS Animations */}
                <style jsx>{`
                    @keyframes mesh-1 {
                        0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
                        33% { transform: translate(5%, -5%) scale(1.1) rotate(5deg); }
                        66% { transform: translate(-5%, 5%) scale(0.9) rotate(-5deg); }
                    }
                    @keyframes mesh-2 {
                        0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
                        33% { transform: translate(-8%, 8%) scale(1.15) rotate(-8deg); }
                        66% { transform: translate(8%, -8%) scale(0.85) rotate(8deg); }
                    }
                    @keyframes mesh-3 {
                        0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
                        50% { transform: translate(10%, -10%) scale(1.2) rotate(10deg); }
                    }
                    @keyframes float-3d-1 {
                        0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
                        33% { transform: translate3d(40px, -60px, 30px) scale(1.15); }
                        66% { transform: translate3d(-30px, 40px, -20px) scale(0.9); }
                    }
                    @keyframes float-3d-2 {
                        0%, 100% { transform: translate3d(0, 0, 0) scale(1) rotate(0deg); }
                        33% { transform: translate3d(-50px, 50px, 40px) scale(0.9) rotate(5deg); }
                        66% { transform: translate3d(40px, -40px, -30px) scale(1.1) rotate(-5deg); }
                    }
                    @keyframes float-3d-3 {
                        0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
                        50% { transform: translate3d(20px, -30px, 50px) scale(1.2); }
                    }
                    @keyframes float-rotate-1 {
                        0%, 100% { transform: translate(0, 0) rotate(0deg); }
                        33% { transform: translate(20px, -30px) rotate(120deg); }
                        66% { transform: translate(-15px, 20px) rotate(240deg); }
                    }
                    @keyframes float-rotate-2 {
                        0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }
                        50% { transform: translate(-25px, 30px) rotate(180deg) scale(1.2); }
                    }
                    @keyframes float-rotate-3 {
                        0%, 100% { transform: translate(0, 0) rotate(0deg); }
                        33% { transform: translate(15px, 25px) rotate(-90deg); }
                        66% { transform: translate(-20px, -15px) rotate(-180deg); }
                    }
                    @keyframes float-slow {
                        0%, 100% { transform: translateY(0px); }
                        50% { transform: translateY(-20px); }
                    }
                    @keyframes float-delayed {
                        0%, 100% { transform: translateY(0px) rotate(0deg); }
                        50% { transform: translateY(-15px) rotate(180deg); }
                    }
                    @keyframes particle {
                        0% { transform: translateY(0) scale(0); opacity: 0; }
                        10% { opacity: 0.6; }
                        90% { opacity: 0.3; }
                        100% { transform: translateY(-100vh) scale(1); opacity: 0; }
                    }
                    @keyframes spin-slow {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                    @keyframes fade-in-up {
                        from { opacity: 0; transform: translateY(40px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    .animate-mesh-1 { animation: mesh-1 25s ease-in-out infinite; }
                    .animate-mesh-2 { animation: mesh-2 30s ease-in-out infinite; }
                    .animate-mesh-3 { animation: mesh-3 20s ease-in-out infinite; }
                    .animate-float-3d-1 { animation: float-3d-1 28s ease-in-out infinite; }
                    .animate-float-3d-2 { animation: float-3d-2 35s ease-in-out infinite; }
                    .animate-float-3d-3 { animation: float-3d-3 22s ease-in-out infinite; }
                    .animate-float-rotate-1 { animation: float-rotate-1 20s ease-in-out infinite; }
                    .animate-float-rotate-2 { animation: float-rotate-2 25s ease-in-out infinite; }
                    .animate-float-rotate-3 { animation: float-rotate-3 18s ease-in-out infinite; }
                    .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
                    .animate-float-delayed { animation: float-delayed 10s ease-in-out infinite; }
                    .animate-particle { animation: particle linear infinite; }
                    .animate-spin-slow { animation: spin-slow 8s linear infinite; }
                    .animate-fade-in-up { animation: fade-in-up 1s ease-out; }
                `}</style>
            </div>
        </div>
    );
}

export default function Login() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Spinner /></div>}>
            <LoginContent />
        </Suspense>
    );
}
