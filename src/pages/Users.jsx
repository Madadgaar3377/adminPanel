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

                {/* View Modal */}
            {isViewOpen && viewUser && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
                                <h2 className="text-xl font-bold text-gray-900">{viewUser.name}</h2>
                                <button
                                    onClick={() => setIsViewOpen(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div className="p-6 space-y-6">
                                {/* Profile Images */}
                                <div className="flex gap-4">
                                    {viewUser.profilePic && (
                                        <div>
                                            <p className="text-xs font-semibold text-gray-600 mb-2">Profile Picture</p>
                                            <img src={viewUser.profilePic} alt="Profile" className="w-32 h-32 rounded-lg object-cover border border-gray-200" />
                                    </div>
                                    )}
                                    {viewUser.idCardPic && (
                                        <div>
                                            <p className="text-xs font-semibold text-gray-600 mb-2">ID Card</p>
                                            <img src={viewUser.idCardPic} alt="ID" className="w-48 h-32 rounded-lg object-cover border border-gray-200" />
                                    </div>
                                )}
                            </div>

                                {/* User Info */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-semibold text-gray-600">User ID</label>
                                        <p className="text-sm font-medium text-gray-900 mt-1">{viewUser.userId}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-600">Username</label>
                                        <p className="text-sm font-medium text-gray-900 mt-1">{viewUser.userName || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-600">Email</label>
                                        <p className="text-sm font-medium text-gray-900 mt-1">{viewUser.email}</p>
                            </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-600">Phone</label>
                                        <p className="text-sm font-medium text-gray-900 mt-1">{viewUser.phoneNumber || 'N/A'}</p>
                        </div>
                                <div>
                                        <label className="text-xs font-semibold text-gray-600">CNIC</label>
                                        <p className="text-sm font-medium text-gray-900 mt-1">{viewUser.cnicNumber || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-600">Wallet Balance</label>
                                        <p className="text-sm font-medium text-gray-900 mt-1">Rs. {viewUser.walletBalance?.toLocaleString() || 0}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-xs font-semibold text-gray-600">Address</label>
                                        <p className="text-sm font-medium text-gray-900 mt-1">{viewUser.Address || 'N/A'}</p>
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="flex gap-2">
                                    <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                                        viewUser.isVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                        {viewUser.isVerified ? 'Verified' : 'Unverified'}
                                    </span>
                                    <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                                        viewUser.isBlocked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                    }`}>
                                        {viewUser.isBlocked ? 'Blocked' : 'Active'}
                                    </span>
                                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold capitalize">
                                        {viewUser.UserType}
                                    </span>
                                </div>
                            </div>
                            <div className="p-6 border-t border-gray-200 bg-gray-50">
                                <button
                                    onClick={() => { setIsViewOpen(false); openModal(viewUser); }}
                                    className="w-full py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
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
