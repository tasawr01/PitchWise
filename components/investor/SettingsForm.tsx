'use client';

import { useState } from 'react';
import { updateInvestorProfile } from '@/app/actions/investor';
import { Loader2, Save, Upload, User, Building, Wallet, Globe } from 'lucide-react';
import Image from 'next/image';

interface SettingsFormProps {
    user: any;
}

const INDUSTRIES = [
    'Tech', 'Health', 'Finance', 'Education', 'Retail', 'Real Estate',
    'Food & Beverage', 'Transportation', 'Energy', 'Other'
];

export default function SettingsForm({ user }: SettingsFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: user.fullName || '',
        phone: user.phone || '',
        cityCountry: user.cityCountry || '',
        organizationName: user.organizationName || '',
        investorType: user.investorType || 'Individual',
        investmentMin: user.investmentMin || '',
        investmentMax: user.investmentMax || '',
        industryPreferences: user.industryPreferences || [],
        profilePhoto: user.profilePhoto || ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleIndustryChange = (industry: string) => {
        setFormData(prev => {
            const current = prev.industryPreferences || [];
            if (current.includes(industry)) {
                return { ...prev, industryPreferences: current.filter((i: string) => i !== industry) };
            } else {
                return { ...prev, industryPreferences: [...current, industry] };
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const result = await updateInvestorProfile(user._id, formData);
            if (result.success) {
                alert('Profile updated successfully!');
            } else {
                alert('Failed to update profile: ' + result.error);
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-[#0B2C4A] mb-4 flex items-center gap-2">
                    <User className="w-5 h-5" /> Basic Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            className="w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location (City, Country)</label>
                        <input
                            type="text"
                            name="cityCountry"
                            value={formData.cityCountry}
                            onChange={handleChange}
                            placeholder="e.g. Lahore, Pakistan"
                            className="w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Profile Photo URL</label>
                        <input
                            type="text"
                            name="profilePhoto"
                            value={formData.profilePhoto}
                            onChange={handleChange}
                            placeholder="https://example.com/photo.jpg"
                            className="w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>
            </section>

            {/* Investment Profile */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-[#0B2C4A] mb-4 flex items-center gap-2">
                    <Wallet className="w-5 h-5" /> Investment Profile
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Investor Type</label>
                        <select
                            name="investorType"
                            value={formData.investorType}
                            onChange={handleChange}
                            className="w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="Individual">Individual / Angel</option>
                            <option value="VC">Venture Capital</option>
                            <option value="Corporate">Corporate</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
                        <input
                            type="text"
                            name="organizationName"
                            value={formData.organizationName}
                            onChange={handleChange}
                            placeholder="e.g. ABC Ventures"
                            className="w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Min Investment (Rs)</label>
                        <input
                            type="number"
                            name="investmentMin"
                            value={formData.investmentMin}
                            onChange={handleChange}
                            className="w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Max Investment (Rs)</label>
                        <input
                            type="number"
                            name="investmentMax"
                            value={formData.investmentMax}
                            onChange={handleChange}
                            className="w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Industry Preferences</label>
                    <div className="flex flex-wrap gap-2">
                        {INDUSTRIES.map(industry => (
                            <button
                                key={industry}
                                type="button"
                                onClick={() => handleIndustryChange(industry)}
                                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${formData.industryPreferences.includes(industry)
                                    ? 'bg-[#0B2C4A] text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {industry}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            <div className="flex justify-end pt-4">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center gap-2 px-8 py-3 bg-[#0B2C4A] text-white rounded-lg font-semibold hover:bg-opacity-90 transition-all shadow-lg hover:shadow-xl disabled:opacity-70"
                >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    Save Changes
                </button>
            </div>
        </form>
    );
}
