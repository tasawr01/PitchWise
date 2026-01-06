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
            <h2 className="text-2xl font-bold text-gray-800">Settings</h2>

            {/* Profile Header (Photo) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex items-center gap-6">
                <div className="relative group">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200">
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
                        className="absolute bottom-0 right-0 bg-blue-600 text-white p-1.5 rounded-full shadow hover:bg-blue-700"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>
                    </button>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-900">{user?.fullName}</h3>
                    <p className="text-gray-500 text-sm">{user?.email}</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-6 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('profile')}
                    className={`pb-3 px-1 font-medium ${activeTab === 'profile' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Profile Settings
                </button>
                <button
                    onClick={() => setActiveTab('documents')}
                    className={`pb-3 px-1 font-medium ${activeTab === 'documents' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Identity Documents
                </button>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                {activeTab === 'profile' ? (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input name="fullName" value={profileForm.fullName} onChange={handleProfileChange} className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 border" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                <input name="phone" value={profileForm.phone} onChange={handleProfileChange} className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 border" />
                            </div>
                        </div>

                        <hr className="border-gray-100" />

                        <div>
                            <h4 className="font-semibold text-gray-800 mb-4">Change Password</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                    <input type="password" name="newPassword" value={profileForm.newPassword} placeholder="Leave blank to keep current" onChange={handleProfileChange} className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 border" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                                    <input type="password" name="confirmPassword" value={profileForm.confirmPassword} onChange={handleProfileChange} className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 border" />
                                </div>
                            </div>
                            {profileForm.newPassword && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Old Password (Required)</label>
                                    <input type="password" name="oldPassword" value={profileForm.oldPassword} onChange={handleProfileChange} className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 border" />
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end pt-4">
                            <button onClick={handleProfileSave} disabled={savingProfile} className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50">
                                {savingProfile ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Current Status */}
                        <div className="bg-gray-50 p-4 rounded-lg mb-6">
                            <h4 className="font-semibold text-gray-800 mb-2">Current Verification Status</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div><span className="text-gray-600">Document Type:</span> <span className="font-medium capitalize">{user?.documentType || 'Not Set'}</span></div>
                                <div><span className="text-gray-600">Verified:</span> <span className={`font-medium ${user?.isVerified ? 'text-green-600' : 'text-amber-600'}`}>{user?.isVerified ? 'Verified' : 'Unverified'}</span></div>
                            </div>
                        </div>

                        {docStatus ? (
                            <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg flex items-center justify-between">
                                <div>
                                    <p className="font-semibold">Update Request Pending</p>
                                    <p className="text-sm mt-1">You have a pending request to update your {docStatus.documentType.toUpperCase()}. Please wait for admin approval.</p>
                                </div>
                                <span className="bg-blue-200 text-blue-900 text-xs px-2 py-1 rounded font-bold uppercase tracking-wide">Pending</span>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <h4 className="font-semibold text-gray-800">Request Document Update</h4>
                                <p className="text-sm text-gray-500">Updating these documents requires admin approval. Changes will not be live until approved.</p>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
                                    <select
                                        value={docForm.documentType}
                                        onChange={(e) => {
                                            setDocForm({ ...docForm, documentType: e.target.value });
                                            setDocErrors({});
                                        }}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 border"
                                    >
                                        <option value="cnic">CNIC (National ID)</option>
                                        <option value="passport">Passport</option>
                                    </select>
                                </div>

                                {docForm.documentType === 'cnic' ? (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">CNIC Number</label>
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
                                                className={`w-full rounded-md border ${docErrors.cnicNumber ? 'border-red-500' : 'border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5`}
                                            />
                                            {docErrors.cnicNumber && <p className="text-red-500 text-xs mt-1">{docErrors.cnicNumber}</p>}
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">CNIC Front Image</label>
                                                <input type="file" accept="image/*" onChange={(e) => handleDocFileChange('cnicFront', e)} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                                                {docErrors.cnicFront && <p className="text-red-500 text-xs mt-1">{docErrors.cnicFront}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">CNIC Back Image</label>
                                                <input type="file" accept="image/*" onChange={(e) => handleDocFileChange('cnicBack', e)} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                                                {docErrors.cnicBack && <p className="text-red-500 text-xs mt-1">{docErrors.cnicBack}</p>}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Issuing Country</label>
                                            <select
                                                value={docForm.issuingCountry}
                                                onChange={(e) => {
                                                    setDocForm({ ...docForm, issuingCountry: e.target.value });
                                                    if (docErrors.issuingCountry) setDocErrors({ ...docErrors, issuingCountry: '' });
                                                }}
                                                className={`w-full rounded-md border ${docErrors.issuingCountry ? 'border-red-500' : 'border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5`}
                                            >
                                                <option value="">Select Country</option>
                                                {Object.entries(PASSPORT_FORMATS).map(([key, { label }]) => (
                                                    <option key={key} value={key}>{label}</option>
                                                ))}
                                            </select>
                                            {docErrors.issuingCountry && <p className="text-red-500 text-xs mt-1">{docErrors.issuingCountry}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Passport Number</label>
                                            <input
                                                type="text"
                                                value={docForm.passportNumber}
                                                onChange={(e) => {
                                                    setDocForm({ ...docForm, passportNumber: e.target.value });
                                                    if (docErrors.passportNumber) setDocErrors({ ...docErrors, passportNumber: '' });
                                                }}
                                                placeholder={docForm.issuingCountry ? PASSPORT_FORMATS[docForm.issuingCountry]?.placeholder : ''}
                                                className={`w-full rounded-md border ${docErrors.passportNumber ? 'border-red-500' : 'border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5`}
                                            />
                                            {docErrors.passportNumber && <p className="text-red-500 text-xs mt-1">{docErrors.passportNumber}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                                            <input
                                                type="date"
                                                value={docForm.expiryDate}
                                                onChange={(e) => {
                                                    setDocForm({ ...docForm, expiryDate: e.target.value });
                                                    if (docErrors.expiryDate) setDocErrors({ ...docErrors, expiryDate: '' });
                                                }}
                                                className={`w-full rounded-md border ${docErrors.expiryDate ? 'border-red-500' : 'border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5`}
                                            />
                                            {docErrors.expiryDate && <p className="text-red-500 text-xs mt-1">{docErrors.expiryDate}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Passport Scan</label>
                                            <input type="file" accept="image/*" onChange={(e) => handleDocFileChange('passportScan', e)} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                                            {docErrors.passportScan && <p className="text-red-500 text-xs mt-1">{docErrors.passportScan}</p>}
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-end pt-4">
                                    <button onClick={handleDocRequest} disabled={savingDoc} className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50">
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
