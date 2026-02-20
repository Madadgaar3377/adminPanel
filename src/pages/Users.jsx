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
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [deleting, setDeleting] = useState(false);

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

    const handleDeleteUser = async (user) => {
        if (!user?.userId) return;
        setDeleting(true);
        const authData = JSON.parse(localStorage.getItem('adminAuth'));
        try {
            const response = await fetch(`${ApiBaseUrl}/admin/deleteUser/${user.userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authData.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reason: 'Deleted by admin from Users panel' })
            });
            const result = await response.json();
            if (result.success) {
                setUsers(users.filter(u => u.userId !== user.userId));
                setDeleteConfirm(null);
                setIsModalOpen(false);
                setIsViewOpen(false);
                alert('User deleted successfully');
            } else {
                alert(result.message || 'Failed to delete user');
            }
        } catch (err) {
            alert('Delete failed');
        } finally {
            setDeleting(false);
        }
    };

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
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="text-center">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-red-100 rounded-full mx-auto"></div>
                        <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin absolute top-0 left-1/2 -translate-x-1/2"></div>
                    </div>
                    <p className="mt-4 text-sm font-medium text-gray-600">Loading users...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
            <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-4 xs:py-6 sm:py-8 space-y-4 sm:space-y-6">
                {/* Error Message */}
                {error && (
                    <div className="bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-500 rounded-xl p-5 shadow-sm flex items-start justify-between">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <p className="text-red-700 font-bold text-sm">{error}</p>
                        </div>
                        <button onClick={() => setError('')} className="text-red-600 hover:text-red-800 transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}

                {/* Modern Header - v2.0.5 */}
                <div className="relative overflow-hidden bg-gradient-to-r from-red-600 via-red-500 to-rose-600 rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-40 h-40 bg-white opacity-5 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-40 h-40 bg-white opacity-5 rounded-full blur-3xl"></div>
                    
                    <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                                    <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                </div>
                                <div className="min-w-0">
                                    <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight truncate">User Management</h1>
                                    <p className="text-red-100 text-xs sm:text-sm font-medium mt-0.5">Manage all platform users • v2.0.5</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                            <div className="relative flex-1 sm:flex-initial sm:w-64">
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white placeholder:text-white/60 rounded-lg sm:rounded-xl focus:border-white/40 outline-none transition-all font-medium text-sm sm:text-base"
                                />
                                <svg className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <button
                                onClick={fetchUsers}
                                disabled={loading}
                                className="p-2 sm:p-3 bg-white/10 backdrop-blur-sm text-white rounded-lg sm:rounded-xl hover:bg-white/20 transition-all duration-300 disabled:opacity-50 active:scale-95 flex-shrink-0"
                            >
                                <svg className={`w-4 h-4 sm:w-5 sm:h-5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </button>
                        </div>
                </div>
            </div>

                {/* Filters - v2.0.5 */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6">
                    <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
                        <div className="flex-1">
                            <label className="text-xs font-bold text-gray-700 mb-3 block uppercase tracking-wide flex items-center gap-2">
                                <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                                User Type
                            </label>
                            <div className="flex flex-wrap gap-2">
                    {['all', 'user', 'admin', 'agent', 'partner'].map((type) => (
                        <button
                            key={type}
                            onClick={() => setFilterType(type)}
                                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 capitalize ${
                                            filterType === type 
                                                ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-200 scale-105' 
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                                        }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
                        </div>
                        <div className="flex-1">
                            <label className="text-xs font-bold text-gray-700 mb-3 block uppercase tracking-wide flex items-center gap-2">
                                <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Status
                            </label>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm font-bold outline-none focus:border-red-500 focus:bg-white transition-all"
                            >
                                <option value="all">All Status</option>
                                <option value="verified">✓ Verified</option>
                                <option value="unverified">⊘ Unverified</option>
                                <option value="blocked">✗ Blocked</option>
                </select>
                        </div>
                        <div className="flex items-end">
                            <div className="bg-gradient-to-r from-red-50 to-rose-50 px-6 py-3 rounded-xl border border-red-200">
                                <p className="text-xs text-gray-600 font-medium">Total Results</p>
                                <p className="text-2xl font-black text-red-600">{filteredUsers.length}</p>
                                <p className="text-xs text-gray-500">of {users.length} users</p>
                            </div>
                        </div>
                    </div>
            </div>

                {/* Users Table - v2.0.5 */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto -mx-3 xs:-mx-4 sm:mx-0">
                        <table className="w-full min-w-[640px]">
                            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                                <tr>
                                    <th className="px-3 xs:px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">User</th>
                                    <th className="px-3 xs:px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider hidden md:table-cell">Contact</th>
                                    <th className="px-3 xs:px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider hidden lg:table-cell">Type</th>
                                    <th className="px-3 xs:px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">Status</th>
                                    <th className="px-3 xs:px-4 sm:px-6 py-3 sm:py-4 text-right text-xs font-black text-gray-700 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                            <tbody className="divide-y divide-gray-100">
                                {paginatedUsers.map(user => (
                                    <tr key={user._id} className="hover:bg-gradient-to-r hover:from-red-50/50 hover:to-rose-50/50 transition-all duration-300">
                                    <td className="px-3 xs:px-4 sm:px-6 py-3 sm:py-4">
                                        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                                            {user.profilePic ? (
                                                    <img src={user.profilePic} alt="" className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl object-cover ring-2 ring-gray-200 flex-shrink-0" />
                                            ) : (
                                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg sm:rounded-xl flex items-center justify-center text-white font-black text-base sm:text-lg shadow-lg flex-shrink-0">
                                                    {user.name?.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                    <p className="font-bold text-gray-900 text-sm sm:text-base truncate">{user.name}</p>
                                                    <p className="text-xs text-gray-500 font-medium truncate">ID: {user.userId}</p>
                                                </div>
                                        </div>
                                    </td>
                                        <td className="px-3 xs:px-4 sm:px-6 py-3 sm:py-4 hidden md:table-cell">
                                            <p className="text-sm text-gray-900 font-semibold truncate">{user.email}</p>
                                            <p className="text-xs text-gray-500 font-medium truncate">{user.phoneNumber || 'N/A'}</p>
                                    </td>
                                        <td className="px-3 xs:px-4 sm:px-6 py-3 sm:py-4 hidden lg:table-cell">
                                            <span className="px-2 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-lg text-xs font-bold capitalize shadow-sm inline-block">
                                            {user.UserType}
                                        </span>
                                    </td>
                                    <td className="px-3 xs:px-4 sm:px-6 py-3 sm:py-4">
                                            <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                                <span className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-bold shadow-sm whitespace-nowrap ${
                                                    user.isVerified 
                                                        ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200' 
                                                        : 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700 border border-yellow-200'
                                                }`}>
                                                    {user.isVerified ? '✓ Verified' : '⏳ Pending'}
                                            </span>
                                            {user.isBlocked && (
                                                    <span className="px-2 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-red-100 to-rose-100 text-red-700 rounded-lg text-xs font-bold shadow-sm border border-red-200 whitespace-nowrap">
                                                        ✗ Blocked
                                                    </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-3 xs:px-4 sm:px-6 py-3 sm:py-4 text-right">
                                        <div className="flex justify-end gap-1.5 sm:gap-2">
                                            <button
                                                onClick={() => openView(user)}
                                                    className="p-1.5 sm:p-2.5 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-lg sm:rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-300 shadow-sm hover:shadow active:scale-95"
                                                    title="View Details"
                                            >
                                                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                            </button>
                                            <button
                                                onClick={() => openModal(user)}
                                                    className="px-3 sm:px-4 py-1.5 sm:py-2.5 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg sm:rounded-xl hover:from-red-700 hover:to-rose-700 transition-all duration-300 text-xs font-bold shadow-lg shadow-red-200 hover:shadow-xl active:scale-95"
                                            >
                                                    <span className="hidden sm:inline">Edit</span>
                                                    <svg className="w-4 h-4 sm:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                            </button>
                                            <button
                                                onClick={() => setDeleteConfirm(user)}
                                                    className="p-1.5 sm:p-2.5 bg-gradient-to-r from-red-100 to-rose-100 text-red-600 rounded-lg sm:rounded-xl hover:from-red-200 hover:to-rose-200 transition-all duration-300 shadow-sm hover:shadow active:scale-95"
                                                    title="Delete User"
                                            >
                                                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                        {filteredUsers.length === 0 && (
                            <div className="p-16 text-center">
                                <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <p className="text-sm font-bold text-gray-500">No users found</p>
                                <p className="text-xs text-gray-400 mt-1">Try adjusting your filters</p>
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
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 xs:p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
                            {/* Header */}
                            <div className="p-4 sm:p-6 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-red-50 to-white gap-3">
                                <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
                                    {viewUser.profilePic ? (
                                        <img src={viewUser.profilePic} alt="" className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl object-cover border-2 border-white shadow-md flex-shrink-0" />
                                    ) : (
                                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-lg sm:rounded-xl flex items-center justify-center text-red-600 font-black text-xl sm:text-2xl border-2 border-white shadow-md flex-shrink-0">
                                            {viewUser.name?.charAt(0)}
                                        </div>
                                    )}
                                    <div className="min-w-0">
                                        <h2 className="text-lg sm:text-2xl font-black text-gray-900 uppercase tracking-tight truncate">{viewUser.name}</h2>
                                        <p className="text-xs font-semibold text-red-600 uppercase tracking-widest mt-0.5 truncate">ID: {viewUser.userId}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsViewOpen(false)}
                                    className="p-2 hover:bg-white rounded-xl transition-all flex-shrink-0"
                                >
                                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
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
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                                <div className="p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl border border-gray-100">
                                                    <label className="text-xs font-black text-gray-400 uppercase tracking-wider">Full Name</label>
                                                    <p className="text-sm font-bold text-gray-900 mt-1 truncate">{viewUser.name}</p>
                                                </div>
                                                <div className="p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl border border-gray-100">
                                                    <label className="text-xs font-black text-gray-400 uppercase tracking-wider">Username</label>
                                                    <p className="text-sm font-bold text-gray-900 mt-1 truncate">{viewUser.userName || 'N/A'}</p>
                                                </div>
                                                <div className="p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl border border-gray-100">
                                                    <label className="text-xs font-black text-gray-400 uppercase tracking-wider">User Type</label>
                                                    <span className="inline-block px-2 sm:px-3 py-1 bg-gray-200 text-gray-800 rounded-lg text-xs font-black uppercase mt-1">
                                                        {viewUser.UserType}
                                                    </span>
                                                </div>
                                                <div className="p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl border border-gray-100">
                                                    <label className="text-xs font-black text-gray-400 uppercase tracking-wider">CNIC</label>
                                                    <p className="text-sm font-bold text-gray-900 mt-1 truncate">{viewUser.cnicNumber || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </section>

                                        {/* Contact Information */}
                                        <section>
                                            <h3 className="text-sm font-black text-red-600 uppercase tracking-widest mb-4 border-l-4 border-red-600 pl-3">Contact Information</h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                                <div className="p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl border border-gray-100">
                                                    <label className="text-xs font-black text-gray-400 uppercase tracking-wider">Email</label>
                                                    <p className="text-sm font-bold text-gray-900 mt-1 break-all">{viewUser.email}</p>
                                                </div>
                                                <div className="p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl border border-gray-100">
                                                    <label className="text-xs font-black text-gray-400 uppercase tracking-wider">Phone Number</label>
                                                    <p className="text-sm font-bold text-gray-900 mt-1">{viewUser.phoneNumber || 'N/A'}</p>
                                                </div>
                                                <div className="p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl border border-gray-100">
                                                    <label className="text-xs font-black text-gray-400 uppercase tracking-wider">WhatsApp</label>
                                                    <p className="text-sm font-bold text-gray-900 mt-1">{viewUser.WhatsappNumber || 'N/A'}</p>
                                                </div>
                                                <div className="p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl border border-gray-100">
                                                    <label className="text-xs font-black text-gray-400 uppercase tracking-wider">Referred By</label>
                                                    <p className="text-sm font-bold text-gray-900 mt-1 truncate">{viewUser.refferedBy || 'N/A'}</p>
                                                </div>
                                                <div className="p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl border border-gray-100 sm:col-span-2">
                                                    <label className="text-xs font-black text-gray-400 uppercase tracking-wider">Address</label>
                                                    <p className="text-sm font-bold text-gray-900 mt-1 break-words">{viewUser.Address || 'N/A'}</p>
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
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
                            <div className="p-6 border-t border-gray-200 bg-gray-50 flex gap-3">
                                <button
                                    onClick={() => handleUpdateUser(selectedUser.userId, editForm)}
                                    disabled={updating}
                                    className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {updating ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Saving...
                                        </>
                                    ) : 'Save Changes'}
                                </button>
                                <button
                                    onClick={() => setDeleteConfirm(selectedUser)}
                                    className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors font-medium flex items-center justify-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Delete
                                </button>
                        </div>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {deleteConfirm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                            <div className="p-6 text-center">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-black text-gray-900 mb-2">Delete User</h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    Are you sure you want to delete <span className="font-bold text-gray-900">{deleteConfirm.name}</span>?
                                    <br />
                                    <span className="text-xs text-gray-500">({deleteConfirm.email})</span>
                                </p>
                                <p className="text-xs text-red-600 bg-red-50 rounded-lg p-3 mb-6">
                                    This action cannot be undone. The user will be permanently removed from the system.
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setDeleteConfirm(null)}
                                        disabled={deleting}
                                        className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => handleDeleteUser(deleteConfirm)}
                                        disabled={deleting}
                                        className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {deleting ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                Deleting...
                                            </>
                                        ) : 'Delete User'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                </div>
        </div>
    );
};

export default Users;
