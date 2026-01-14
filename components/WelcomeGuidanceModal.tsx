'use client';

import { useState, useEffect } from 'react';

interface WelcomeGuidanceModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function WelcomeGuidanceModal({ isOpen, onClose }: WelcomeGuidanceModalProps) {
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        if (isOpen) {
            setCurrentStep(0);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const steps = [
        {
            title: "Welcome to PitchWise!",
            description: "Your journey to securing investment starts here. Click Next to take a quick tour and learn how to use PitchWise effectively.",
            icon: (
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6 text-blue-600">
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
            )
        },
        {
            title: "Step 1: Create a Pitch",
            description: "Use our structured Pitch Creator to build a compelling startup profile. You'll need to provide details about your Idea, Business Model, Financials, and upload your Pitch Deck.",
            icon: (
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-6 text-purple-600">
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </div>
            )
        },
        {
            title: "Step 2: Admin Verification",
            description: "Once submitted, your pitch goes to our Admin team for a quality check. We ensure everything looks professional before investors see it. Tracking your status is easy from the Dashboard.",
            icon: (
                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mb-6 text-yellow-600">
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
            )
        },
        {
            title: "Step 3: Get Discovered",
            description: "Approved pitches are showcased to our network of investors. Keep your profile updated and respond quickly to any inquiries to maximize your chances of funding.",
            icon: (
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 text-green-600">
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                </div>
            )
        }
    ];

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            onClose();
        }
    };


    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden relative flex flex-col items-center p-8 text-center animate-scaleIn">

                {/* Steps Config */}
                <div className="absolute top-6 right-6 text-sm font-bold text-gray-300 flex items-center gap-4">
                    <span>{currentStep + 1} / {steps.length}</span>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                        title="Close Guide"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex flex-col items-center mt-4">
                    {steps[currentStep].icon}
                    <h2 className="text-2xl font-extrabold text-[#0B2C4A] mb-4">{steps[currentStep].title}</h2>
                    <p className="text-gray-600 leading-relaxed mb-6">{steps[currentStep].description}</p>
                </div>

                {/* Dots */}
                <div className="flex gap-2 mb-8">
                    {steps.map((_, idx) => (
                        <div
                            key={idx}
                            className={`h-2 rounded-full transition-all duration-300 ${idx === currentStep ? 'w-8 bg-[#0B2C4A]' : 'w-2 bg-gray-200'}`}
                        />
                    ))}
                </div>

                {/* Actions */}
                <div className="w-full flex gap-3">
                    {currentStep > 0 && (
                        <button
                            onClick={() => setCurrentStep(prev => prev - 1)}
                            className="flex-1 px-6 py-3 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            Back
                        </button>
                    )}
                    <button
                        onClick={handleNext}
                        className="flex-1 px-6 py-3 bg-[#0B2C4A] text-white font-bold rounded-xl hover:bg-[#09223a] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                    >
                        {currentStep === steps.length - 1 ? "Let's Get Started!" : "Next"}
                    </button>
                </div>
            </div>
        </div>
    );
}
