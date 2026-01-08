import React, { useState, useEffect } from 'react';
import ApiBaseUrl from '../constants/apiUrl';
import Pagination from '../compontents/Pagination';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [selectedUser, setSelectedUser] = useState(null);
    const [viewUser, setViewUser] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false);

    const fetchUsers = async () => {
        setLoading(true);
        const authData = JSON.parse(localStorage.getItem('adminAuth'));
        try {
            const response = await fetch(`${ApiBaseUrl}/getAllUsers`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authData.token}`,
                    'Content-Type': 'application/json'
                }
            });
            const result = await response.json();
            if (result.success) setUsers(result.users);
            else setError(result.message);
        } catch (err) {
            setError('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateUser = async (userId, updates) => {
        setUpdating(true);
        const authData = JSON.parse(localStorage.getItem('adminAuth'));
        try {
            const response = await fetch(`${ApiBaseUrl}/updateUser`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${authData.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId, updates })
            });
            const result = await response.json();
            if (result.success) {
                setUsers(users.map(u => u.userId === userId ? { ...u, ...result.user } : u));
                if (selectedUser?.userId === userId) setSelectedUser(result.user);
                if (viewUser?.userId === userId) setViewUser(result.user);
                alert('User updated successfully');
            }
        } catch (err) {
            alert('Update failed');
        } finally {
            setUpdating(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.userId?.toString().includes(searchTerm);
        const matchesType = filterType === 'all' || user.UserType === filterType;
        const matchesStatus = filterStatus === 'all' ||
            (filterStatus === 'verified' && user.isVerified) ||
            (filterStatus === 'blocked' && user.isBlocked) ||
            (filterStatus === 'unverified' && !user.isVerified);
        return matchesSearch && matchesType && matchesStatus;
    });

    // Pagination
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    // Reset to page 1 when search or filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterType, filterStatus]);

    const openModal = (user) => {
        setSelectedUser(user);
        setEditForm({ ...user });
        setIsModalOpen(true);
    };

    const openView = (user) => {
        setViewUser(user);
        setIsViewOpen(true);
    };

    if (loading && users.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-gray-200 border-t-red-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-sm text-gray-500">Loading users...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center justify-between">
                        <p className="text-red-600 font-semibold text-sm">{error}</p>
                        <button onClick={() => setError('')} className="text-red-600 hover:text-red-800">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}

                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                            <p className="text-sm text-gray-500 mt-1">Manage all platform users</p>
                </div>
                        <div className="flex gap-2 w-full md:w-auto">
                        <input
                            type="text"
                                placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                                className="flex-1 md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                            />
                            <button
                                onClick={fetchUsers}
                                disabled={loading}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                            >
                                <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </button>
                        </div>
                </div>
            </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div>
                            <label className="text-xs font-semibold text-gray-600 mb-2 block">User Type</label>
                            <div className="flex gap-2">
                    {['all', 'user', 'admin', 'agent', 'partner'].map((type) => (
                        <button
                            key={type}
                            onClick={() => setFilterType(type)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
                                            filterType === type ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-600 mb-2 block">Status</label>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-4 py-1.5 border border-gray-300 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-red-500"
                            >
                                <option value="all">All Status</option>
                                <option value="verified">Verified</option>
                                <option value="unverified">Unverified</option>
                                <option value="blocked">Blocked</option>
                </select>
                        </div>
                        <div className="ml-auto flex items-end">
                            <span className="text-sm text-gray-500">
                                {filteredUsers.length} of {users.length} users
                            </span>
                        </div>
                    </div>
            </div>

                {/* Users Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">User</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase hidden md:table-cell">Contact</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase hidden lg:table-cell">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                            </tr>
                        </thead>
                            <tbody className="divide-y divide-gray-200">
                                {paginatedUsers.map(user => (
                                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {user.profilePic ? (
                                                    <img src={user.profilePic} alt="" className="w-10 h-10 rounded-lg object-cover" />
                                            ) : (
                                                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center text-red-600 font-bold">
                                                    {user.name?.charAt(0)}
                                                </div>
                                            )}
                                            <div>
                                                    <p className="font-semibold text-gray-900">{user.name}</p>
                                                    <p className="text-xs text-gray-500">ID: {user.userId}</p>
                                                </div>
                                        </div>
                                    </td>
                                        <td className="px-6 py-4 hidden md:table-cell">
                                            <p className="text-sm text-gray-900">{user.email}</p>
                                            <p className="text-xs text-gray-500">{user.phoneNumber || 'N/A'}</p>
                                    </td>
                                        <td className="px-6 py-4 hidden lg:table-cell">
                                            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium capitalize">
                                            {user.UserType}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                                    user.isVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                    {user.isVerified ? 'Verified' : 'Pending'}
                                            </span>
                                            {user.isBlocked && (
                                                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">
                                                        Blocked
                                                    </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => openView(user)}
                                                    className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                                                    title="View Details"
                                            >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                            </button>
                                            <button
                                                onClick={() => openModal(user)}
                                                    className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs font-medium"
                                            >
                                                    Edit
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                        {filteredUsers.length === 0 && (
                            <div className="p-12 text-center text-gray-400">
                                <p className="text-sm font-medium">No users found</p>
                            </div>
                        )}
                    </div>
                    
                    {/* Pagination */}
                    {filteredUsers.length > 0 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            totalItems={filteredUsers.length}
                            itemsPerPage={itemsPerPage}
                        />
                    )}
                </div>

                {/* View Modal - Enhanced with Complete Details */}
            {isViewOpen && viewUser && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
                            {/* Header */}
                            <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-red-50 to-white">
                                <div className="flex items-center gap-4">
                                    {viewUser.profilePic ? (
                                        <img src={viewUser.profilePic} alt="" className="w-16 h-16 rounded-xl object-cover border-2 border-white shadow-md" />
                                    ) : (
                                        <div className="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center text-red-600 font-black text-2xl border-2 border-white shadow-md">
                                            {viewUser.name?.charAt(0)}
                                        </div>
                                    )}
                                    <div>
                                        <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">{viewUser.name}</h2>
                                        <p className="text-xs font-semibold text-red-600 uppercase tracking-widest mt-0.5">ID: {viewUser.userId}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsViewOpen(false)}
                                    className="p-2 hover:bg-white rounded-xl transition-all"
                                >
                                    <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-6">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Left Column - Images */}
                                    <div className="space-y-6">
                                        <div>
                                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Profile Picture</p>
                                            {viewUser.profilePic ? (
                                                <img src={viewUser.profilePic} alt="Profile" className="w-full aspect-square rounded-2xl object-cover border-2 border-gray-100 shadow-lg" />
                                            ) : (
                                                <div className="w-full aspect-square rounded-2xl bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-200">
                                                    <p className="text-sm font-semibold text-gray-400">No image</p>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div>
                                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">ID Card</p>
                                            {viewUser.idCardPic ? (
                                                <img src={viewUser.idCardPic} alt="ID" className="w-full aspect-video rounded-2xl object-cover border-2 border-gray-100 shadow-lg" />
                                            ) : (
                                                <div className="w-full aspect-video rounded-2xl bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-200">
                                                    <p className="text-sm font-semibold text-gray-400">No document</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Middle & Right Columns - Details */}
                                    <div className="lg:col-span-2 space-y-6">
                                        {/* Basic Information */}
                                        <section>
                                            <h3 className="text-sm font-black text-red-600 uppercase tracking-widest mb-4 border-l-4 border-red-600 pl-3">Basic Information</h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                                    <label className="text-xs font-black text-gray-400 uppercase tracking-wider">Full Name</label>
                                                    <p className="text-sm font-bold text-gray-900 mt-1">{viewUser.name}</p>
                                                </div>
                                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                                    <label className="text-xs font-black text-gray-400 uppercase tracking-wider">Username</label>
                                                    <p className="text-sm font-bold text-gray-900 mt-1">{viewUser.userName || 'N/A'}</p>
                                                </div>
                                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                                    <label className="text-xs font-black text-gray-400 uppercase tracking-wider">User Type</label>
                                                    <span className="inline-block px-3 py-1 bg-gray-200 text-gray-800 rounded-lg text-xs font-black uppercase mt-1">
                                                        {viewUser.UserType}
                                                    </span>
                                                </div>
                                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                                    <label className="text-xs font-black text-gray-400 uppercase tracking-wider">CNIC</label>
                                                    <p className="text-sm font-bold text-gray-900 mt-1">{viewUser.cnicNumber || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </section>

                                        {/* Contact Information */}
                                        <section>
                                            <h3 className="text-sm font-black text-red-600 uppercase tracking-widest mb-4 border-l-4 border-red-600 pl-3">Contact Information</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                                    <label className="text-xs font-black text-gray-400 uppercase tracking-wider">Email</label>
                                                    <p className="text-sm font-bold text-gray-900 mt-1 break-all">{viewUser.email}</p>
                                                </div>
                                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                                    <label className="text-xs font-black text-gray-400 uppercase tracking-wider">Phone Number</label>
                                                    <p className="text-sm font-bold text-gray-900 mt-1">{viewUser.phoneNumber || 'N/A'}</p>
                                                </div>
                                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                                    <label className="text-xs font-black text-gray-400 uppercase tracking-wider">WhatsApp</label>
                                                    <p className="text-sm font-bold text-gray-900 mt-1">{viewUser.WhatsappNumber || 'N/A'}</p>
                                                </div>
                                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 md:col-span-1">
                                                    <label className="text-xs font-black text-gray-400 uppercase tracking-wider">Referred By</label>
                                                    <p className="text-sm font-bold text-gray-900 mt-1">{viewUser.refferedBy || 'N/A'}</p>
                                                </div>
                                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 md:col-span-2">
                                                    <label className="text-xs font-black text-gray-400 uppercase tracking-wider">Address</label>
                                                    <p className="text-sm font-bold text-gray-900 mt-1">{viewUser.Address || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </section>

                                        {/* Status & Verification */}
                                        <section>
                                            <h3 className="text-sm font-black text-red-600 uppercase tracking-widest mb-4 border-l-4 border-red-600 pl-3">Status & Verification</h3>
                                            <div className="flex flex-wrap gap-3">
                                                <span className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider ${
                                                    viewUser.isActive !== false ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-200' : 'bg-gray-100 text-gray-600 border-2 border-gray-200'
                                                }`}>
                                                    {viewUser.isActive !== false ? '✓ Active' : '✗ Inactive'}
                                                </span>
                                                <span className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider ${
                                                    viewUser.isVerified ? 'bg-blue-100 text-blue-700 border-2 border-blue-200' : 'bg-yellow-100 text-yellow-700 border-2 border-yellow-200'
                                                }`}>
                                                    {viewUser.isVerified ? '✓ Verified' : '⏳ Unverified'}
                                                </span>
                                                <span className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider ${
                                                    viewUser.emailVerify ? 'bg-purple-100 text-purple-700 border-2 border-purple-200' : 'bg-gray-100 text-gray-600 border-2 border-gray-200'
                                                }`}>
                                                    {viewUser.emailVerify ? '✓ Email Verified' : 'Email Pending'}
                                                </span>
                                                {viewUser.isBlocked && (
                                                    <span className="px-4 py-2 bg-red-100 text-red-700 rounded-xl text-xs font-black uppercase tracking-wider border-2 border-red-200">
                                                        🚫 Blocked
                                                    </span>
                                                )}
                                            </div>
                                        </section>

                                        {/* Financial Information */}
                                        <section>
                                            <h3 className="text-sm font-black text-red-600 uppercase tracking-widest mb-4 border-l-4 border-red-600 pl-3">Financial Information</h3>
                                            <div className="p-6 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl text-white shadow-xl">
                                                <p className="text-xs font-black uppercase tracking-widest opacity-60 mb-2">Wallet Balance</p>
                                                <p className="text-3xl font-black">Rs. {viewUser.walletBalance?.toLocaleString() || 0}</p>
                                            </div>

                                            {/* Bank Accounts */}
                                            {viewUser.BankAccountinfo && viewUser.BankAccountinfo.length > 0 && (
                                                <div className="mt-4 space-y-3">
                                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Bank Accounts</p>
                                                    {viewUser.BankAccountinfo.map((bank, idx) => (
                                                        <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-4">
                                                            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center text-red-600">
                                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                                                </svg>
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="text-sm font-bold text-gray-900">{bank.bankName || 'N/A'}</p>
                                                                <p className="text-xs text-gray-500">{bank.accountName || 'N/A'}</p>
                                                            </div>
                                                            <p className="text-xs font-mono font-bold text-gray-600">{bank.accountNumber || 'N/A'}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </section>

                                        {/* Access Permissions */}
                                        {viewUser.userAccess && viewUser.userAccess.length > 0 && (
                                            <section>
                                                <h3 className="text-sm font-black text-red-600 uppercase tracking-widest mb-4 border-l-4 border-red-600 pl-3">Access Permissions</h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {viewUser.userAccess.map((access, idx) => (
                                                        <span key={idx} className="px-4 py-2 bg-blue-50 text-blue-700 border-2 border-blue-100 rounded-xl text-xs font-black uppercase">
                                                            {access}
                                                        </span>
                                                    ))}
                                                </div>
                                            </section>
                                        )}

                                        {/* Location & System Info */}
                                        <section>
                                            <h3 className="text-sm font-black text-red-600 uppercase tracking-widest mb-4 border-l-4 border-red-600 pl-3">System Information</h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                {viewUser.livelocation && (
                                                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                                        <label className="text-xs font-black text-gray-400 uppercase tracking-wider">Live Location</label>
                                                        <p className="text-sm font-bold text-gray-900 mt-1">{viewUser.livelocation}</p>
                                                    </div>
                                                )}
                                                {viewUser.lastIpAddress && (
                                                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                                        <label className="text-xs font-black text-gray-400 uppercase tracking-wider">Last IP Address</label>
                                                        <p className="text-sm font-mono font-bold text-gray-900 mt-1">{viewUser.lastIpAddress}</p>
                                                    </div>
                                                )}
                                                {viewUser.createdAt && (
                                                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                                        <label className="text-xs font-black text-gray-400 uppercase tracking-wider">Member Since</label>
                                                        <p className="text-sm font-bold text-gray-900 mt-1">{new Date(viewUser.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                )}
                                                {viewUser.updatedAt && (
                                                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                                        <label className="text-xs font-black text-gray-400 uppercase tracking-wider">Last Updated</label>
                                                        <p className="text-sm font-bold text-gray-900 mt-1">{new Date(viewUser.updatedAt).toLocaleDateString()}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </section>

                                        {/* Company Details (For Partners) */}
                                        {viewUser.UserType === 'partner' && viewUser.companyDetails && (
                                            <section className="space-y-6">
                                                <h3 className="text-sm font-black text-red-600 uppercase tracking-widest mb-4 border-l-4 border-red-600 pl-3">Company Information</h3>
                                                
                                                {/* Basic Company Info */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {viewUser.companyDetails.RegisteredCompanyName && (
                                                        <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-100">
                                                            <label className="text-xs font-black text-blue-600 uppercase tracking-wider">Company Name</label>
                                                            <p className="text-sm font-bold text-gray-900 mt-1">{viewUser.companyDetails.RegisteredCompanyName}</p>
                                                        </div>
                                                    )}
                                                    {viewUser.companyDetails.PartnerType && (
                                                        <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-100">
                                                            <label className="text-xs font-black text-blue-600 uppercase tracking-wider">Partner Type</label>
                                                            <p className="text-sm font-bold text-gray-900 mt-1">{viewUser.companyDetails.PartnerType}</p>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Registration & Tax Info */}
                                                <div>
                                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Registration & Tax Information</p>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {viewUser.companyDetails.SECPRegistrationNumber && (
                                                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                                                <label className="text-xs font-black text-gray-400 uppercase tracking-wider">SECP Reg. Number</label>
                                                                <p className="text-sm font-bold text-gray-900 mt-1">{viewUser.companyDetails.SECPRegistrationNumber}</p>
                                                            </div>
                                                        )}
                                                        {viewUser.companyDetails.NTN && (
                                                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                                                <label className="text-xs font-black text-gray-400 uppercase tracking-wider">NTN</label>
                                                                <p className="text-sm font-bold text-gray-900 mt-1">{viewUser.companyDetails.NTN}</p>
                                                            </div>
                                                        )}
                                                        {viewUser.companyDetails.STRN && (
                                                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                                                <label className="text-xs font-black text-gray-400 uppercase tracking-wider">STRN</label>
                                                                <p className="text-sm font-bold text-gray-900 mt-1">{viewUser.companyDetails.STRN}</p>
                                                            </div>
                                                        )}
                                                        {viewUser.companyDetails.AuthorizationReference && (
                                                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                                                <label className="text-xs font-black text-gray-400 uppercase tracking-wider">Authorization Reference</label>
                                                                <p className="text-sm font-bold text-gray-900 mt-1">{viewUser.companyDetails.AuthorizationReference}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Address & Website */}
                                                <div className="grid grid-cols-1 gap-4">
                                                    {viewUser.companyDetails.HeadOfficeAddress && (
                                                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                                            <label className="text-xs font-black text-gray-400 uppercase tracking-wider">Head Office Address</label>
                                                            <p className="text-sm font-bold text-gray-900 mt-1">{viewUser.companyDetails.HeadOfficeAddress}</p>
                                                        </div>
                                                    )}
                                                    {viewUser.companyDetails.OfficialWebsite && (
                                                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                                            <label className="text-xs font-black text-gray-400 uppercase tracking-wider">Official Website</label>
                                                            <a href={viewUser.companyDetails.OfficialWebsite} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-blue-600 hover:underline mt-1 block">
                                                                {viewUser.companyDetails.OfficialWebsite}
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Commission Info */}
                                                {(viewUser.companyDetails.CommissionType || viewUser.companyDetails.CommissionLock) && (
                                                    <div>
                                                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Commission Details</p>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            {viewUser.companyDetails.CommissionType && (
                                                                <div className="p-4 bg-emerald-50 rounded-xl border-2 border-emerald-100">
                                                                    <label className="text-xs font-black text-emerald-600 uppercase tracking-wider">Commission Type</label>
                                                                    <p className="text-sm font-bold text-gray-900 mt-1">{viewUser.companyDetails.CommissionType}</p>
                                                                </div>
                                                            )}
                                                            {viewUser.companyDetails.CommissionLock && (
                                                                <div className="p-4 bg-emerald-50 rounded-xl border-2 border-emerald-100">
                                                                    <label className="text-xs font-black text-emerald-600 uppercase tracking-wider">Commission Lock</label>
                                                                    <p className="text-sm font-bold text-gray-900 mt-1">{viewUser.companyDetails.CommissionLock}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Documents */}
                                                {(viewUser.companyDetails.SECPRegistrationCertificate || viewUser.companyDetails.DeliveryPolicyDocument || viewUser.companyDetails.CompanyProfilePDF || viewUser.companyDetails.AuthorizedAgencyLetter) && (
                                                    <div>
                                                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Company Documents</p>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                            {viewUser.companyDetails.SECPRegistrationCertificate && (
                                                                <a href={viewUser.companyDetails.SECPRegistrationCertificate} target="_blank" rel="noopener noreferrer" className="p-4 bg-purple-50 rounded-xl border border-purple-100 hover:border-purple-300 transition-all flex items-center gap-3 group">
                                                                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 group-hover:bg-purple-200">
                                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                        </svg>
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <p className="text-xs font-black text-purple-600 uppercase">SECP Certificate</p>
                                                                        <p className="text-xs text-gray-500">Click to view</p>
                                                                    </div>
                                                                </a>
                                                            )}
                                                            {viewUser.companyDetails.DeliveryPolicyDocument && (
                                                                <a href={viewUser.companyDetails.DeliveryPolicyDocument} target="_blank" rel="noopener noreferrer" className="p-4 bg-purple-50 rounded-xl border border-purple-100 hover:border-purple-300 transition-all flex items-center gap-3 group">
                                                                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 group-hover:bg-purple-200">
                                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                        </svg>
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <p className="text-xs font-black text-purple-600 uppercase">Delivery Policy</p>
                                                                        <p className="text-xs text-gray-500">Click to view</p>
                                                                    </div>
                                                                </a>
                                                            )}
                                                            {viewUser.companyDetails.CompanyProfilePDF && (
                                                                <a href={viewUser.companyDetails.CompanyProfilePDF} target="_blank" rel="noopener noreferrer" className="p-4 bg-purple-50 rounded-xl border border-purple-100 hover:border-purple-300 transition-all flex items-center gap-3 group">
                                                                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 group-hover:bg-purple-200">
                                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                        </svg>
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <p className="text-xs font-black text-purple-600 uppercase">Company Profile</p>
                                                                        <p className="text-xs text-gray-500">Click to view</p>
                                                                    </div>
                                                                </a>
                                                            )}
                                                            {viewUser.companyDetails.AuthorizedAgencyLetter && (
                                                                <a href={viewUser.companyDetails.AuthorizedAgencyLetter} target="_blank" rel="noopener noreferrer" className="p-4 bg-purple-50 rounded-xl border border-purple-100 hover:border-purple-300 transition-all flex items-center gap-3 group">
                                                                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 group-hover:bg-purple-200">
                                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                        </svg>
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <p className="text-xs font-black text-purple-600 uppercase">Agency Letter</p>
                                                                        <p className="text-xs text-gray-500">Click to view</p>
                                                                    </div>
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* CNIC Pictures */}
                                                {viewUser.companyDetails.cnicPic && viewUser.companyDetails.cnicPic.length > 0 && (
                                                    <div>
                                                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">CNIC Documents</p>
                                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                            {viewUser.companyDetails.cnicPic.map((cnic, idx) => (
                                                                <div key={idx} className="relative group">
                                                                    <img src={cnic} alt={`CNIC ${idx + 1}`} className="w-full aspect-video rounded-xl object-cover border-2 border-gray-200 group-hover:border-red-400 transition-all shadow-md" />
                                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-xl transition-all"></div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Authorized Contact Persons */}
                                                {viewUser.companyDetails.AuthorizedContactPerson && viewUser.companyDetails.AuthorizedContactPerson.length > 0 && (
                                                    <div>
                                                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Authorized Contact Persons</p>
                                                        <div className="space-y-3">
                                                            {viewUser.companyDetails.AuthorizedContactPerson.map((person, idx) => (
                                                                <div key={idx} className="p-5 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl border-2 border-orange-100 shadow-sm">
                                                                    <div className="flex items-start justify-between mb-3">
                                                                        <div>
                                                                            <h4 className="text-base font-black text-gray-900 uppercase">{person.fullName || 'N/A'}</h4>
                                                                            <p className="text-xs font-semibold text-orange-600 uppercase tracking-wider">{person.Designation || 'N/A'}</p>
                                                                        </div>
                                                                        <span className="px-3 py-1 bg-orange-200 text-orange-800 rounded-lg text-xs font-black">Contact #{idx + 1}</span>
                                                                    </div>
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                        {person.email && (
                                                                            <div className="flex items-center gap-2">
                                                                                <svg className="w-4 h-4 text-orange-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                                                </svg>
                                                                                <p className="text-xs font-bold text-gray-700">{person.email}</p>
                                                                            </div>
                                                                        )}
                                                                        {person.phoneNumber && (
                                                                            <div className="flex items-center gap-2">
                                                                                <svg className="w-4 h-4 text-orange-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                                                </svg>
                                                                                <p className="text-xs font-bold text-gray-700">{person.phoneNumber}</p>
                                                                            </div>
                                                                        )}
                                                                        {person.OfficeAddress && (
                                                                            <div className="flex items-start gap-2 md:col-span-2">
                                                                                <svg className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                                </svg>
                                                                                <p className="text-xs font-bold text-gray-700">{person.OfficeAddress}</p>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Authorization Declarations */}
                                                {viewUser.companyDetails.AuthorizationDeclaration && viewUser.companyDetails.AuthorizationDeclaration.length > 0 && (
                                                    <div>
                                                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Authorization Declarations</p>
                                                        <div className="space-y-2">
                                                            {viewUser.companyDetails.AuthorizationDeclaration.map((declaration, idx) => (
                                                                <div key={idx} className="p-4 bg-gray-50 rounded-xl border-l-4 border-gray-300 flex items-start gap-3">
                                                                    <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 ${declaration.isTrue ? 'bg-green-500' : 'bg-gray-300'}`}>
                                                                        {declaration.isTrue && (
                                                                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                                            </svg>
                                                                        )}
                                                                    </div>
                                                                    <p className="text-xs font-semibold text-gray-700 leading-relaxed">{declaration.text || 'N/A'}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </section>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-6 border-t border-gray-200 bg-gray-50 flex gap-3">
                                <button
                                    onClick={() => setIsViewOpen(false)}
                                    className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-gray-300 transition-colors"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => { setIsViewOpen(false); openModal(viewUser); }}
                                    className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-red-700 transition-colors shadow-lg shadow-red-100"
                                >
                                    Edit User
                                </button>
                        </div>
                    </div>
                </div>
            )}

                {/* Edit Modal */}
                {isModalOpen && selectedUser && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
                            <div>
                                    <h2 className="text-xl font-bold text-gray-900">Edit User</h2>
                                    <p className="text-sm text-gray-500 mt-0.5">Update user information</p>
                            </div>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
                                {/* Basic Info */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Full Name</label>
                                        <input
                                            type="text"
                                            value={editForm.name || ''}
                                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Username</label>
                                        <input
                                            type="text"
                                            value={editForm.userName || ''}
                                            onChange={(e) => setEditForm({ ...editForm, userName: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-600 mb-1.5 block">CNIC</label>
                                        <input
                                            type="text"
                                            value={editForm.cnicNumber || ''}
                                            onChange={(e) => setEditForm({ ...editForm, cnicNumber: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Wallet Balance</label>
                                        <input
                                            type="number"
                                            value={editForm.walletBalance || 0}
                                            onChange={(e) => setEditForm({ ...editForm, walletBalance: Number(e.target.value) })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Email</label>
                                    <input
                                        type="email"
                                        value={editForm.email || ''}
                                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Address</label>
                                    <textarea
                                        value={editForm.Address || ''}
                                        onChange={(e) => setEditForm({ ...editForm, Address: e.target.value })}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none"
                                    ></textarea>
                            </div>

                                {/* Status Controls */}
                                <div className="space-y-3 pt-4 border-t border-gray-200">
                                    <label className="text-xs font-semibold text-gray-600 block">User Type</label>
                                    <div className="flex gap-2">
                                    {['user', 'agent', 'admin', 'partner'].map(role => (
                                            <button
                                                key={role}
                                                onClick={() => handleUpdateUser(selectedUser.userId, { UserType: role })}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                                                    selectedUser.UserType === role
                                                        ? 'bg-red-600 text-white'
                                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                            >
                                            {role}
                                        </button>
                                    ))}
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => handleUpdateUser(selectedUser.userId, { isVerified: !selectedUser.isVerified })}
                                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                                            selectedUser.isVerified
                                                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                : 'bg-green-600 text-white hover:bg-green-700'
                                        }`}
                                    >
                                        {selectedUser.isVerified ? 'Unverify' : 'Verify'}
                                    </button>
                                    <button
                                        onClick={() => handleUpdateUser(selectedUser.userId, { isBlocked: !selectedUser.isBlocked })}
                                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                                            selectedUser.isBlocked
                                                ? 'bg-green-600 text-white hover:bg-green-700'
                                                : 'bg-red-100 text-red-700 hover:bg-red-200'
                                        }`}
                                    >
                                        {selectedUser.isBlocked ? 'Unblock' : 'Block'}
                                    </button>
                                </div>
                            </div>
                            <div className="p-6 border-t border-gray-200 bg-gray-50">
                                <button
                                    onClick={() => handleUpdateUser(selectedUser.userId, editForm)}
                                    disabled={updating}
                                    className="w-full py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {updating ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Saving...
                                        </>
                                    ) : 'Save Changes'}
                                </button>
                        </div>
                        </div>
                    </div>
                )}
                </div>
        </div>
    );
};

export default Users;
