'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import Spinner from '@/components/Spinner';
import { Check, X } from 'lucide-react';

function ResetPasswordContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Password Validation State
    const [validations, setValidations] = useState({
        minLength: false,
        hasUpper: false,
        hasLower: false,
        hasNumber: false,
        hasSpecial: false,
    });

    useEffect(() => {
        setValidations({
            minLength: password.length >= 8,
            hasUpper: /[A-Z]/.test(password),
            hasLower: /[a-z]/.test(password),
            hasNumber: /[0-9]/.test(password),
            hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        });
    }, [password]);

    const isPasswordValid = Object.values(validations).every(Boolean);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (!token) {
            setError('Invalid or missing reset token.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (!isPasswordValid) {
            setError('Please meet all password requirements.');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password, confirmPassword }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Something went wrong');
            }

            setMessage('Password reset successful! Redirecting to login...');

            setTimeout(() => {
                router.push('/login');
            }, 3000);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center font-sans bg-gray-50">
                <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md w-full">
                    <p className="text-red-600 mb-4">Invalid or missing reset token.</p>
                    <Link href="/forgot-password" className="text-[#0B2C4A] font-bold hover:underline">
                        Request a new link
                    </Link>
                </div>
            </div>
        );
    }

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
                            Set New Password
                        </h2>
                        <p className="mt-1 text-sm text-gray-600">
                            Create a strong password for your account.
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
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    New Password
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

                            {/* Password Requirements */}
                            <div className="bg-gray-50 p-3 rounded-md space-y-2 text-xs text-gray-600">
                                <p className="font-semibold text-gray-700">Password must contain:</p>
                                <div className="grid grid-cols-1 gap-1">
                                    <RequirementItem valid={validations.minLength} text="At least 8 characters" />
                                    <RequirementItem valid={validations.hasUpper} text="One uppercase letter" />
                                    <RequirementItem valid={validations.hasLower} text="One lowercase letter" />
                                    <RequirementItem valid={validations.hasNumber} text="One number" />
                                    <RequirementItem valid={validations.hasSpecial} text="One special character" />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                    Confirm Password
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2.5 placeholder-gray-400 shadow-sm focus:border-[#0B2C4A] focus:outline-none focus:ring-[#0B2C4A] sm:text-sm"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={loading || !isPasswordValid}
                                    className="flex w-full justify-center rounded-md border border-transparent bg-[#0B2C4A] py-2.5 px-4 text-sm font-bold text-white shadow-sm hover:bg-[#0B2C4A]/90 focus:outline-none focus:ring-2 focus:ring-[#0B2C4A] focus:ring-offset-2 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                                >
                                    {loading ? (
                                        <div className="flex items-center gap-2">
                                            <Spinner className="w-4 h-4 text-white" />
                                            <span>Reseting...</span>
                                        </div>
                                    ) : (
                                        'Reset Password'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Right Side - Same Premium Background */}
            <div className="hidden lg:block relative w-0 flex-1 overflow-hidden bg-[#0B2C4A]">
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#05090f] via-[#0a1628] to-[#0f1a2e]"></div>
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent"></div>
                    </div>
                </div>

                <div className="absolute inset-0 flex items-center justify-center p-12">
                    <div className="text-center space-y-6">
                        <h1 className="text-5xl font-light text-white leading-tight tracking-tight drop-shadow-2xl">
                            Security First
                        </h1>
                        <p className="text-lg text-white/70 font-light tracking-wide">
                            Setting a new standard for your account security.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function RequirementItem({ valid, text }: { valid: boolean; text: string }) {
    return (
        <div className={`flex items-center gap-2 ${valid ? 'text-green-600' : 'text-gray-500'}`}>
            {valid ? <Check size={14} className="stroke-[3]" /> : <X size={14} />}
            <span>{text}</span>
        </div>
    );
}

export default function ResetPassword() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Spinner /></div>}>
            <ResetPasswordContent />
        </Suspense>
    );
}
