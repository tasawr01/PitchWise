'use client';

import { useState, useEffect } from 'react';

export default function AdminSettings() {
    const [settings, setSettings] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetch('/api/admin/settings')
            .then(res => res.json())
            .then(data => {
                setSettings(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const handleChange = (field: string, value: any) => {
        setSettings((prev: any) => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            });
            if (res.ok) {
                alert('Settings saved successfully!');
            } else {
                alert('Failed to save settings.');
            }
        } catch (error) {
            alert('Error saving settings.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8">Loading configuration...</div>;

    return (
        <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Platform Configuration</h2>
            <p className="text-gray-500 mb-8">Manage active system settings and moderation rules.</p>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-8">

                {/* Section 1: General Info */}
                <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">General Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Platform Name"
                            value={settings.platformName || ''}
                            onChange={(e: any) => handleChange('platformName', e.target.value)}
                        />
                        <Input
                            label="Support Email"
                            type="email"
                            value={settings.supportEmail || ''}
                            onChange={(e: any) => handleChange('supportEmail', e.target.value)}
                        />
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Platform Tagline</label>
                            <input
                                type="text"
                                value={settings.tagline || ''}
                                onChange={(e) => handleChange('tagline', e.target.value)}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                            />
                        </div>
                    </div>
                </div>

                {/* Section 2: Access Control */}
                <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Access Control</h3>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div>
                            <h4 className="font-semibold text-gray-900">Allow New Registrations</h4>
                            <p className="text-sm text-gray-500">Enable or disable new user signups globally.</p>
                        </div>
                        <Toggle
                            checked={settings.allowRegistrations}
                            onChange={(val: boolean) => handleChange('allowRegistrations', val)}
                        />
                    </div>
                </div>

                {/* Section 3: Content Moderation */}
                <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Content Moderation</h3>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Forbidden Keywords (Comma separated)</label>
                        <textarea
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border h-32"
                            value={settings.forbiddenKeywords || ''}
                            onChange={(e) => handleChange('forbiddenKeywords', e.target.value)}
                            placeholder="e.g. scam, fraud, illegal"
                        ></textarea>
                        <p className="text-xs text-gray-500 mt-1">
                            Pitches containing these words in the title or description will be automatically <strong>Rejected</strong>.
                        </p>
                    </div>
                </div>

            </div>

            <div className="mt-6 flex justify-end gap-3">
                <button
                    onClick={() => window.location.reload()}
                    className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 shadow-sm transition disabled:opacity-50"
                >
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </div>
    );
}

// Reusable Components
const Input = ({ label, ...props }: any) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input {...props} className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 border transition" />
    </div>
);

const Toggle = ({ checked, onChange }: { checked: boolean, onChange: (val: boolean) => void }) => {
    return (
        <button
            type="button"
            onClick={() => onChange(!checked)}
            className={`${checked ? 'bg-blue-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
        >
            <span className={`${checked ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`} />
        </button>
    );
};
