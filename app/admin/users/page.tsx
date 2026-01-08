'use client';

import { useState, useEffect } from 'react';

export default function AdminUsers() {
    const [activeTab, setActiveTab] = useState('approved'); // 'pending' | 'approved' | 'doc-requests'
    const [users, setUsers] = useState<any[]>([]);
    const [docRequests, setDocRequests] = useState<any[]>([]);
    const [selectedUser, setSelectedUser] = useState<any>(null); // For Review Modal
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

    const handleStatusUpdate = async (userId: string, status: 'approved' | 'rejected') => {
        if (!confirm(`Are you sure you want to ${status.toUpperCase()} this user?`)) return;

        try {
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            if (res.ok) {
                alert(`User ${status} successfully`);
                setSelectedUser(null); // Close modal if open
                fetchUsers();
            } else {
                alert('Failed to update user status');
            }
        } catch (error) {
            console.error(error);
            alert('Error updating user status');
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

    // Modal Component
    const UserReviewModal = ({ user, onClose }: { user: any, onClose: () => void }) => {
        if (!user) return null;
        return (
            <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto transition-all duration-300">
                <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Review User Application</h3>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                                <span className="text-2xl">&times;</span>
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Personal Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 sm:col-span-1">
                                    <h4 className="font-semibold text-gray-700 mb-2">Personal Information</h4>
                                    <div className="space-y-1 text-sm">
                                        <p><span className="text-gray-500">Name:</span> {user.fullName}</p>
                                        <p><span className="text-gray-500">Email:</span> {user.email}</p>
                                        <p><span className="text-gray-500">Phone:</span> {user.phone}</p>
                                        <p><span className="text-gray-500">Type:</span> <span className="uppercase">{user.role}</span></p>
                                    </div>
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                    <h4 className="font-semibold text-gray-700 mb-2">Profile Photo</h4>
                                    {user.profilePhoto ? (
                                        <img src={user.profilePhoto} alt="Profile" className="w-20 h-20 rounded-full object-cover border" />
                                    ) : (
                                        <span className="text-gray-400 text-sm">No photo uploaded</span>
                                    )}
                                </div>
                            </div>

                            <hr />

                            {/* Document Info */}
                            <div>
                                <h4 className="font-semibold text-gray-700 mb-3">Identity Documents ({user.documentType?.toUpperCase()})</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="text-sm space-y-1">
                                        <p><span className="text-gray-500">Number:</span> {user.documentType === 'cnic' ? user.cnicNumber : user.passportNumber}</p>
                                        {user.documentType === 'passport' && (
                                            <>
                                                <p><span className="text-gray-500">Issuing Country:</span> {user.issuingCountry}</p>
                                                <p><span className="text-gray-500">Expiry Date:</span> {user.expiryDate}</p>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {user.documentType === 'cnic' ? (
                                        <>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">CNIC Front</p>
                                                {user.cnicFront ? (
                                                    <a href={user.cnicFront} target="_blank" rel="noopener noreferrer">
                                                        <img src={user.cnicFront} alt="CNIC Front" className="w-full h-32 object-cover rounded border hover:opacity-90 transition" />
                                                    </a>
                                                ) : <span className="text-red-500 text-sm">Missing</span>}
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">CNIC Back</p>
                                                {user.cnicBack ? (
                                                    <a href={user.cnicBack} target="_blank" rel="noopener noreferrer">
                                                        <img src={user.cnicBack} alt="CNIC Back" className="w-full h-32 object-cover rounded border hover:opacity-90 transition" />
                                                    </a>
                                                ) : <span className="text-red-500 text-sm">Missing</span>}
                                            </div>
                                        </>
                                    ) : (
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Passport Scan</p>
                                            {user.passportScan ? (
                                                <a href={user.passportScan} target="_blank" rel="noopener noreferrer">
                                                    <img src={user.passportScan} alt="Passport Scan" className="w-full h-48 object-cover rounded border hover:opacity-90 transition" />
                                                </a>
                                            ) : <span className="text-red-500 text-sm">Missing</span>}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Extra Info based on Role */}
                            {user.role === 'entrepreneur' && (
                                <>
                                    <hr />
                                    <div>
                                        <h4 className="font-semibold text-gray-700 mb-2">Startup Info</h4>
                                        <p className="text-sm"><span className="text-gray-500">Startup Name:</span> {user.startupName}</p>
                                        <p className="text-sm"><span className="text-gray-500">Category:</span> {user.startupCategory}</p>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Actions Footer */}
                        <div className="mt-8 pt-4 border-t flex justify-end gap-3">
                            <button
                                onClick={() => handleStatusUpdate(user._id, 'rejected')}
                                className="px-4 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 font-medium"
                            >
                                Reject
                            </button>
                            <button
                                onClick={() => handleStatusUpdate(user._id, 'approved')}
                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium shadow-sm transition-colors"
                            >
                                Approve User
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-extrabold text-[#0B2C4A] tracking-tight">User Management</h2>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('approved')}
                    className={`pb-2 px-1 ${activeTab === 'approved' ? 'border-b-2 border-[#0B2C4A] text-[#0B2C4A] font-bold' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    All Users
                </button>
                <button
                    onClick={() => setActiveTab('pending')}
                    className={`pb-2 px-1 ${activeTab === 'pending' ? 'border-b-2 border-[#0B2C4A] text-[#0B2C4A] font-bold' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Pending Approval
                </button>
                <button
                    onClick={() => setActiveTab('doc-requests')}
                    className={`pb-2 px-1 ${activeTab === 'doc-requests' ? 'border-b-2 border-[#0B2C4A] text-[#0B2C4A] font-bold' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Doc Update Requests
                </button>
            </div>

            {loading ? <div className="p-8 text-center text-gray-500">Loading...</div> : (
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                    {activeTab === 'doc-requests' ? (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-[#0B2C4A] text-white">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">User</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Details</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Documents</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {docRequests.map((req) => (
                                    <tr key={req._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-[#0B2C4A]">{req.entrepreneur?.fullName}</div>
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
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#0B2C4A]">
                                            <div className="flex gap-2">
                                                {req.documentType === 'cnic' ? (
                                                    <>
                                                        <a href={req.cnicFront} target="_blank" rel="noopener noreferrer" className="hover:underline font-medium">Front</a>
                                                        <span className="text-gray-300">|</span>
                                                        <a href={req.cnicBack} target="_blank" rel="noopener noreferrer" className="hover:underline font-medium">Back</a>
                                                    </>
                                                ) : (
                                                    <a href={req.passportScan} target="_blank" rel="noopener noreferrer" className="hover:underline font-medium">Scan</a>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleDocAction(req._id, 'approved')} className="text-green-700 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-1 rounded-md transition-colors">Approve</button>
                                                <button onClick={() => handleDocAction(req._id, 'rejected')} className="text-red-700 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md transition-colors">Reject</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {docRequests.length === 0 && (
                                    <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No pending requests found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-[#0B2C4A] text-white">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Status</th>
                                    {activeTab === 'pending' && (
                                        <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">Review</th>
                                    )}
                                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {users.map((user) => (
                                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-[#0B2C4A]">{user.fullName}</div>
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
                                        {activeTab === 'pending' && (
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <button
                                                    onClick={() => setSelectedUser(user)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-full text-sm font-medium transition-colors duration-200 border border-indigo-200"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                    Review
                                                </button>
                                            </td>
                                        )}
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2">
                                                {activeTab === 'pending' ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleStatusUpdate(user._id, 'approved')}
                                                            className="text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded-md shadow-sm transition-colors text-xs uppercase font-bold tracking-wide"
                                                        >
                                                            Accept
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusUpdate(user._id, 'rejected')}
                                                            className="text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md shadow-sm transition-colors text-xs uppercase font-bold tracking-wide"
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                ) : (
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
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {users.length === 0 && (
                                    <tr><td colSpan={activeTab === 'pending' ? 5 : 4} className="px-6 py-4 text-center text-gray-500">
                                        {activeTab === 'pending' ? 'No pending approvals.' : 'No users found.'}
                                    </td></tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* Render Modal */}
            {selectedUser && <UserReviewModal user={selectedUser} onClose={() => setSelectedUser(null)} />}
        </div>
    );
}
