import React, { useState, useEffect } from 'react';
import ApiBaseUrl from '../constants/apiUrl';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Simple Filter states
    const [filterType, setFilterType] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');

    // Update States
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
        return <div className="p-10 text-center font-bold text-red-600 animate-pulse">Initializing User Registry...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto p-4 space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
                    <p className="text-sm text-gray-500">View and manage platform accounts</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-80">
                        <input
                            type="text"
                            placeholder="Search name, email, or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:bg-white outline-none transition-all"
                        />
                    </div>
                    <button onClick={fetchUsers} className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors">
                        <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                    </button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-wrap gap-3">
                <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-100">
                    {['all', 'user', 'admin', 'agent', 'partner'].map((type) => (
                        <button
                            key={type}
                            onClick={() => setFilterType(type)}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${filterType === type ? 'bg-red-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-xs font-bold uppercase text-gray-500 outline-none focus:ring-2 focus:ring-red-500 shadow-sm"
                >
                    <option value="all">Any Status</option>
                    <option value="verified">Verified Only</option>
                    <option value="unverified">Pending Only</option>
                    <option value="blocked">Blocked Only</option>
                </select>
            </div>

            {/* Main Table */}
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50/50 text-gray-400 font-bold border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 uppercase tracking-wider text-[10px]">Identity</th>
                                <th className="px-6 py-4 uppercase tracking-wider text-[10px]">Contact Details</th>
                                <th className="px-6 py-4 uppercase tracking-wider text-[10px]">Account Class</th>
                                <th className="px-6 py-4 uppercase tracking-wider text-[10px]">Current Status</th>
                                <th className="px-6 py-4 text-right uppercase tracking-wider text-[10px]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredUsers.map(user => (
                                <tr key={user._id} className="hover:bg-red-50/10 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {user.profilePic ? (
                                                <img src={user.profilePic} alt="" className="w-10 h-10 rounded-xl object-cover border border-gray-100 shadow-sm" />
                                            ) : (
                                                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-600 font-black border border-red-100">
                                                    {user.name?.charAt(0)}
                                                </div>
                                            )}
                                            <div>
                                                <div className="font-bold text-gray-900 group-hover:text-red-600 transition-colors">{user.name}</div>
                                                <div className="text-[10px] font-black text-gray-300">ID: {user.userId}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-gray-600 font-medium">{user.email}</div>
                                        <div className="text-[10px] text-gray-400 font-bold">{user.phoneNumber || 'N/A'}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-[10px] font-black uppercase tracking-widest">
                                            {user.UserType}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-1.5 flex-wrap">
                                            <span className={`px-2 py-0.5 rounded text-[9px] font-black tracking-widest ${user.isVerified ? 'bg-blue-100 text-blue-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                                {user.isVerified ? 'VERIFIED' : 'PENDING'}
                                            </span>
                                            {user.isBlocked && (
                                                <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded text-[9px] font-black tracking-widest">RESTRICTED</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => openView(user)}
                                                className="p-2 bg-gray-50 text-gray-400 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-all shadow-sm"
                                                title="View Full Profile"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                            </button>
                                            <button
                                                onClick={() => openModal(user)}
                                                className="px-4 py-2 text-[10px] font-black bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-sm active:scale-95 transition-all tracking-widest"
                                            >
                                                EDIT
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredUsers.length === 0 && <div className="p-16 text-center text-gray-300 font-bold uppercase tracking-[0.2em] text-xs">No entries found in registry</div>}
                </div>
            </div>

            {/* View Full Data Modal (Eye Button) */}
            {isViewOpen && viewUser && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
                        {/* Sidebar with Images */}
                        <div className="w-full md:w-80 bg-gray-50/50 p-8 border-b md:border-b-0 md:border-r border-gray-100 flex flex-col items-center gap-8 overflow-y-auto custom-scrollbar">
                            <div className="relative group text-center">
                                <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-3">Profile Identity</p>
                                {viewUser.profilePic ? (
                                    <div className="relative">
                                        <img src={viewUser.profilePic} alt="Profile" className="w-40 h-40 rounded-[2.5rem] object-cover border-4 border-white shadow-2xl relative z-10" />
                                        <div className="absolute inset-0 bg-red-600/10 blur-3xl rounded-full scale-75"></div>
                                    </div>
                                ) : (
                                    <div className="w-32 h-32 bg-white rounded-[2.5rem] flex items-center justify-center text-red-600 text-4xl font-black italic border-2 border-gray-100 shadow-xl">
                                        {viewUser.name?.charAt(0)}
                                    </div>
                                )}
                            </div>

                            <div className="w-full space-y-4">
                                <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest text-center">ID Documentation</p>
                                {viewUser.idCardPic ? (
                                    <div className="group relative">
                                        <img src={viewUser.idCardPic} alt="ID Card" className="w-full h-48 rounded-2xl object-contain bg-white border-2 border-dashed border-gray-200 p-2 shadow-sm transition-transform hover:scale-105" />
                                        <p className="text-[8px] font-black text-center mt-2 text-gray-400">CNIC / ID IMAGE</p>
                                    </div>
                                ) : (
                                    <div className="w-full h-32 bg-gray-100/50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-300">
                                        <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        <span className="text-[9px] font-black uppercase">No ID Image</span>
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 w-full">
                                <div className="flex flex-wrap gap-2 justify-center">
                                    <StatusChip label="Verified" active={viewUser.isVerified} />
                                    <StatusChip label="Blocked" active={viewUser.isBlocked} danger />
                                </div>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 flex flex-col h-full bg-white overflow-hidden">
                            <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter leading-none">{viewUser.name}</h2>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-[10px] font-black px-2 py-0.5 bg-red-600 text-white rounded uppercase tracking-[0.2em]">{viewUser.UserType}</span>
                                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">UID: {viewUser.userId}</span>
                                    </div>
                                </div>
                                <button onClick={() => setIsViewOpen(false)} className="w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-red-50 text-gray-300 hover:text-red-600 rounded-2xl transition-all">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>

                            <div className="p-10 overflow-y-auto space-y-10 flex-1 custom-scrollbar">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                    <div className="space-y-6">
                                        <h3 className="text-[10px] font-black text-red-600 uppercase tracking-[0.4em] border-l-4 border-red-600 pl-3">Member Identity</h3>
                                        <div className="space-y-4">
                                            <DataRow label="System ID (_id)" value={viewUser._id} isCode />
                                            <DataRow label="User Handle" value={viewUser.userName} />
                                            <DataRow label="Assigned CNIC" value={viewUser.cnicNumber || 'Not available'} />
                                            <DataRow label="Address" value={viewUser.Address || 'No address registered'} />
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <h3 className="text-[10px] font-black text-red-600 uppercase tracking-[0.4em] border-l-4 border-red-600 pl-3">Contact Logic</h3>
                                        <div className="space-y-4">
                                            <DataRow label="Mail Access" value={viewUser.email} />
                                            <DataRow label="Direct Phone" value={viewUser.phoneNumber || 'N/A'} />
                                            <DataRow label="Whatsapp Link" value={viewUser.WhatsappNumber || 'N/A'} />
                                            <DataRow label="Platform Wallet" value={`Rs. ${viewUser.walletBalance?.toLocaleString()}`} isBold />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 pt-6 border-t border-gray-50">
                                    <div className="space-y-6">
                                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">System Footprint</h3>
                                        <div className="space-y-4">
                                            <DataRow label="Sync Origin (IP)" value={viewUser.lastIpAddress || 'Hidden'} isCode />
                                            <DataRow label="Joined Data" value={new Date(viewUser.createdAt).toLocaleString()} />
                                            <DataRow label="Latest Interaction" value={new Date(viewUser.updatedAt).toLocaleString()} />
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Security Auth</h3>
                                        <div className="space-y-4">
                                            <DataRow label="Security OTP" value={viewUser.verificationOtp || 'None'} isCode />
                                            <DataRow label="OTP Expiry" value={viewUser.verificationOtpExpiryTime ? new Date(viewUser.verificationOtpExpiryTime).toLocaleString() : 'N/A'} />
                                            <DataRow label="Password Segment" value={viewUser.password ? viewUser.password.substring(0, 15) + '...' : 'PROTECTED'} isCode />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 border-t border-gray-50 bg-gray-50/50 flex justify-between items-center">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Viewing Mode Only</p>
                                <button
                                    onClick={() => { setIsViewOpen(false); openModal(viewUser); }}
                                    className="px-8 py-3 bg-gray-900 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-red-600 shadow-xl shadow-gray-200 transition-all active:scale-95"
                                >
                                    Modify This Registry
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal (Existing Logic) */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in zoom-in duration-200">
                    <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
                        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h2 className="font-black text-gray-900 uppercase tracking-tighter text-xl leading-none">Configuration</h2>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Update Member Logic</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 flex items-center justify-center bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-red-600 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="p-10 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-2 gap-6">
                                <FormInput label="Full Name" value={editForm.name} onChange={(val) => setEditForm({ ...editForm, name: val })} />
                                <FormInput label="Username" value={editForm.userName} onChange={(val) => setEditForm({ ...editForm, userName: val })} />
                                <FormInput label="Wallet (Rs)" type="number" value={editForm.walletBalance} onChange={(val) => setEditForm({ ...editForm, walletBalance: Number(val) })} />
                                <FormInput label="CNIC / ID" value={editForm.cnicNumber} onChange={(val) => setEditForm({ ...editForm, cnicNumber: val })} />
                            </div>
                            <FormInput label="Mail Address" value={editForm.email} onChange={(val) => setEditForm({ ...editForm, email: val })} />
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Home / Office Address</label>
                                <textarea rows="2" value={editForm.Address} onChange={(e) => setEditForm({ ...editForm, Address: e.target.value })} className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-2xl text-sm font-bold transition-all resize-none outline-none shadow-inner"></textarea>
                            </div>

                            <div className="flex gap-4 pt-6 border-t border-gray-50">
                                <button onClick={() => handleUpdateUser(selectedUser.userId, { isBlocked: !selectedUser.isBlocked })} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border-2 transition-all ${selectedUser.isBlocked ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-100' : 'bg-red-50 border-red-50 text-red-600 hover:bg-red-600 hover:text-white'}`}>
                                    {selectedUser.isBlocked ? 'UNLOCK' : 'STRICT BLOCK'}
                                </button>
                                <button onClick={() => handleUpdateUser(selectedUser.userId, { isVerified: !selectedUser.isVerified })} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border-2 transition-all ${selectedUser.isVerified ? 'bg-white border-blue-600 text-blue-600' : 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100'}`}>
                                    {selectedUser.isVerified ? 'REVOKE BADGE' : 'APPROVE'}
                                </button>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] block text-center">Security Class Assignment</label>
                                <div className="flex flex-wrap justify-center gap-3">
                                    {['user', 'agent', 'admin', 'partner'].map(role => (
                                        <button key={role} onClick={() => handleUpdateUser(selectedUser.userId, { UserType: role })} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all tracking-widest ${selectedUser.UserType === role ? 'bg-gray-900 text-white shadow-2xl' : 'bg-white border-2 border-gray-100 text-gray-300 hover:border-red-600 hover:text-red-600'}`}>
                                            {role}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="p-8 border-t border-gray-100 bg-gray-50/50">
                            <button onClick={() => handleUpdateUser(selectedUser.userId, editForm)} disabled={updating} className="w-full py-5 bg-red-600 text-white rounded-[2rem] font-black text-sm uppercase tracking-[0.4em] hover:bg-red-700 shadow-[0_20px_40px_-10px_rgba(220,38,38,0.3)] disabled:opacity-50 transition-all flex items-center justify-center gap-3">
                                {updating ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : 'Commit Data Push'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); border-radius: 10px; }
            `}</style>
        </div>
    );
};

// Helper Components
const DataRow = ({ label, value, isCode = false, isBold = false, isBadge = false }) => (
    <div className="flex flex-col gap-1 group">
        <span className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em] group-hover:text-red-600 transition-colors">{label}</span>
        <span className={`text-sm break-all ${isCode ? 'font-mono text-[11px] text-gray-500 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100 shadow-inner' : isBold ? 'font-black text-gray-900 border-b-4 border-red-50 inline-block text-lg tracking-tighter' : isBadge ? 'font-black uppercase text-red-600 italic tracking-tighter' : 'font-bold text-gray-700 leading-tight'}`}>
            {value}
        </span>
    </div>
);

const FormInput = ({ label, value, onChange, type = "text" }) => (
    <div className="space-y-2 group">
        <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest group-focus-within:text-red-600 transition-colors pl-1">{label}</label>
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent focus:border-red-600 focus:bg-white rounded-2xl text-sm font-bold transition-all outline-none shadow-sm"
        />
    </div>
);

const StatusChip = ({ label, active, danger = false }) => (
    <div className={`px-4 py-2 rounded-2xl border-2 flex items-center gap-2.5 transition-all ${active ? (danger ? 'bg-red-50 border-red-600 text-red-600 shadow-lg shadow-red-50' : 'bg-emerald-50 border-emerald-600 text-emerald-600 shadow-lg shadow-emerald-50') : 'bg-white border-gray-100 text-gray-300'}`}>
        <div className={`w-2 h-2 rounded-full ${active ? (danger ? 'bg-red-600' : 'bg-emerald-600') : 'bg-gray-200'} animate-pulse`}></div>
        <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
        {active && (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" d="M5 13l4 4L19 7" /></svg>
        )}
    </div>
);

export default Users;
