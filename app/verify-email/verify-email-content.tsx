'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'already-verified'>('loading');
    const [message, setMessage] = useState('');
    const [userName, setUserName] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [resending, setResending] = useState(false);

    useEffect(() => {
        const token = searchParams.get('token');

        if (!token) {
            setStatus('error');
            setMessage('No verification token provided.');
            return;
        }

        verifyEmail(token);
    }, [searchParams]);

    const verifyEmail = async (token: string) => {
        try {
            const response = await fetch(`/api/auth/verify-email?token=${token}`);
            const data = await response.json();

            if (response.ok) {
                if (data.alreadyVerified) {
                    setStatus('already-verified');
                    setMessage(data.message);
                } else {
                    setStatus('success');
                    setMessage(data.message);
                    setUserName(data.userName);
                    setShowModal(true);
                }
            } else {
                setStatus('error');
                setMessage(data.error || 'Verification failed');
            }
        } catch (error) {
            setStatus('error');
            setMessage('An error occurred during verification');
        }
    };

    const handleResendEmail = async () => {
        setResending(true);
        try {
            const response = await fetch('/api/auth/send-verification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: '' }),
            });

            if (response.ok) {
                setMessage('Verification email resent! Please check your inbox.');
            }
        } catch (error) {
            setMessage('Failed to resend email. Please try again.');
        }
        setResending(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <AnimatePresence>
                    {status === 'loading' && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-2xl shadow-xl p-8 text-center"
                        >
                            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#0B2C4A] mx-auto"></div>
                            <p className="mt-6 text-gray-600 text-lg">Verifying your email...</p>
                        </motion.div>
                    )}

                    {status === 'success' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-2xl shadow-xl p-8"
                        >
                            <div className="text-center">
                                <div className="mx-auto w-20 h-20 bg-[#e6f0fa] rounded-full flex items-center justify-center mb-6">
                                    <svg className="w-10 h-10 text-[#0B2C4A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-4">Email Verified!</h1>
                                <p className="text-gray-600 mb-6">{message}</p>

                                <div className="bg-blue-50 border-l-4 border-[#0B2C4A] p-4 mb-6">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-[#0B2C4A]" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-[#0B2C4A]">Pending Admin Review</h3>
                                            <div className="mt-2 text-sm text-blue-900">
                                                <p>Your profile is now under review. You will receive an email notification within 1-2 business days.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => router.push('/login')}
                                    className="w-full bg-[#0B2C4A] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#0B2C4A]/90 transition-all shadow-md"
                                >
                                    Go to Login
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {status === 'already-verified' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-2xl shadow-xl p-8 text-center"
                        >
                            <div className="mx-auto w-20 h-20 bg-[#e6f0fa] rounded-full flex items-center justify-center mb-6">
                                <svg className="w-10 h-10 text-[#0B2C4A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-4">Already Verified</h1>
                            <p className="text-gray-600 mb-6">{message}</p>
                            <button
                                onClick={() => router.push('/login')}
                                className="bg-[#0B2C4A] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#0B2C4A]/90 transition-colors"
                            >
                                Go to Login
                            </button>
                        </motion.div>
                    )}

                    {status === 'error' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-2xl shadow-xl p-8 text-center"
                        >
                            <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-4">Verification Failed</h1>
                            <p className="text-red-600 mb-6">{message}</p>

                            <div className="space-y-3">
                                <p className="text-sm text-gray-600">
                                    The verification link may have expired or is invalid.
                                </p>
                                <button
                                    onClick={() => router.push('/login')}
                                    className="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                                >
                                    Back to Login
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Success Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="text-center">
                                <div className="mx-auto w-24 h-24 bg-[#0B2C4A] rounded-full flex items-center justify-center mb-6 shadow-lg">
                                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome, {userName}!</h2>
                                <p className="text-gray-600 mb-6">Your email has been successfully verified.</p>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="bg-[#0B2C4A] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#0B2C4A]/90 transition-colors shadow-md"
                                >
                                    Continue
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
