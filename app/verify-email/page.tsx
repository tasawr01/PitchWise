'use client';

import { Suspense } from 'react';
import VerifyEmailContent from './verify-email-content';

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="text-lg">Loading...</div></div>}>
            <VerifyEmailContent />
        </Suspense>
    );
}
