'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

type Role = 'entrepreneur' | 'investor' | '';
type DocumentType = 'cnic' | 'passport' | '';

const COUNTRY_CODES: Record<string, { code: string, label: string, format: RegExp, mask: (val: string) => string, maxLength: number }> = {
    PK: {
        code: '+92',
        label: 'Pakistan',
        format: /^\+92 \d{3} \d{7}$/,
        maxLength: 12, // 2 (92) + 3 + 7 = 12 digits
        mask: (val) => {
            // +92 300 1234567
            let formatted = '+92';
            if (val.length > 2) formatted += ' ' + val.substring(2, 5);
            if (val.length > 5) formatted += ' ' + val.substring(5);
            return formatted;
        }
    },
    US: {
        code: '+1',
        label: 'United States',
        format: /^\+1 \d{3} \d{3} \d{4}$/,
        maxLength: 11, // 1 (1) + 3 + 3 + 4 = 11 digits
        mask: (val) => {
            // +1 123 456 7890
            let formatted = '+1';
            if (val.length > 1) formatted += ' ' + val.substring(1, 4);
            if (val.length > 4) formatted += ' ' + val.substring(4, 7);
            if (val.length > 7) formatted += ' ' + val.substring(7);
            return formatted;
        }
    },
    UK: {
        code: '+44',
        label: 'United Kingdom',
        format: /^\+44 \d{4} \d{6}$/,
        maxLength: 12, // 44 + 4 + 6 = 12? UK mobile usually 07xxx xxxxxx (11 digits). Int: +44 7xxx xxxxxx (12 digits including 44)
        mask: (val) => {
            // +44 7911 123456
            let formatted = '+44';
            if (val.length > 2) formatted += ' ' + val.substring(2, 6);
            if (val.length > 6) formatted += ' ' + val.substring(6);
            return formatted;
        }
    },
    CA: {
        code: '+1',
        label: 'Canada',
        format: /^\+1 \d{3} \d{3} \d{4}$/,
        maxLength: 11,
        mask: (val) => {
            let formatted = '+1';
            if (val.length > 1) formatted += ' ' + val.substring(1, 4);
            if (val.length > 4) formatted += ' ' + val.substring(4, 7);
            if (val.length > 7) formatted += ' ' + val.substring(7);
            return formatted;
        }
    },
    AU: {
        code: '+61',
        label: 'Australia',
        format: /^\+61 \d{3} \d{3} \d{3}$/,
        maxLength: 11, // 61 (2) + 9 = 11
        mask: (val) => {
            // +61 412 345 678
            let formatted = '+61';
            if (val.length > 2) formatted += ' ' + val.substring(2, 5);
            if (val.length > 5) formatted += ' ' + val.substring(5, 8);
            if (val.length > 8) formatted += ' ' + val.substring(8);
            return formatted;
        }
    },
    AE: {
        code: '+971',
        label: 'UAE',
        format: /^\+971 \d{2} \d{3} \d{4}$/, // +971 5x xxx xxxx
        maxLength: 12, // 971 (3) + 9 = 12
        mask: (val) => {
            // +971 50 123 4567
            let formatted = '+971';
            if (val.length > 3) formatted += ' ' + val.substring(3, 5);
            if (val.length > 5) formatted += ' ' + val.substring(5, 8);
            if (val.length > 8) formatted += ' ' + val.substring(8);
            return formatted;
        }
    }
};

const PASSPORT_FORMATS: Record<string, { label: string, format: RegExp, placeholder: string, error: string, maxLength: number, inputType: 'numeric' | 'alphanumeric' }> = {
    pakistan: {
        label: 'Pakistan',
        format: /^[A-Z]{2}\d{7}$/,
        placeholder: 'AB1234567',
        error: 'Format must be 2 letters followed by 7 digits (e.g., AB1234567)',
        maxLength: 9,
        inputType: 'alphanumeric'
    },
    usa: {
        label: 'United States',
        format: /^\d{9}$|^[A-Z]\d{8}$/,
        placeholder: '123456789 or A12345678',
        error: 'Format must be 9 digits or 1 letter followed by 8 digits',
        maxLength: 9,
        inputType: 'alphanumeric'
    },
    uk: {
        label: 'United Kingdom',
        format: /^\d{9}$/,
        placeholder: '123456789',
        error: 'Format must be exactly 9 digits',
        maxLength: 9,
        inputType: 'numeric'
    },
    canada: {
        label: 'Canada',
        format: /^[A-Z]{2}\d{6}$/,
        placeholder: 'AB123456',
        error: 'Format must be 2 letters followed by 6 digits',
        maxLength: 8,
        inputType: 'alphanumeric'
    },
    australia: {
        label: 'Australia',
        format: /^[A-Z]{1,2}\d{7}$/,
        placeholder: 'A1234567',
        error: 'Format must be 1 or 2 letters followed by 7 digits',
        maxLength: 9,
        inputType: 'alphanumeric'
    },
    uae: {
        label: 'United Arab Emirates',
        format: /^[A-Z0-9]{3,15}$/,
        placeholder: 'A1234567',
        error: 'Format must be alphanumeric',
        maxLength: 15,
        inputType: 'alphanumeric'
    }
};

interface FormData {
    // Step 1
    profilePhoto: File | null;
    fullName: string;
    email: string;
    phoneCountry: string;
    phone: string;
    password: string;
    password: string;
    confirmPassword: string;
    role: Role;

    // Step 2
    documentType: DocumentType;
    cnicNumber: string;
    cnicFront: File | null;
    cnicBack: File | null;
    passportNumber: string;
    issuingCountry: string;
    expiryDate: string;
    passportScan: File | null;

    // Step 3 - Entrepreneur
    startupName: string;
    yourRole: string;
    startupCategory: string;
    cityOfOperation: string;
    howDidYouHear: string;
    ideaSafetyPolicy: boolean;

    // Step 3 - Investor
    investorType: string;
    investmentMin: string;
    investmentMax: string;
    industryPreferences: string[];
    cityCountry: string;
    organizationName: string;

    // Step 4
    termsAccepted: boolean;
    privacyAccepted: boolean;
    verificationConsent: boolean;
}

export default function Signup() {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<FormData>({
        profilePhoto: null,
        fullName: '',
        email: '',
        phone: '',
        phoneCountry: 'PK',
        password: '',
        confirmPassword: '',
        role: '',
        documentType: '',
        cnicNumber: '',
        cnicFront: null,
        cnicBack: null,
        passportNumber: '',
        issuingCountry: '',
        expiryDate: '',
        passportScan: null,
        startupName: '',
        yourRole: '',
        startupCategory: '',
        cityOfOperation: '',
        howDidYouHear: '',
        ideaSafetyPolicy: false,
        investorType: '',
        investmentMin: '',
        investmentMax: '',
        industryPreferences: [],
        cityCountry: '',
        organizationName: '',
        termsAccepted: false,
        privacyAccepted: false,
        verificationConsent: false,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    useEffect(() => {
        if (formData.profilePhoto) {
            const objectUrl = URL.createObjectURL(formData.profilePhoto);
            setPhotoPreview(objectUrl);
            return () => URL.revokeObjectURL(objectUrl);
        } else {
            setPhotoPreview(null);
        }
    }, [formData.profilePhoto]);

    const updateFormData = (field: keyof FormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const validateStep1 = () => {
        const newErrors: Record<string, string> = {};

        // Name validation: min 3 chars, no numbers
        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Full name is required';
        } else if (formData.fullName.trim().length < 3) {
            newErrors.fullName = 'Name must be at least 3 characters';
        } else if (/\d/.test(formData.fullName)) {
            newErrors.fullName = 'Name should not contain numbers';
        }

        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';

        // Phone validation: +92 300 1234567
        // Phone validation based on country
        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else {
            const country = COUNTRY_CODES[formData.phoneCountry];
            if (country) {
                if (!country.format.test(formData.phone)) {
                    newErrors.phone = `Invalid format for ${country.label}. Check spacing or length.`;
                }
            } else {
                if (formData.phone.length < 5) newErrors.phone = 'Invalid phone number';
            }
        }

        if (!formData.password) newErrors.password = 'Password is required';
        else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
        else {
            // Password should not contain any part of the name
            const nameParts = formData.fullName.toLowerCase().split(/\s+/).filter(part => part.length > 2);
            const passwordLower = formData.password.toLowerCase();
            const containsNamePart = nameParts.some(part => passwordLower.includes(part));
            if (containsNamePart) {
                newErrors.password = 'Password should not contain your name';
            }
        }

        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
        if (!formData.role) newErrors.role = 'Please select a role';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.documentType) newErrors.documentType = 'Please select a document type';

        if (formData.documentType === 'cnic') {
            if (!formData.cnicNumber.trim()) {
                newErrors.cnicNumber = 'CNIC number is required';
            } else if (!/^\d{5}-\d{7}-\d{1}$/.test(formData.cnicNumber)) {
                newErrors.cnicNumber = 'CNIC format must be: 12345-1234567-1';
            }
            if (!formData.cnicFront) newErrors.cnicFront = 'CNIC front image is required';
            if (!formData.cnicBack) newErrors.cnicBack = 'CNIC back image is required';
        }

        if (formData.documentType === 'passport') {
            if (!formData.issuingCountry) newErrors.issuingCountry = 'Issuing country is required';

            if (!formData.passportNumber.trim()) {
                newErrors.passportNumber = 'Passport number is required';
            } else if (formData.issuingCountry) {
                const countryRule = PASSPORT_FORMATS[formData.issuingCountry];
                if (countryRule && !countryRule.format.test(formData.passportNumber.replace(/\s/g, '').toUpperCase())) {
                    newErrors.passportNumber = countryRule.error;
                }
            }

            if (!formData.expiryDate) newErrors.expiryDate = 'Expiry date is required';
            if (!formData.passportScan) newErrors.passportScan = 'Passport scan is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep3 = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.termsAccepted) newErrors.termsAccepted = 'You must accept the Terms & Conditions';
        if (!formData.privacyAccepted) newErrors.privacyAccepted = 'You must accept the Privacy Policy';
        if (!formData.verificationConsent) newErrors.verificationConsent = 'You must consent to identity verification';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        let isValid = false;

        switch (currentStep) {
            case 1:
                isValid = validateStep1();
                break;
            case 2:
                isValid = validateStep2();
                break;
            case 3:
                // Step 3 is now the final step, handled by handleSubmit
                isValid = true;
                break;
            default:
                isValid = true;
        }

        if (isValid && currentStep < 3) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (validateStep3()) {
            setIsSubmitting(true);
            try {
                const data = new FormData();
                // Append all text fields
                Object.keys(formData).forEach(key => {
                    const value = (formData as any)[key];
                    if (value !== null && typeof value !== 'object' && key !== 'industryPreferences') {
                        data.append(key, value);
                    }
                });

                // Append Files
                if (formData.profilePhoto) data.append('profilePhoto', formData.profilePhoto);
                if (formData.cnicFront) data.append('cnicFront', formData.cnicFront);
                if (formData.cnicBack) data.append('cnicBack', formData.cnicBack);
                if (formData.passportScan) data.append('passportScan', formData.passportScan);

                // Append Array fields (Industry Preferences)
                if (formData.industryPreferences && formData.industryPreferences.length > 0) {
                    // Since our model is just [String], and standard formData handling varies,
                    // let's append each item with same key for getAll(), or assume backend parses JSON.
                    // A safe bet for many backends is sending as individual entries:
                    formData.industryPreferences.forEach(pref => {
                        data.append('industryPreferences', pref);
                    });
                    // OR if backend expects a JSON string:
                    // data.append('industryPreferences', JSON.stringify(formData.industryPreferences));
                    // I'll stick to 'industryPreferences' multiple keys as hinted in API route logic plan.
                }

                const response = await fetch('/api/signup', {
                    method: 'POST',
                    body: data,
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.error || 'Registration failed');
                }

                // Show Success Modal
                setShowSuccessModal(true);

            } catch (error: any) {
                alert(error.message);
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const handleFileUpload = (field: keyof FormData, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        updateFormData(field, file);
    };

    const getPasswordStrength = (password: string) => {
        if (!password) return { strength: 0, label: '' };
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[^a-zA-Z\d]/.test(password)) strength++;

        const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
        return { strength, label: labels[strength] };
    };

    const passwordStrength = getPasswordStrength(formData.password);

    return (
        <div className="min-h-screen flex font-sans">
            {/* Left Side - Form */}
            <div className="flex-1 flex flex-col justify-center py-6 px-4 sm:px-6 lg:flex-none lg:px-12 xl:px-16 bg-white">
                <div className="mx-auto w-full max-w-md lg:w-[480px]">
                    <div className="mb-5">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <div className="relative w-16 h-16">
                                <Image
                                    src="/assets/footerlogo.png"
                                    alt="PitchWise Logo"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                        </Link>
                        <h2 className="text-2xl font-bold tracking-tight text-[#0B2C4A]">
                            Create an account
                        </h2>
                        <p className="mt-1 text-sm text-gray-600">
                            Join thousands of entrepreneurs and investors today.
                        </p>
                    </div>

                    {/* Progress Indicator */}
                    <div className="mb-5">
                        <div className="flex items-center justify-between mb-2">
                            {[1, 2, 3].map((step) => (
                                <div key={step} className="flex items-center flex-1">
                                    <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all ${currentStep >= step
                                        ? 'bg-[#0B2C4A] text-white'
                                        : 'bg-gray-200 text-gray-400'
                                        }`}>
                                        {step}
                                    </div>
                                    {step < 3 && (
                                        <div className={`flex-1 h-1 mx-2 transition-all ${currentStep > step ? 'bg-[#0B2C4A]' : 'bg-gray-200'
                                            }`} />
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="text-sm text-gray-600 text-center mt-2">
                            Step {currentStep} of 3
                        </div>
                    </div>

                    {/* Form Container */}
                    <div className="mt-5">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Step 1: Basic Information */}
                            {currentStep === 1 && (
                                <div className="space-y-3.5 animate-fadeIn">
                                    <h3 className="text-lg font-semibold text-[#0B2C4A] mb-3">Basic Information</h3>



                                    <div>
                                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                                            Full Name *
                                        </label>
                                        <input
                                            id="fullName"
                                            type="text"
                                            value={formData.fullName}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                // Only allow changes if no numbers are introduced (except allowing deletion)
                                                if (!/\d/.test(val)) {
                                                    updateFormData('fullName', val);
                                                }
                                            }}
                                            className={`block w-full rounded-md border ${errors.fullName ? 'border-red-500' : 'border-gray-300'} px-3 py-2.5 shadow-sm focus:border-[#0B2C4A] focus:outline-none focus:ring-[#0B2C4A] sm:text-sm transition-colors`}
                                            placeholder="John Doe"
                                        />
                                        {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                            Email Address *
                                        </label>
                                        <input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => updateFormData('email', e.target.value)}
                                            className={`block w-full rounded-md border ${errors.email ? 'border-red-500' : 'border-gray-300'} px-3 py-2.5 shadow-sm focus:border-[#0B2C4A] focus:outline-none focus:ring-[#0B2C4A] sm:text-sm transition-colors`}
                                            placeholder="john@example.com"
                                        />
                                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                                            Phone Number *
                                        </label>
                                        <div className="flex gap-2">
                                            <select
                                                value={formData.phoneCountry}
                                                onChange={(e) => {
                                                    const newCountry = e.target.value;
                                                    // Reset phone when country changes, or try to keep if possible, but cleaner to reset or re-prefix
                                                    const countryData = COUNTRY_CODES[newCountry];
                                                    updateFormData('phoneCountry', newCountry);
                                                    updateFormData('phone', countryData.code);
                                                }}
                                                className="block w-[140px] rounded-md border border-gray-300 px-3 py-2.5 shadow-sm focus:border-[#0B2C4A] focus:outline-none focus:ring-[#0B2C4A] sm:text-sm transition-colors"
                                            >
                                                {Object.entries(COUNTRY_CODES).map(([key, { label, code }]) => (
                                                    <option key={key} value={key}>
                                                        {label} ({code})
                                                    </option>
                                                ))}
                                            </select>
                                            <input
                                                id="phone"
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => {
                                                    const country = COUNTRY_CODES[formData.phoneCountry];
                                                    let val = e.target.value.replace(/\D/g, '');
                                                    const codeDigits = country.code.replace(/\D/g, '');

                                                    // If user clears everything, reset to code
                                                    if (val.length < codeDigits.length) {
                                                        val = codeDigits;
                                                    }

                                                    // Ensure it starts with the correct country code
                                                    if (!val.startsWith(codeDigits)) {
                                                        val = codeDigits + val;
                                                    }

                                                    // Max length check
                                                    if (val.length > country.maxLength) {
                                                        val = val.substring(0, country.maxLength);
                                                    }

                                                    // Apply mask
                                                    const formatted = country.mask(val);
                                                    updateFormData('phone', formatted);
                                                }}
                                                className={`block w-full rounded-md border ${errors.phone ? 'border-red-500' : 'border-gray-300'} px-3 py-2.5 shadow-sm focus:border-[#0B2C4A] focus:outline-none focus:ring-[#0B2C4A] sm:text-sm transition-colors`}
                                                placeholder={formData.phoneCountry === 'PK' ? '+92 300 1234567' : 'Enter phone number'}
                                            />
                                        </div>
                                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                            Password *
                                        </label>
                                        <input
                                            id="password"
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => updateFormData('password', e.target.value)}
                                            className={`block w-full rounded-md border ${errors.password ? 'border-red-500' : 'border-gray-300'} px-3 py-2.5 shadow-sm focus:border-[#0B2C4A] focus:outline-none focus:ring-[#0B2C4A] sm:text-sm transition-colors`}
                                            placeholder="Create a password"
                                        />
                                        {formData.password && (
                                            <div className="mt-1 flex items-center gap-1">
                                                {[1, 2, 3, 4].map((level) => (
                                                    <div
                                                        key={level}
                                                        className={`h-1 flex-1 rounded transition-all ${passwordStrength.strength >= level
                                                            ? passwordStrength.strength === 1
                                                                ? 'bg-red-500'
                                                                : passwordStrength.strength === 2
                                                                    ? 'bg-yellow-500'
                                                                    : passwordStrength.strength === 3
                                                                        ? 'bg-blue-500'
                                                                        : 'bg-green-500'
                                                            : 'bg-gray-200'
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                        {formData.password && (
                                            <p className="text-xs mt-1 text-gray-500">{passwordStrength.label}</p>
                                        )}
                                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                            Confirm Password *
                                        </label>
                                        <input
                                            id="confirmPassword"
                                            type="password"
                                            value={formData.confirmPassword}
                                            onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                                            className={`block w-full rounded-md border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} px-3 py-2.5 shadow-sm focus:border-[#0B2C4A] focus:outline-none focus:ring-[#0B2C4A] sm:text-sm transition-colors`}
                                            placeholder="Confirm your password"
                                        />
                                        {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-3">
                                            Role Selection *
                                        </label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <label className={`flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${formData.role === 'entrepreneur'
                                                ? 'border-[#0B2C4A] bg-[#0B2C4A]/5'
                                                : 'border-gray-300 hover:border-gray-400'
                                                }`}>
                                                <input
                                                    type="radio"
                                                    name="role"
                                                    value="entrepreneur"
                                                    checked={formData.role === 'entrepreneur'}
                                                    onChange={(e) => updateFormData('role', e.target.value)}
                                                    className="sr-only"
                                                />
                                                <span className="font-medium">Entrepreneur</span>
                                            </label>
                                            <label className={`flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${formData.role === 'investor'
                                                ? 'border-[#0B2C4A] bg-[#0B2C4A]/5'
                                                : 'border-gray-300 hover:border-gray-400'
                                                }`}>
                                                <input
                                                    type="radio"
                                                    name="role"
                                                    value="investor"
                                                    checked={formData.role === 'investor'}
                                                    onChange={(e) => updateFormData('role', e.target.value)}
                                                    className="sr-only"
                                                />
                                                <span className="font-medium">Investor</span>
                                            </label>
                                        </div>
                                        {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Identity Verification */}
                            {currentStep === 2 && (
                                <div className="space-y-5 animate-fadeIn">
                                    <div>
                                        <h3 className="text-xl font-semibold text-[#0B2C4A]">Verify Your Identity</h3>
                                    </div>

                                    {/* Profile Photo Upload */}
                                    <div className="flex flex-col items-center mb-6">
                                        <div className="relative w-24 h-24 mb-2">
                                            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#0B2C4A] bg-gray-100 flex items-center justify-center relative group">
                                                {photoPreview ? (
                                                    <Image
                                                        src={photoPreview}
                                                        alt="Profile Preview"
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="text-gray-400">
                                                        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                                                        </svg>
                                                    </div>
                                                )}

                                                {/* Overlay */}
                                                <label
                                                    htmlFor="profilePhoto"
                                                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                                >
                                                    <span className="text-white text-xs font-medium">Change</span>
                                                </label>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => document.getElementById('profilePhoto')?.click()}
                                                className="absolute bottom-0 right-0 bg-[#0B2C4A] text-white p-1.5 rounded-full shadow-md hover:bg-[#0B2C4A]/90 transition-colors"
                                            >
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                </svg>
                                            </button>
                                        </div>
                                        <input
                                            id="profilePhoto"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleFileUpload('profilePhoto', e)}
                                            className="hidden"
                                        />
                                        <p className="text-xs text-gray-500">Upload Profile Photo</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-3">
                                            Document Type *
                                        </label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <label className={`flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${formData.documentType === 'cnic'
                                                ? 'border-[#0B2C4A] bg-[#0B2C4A]/5'
                                                : 'border-gray-300 hover:border-gray-400'
                                                }`}>
                                                <input
                                                    type="radio"
                                                    name="documentType"
                                                    value="cnic"
                                                    checked={formData.documentType === 'cnic'}
                                                    onChange={(e) => updateFormData('documentType', e.target.value)}
                                                    className="sr-only"
                                                />
                                                <span className="font-medium">CNIC</span>
                                            </label>
                                            <label className={`flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${formData.documentType === 'passport'
                                                ? 'border-[#0B2C4A] bg-[#0B2C4A]/5'
                                                : 'border-gray-300 hover:border-gray-400'
                                                }`}>
                                                <input
                                                    type="radio"
                                                    name="documentType"
                                                    value="passport"
                                                    checked={formData.documentType === 'passport'}
                                                    onChange={(e) => updateFormData('documentType', e.target.value)}
                                                    className="sr-only"
                                                />
                                                <span className="font-medium">Passport</span>
                                            </label>
                                        </div>
                                        {errors.documentType && <p className="text-red-500 text-xs mt-1">{errors.documentType}</p>}
                                    </div>

                                    {/* CNIC Fields */}
                                    {formData.documentType === 'cnic' && (
                                        <div className="space-y-4 animate-slideIn">
                                            <div>
                                                <label htmlFor="cnicNumber" className="block text-sm font-medium text-gray-700 mb-1">
                                                    CNIC Number (13 digits) *
                                                </label>
                                                <input
                                                    id="cnicNumber"
                                                    type="text"
                                                    value={formData.cnicNumber}
                                                    onChange={(e) => {
                                                        let val = e.target.value.replace(/\D/g, ''); // Remove non-digits
                                                        // Auto-format: 12345-1234567-1
                                                        if (val.length > 13) val = val.substring(0, 13);

                                                        let formattedCNIC = val;
                                                        if (val.length > 5) {
                                                            formattedCNIC = val.substring(0, 5) + '-' + val.substring(5);
                                                        }
                                                        if (val.length > 12) {
                                                            formattedCNIC = formattedCNIC.substring(0, 13) + '-' + formattedCNIC.substring(13);
                                                        }
                                                        updateFormData('cnicNumber', formattedCNIC);
                                                    }}
                                                    maxLength={15}
                                                    className={`block w-full rounded-md border ${errors.cnicNumber ? 'border-red-500' : 'border-gray-300'} px-3 py-2.5 shadow-sm focus:border-[#0B2C4A] focus:outline-none focus:ring-[#0B2C4A] sm:text-sm transition-colors`}
                                                    placeholder="12345-1234567-1"
                                                />
                                                {errors.cnicNumber && <p className="text-red-500 text-xs mt-1">{errors.cnicNumber}</p>}
                                            </div>

                                            <div>
                                                <label htmlFor="cnicFront" className="block text-sm font-medium text-gray-700 mb-1">
                                                    Upload CNIC Front Image *
                                                </label>
                                                <input
                                                    id="cnicFront"
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleFileUpload('cnicFront', e)}
                                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#0B2C4A] file:text-white hover:file:bg-[#0B2C4A]/90 transition-all"
                                                />
                                                {formData.cnicFront && <p className="text-xs text-green-600 mt-1">✓ {formData.cnicFront.name}</p>}
                                                {errors.cnicFront && <p className="text-red-500 text-xs mt-1">{errors.cnicFront}</p>}
                                            </div>

                                            <div>
                                                <label htmlFor="cnicBack" className="block text-sm font-medium text-gray-700 mb-1">
                                                    Upload CNIC Back Image *
                                                </label>
                                                <input
                                                    id="cnicBack"
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleFileUpload('cnicBack', e)}
                                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#0B2C4A] file:text-white hover:file:bg-[#0B2C4A]/90 transition-all"
                                                />
                                                {formData.cnicBack && <p className="text-xs text-green-600 mt-1">✓ {formData.cnicBack.name}</p>}
                                                {errors.cnicBack && <p className="text-red-500 text-xs mt-1">{errors.cnicBack}</p>}
                                            </div>
                                        </div>
                                    )}

                                    {/* Passport Fields */}
                                    {formData.documentType === 'passport' && (
                                        <div className="space-y-4 animate-slideIn">
                                            {/* Reordered: Country First */}
                                            <div>
                                                <label htmlFor="issuingCountry" className="block text-sm font-medium text-gray-700 mb-1">
                                                    Issuing Country *
                                                </label>
                                                <select
                                                    id="issuingCountry"
                                                    value={formData.issuingCountry}
                                                    onChange={(e) => updateFormData('issuingCountry', e.target.value)}
                                                    className={`block w-full rounded-md border ${errors.issuingCountry ? 'border-red-500' : 'border-gray-300'} px-3 py-2.5 shadow-sm focus:border-[#0B2C4A] focus:outline-none focus:ring-[#0B2C4A] sm:text-sm transition-colors`}
                                                >
                                                    <option value="">Select country</option>
                                                    <option value="pakistan">Pakistan</option>
                                                    <option value="usa">United States</option>
                                                    <option value="uk">United Kingdom</option>
                                                    <option value="canada">Canada</option>
                                                    <option value="australia">Australia</option>
                                                    <option value="uae">United Arab Emirates</option>
                                                </select>
                                                {errors.issuingCountry && <p className="text-red-500 text-xs mt-1">{errors.issuingCountry}</p>}
                                            </div>

                                            <div>
                                                <label htmlFor="passportNumber" className="block text-sm font-medium text-gray-700 mb-1">
                                                    Passport Number *
                                                </label>
                                                <input
                                                    id="passportNumber"
                                                    type="text"
                                                    value={formData.passportNumber}
                                                    onChange={(e) => {
                                                        let val = e.target.value.toUpperCase();
                                                        const countryRule = formData.issuingCountry ? PASSPORT_FORMATS[formData.issuingCountry] : null;

                                                        if (countryRule) {
                                                            // Enforce numeric only if specified (like UK)
                                                            if (countryRule.inputType === 'numeric') {
                                                                val = val.replace(/\D/g, '');
                                                            } else {
                                                                // Generic alphanumeric enforcement for others
                                                                val = val.replace(/[^A-Z0-9]/g, '');
                                                            }

                                                            // Enforce Max Length
                                                            if (val.length > countryRule.maxLength) {
                                                                val = val.substring(0, countryRule.maxLength);
                                                            }
                                                        }

                                                        updateFormData('passportNumber', val);
                                                    }}
                                                    className={`block w-full rounded-md border ${errors.passportNumber ? 'border-red-500' : 'border-gray-300'} px-3 py-2.5 shadow-sm focus:border-[#0B2C4A] focus:outline-none focus:ring-[#0B2C4A] sm:text-sm transition-colors`}
                                                    placeholder={formData.issuingCountry ? PASSPORT_FORMATS[formData.issuingCountry]?.placeholder : "Select country first"}
                                                    disabled={!formData.issuingCountry}
                                                />
                                                {errors.passportNumber && <p className="text-red-500 text-xs mt-1">{errors.passportNumber}</p>}
                                                {!errors.passportNumber && formData.issuingCountry && (
                                                    <p className="text-gray-400 text-xs mt-1">{PASSPORT_FORMATS[formData.issuingCountry]?.error}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                                                    Expiry Date *
                                                </label>
                                                <input
                                                    id="expiryDate"
                                                    type="date"
                                                    value={formData.expiryDate}
                                                    onChange={(e) => updateFormData('expiryDate', e.target.value)}
                                                    className={`block w-full rounded-md border ${errors.expiryDate ? 'border-red-500' : 'border-gray-300'} px-3 py-2.5 shadow-sm focus:border-[#0B2C4A] focus:outline-none focus:ring-[#0B2C4A] sm:text-sm transition-colors`}
                                                />
                                                {errors.expiryDate && <p className="text-red-500 text-xs mt-1">{errors.expiryDate}</p>}
                                            </div>

                                            <div>
                                                <label htmlFor="passportScan" className="block text-sm font-medium text-gray-700 mb-1">
                                                    Upload Passport Scan *
                                                </label>
                                                <input
                                                    id="passportScan"
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleFileUpload('passportScan', e)}
                                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#0B2C4A] file:text-white hover:file:bg-[#0B2C4A]/90 transition-all"
                                                />
                                                {formData.passportScan && <p className="text-xs text-green-600 mt-1">✓ {formData.passportScan.name}</p>}
                                                {errors.passportScan && <p className="text-red-500 text-xs mt-1">{errors.passportScan}</p>}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Step 3: Role-Specific Information */}


                            {/* Step 3: Agreements & Finalization */}
                            {currentStep === 3 && (
                                <div className="space-y-5 animate-fadeIn">
                                    <h3 className="text-xl font-semibold text-[#0B2C4A]">Complete Your Registration</h3>

                                    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                                        <div>
                                            <label className="flex items-start gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.termsAccepted}
                                                    onChange={(e) => updateFormData('termsAccepted', e.target.checked)}
                                                    className="mt-1 h-4 w-4 rounded border-gray-300 text-[#0B2C4A] focus:ring-[#0B2C4A]"
                                                />
                                                <span className="text-sm text-gray-700">
                                                    I agree to the <Link href="/terms-of-service" className="text-[#0B2C4A] hover:underline font-medium">Terms & Conditions</Link> *
                                                </span>
                                            </label>
                                            {errors.termsAccepted && <p className="text-red-500 text-xs mt-1 ml-6">{errors.termsAccepted}</p>}
                                        </div>

                                        <div>
                                            <label className="flex items-start gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.privacyAccepted}
                                                    onChange={(e) => updateFormData('privacyAccepted', e.target.checked)}
                                                    className="mt-1 h-4 w-4 rounded border-gray-300 text-[#0B2C4A] focus:ring-[#0B2C4A]"
                                                />
                                                <span className="text-sm text-gray-700">
                                                    I agree to the <Link href="/privacy-policy" className="text-[#0B2C4A] hover:underline font-medium">Privacy Policy</Link> *
                                                </span>
                                            </label>
                                            {errors.privacyAccepted && <p className="text-red-500 text-xs mt-1 ml-6">{errors.privacyAccepted}</p>}
                                        </div>

                                        <div>
                                            <label className="flex items-start gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.verificationConsent}
                                                    onChange={(e) => updateFormData('verificationConsent', e.target.checked)}
                                                    className="mt-1 h-4 w-4 rounded border-gray-300 text-[#0B2C4A] focus:ring-[#0B2C4A]"
                                                />
                                                <span className="text-sm text-gray-700">
                                                    I consent to identity verification and secure data storage *
                                                </span>
                                            </label>
                                            {errors.verificationConsent && <p className="text-red-500 text-xs mt-1 ml-6">{errors.verificationConsent}</p>}
                                        </div>
                                    </div>

                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <h4 className="font-semibold text-sm text-blue-900 mb-2">📋 Registration Summary</h4>
                                        <div className="text-sm text-blue-800 space-y-1">
                                            <p><strong>Name:</strong> {formData.fullName}</p>
                                            <p><strong>Email:</strong> {formData.email}</p>
                                            <p><strong>Role:</strong> {formData.role.charAt(0).toUpperCase() + formData.role.slice(1)}</p>
                                            <p><strong>Document:</strong> {formData.documentType.toUpperCase()}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Navigation Buttons */}
                            <div className="flex gap-3 pt-4">
                                {currentStep > 1 && (
                                    <button
                                        type="button"
                                        onClick={handleBack}
                                        className="flex-1 rounded-md border border-gray-300 bg-white py-2.5 px-4 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0B2C4A] focus:ring-offset-2 transition-all"
                                    >
                                        Back
                                    </button>
                                )}

                                {currentStep < 3 ? (
                                    <button
                                        type="button"
                                        onClick={handleNext}
                                        className={`${currentStep === 1 ? 'w-full' : 'flex-1'} rounded-md border border-transparent bg-[#0B2C4A] py-2.5 px-4 text-sm font-bold text-white shadow-sm hover:bg-[#0B2C4A]/90 focus:outline-none focus:ring-2 focus:ring-[#0B2C4A] focus:ring-offset-2 transition-all transform hover:-translate-y-0.5`}
                                    >
                                        Next
                                    </button>
                                ) : (
                                    <button
                                        type="submit"
                                        className="flex-1 rounded-md border border-transparent bg-[#0B2C4A] py-2.5 px-4 text-sm font-bold text-white shadow-sm hover:bg-[#0B2C4A]/90 focus:outline-none focus:ring-2 focus:ring-[#0B2C4A] focus:ring-offset-2 transition-all transform hover:-translate-y-0.5"
                                    >
                                        Create Account
                                    </button>
                                )}
                            </div>
                        </form>

                        <p className="mt-8 text-center text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link href="/login" className="font-medium text-[#0B2C4A] hover:text-[#0B2C4A]/80">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Side - Image/Branding */}
            <div className="hidden lg:block relative w-0 flex-1">
                <Image
                    className="absolute inset-0 h-full w-full object-cover"
                    src="https://images.unsplash.com/photo-1559136555-9303baea8ebd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80"
                    alt="Office meeting"
                    fill
                    priority
                    sizes="50vw"
                />
                <div className="absolute inset-0 bg-[#0B2C4A]/40 mix-blend-multiply" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B2C4A]/90 via-[#0B2C4A]/20 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-12 text-white">
                    <h2 className="text-4xl font-bold mb-4 font-heading">Start Your Journey.</h2>
                    <p className="text-lg text-gray-200 max-w-lg leading-relaxed">
                        "Finding the right investors was a nightmare until I found PitchWise. Within weeks, we secured our seed round."
                    </p>
                    <div className="mt-6 flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold">
                            SA
                        </div>
                        <div>
                            <div className="font-bold">Sarah Ames</div>
                            <div className="text-sm text-gray-300">Founder, GreenTech</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 text-center animate-slideIn">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-[#0B2C4A] mb-2">Registration Completed!</h3>
                        <p className="text-gray-600 mb-6">
                            Your account has been created successfully. Please wait for Admin Approval before logging in.
                        </p>
                        <Link
                            href="/login"
                            className="block w-full bg-[#0B2C4A] text-white font-semibold py-3 rounded-lg hover:bg-[#0B2C4A]/90 transition-colors"
                        >
                            OK, Go to Login
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
