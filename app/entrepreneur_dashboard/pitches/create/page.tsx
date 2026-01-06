'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import StepWizard from '@/components/StepWizard'; // Will create this reusable wrapper locally to keep file clean or just inline it? 
// Let's implement inline to handle the complex state easily in one file first.

export default function CreatePitch() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Form State for 9 Steps
    const [formData, setFormData] = useState({
        // Step 1
        businessName: '', title: '', industry: 'Tech', stage: 'Idea',
        // Step 2
        problemStatement: '', targetCustomer: '', solution: '', uniqueSellingPoint: '',
        // Step 3
        offeringType: 'Product', productStatus: 'Concept', keyFeatures: [''],
        // Step 4
        marketType: 'B2B', hasExistingCustomers: false, customerCount: 0,
        // Step 5
        revenueModel: '', pricingModel: '', monthlyRevenue: 0,
        // Step 6
        totalUsers: 0, monthlyGrowthRate: 0, majorMilestones: [''],
        // Step 7
        founderName: '', founderRole: '', founderExpYears: 0, teamSize: 1, linkedinUrl: '',
        // Step 8
        amountRequired: 0, fundingType: 'Equity', equityOffered: 0, useOfFunds: '',
        // Step 9 (Files) - we keep file objects separately usually, but for simple state:
        pitchDeck: null as File | null,
        financials: null as File | null,
        demo: null as File | null,
    });

    const handleChange = (e: any) => {
        const { name, value, type, checked, files } = e.target;
        if (type === 'file') {
            setFormData(prev => ({ ...prev, [name]: files[0] }));
        } else if (type === 'checkbox') {
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    // Array Handlers
    const handleArrayChange = (index: number, value: string, field: 'keyFeatures' | 'majorMilestones') => {
        const newArray = [...formData[field]];
        newArray[index] = value;
        setFormData(prev => ({ ...prev, [field]: newArray }));
    };
    const addArrayItem = (field: 'keyFeatures' | 'majorMilestones') => {
        if (formData[field].length < 5) {
            setFormData(prev => ({ ...prev, [field]: [...prev[field], ''] }));
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const data = new FormData();
            // Append all simple fields
            Object.keys(formData).forEach(key => {
                const value = (formData as any)[key];
                if (key === 'keyFeatures' || key === 'majorMilestones') {
                    value.forEach((v: string) => data.append(key, v));
                } else if (value instanceof File) {
                    if (value) data.append(key, value);
                } else {
                    data.append(key, String(value));
                }
            });

            const res = await fetch('/api/pitches', {
                method: 'POST',
                body: data,
            });

            if (!res.ok) throw new Error('Failed to create pitch');

            router.push('/entrepreneur_dashboard/pitches');
        } catch (error) {
            console.error(error);
            alert('Failed to submit pitch');
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => setStep(prev => Math.min(prev + 1, 9));
    const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

    return (
        <div className="max-w-3xl mx-auto py-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <div className="mb-8">
                    <div className="flex justify-between items-center text-sm font-medium text-gray-500 mb-2">
                        <span>Step {step} of 9</span>
                        <span>{Math.round((step / 9) * 100)}% Completed</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${(step / 9) * 100}%` }}></div>
                    </div>
                </div>

                <div className="space-y-6 min-h-[400px]">
                    {step === 1 && (
                        <div className="space-y-4 animate-fadeIn">
                            <h2 className="text-2xl font-bold text-gray-800">Business Basics</h2>
                            <Input label="Business Name" name="businessName" value={formData.businessName} onChange={handleChange} />
                            <Input label="Pitch Title" name="title" value={formData.title} onChange={handleChange} />
                            <Select label="Industry" name="industry" value={formData.industry} onChange={handleChange} options={['Tech', 'Health', 'Finance', 'Education', 'Retail', 'Other']} />
                            <Select label="Stage" name="stage" value={formData.stage} onChange={handleChange} options={['Idea', 'MVP', 'Revenue', 'Growth']} />
                        </div>
                    )}
                    {step === 2 && (
                        <div className="space-y-4 animate-fadeIn">
                            <h2 className="text-2xl font-bold text-gray-800">Problem & Solution</h2>
                            <TextArea label="What problem are you solving?" name="problemStatement" value={formData.problemStatement} onChange={handleChange} />
                            <Input label="Who is the target customer?" name="targetCustomer" value={formData.targetCustomer} onChange={handleChange} />
                            <TextArea label="What is your solution?" name="solution" value={formData.solution} onChange={handleChange} />
                            <TextArea label="Why is it better? (USP)" name="uniqueSellingPoint" value={formData.uniqueSellingPoint} onChange={handleChange} />
                        </div>
                    )}
                    {step === 3 && (
                        <div className="space-y-4 animate-fadeIn">
                            <h2 className="text-2xl font-bold text-gray-800">Product / Service</h2>
                            <Select label="Offering Type" name="offeringType" value={formData.offeringType} onChange={handleChange} options={['Product', 'Service', 'Platform']} />
                            <Select label="Status" name="productStatus" value={formData.productStatus} onChange={handleChange} options={['Concept', 'Prototype', 'Live']} />
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Key Features (Max 5)</label>
                                {formData.keyFeatures.map((feat, i) => (
                                    <input key={i} type="text" value={feat} onChange={(e) => handleArrayChange(i, e.target.value, 'keyFeatures')} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border mb-2" placeholder={`Feature ${i + 1}`} />
                                ))}
                                {formData.keyFeatures.length < 5 && (
                                    <button type="button" onClick={() => addArrayItem('keyFeatures')} className="text-sm text-blue-600 font-medium">+ Add Feature</button>
                                )}
                            </div>
                        </div>
                    )}
                    {step === 4 && (
                        <div className="space-y-4 animate-fadeIn">
                            <h2 className="text-2xl font-bold text-gray-800">Market & Customers</h2>
                            <Select label="Target Market" name="marketType" value={formData.marketType} onChange={handleChange} options={['B2B', 'B2C', 'Both']} />
                            <div className="flex items-center gap-2">
                                <input type="checkbox" name="hasExistingCustomers" checked={formData.hasExistingCustomers} onChange={handleChange} id="hasCust" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                                <label htmlFor="hasCust" className="text-sm text-gray-700">Do you have existing customers?</label>
                            </div>
                            {formData.hasExistingCustomers && (
                                <Input label="Number of Customers" type="number" name="customerCount" value={formData.customerCount} onChange={handleChange} />
                            )}
                        </div>
                    )}
                    {step === 5 && (
                        <div className="space-y-4 animate-fadeIn">
                            <h2 className="text-2xl font-bold text-gray-800">Revenue Model</h2>
                            <TextArea label="How do you make money?" name="revenueModel" value={formData.revenueModel} onChange={handleChange} />
                            <Input label="Pricing Model" name="pricingModel" value={formData.pricingModel} onChange={handleChange} placeholder="e.g. Subscription, One-time" />
                            <Input label="Current Monthly Revenue" type="number" name="monthlyRevenue" value={formData.monthlyRevenue} onChange={handleChange} />
                        </div>
                    )}
                    {step === 6 && (
                        <div className="space-y-4 animate-fadeIn">
                            <h2 className="text-2xl font-bold text-gray-800">Traction</h2>
                            <Input label="Total Users" type="number" name="totalUsers" value={formData.totalUsers} onChange={handleChange} />
                            <Input label="Monthly Growth (%)" type="number" name="monthlyGrowthRate" value={formData.monthlyGrowthRate} onChange={handleChange} />
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Major Milestones</label>
                                {formData.majorMilestones.map((m, i) => (
                                    <input key={i} type="text" value={m} onChange={(e) => handleArrayChange(i, e.target.value, 'majorMilestones')} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border mb-2" placeholder={`Milestone ${i + 1}`} />
                                ))}
                                {formData.majorMilestones.length < 5 && (
                                    <button type="button" onClick={() => addArrayItem('majorMilestones')} className="text-sm text-blue-600 font-medium">+ Add Milestone</button>
                                )}
                            </div>
                        </div>
                    )}
                    {step === 7 && (
                        <div className="space-y-4 animate-fadeIn">
                            <h2 className="text-2xl font-bold text-gray-800">Team</h2>
                            <Input label="Founder Name" name="founderName" value={formData.founderName} onChange={handleChange} />
                            <Input label="Founder Role" name="founderRole" value={formData.founderRole} onChange={handleChange} />
                            <Input label="Experience (Years)" type="number" name="founderExpYears" value={formData.founderExpYears} onChange={handleChange} />
                            <Input label="Team Size" type="number" name="teamSize" value={formData.teamSize} onChange={handleChange} />
                            <Input label="LinkedIn URL" name="linkedinUrl" value={formData.linkedinUrl} onChange={handleChange} />
                        </div>
                    )}
                    {step === 8 && (
                        <div className="space-y-4 animate-fadeIn">
                            <h2 className="text-2xl font-bold text-gray-800">Funding Ask</h2>
                            <Input label="Amount Required ($)" type="number" name="amountRequired" value={formData.amountRequired} onChange={handleChange} />
                            <Select label="Funding Type" name="fundingType" value={formData.fundingType} onChange={handleChange} options={['Equity', 'Partnership', 'Other']} />
                            {formData.fundingType === 'Equity' && (
                                <Input label="Equity Offered (%)" type="number" name="equityOffered" value={formData.equityOffered} onChange={handleChange} />
                            )}
                            <TextArea label="Use of Funds" name="useOfFunds" value={formData.useOfFunds} onChange={handleChange} placeholder="Brief breakdown..." />
                        </div>
                    )}
                    {step === 9 && (
                        <div className="space-y-4 animate-fadeIn">
                            <h2 className="text-2xl font-bold text-gray-800">Documents</h2>
                            <FileInput label="Pitch Deck (PDF)" name="pitchDeck" onChange={handleChange} accept=".pdf" />
                            <FileInput label="Financials (PDF)" name="financials" onChange={handleChange} accept=".pdf" />
                            <FileInput label="Demo/Product Image" name="demo" onChange={handleChange} accept="image/*,video/*" />
                        </div>
                    )}
                </div>

                <div className="mt-8 flex justify-between pt-6 border-t border-gray-200">
                    <button
                        onClick={prevStep}
                        disabled={step === 1}
                        className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        Back
                    </button>
                    {step < 9 ? (
                        <button
                            onClick={nextStep}
                            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                        >
                            Next Step
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition flex items-center gap-2"
                        >
                            {loading ? 'Submitting...' : 'Submit Pitch'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

const Input = ({ label, ...props }: any) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input {...props} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border transition-colors" />
    </div>
);

const TextArea = ({ label, ...props }: any) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <textarea {...props} rows={3} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border transition-colors" />
    </div>
);

const Select = ({ label, options, ...props }: any) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <select {...props} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border transition-colors bg-white">
            {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);

const FileInput = ({ label, ...props }: any) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input type="file" {...props} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition" />
    </div>
);
