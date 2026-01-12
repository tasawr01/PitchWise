'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import ValidationModal from '@/components/ValidationModal';

export default function CreatePitch() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [validationError, setValidationError] = useState<string[]>([]);
    const [showValidationModal, setShowValidationModal] = useState(false);
    const [lastSavedStep, setLastSavedStep] = useState(1);

    // Initial State matching new schema
    const [formData, setFormData] = useState({
        // Part 1: The Idea & The Market
        logo: null as File | null,
        businessName: '',
        title: '', // One-line pitch
        industry: 'Tech',
        customIndustry: '',
        problemStatement: '',
        targetCustomer: '',
        problemUrgency: '',
        solution: '',
        solutionMechanism: '',
        uniqueSellingPoint: '',
        competitors: '',
        currentAlternatives: '',
        marketSizeLocation: '',
        marketGrowth: '',

        // Part 2: The Business & Execution
        stage: 'Good Idea',
        revenueModel: '',
        pricingModel: '',
        revenuePerCustomer: '',
        traction: '',
        customerValidation: '',
        keyTechnology: '',
        moat: '',
        risks: '',
        riskMitigation: '',
        founderBackground: '',
        teamFit: '',

        // Part 3: The Deal & The Future
        amountRequired: '',
        equityOffered: '',
        valuation: '',
        useOfFunds: '',
        monthlyExpenses: '',
        breakEvenPoint: '',
        profitabilityTimeline: '',
        vision: '',
        exitPlan: '',
        noInvestmentPlan: '',

        // Part 4: Documents
        pitchDeck: null as File | null,
        demo: null as File | null,
        tractionProof: [] as File[],
        financials: [] as File[],
    });

    const handleChange = (e: any) => {
        const { name, value, type, files } = e.target;
        if (type === 'file') {
            if (name === 'tractionProof' || name === 'financials') {
                const newFiles = Array.from(files as FileList || []);
                setFormData(prev => ({
                    ...prev,
                    [name]: [...(prev as any)[name], ...newFiles]
                }));
                e.target.value = '';
            } else {
                setFormData(prev => ({ ...prev, [name]: files[0] }));
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleRemoveFile = (name: string, index: number) => {
        setFormData(prev => {
            const currentFiles = (prev as any)[name] as File[];
            const newFiles = [...currentFiles];
            newFiles.splice(index, 1);
            return { ...prev, [name]: newFiles };
        });
    };


    const handleSubmit = async (isDraft = false) => {
        // If not draft, validate strictly
        if (!isDraft) {
            const missing = validateAllSteps();
            if (missing.length > 0) {
                setValidationError(missing);
                setShowValidationModal(true);
                return;
            }
        } else {
            // Draft Validation: Require at least Business Name
            if (!formData.businessName || formData.businessName.trim() === '') {
                setValidationError(['Business Name is required to save a draft.']);
                setShowValidationModal(true);
                return;
            }
        }

        setLoading(true);
        try {
            const data = new FormData();
            if (isDraft) data.append('status', 'draft');

            Object.keys(formData).forEach(key => {
                const value = (formData as any)[key];

                if (key === 'industry' && value === 'Other') {
                    const customValue = (formData as any).customIndustry;
                    if (customValue) data.append('industry', customValue);
                    return;
                }
                if (key === 'customIndustry') return;

                if (key === 'tractionProof' || key === 'financials') {
                    value.forEach((file: File) => data.append(key, file));
                } else if (value instanceof File) {
                    if (value) data.append(key, value);
                } else {
                    data.append(key, String(value));
                }
            });

            // Debug logging
            for (let [key, value] of data.entries()) {
                console.log(`FormData: ${key} =`, value instanceof File ? `File: ${value.name} (${value.size})` : value);
            }

            const res = await fetch('/api/pitches', {
                method: 'POST',
                body: data,
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to create pitch');
            }

            router.push('/entrepreneur_dashboard/pitches');
            router.push('/entrepreneur_dashboard/pitches');
        } catch (error: any) {
            console.error('Submission error:', error);

            // Check if it's a validation error from Mongoose
            if (error.message && error.message.includes('Pitch validation failed')) {
                const message = error.message.replace('Pitch validation failed: ', '');
                // Attempt to parse fields
                const errors = message.split(', ').map((err: string) => {
                    const parts = err.split(': ');
                    return parts.length > 1 ? parts[1] : err;
                });

                setValidationError(errors);
                setShowValidationModal(true);
            } else {
                // Fallback for other errors (network, 500, etc) could still use modal or alert
                setValidationError([error.message || 'Failed to submit pitch']);
                setShowValidationModal(true);
            }
        } finally {
            setLoading(false);
        }
    };

    const validateAllSteps = () => {
        const requiredFields: any = {
            1: ['logo', 'businessName', 'title', 'industry', 'problemStatement', 'targetCustomer', 'problemUrgency', 'solution', 'solutionMechanism', 'uniqueSellingPoint', 'competitors', 'currentAlternatives', 'marketSizeLocation', 'marketGrowth'],
            2: ['stage', 'revenueModel', 'pricingModel', 'revenuePerCustomer', 'traction', 'customerValidation', 'keyTechnology', 'moat', 'risks', 'riskMitigation', 'founderBackground', 'teamFit'],
            3: ['amountRequired', 'equityOffered', 'valuation', 'useOfFunds', 'monthlyExpenses', 'breakEvenPoint', 'profitabilityTimeline', 'vision', 'exitPlan', 'noInvestmentPlan'],
            4: ['pitchDeck', 'demo', 'tractionProof', 'financials']
        };

        const missing: string[] = [];

        // Check text fields
        for (let i = 1; i <= 4; i++) {
            const fields = requiredFields[i];
            for (const field of fields) {
                const value = (formData as any)[field];
                if (!value || (Array.isArray(value) && value.length === 0)) {
                    // Format field name: 'businessName' -> 'Business Name'
                    const formattedDetails = field.replace(/([A-Z])/g, ' $1').replace(/^./, (str: string) => str.toUpperCase());
                    missing.push(`${formattedDetails} (Step ${i})`);
                }
            }
        }

        // Check PDF constraints
        if (formData.pitchDeck instanceof File && formData.pitchDeck.type !== 'application/pdf') {
            missing.push('Pitch Deck must be a PDF file (Step 4)');
        }
        if (formData.demo instanceof File && formData.demo.type !== 'application/pdf') {
            missing.push('Demo must be a PDF file (Step 4)');
        }
        for (const file of formData.tractionProof) {
            if (file.type !== 'application/pdf') missing.push(`Traction Proof file "${file.name}" must be a PDF (Step 4)`);
        }
        for (const file of formData.financials) {
            if (file.type !== 'application/pdf') missing.push(`Financial Snapshot file "${file.name}" must be a PDF (Step 4)`);
        }

        return missing;
    };


    const nextStep = () => {
        setStep(prev => Math.min(prev + 1, 4));
    };
    const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

    // Calculate progress
    const progress = Math.round((step / 4) * 100);

    return (
        <div className="max-w-4xl mx-auto py-10 px-4">
            <ValidationModal
                isOpen={showValidationModal}
                onClose={() => setShowValidationModal(false)}
                missingFields={validationError}
                onFix={(step: number) => {
                    setStep(step);
                    setShowValidationModal(false);
                }}
            />
            {/* Progress Bar */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
                <div className="flex justify-between items-end mb-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-[#0B2C4A]">Create Your Pitch</h1>
                        <p className="text-gray-500 mt-1">Share your vision with investors.</p>
                    </div>
                    <div className="text-right">
                        <span className="text-sm font-semibold text-[#0B2C4A] block mb-1">Step {step} of 4</span>
                        <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                            {step === 1 ? 'The Idea' : step === 2 ? 'Execution' : step === 3 ? 'The Deal' : 'Documents'}
                        </span>
                    </div>
                </div>
                <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-[#0B2C4A] h-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-8 md:p-10 space-y-8 animate-fadeIn">

                    {/* STEP 1: THE IDEA & THE MARKET */}
                    {step === 1 && (
                        <div className="space-y-8">
                            <SectionHeader title="PART 1: THE IDEA & THE MARKET" subtitle="(Do we understand it? Does anyone want it?)" />

                            <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100">
                                <h3 className="text-lg font-bold text-[#0B2C4A] mb-4">Basic Identity</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="col-span-1 md:col-span-2">
                                        <FileInput label="Company Logo (Required)" name="logo" onChange={handleChange} accept="image/*" required />
                                    </div>
                                    <Input label="Business Name" name="businessName" value={formData.businessName} onChange={handleChange} placeholder="Enter your business or idea name (e.g., FreshDrop, RepairGo)" />
                                    <Input label="One-line Pitch" name="title" value={formData.title} onChange={handleChange} placeholder="Describe your idea in ONE sentence: &quot;We help [target user] to [solve problem] by [your solution]&quot;" />
                                    <div className="col-span-1 md:col-span-2">
                                        <Select label="Industry / Category" name="industry" value={formData.industry} onChange={handleChange} options={['Tech', 'Health', 'Finance', 'Education', 'Retail', 'Real Estate', 'Food & Beverage', 'Transportation', 'Energy', 'Other']} />
                                        {formData.industry === 'Other' && (
                                            <div className="mt-2">
                                                <Input label="Specify Industry" name="customIndustry" value={(formData as any).customIndustry || ''} onChange={handleChange} placeholder="e.g. Artificial Intelligence" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <QuestionGroup title="The Problem">
                                <Question question="What real problem are you solving?" name="problemStatement" value={formData.problemStatement} onChange={handleChange} placeholder="Explain the main problem people face today that your idea solves" />
                                <Question question="Who faces this problem? (Target Customer)" name="targetCustomer" value={formData.targetCustomer} onChange={handleChange} placeholder="Who has this problem? (e.g., students, small businesses, families, shop owners)" />
                                <Question question="Why is this problem urgent or painful?" name="problemUrgency" value={formData.problemUrgency} onChange={handleChange} placeholder="Explain why this problem matters and what happens if it is not solved" />
                            </QuestionGroup>

                            <QuestionGroup title="The Solution">
                                <Question question="What is your product or service?" name="solution" value={formData.solution} onChange={handleChange} placeholder="Describe what you are offering (product, app, service, platform, etc.)" />
                                <Question question="How does your solution work?" name="solutionMechanism" value={formData.solutionMechanism} onChange={handleChange} placeholder="Explain step-by-step how a customer will use your product or service" />
                                <Question question="What makes your solution better than existing options?" name="uniqueSellingPoint" value={formData.uniqueSellingPoint} onChange={handleChange} placeholder="Explain why your solution is better, cheaper, faster, or easier than existing options" />
                            </QuestionGroup>

                            <QuestionGroup title="The Market">
                                <Question question="Who are your competitors?" name="competitors" value={formData.competitors} onChange={handleChange} placeholder="List similar businesses or alternatives (if none, write &quot;No direct competitors&quot;)" />
                                <Question question="How is this problem solved today?" name="currentAlternatives" value={formData.currentAlternatives} onChange={handleChange} placeholder="How are people solving this problem today without your solution?" />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Question question="Target Market Size & Location" name="marketSizeLocation" value={formData.marketSizeLocation} onChange={handleChange} placeholder="Estimate how many people or businesses could use your product (small / medium / large)" />
                                    <Question question="Is this market growing? Why?" name="marketGrowth" value={formData.marketGrowth} onChange={handleChange} placeholder="Is this market growing or stable? Explain briefly" />
                                </div>
                            </QuestionGroup>
                        </div>
                    )}

                    {/* STEP 2: THE BUSINESS & EXECUTION */}
                    {step === 2 && (
                        <div className="space-y-8">
                            <SectionHeader title="PART 2: THE BUSINESS & EXECUTION" subtitle="(Can this make money and scale? Can YOU execute it?)" />

                            <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100">
                                <h3 className="text-lg font-bold text-[#0B2C4A] mb-4">Current Status</h3>
                                <Select label="Business Stage" name="stage" value={formData.stage} onChange={handleChange} options={['Good Idea', 'Research & Development', 'Product Development', 'Shipping/Live', 'Revenue', 'Expansion']} />
                                <div className="mt-4">
                                    <Question question="Traction so far (users, sales, pilots, feedback)" name="traction" value={formData.traction} onChange={handleChange} placeholder="Mention users, customers, sales, or testing done (or write &quot;Not started yet&quot;)" />
                                </div>
                            </div>

                            <QuestionGroup title="Business Model">
                                <Question question="How do you make money?" name="revenueModel" value={formData.revenueModel} onChange={handleChange} placeholder="How will you make money? (e.g., selling products, subscriptions, commission, ads)" />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Question question="Pricing Model" name="pricingModel" value={formData.pricingModel} onChange={handleChange} placeholder="How much will customers pay? (price per product, monthly fee, commission %)" />
                                    <Question question="Expected Revenue per Customer" name="revenuePerCustomer" value={formData.revenuePerCustomer} onChange={handleChange} placeholder="Estimate how much one customer will pay per month or per year" />
                                </div>
                                <Question question="Proof that customers will pay (Validation)" name="customerValidation" value={formData.customerValidation} onChange={handleChange} placeholder="Explain why you believe customers will pay for this solution" />
                            </QuestionGroup>

                            <QuestionGroup title="Defensibility & Risks">
                                <Question question="Key Technology or Operations Involved" name="keyTechnology" value={formData.keyTechnology} onChange={handleChange} placeholder="Mention tools, apps, software, or processes needed to run this business" />
                                <Question question="What makes this business hard to copy? (Moat)" name="moat" value={formData.moat} onChange={handleChange} placeholder="Explain what prevents others from easily copying your idea" />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Question question="Current Challenges or Risks" name="risks" value={formData.risks} onChange={handleChange} placeholder="Mention the biggest problems or risks you may face" />
                                    <Question question="How will you reduce these risks?" name="riskMitigation" value={formData.riskMitigation} onChange={handleChange} placeholder="Explain how you plan to reduce or manage these risks" />
                                </div>
                            </QuestionGroup>

                            <QuestionGroup title="The Team">
                                <Question question="Founder(s) Background and Roles" name="founderBackground" value={formData.founderBackground} onChange={handleChange} placeholder="Briefly describe your education, skills, or experience" />
                                <Question question="Why are YOU the right person/team to build this?" name="teamFit" value={formData.teamFit} onChange={handleChange} placeholder="Explain why you are suitable to build and run this business" />
                            </QuestionGroup>
                        </div>
                    )}

                    {/* STEP 3: THE DEAL & THE FUTURE */}
                    {step === 3 && (
                        <div className="space-y-8">
                            <SectionHeader title="PART 3: THE DEAL & THE FUTURE" subtitle="(Is this worth investing in? What’s the return?)" />

                            <QuestionGroup title="The Ask">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <Input label="Investment Seeking (Rs.)" type="number" name="amountRequired" value={formData.amountRequired} onChange={handleChange} placeholder="e.g. 500000" />
                                    <Input label="Equity Offering (%)" type="number" name="equityOffered" value={formData.equityOffered} onChange={handleChange} placeholder="e.g. 10" />
                                    <Input label="Company Valuation (Rs.)" type="number" name="valuation" value={formData.valuation} onChange={handleChange} placeholder="Estimated company value based on investment and equity offered" />
                                </div>
                                <div className="mt-4">
                                    <Question question="Use of Funds (Clear Breakdown)" name="useOfFunds" value={formData.useOfFunds} onChange={handleChange} placeholder="Explain how you will use the investment (development, marketing, operations)" />
                                </div>
                            </QuestionGroup>

                            <QuestionGroup title="Financials">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Question question="Monthly Expenses" name="monthlyExpenses" value={formData.monthlyExpenses} onChange={handleChange} placeholder="Estimate monthly costs to run the business" />
                                    <Question question="Expected Break-even Point" name="breakEvenPoint" value={formData.breakEvenPoint} onChange={handleChange} placeholder="When do you expect income to cover expenses? (months/years)" />
                                </div>
                                <Question question="Profitability Timeline" name="profitabilityTimeline" value={formData.profitabilityTimeline} onChange={handleChange} placeholder="When do you expect the business to start making profit?" />
                            </QuestionGroup>

                            <QuestionGroup title="Vision & Exit">
                                <Question question="5-Year Vision for the Company" name="vision" value={formData.vision} onChange={handleChange} placeholder="Describe where you want this business to be in 5 years" />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Question question="Exit Plan (Acquisition, IPO, etc.)" name="exitPlan" value={formData.exitPlan} onChange={handleChange} placeholder="How can investors get returns? (acquisition, IPO, long-term profits)" />
                                    <Question question="What happens if you don't get investment?" name="noInvestmentPlan" value={formData.noInvestmentPlan} onChange={handleChange} placeholder="Explain what you will do if funding is not received" />
                                </div>
                            </QuestionGroup>
                        </div>
                    )}

                    {/* STEP 4: DOCUMENTS */}
                    {step === 4 && (
                        <div className="space-y-8">
                            <SectionHeader title="PART 4: DOCUMENTS" subtitle="(Sharks trust what they see, not what you say)" />

                            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                                <p className="text-sm text-yellow-700">
                                    <strong>Note:</strong> Upload clear and professional documents. These are crucial for investor due diligence.
                                </p>
                            </div>

                            <DocumentUpload
                                label="1. Pitch Deck (MANDATORY)"
                                description="10–12 slides: Problem, Solution, Market, Business Model, Traction, Competition, Team, Financials, Ask. (PDF Only)"
                                name="pitchDeck"
                                onChange={handleChange}
                                accept=".pdf"
                                required
                            />

                            <DocumentUpload
                                label="2. Product Demo / Prototype (MANDATORY)"
                                description="Proof that the idea exists. App/website link, physical product sample, or Figma prototype. (PDF Only)"
                                name="demo"
                                onChange={handleChange}
                                accept=".pdf"
                                required
                            />

                            <DocumentUpload
                                label="3. Traction Proof (MANDATORY)"
                                description="Revenue screenshots, active user numbers, customer testimonials, LOIs. (PDF Only)"
                                name="tractionProof"
                                onChange={handleChange}
                                accept=".pdf"
                                multiple
                                selectedFiles={formData.tractionProof}
                                onRemove={(idx: number) => handleRemoveFile('tractionProof', idx)}
                            />

                            <DocumentUpload
                                label="4. Financial Snapshot (MANDATORY)"
                                description="1–2 pages max. Monthly expenses, revenue, projections, break-even. (PDF Only)"
                                name="financials"
                                onChange={handleChange}
                                accept=".pdf"
                                multiple
                                selectedFiles={formData.financials}
                                onRemove={(idx: number) => handleRemoveFile('financials', idx)}
                            />
                        </div>
                    )}

                </div>

                {/* Footer Controls */}
                <div className="bg-gray-50 px-8 py-6 border-t border-gray-100 flex justify-between items-center">
                    <button
                        onClick={prevStep}
                        disabled={step === 1}
                        className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                    >
                        Back
                    </button>

                    <div className="flex gap-4">
                        <button
                            onClick={() => handleSubmit(true)}
                            disabled={loading}
                            className="px-6 py-3 border-2 border-gray-300 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-sm hover:translate-y-[-1px] flex items-center gap-2"
                        >
                            {loading ? 'Saving...' : 'Save as Draft'}
                        </button>

                        {step < 4 ? (
                            <button
                                onClick={nextStep}
                                className="px-8 py-3 bg-[#0B2C4A] text-white rounded-xl font-bold hover:bg-[#09223a] transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                            >
                                Next Step
                            </button>
                        ) : (
                            <button
                                onClick={() => handleSubmit(false)}
                                disabled={loading}
                                className="px-8 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Submitting...
                                    </>
                                ) : 'Submit Pitch'}
                            </button>
                        )}
                    </div>
                </div>
            </div >
        </div >
    );
}

// Reusable Components matching the new style
const SectionHeader = ({ title, subtitle }: { title: string, subtitle: string }) => (
    <div className="border-b border-gray-200 pb-4 mb-6">
        <h2 className="text-2xl font-bold text-[#0B2C4A] tracking-tight">{title}</h2>
        <p className="text-gray-500 text-sm mt-1">{subtitle}</p>
    </div>
);

const QuestionGroup = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="mb-8">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-[#0B2C4A] rounded-full"></span>
            {title}
        </h3>
        <div className="space-y-5">
            {children}
        </div>
    </div>
);

const Question = ({ question, ...props }: any) => (
    <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">{question}</label>
        <textarea
            rows={3}
            className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-[#0B2C4A] focus:ring-[#0B2C4A] sm:text-sm p-4 border transition-all hover:border-gray-400 bg-gray-50 focus:bg-white resize-y min-h-[100px]"
            {...props}
        />
    </div>
);

const Input = ({ label, ...props }: any) => (
    <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
        <input
            className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-[#0B2C4A] focus:ring-[#0B2C4A] sm:text-sm p-3 border transition-all hover:border-gray-400 bg-gray-50 focus:bg-white"
            {...props}
        />
    </div>
);

const Select = ({ label, options, ...props }: any) => (
    <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
        <div className="relative">
            <select
                className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-[#0B2C4A] focus:ring-[#0B2C4A] sm:text-sm p-3 border transition-all hover:border-gray-400 bg-gray-50 focus:bg-white appearance-none"
                {...props}
            >
                {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
        </div>
    </div>
);

const FileInput = ({ label, required, ...props }: any) => (
    <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
            type="file"
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-[#0B2C4A]/10 file:text-[#0B2C4A] hover:file:bg-[#0B2C4A]/20 transition-all cursor-pointer border border-dashed border-gray-300 rounded-xl p-2 hover:border-[#0B2C4A]"
            {...props}
        />
    </div>
);

const DocumentUpload = ({ label, description, selectedFiles = [], onRemove, ...props }: any) => (
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-[#0B2C4A]/30 transition-all shadow-sm">
        <label className="block text-base font-bold text-gray-900 mb-1">{label}</label>
        <p className="text-sm text-gray-500 mb-4">{description}</p>
        <input
            type="file"
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#0B2C4A] file:text-white hover:file:bg-[#09223a] transition-all cursor-pointer"
            {...props}
        />
        {selectedFiles && selectedFiles.length > 0 && (
            <div className="mt-4 space-y-2">
                {selectedFiles.map((file: File, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200 text-sm">
                        <span className="truncate max-w-[80%] text-gray-700 font-medium">{file.name}</span>
                        {onRemove && (
                            <button
                                type="button"
                                onClick={() => onRemove(index)}
                                className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        )}
                    </div>
                ))}
            </div>
        )}
    </div>
);
