'use client';

import { useState, useEffect } from 'react';

export default function AdminUsers() {
    const [activeTab, setActiveTab] = useState('all'); // 'pending' | 'all' | 'doc-requests'
    const [users, setUsers] = useState<any[]>([]);
    const [docRequests, setDocRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (activeTab === 'doc-requests') {
            fetchDocRequests();
        } else {
            fetchUsers();
        }
    }, [activeTab]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/users-list?status=${activeTab}`);
            const data = await res.json();
            setUsers(data.users || []);
        } catch (error) {
            console.error('Failed to fetch users', error);
        }
        setLoading(false);
    };

    const fetchDocRequests = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/document-updates');
            const data = await res.json();
            setDocRequests(data.updates || []);
        } catch (error) {
            console.error('Failed to fetch doc requests', error);
        }
        setLoading(false);
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Are you sure you want to DELETE this user? This will erase ALL their data (Pitches, Files, Profile) permanently.')) return;

        try {
            const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
            if (res.ok) {
                alert('User deleted successfully');
                fetchUsers();
            } else {
                alert('Failed to delete user');
            }
        } catch (error) {
            console.error(error);
            alert('Error deleting user');
        }
    };

    const handleDocAction = async (requestId: string, action: 'approved' | 'rejected') => {
        if (!confirm(`Are you sure you want to ${action.toUpperCase()} this request?`)) return;

        try {
            const res = await fetch('/api/admin/document-updates', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requestId, action })
            });
            if (res.ok) {
                alert(`Request ${action} successfully`);
                fetchDocRequests();
            } else {
                alert('Failed to process request');
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">User Management</h2>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('all')}
                    className={`pb-2 px-1 ${activeTab === 'all' ? 'border-b-2 border-blue-600 text-blue-600 font-bold' : 'text-gray-500'}`}
                >
                    All Users
                </button>
                <button
                    onClick={() => setActiveTab('pending')}
                    className={`pb-2 px-1 ${activeTab === 'pending' ? 'border-b-2 border-blue-600 text-blue-600 font-bold' : 'text-gray-500'}`}
                >
                    Pending Approval
                </button>
                <button
                    onClick={() => setActiveTab('doc-requests')}
                    className={`pb-2 px-1 ${activeTab === 'doc-requests' ? 'border-b-2 border-blue-600 text-blue-600 font-bold' : 'text-gray-500'}`}
                >
                    Doc Update Requests
                </button>
            </div>

            {loading ? <div className="p-8 text-center text-gray-500">Loading...</div> : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    {activeTab === 'doc-requests' ? (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Documents</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {docRequests.map((req) => (
                                    <tr key={req._id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{req.entrepreneur?.fullName}</div>
                                            <div className="text-sm text-gray-500">{req.entrepreneur?.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800 uppercase">
                                                {req.documentType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {req.documentType === 'cnic' ? `CNIC: ${req.cnicNumber}` : `Passport: ${req.passportNumber}`}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                                            <div className="flex gap-2">
                                                {req.documentType === 'cnic' ? (
                                                    <>
                                                        <a href={req.cnicFront} target="_blank" rel="noopener noreferrer" className="hover:underline">Front</a>
                                                        <span className="text-gray-300">|</span>
                                                        <a href={req.cnicBack} target="_blank" rel="noopener noreferrer" className="hover:underline">Back</a>
                                                    </>
                                                ) : (
                                                    <a href={req.passportScan} target="_blank" rel="noopener noreferrer" className="hover:underline">Scan</a>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleDocAction(req._id, 'approved')} className="text-green-600 hover:text-green-900 bg-green-50 px-3 py-1 rounded-md">Approve</button>
                                                <button onClick={() => handleDocAction(req._id, 'rejected')} className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1 rounded-md">Reject</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {docRequests.length === 0 && (
                                    <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">No pending requests found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {users.map((user) => (
                                    <tr key={user._id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                                            <div className="text-sm text-gray-500">{user.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 uppercase">
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {user.status}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleDeleteUser(user._id)}
                                                className="text-red-600 hover:text-red-900 flex items-center gap-1 ml-auto"
                                                title="Delete User & Data"
                                            >
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {users.length === 0 && (
                                    <tr><td colSpan={4} className="px-6 py-4 text-center text-gray-500">No users found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
}
