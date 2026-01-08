'use client';

import { useState, useEffect, useRef } from 'react';

export default function EntrepreneurSettings() {
    const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'documents'
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Profile Form State
    const [profileForm, setProfileForm] = useState({
        fullName: '',
        phone: '',
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [savingProfile, setSavingProfile] = useState(false);

    // Document Form State
    const [docStatus, setDocStatus] = useState<any>(null); // To store pending request
    const [docForm, setDocForm] = useState({
        documentType: 'cnic', // 'cnic' | 'passport'
        cnicNumber: '',
        passportNumber: '',
        issuingCountry: '',
        expiryDate: ''
    });
    const [files, setFiles] = useState<{ cnicFront?: File, cnicBack?: File, passportScan?: File }>({});
    const [docErrors, setDocErrors] = useState<Record<string, string>>({});
    const [savingDoc, setSavingDoc] = useState(false);

    // Passport Validation Constants (Copied from Signup)
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

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch User for Profile & Current Docs
            const resUser = await fetch('/api/entrepreneur/profile-picture');
            const dataUser = await resUser.json();
            if (dataUser.user) {
                setUser(dataUser.user);
                setProfileForm(prev => ({
                    ...prev,
                    fullName: dataUser.user.fullName || '',
                    phone: dataUser.user.phone || ''
                }));
                // Set initial doc type based on user if verified, or default
                if (dataUser.user.documentType) {
                    setDocForm(prev => ({ ...prev, documentType: dataUser.user.documentType }));
                }
            }

            // Fetch Pending Request
            const resReq = await fetch('/api/entrepreneur/settings/request-doc-update');
            const dataReq = await resReq.json();
            if (dataReq.pendingRequest) {
                setDocStatus(dataReq.pendingRequest);
            } else {
                setDocStatus(null);
            }

        } catch (error) {
            console.error('Fetch error:', error);
        }
        setLoading(false);
    };

    const handleProfileChange = (e: any) => {
        setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
    };

    const handleProfileSave = async () => {
        if (profileForm.newPassword) {
            if (profileForm.newPassword !== profileForm.confirmPassword) {
                alert("Passwords do not match!");
                return;
            }
            if (!profileForm.oldPassword) {
                alert("Old password is required to change password.");
                return;
            }
        }

        setSavingProfile(true);
        try {
            const res = await fetch('/api/entrepreneur/settings/update-profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fullName: profileForm.fullName,
                    phone: profileForm.phone,
                    password: profileForm.newPassword,
                    oldPassword: profileForm.oldPassword
                })
            });
            const result = await res.json();
            if (res.ok) {
                alert('Profile updated successfully!');
                setUser((prev: any) => ({ ...prev, ...result.user })); // Update local state
                setProfileForm(prev => ({ ...prev, oldPassword: '', newPassword: '', confirmPassword: '' }));
            } else {
                alert(result.error || 'Failed to update profile');
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred');
        } finally {
            setSavingProfile(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const data = new FormData();
        data.append('profilePhoto', file);

        try {
            const res = await fetch('/api/entrepreneur/profile-picture', {
                method: 'POST',
                body: data,
            });
            const result = await res.json();
            if (res.ok) {
                setUser(result.user);
                alert('Profile photo updated!');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDocFileChange = (field: string, e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setFiles(prev => ({ ...prev, [field]: e.target.files![0] }));
            if (docErrors[field]) {
                setDocErrors(prev => ({ ...prev, [field]: '' }));
            }
        }
    };

    const validateDocForm = () => {
        const newErrors: Record<string, string> = {};

        if (docForm.documentType === 'cnic') {
            if (!docForm.cnicNumber.trim()) {
                newErrors.cnicNumber = 'CNIC number is required';
            } else if (!/^\d{5}-\d{7}-\d{1}$/.test(docForm.cnicNumber)) {
                newErrors.cnicNumber = 'CNIC format must be: 12345-1234567-1';
            }
            if (!files.cnicFront) newErrors.cnicFront = 'CNIC front image is required';
            if (!files.cnicBack) newErrors.cnicBack = 'CNIC back image is required';
        } else {
            if (!docForm.issuingCountry) newErrors.issuingCountry = 'Issuing country is required';

            if (!docForm.passportNumber.trim()) {
                newErrors.passportNumber = 'Passport number is required';
            } else if (docForm.issuingCountry) {
                // Check format based on country
                const countryRule = PASSPORT_FORMATS[docForm.issuingCountry];
                if (countryRule && !countryRule.format.test(docForm.passportNumber.replace(/\s/g, '').toUpperCase())) {
                    newErrors.passportNumber = countryRule.error;
                }
            }

            if (!docForm.expiryDate) newErrors.expiryDate = 'Expiry date is required';
            if (!files.passportScan) newErrors.passportScan = 'Passport scan is required';
        }

        setDocErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleDocRequest = async () => {
        if (!validateDocForm()) {
            return;
        }

        setSavingDoc(true);
        const data = new FormData();
        data.append('documentType', docForm.documentType);

        if (docForm.documentType === 'cnic') {
            data.append('cnicNumber', docForm.cnicNumber);
            data.append('cnicFront', files.cnicFront!);
            data.append('cnicBack', files.cnicBack!);
        } else {
            data.append('passportNumber', docForm.passportNumber);
            data.append('issuingCountry', docForm.issuingCountry);
            data.append('expiryDate', docForm.expiryDate);
            data.append('passportScan', files.passportScan!);
        }

        try {
            const res = await fetch('/api/entrepreneur/settings/request-doc-update', {
                method: 'POST',
                body: data
            });
            const result = await res.json();
            if (res.ok) {
                alert('Update request submitted successfully! Waiting for admin approval.');
                setDocStatus({
                    ...result.request,
                    // Optimistically set date for immediate feedback if needed, but fetch will conform
                });
                setFiles({});
                setDocErrors({});
            } else {
                alert(result.error || 'Failed to submit request');
            }
        } catch (error) {
            console.error(error);
            alert('Error submitting request');
        } finally {
            setSavingDoc(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-3xl font-extrabold text-[#0B2C4A] tracking-tight mb-2">Platform Configuration</h2>
            <p className="text-gray-500 mt-2 text-lg mb-8">Manage active system settings and moderation rules.</p>
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 flex items-center gap-6">
                <div className="relative group">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 ring-4 ring-offset-2 ring-gray-50">
                        {user?.profilePhoto ? (
                            <img src={user.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-gray-400">
                                {user?.fullName?.[0]}
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 bg-[#0B2C4A] text-white p-2 rounded-full shadow-lg hover:bg-[#09223a] transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>
                    </button>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-[#0B2C4A]">{user?.fullName}</h3>
                    <p className="text-gray-500 text-sm">{user?.email}</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-6 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('profile')}
                    className={`pb-3 px-1 font-bold text-sm uppercase tracking-wide transition-colors ${activeTab === 'profile' ? 'border-b-2 border-[#0B2C4A] text-[#0B2C4A]' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Profile Settings
                </button>
                <button
                    onClick={() => setActiveTab('documents')}
                    className={`pb-3 px-1 font-bold text-sm uppercase tracking-wide transition-colors ${activeTab === 'documents' ? 'border-b-2 border-[#0B2C4A] text-[#0B2C4A]' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Identity Documents
                </button>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
                {activeTab === 'profile' ? (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                                <input name="fullName" value={profileForm.fullName} onChange={handleProfileChange} className="w-full rounded-lg border-gray-300 shadow-sm focus:border-[#0B2C4A] focus:ring-[#0B2C4A] p-3 border transition-colors" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                                <input name="phone" value={profileForm.phone} onChange={handleProfileChange} className="w-full rounded-lg border-gray-300 shadow-sm focus:border-[#0B2C4A] focus:ring-[#0B2C4A] p-3 border transition-colors" />
                            </div>
                        </div>

                        <hr className="border-gray-100" />

                        <div>
                            <h4 className="font-bold text-[#0B2C4A] mb-4">Change Password</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">New Password</label>
                                    <input type="password" name="newPassword" value={profileForm.newPassword} placeholder="Leave blank to keep current" onChange={handleProfileChange} className="w-full rounded-lg border-gray-300 shadow-sm focus:border-[#0B2C4A] focus:ring-[#0B2C4A] p-3 border transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Confirm Password</label>
                                    <input type="password" name="confirmPassword" value={profileForm.confirmPassword} onChange={handleProfileChange} className="w-full rounded-lg border-gray-300 shadow-sm focus:border-[#0B2C4A] focus:ring-[#0B2C4A] p-3 border transition-colors" />
                                </div>
                            </div>
                            {profileForm.newPassword && (
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Old Password (Required)</label>
                                    <input type="password" name="oldPassword" value={profileForm.oldPassword} onChange={handleProfileChange} className="w-full rounded-lg border-gray-300 shadow-sm focus:border-[#0B2C4A] focus:ring-[#0B2C4A] p-3 border transition-colors" />
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end pt-4">
                            <button onClick={handleProfileSave} disabled={savingProfile} className="bg-[#0B2C4A] text-white px-8 py-3 rounded-xl hover:bg-[#09223a] font-bold shadow-lg shadow-blue-900/20 disabled:opacity-50 transition-all">
                                {savingProfile ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Current Status */}
                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 mb-6">
                            <h4 className="font-bold text-[#0B2C4A] mb-4">Current Verification Status</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div><span className="text-gray-500 font-medium">Document Type:</span> <span className="font-bold text-gray-900 capitalize ml-2">{user?.documentType || 'Not Set'}</span></div>
                                <div><span className="text-gray-500 font-medium">Verified:</span> <span className={`font-bold ml-2 ${user?.isVerified ? 'text-green-600' : 'text-amber-600'}`}>{user?.isVerified ? 'Verified' : 'Unverified'}</span></div>
                            </div>
                        </div>

                        {docStatus ? (
                            <div className="bg-blue-50/50 border border-blue-100 text-[#0B2C4A] p-6 rounded-xl flex items-center justify-between">
                                <div>
                                    <p className="font-bold">Update Request Pending</p>
                                    <p className="text-sm mt-1 text-gray-600">You have a pending request to update your {docStatus.documentType.toUpperCase()}. Please wait for admin approval.</p>
                                </div>
                                <span className="bg-[#0B2C4A] text-white text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wide shadow-sm">Pending</span>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <h4 className="font-bold text-[#0B2C4A]">Request Document Update</h4>
                                <p className="text-sm text-gray-500">Updating these documents requires admin approval. Changes will not be live until approved.</p>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Document Type</label>
                                    <select
                                        value={docForm.documentType}
                                        onChange={(e) => {
                                            setDocForm({ ...docForm, documentType: e.target.value });
                                            setDocErrors({});
                                        }}
                                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-[#0B2C4A] focus:ring-[#0B2C4A] p-3 border transition-colors bg-white"
                                    >
                                        <option value="cnic">CNIC (National ID)</option>
                                        <option value="passport">Passport</option>
                                    </select>
                                </div>

                                {docForm.documentType === 'cnic' ? (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">CNIC Number</label>
                                            <input
                                                type="text"
                                                value={docForm.cnicNumber}
                                                onChange={(e) => {
                                                    let val = e.target.value.replace(/\D/g, '');
                                                    if (val.length > 13) val = val.substring(0, 13);
                                                    let formatted = val;
                                                    if (val.length > 5) formatted = val.substring(0, 5) + '-' + val.substring(5);
                                                    if (val.length > 12) formatted = formatted.substring(0, 13) + '-' + formatted.substring(13);

                                                    setDocForm({ ...docForm, cnicNumber: formatted });
                                                    if (docErrors.cnicNumber) setDocErrors({ ...docErrors, cnicNumber: '' });
                                                }}
                                                placeholder="e.g. 12345-1234567-1"
                                                className={`w-full rounded-lg border ${docErrors.cnicNumber ? 'border-red-500' : 'border-gray-300'} shadow-sm focus:border-[#0B2C4A] focus:ring-[#0B2C4A] p-3 transition-colors`}
                                            />
                                            {docErrors.cnicNumber && <p className="text-red-500 text-xs mt-1 font-medium">{docErrors.cnicNumber}</p>}
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">CNIC Front Image</label>
                                                <input type="file" accept="image/*" onChange={(e) => handleDocFileChange('cnicFront', e)} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-[#0B2C4A]/10 file:text-[#0B2C4A] hover:file:bg-[#0B2C4A]/20 transition-colors cursor-pointer" />
                                                {docErrors.cnicFront && <p className="text-red-500 text-xs mt-1 font-medium">{docErrors.cnicFront}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">CNIC Back Image</label>
                                                <input type="file" accept="image/*" onChange={(e) => handleDocFileChange('cnicBack', e)} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-[#0B2C4A]/10 file:text-[#0B2C4A] hover:file:bg-[#0B2C4A]/20 transition-colors cursor-pointer" />
                                                {docErrors.cnicBack && <p className="text-red-500 text-xs mt-1 font-medium">{docErrors.cnicBack}</p>}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Issuing Country</label>
                                            <select
                                                value={docForm.issuingCountry}
                                                onChange={(e) => {
                                                    setDocForm({ ...docForm, issuingCountry: e.target.value });
                                                    if (docErrors.issuingCountry) setDocErrors({ ...docErrors, issuingCountry: '' });
                                                }}
                                                className={`w-full rounded-lg border ${docErrors.issuingCountry ? 'border-red-500' : 'border-gray-300'} shadow-sm focus:border-[#0B2C4A] focus:ring-[#0B2C4A] p-3 transition-colors bg-white`}
                                            >
                                                <option value="">Select Country</option>
                                                {Object.entries(PASSPORT_FORMATS).map(([key, { label }]) => (
                                                    <option key={key} value={key}>{label}</option>
                                                ))}
                                            </select>
                                            {docErrors.issuingCountry && <p className="text-red-500 text-xs mt-1 font-medium">{docErrors.issuingCountry}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Passport Number</label>
                                            <input
                                                type="text"
                                                value={docForm.passportNumber}
                                                onChange={(e) => {
                                                    setDocForm({ ...docForm, passportNumber: e.target.value });
                                                    if (docErrors.passportNumber) setDocErrors({ ...docErrors, passportNumber: '' });
                                                }}
                                                placeholder={docForm.issuingCountry ? PASSPORT_FORMATS[docForm.issuingCountry]?.placeholder : ''}
                                                className={`w-full rounded-lg border ${docErrors.passportNumber ? 'border-red-500' : 'border-gray-300'} shadow-sm focus:border-[#0B2C4A] focus:ring-[#0B2C4A] p-3 transition-colors`}
                                            />
                                            {docErrors.passportNumber && <p className="text-red-500 text-xs mt-1 font-medium">{docErrors.passportNumber}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Expiry Date</label>
                                            <input
                                                type="date"
                                                value={docForm.expiryDate}
                                                onChange={(e) => {
                                                    setDocForm({ ...docForm, expiryDate: e.target.value });
                                                    if (docErrors.expiryDate) setDocErrors({ ...docErrors, expiryDate: '' });
                                                }}
                                                className={`w-full rounded-lg border ${docErrors.expiryDate ? 'border-red-500' : 'border-gray-300'} shadow-sm focus:border-[#0B2C4A] focus:ring-[#0B2C4A] p-3 transition-colors`}
                                            />
                                            {docErrors.expiryDate && <p className="text-red-500 text-xs mt-1 font-medium">{docErrors.expiryDate}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Passport Scan</label>
                                            <input type="file" accept="image/*" onChange={(e) => handleDocFileChange('passportScan', e)} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-[#0B2C4A]/10 file:text-[#0B2C4A] hover:file:bg-[#0B2C4A]/20 transition-colors cursor-pointer" />
                                            {docErrors.passportScan && <p className="text-red-500 text-xs mt-1 font-medium">{docErrors.passportScan}</p>}
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-end pt-4">
                                    <button onClick={handleDocRequest} disabled={savingDoc} className="bg-[#0B2C4A] text-white px-8 py-3 rounded-xl hover:bg-[#09223a] font-bold shadow-lg shadow-blue-900/20 disabled:opacity-50 transition-all">
                                        {savingDoc ? 'Submitting Request...' : 'Submit Update Request'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
