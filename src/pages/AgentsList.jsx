import React, { useState, useEffect } from 'react';
import ApiBaseUrl from '../constants/apiUrl';
import { useNavigate } from 'react-router-dom';
import Pagination from '../compontents/Pagination';

const AgentsList = () => {
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedAgent, setSelectedAgent] = useState(null);
    const itemsPerPage = 10;
    const navigate = useNavigate();

    useEffect(() => {
        fetchAgents();
    }, []);

    const fetchAgents = async () => {
        setLoading(true);
        try {
            const authData = JSON.parse(localStorage.getItem('adminAuth'));
            const res = await fetch(`${ApiBaseUrl}/getAllUsers`, {
                headers: {
                    'Authorization': `Bearer ${authData.token}`,
                }
            });
            const data = await res.json();
            if (data.success) {
                const filtered = data.users.filter(u => u.UserType === 'agent');
                setAgents(filtered);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError("Failed to load agents.");
        } finally {
            setLoading(false);
        }
    };

    const handleBlockToggle = async (user) => {
        const authData = JSON.parse(localStorage.getItem('adminAuth'));
        try {
            const res = await fetch(`${ApiBaseUrl}/updateUser`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${authData.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: user.userId,
                    updates: { isBlocked: !user.isBlocked }
                })
            });
            if (res.ok) {
                fetchAgents();
                alert(`Agent ${user.isBlocked ? 'unblocked' : 'blocked'} successfully`);
            }
        } catch (err) {
            alert("Failed to update agent status.");
        }
    };

    const filtered = agents.filter(a =>
        a.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.userId?.toString().includes(searchTerm) ||
        a.phoneNumber?.includes(searchTerm)
    );

    // Pagination
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedAgents = filtered.slice(startIndex, endIndex);

    // Reset to page 1 when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    if (loading && agents.length === 0) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-gray-200 border-t-red-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-sm text-gray-500">Loading agents...</p>
            </div>
        </div>
    );

    return (
        <div className="p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Agents</h1>
                            <p className="text-sm text-gray-500 mt-1">Manage all platform agents</p>
                        </div>
                        <button
                            onClick={fetchAgents}
                            disabled={loading}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search by name, ID, or phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                        />
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <div className="mt-3 text-sm text-gray-500">
                        {filtered.length} of {agents.length} agents
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                {/* Agents Grid */}
                {filtered.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedAgents.map((agent) => (
                        <div key={agent._id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                            <div className="p-6 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                                        agent.isBlocked
                                            ? 'bg-red-100 text-red-700'
                                            : 'bg-green-100 text-green-700'
                                    }`}>
                                        {agent.isBlocked ? 'Blocked' : 'Active'}
                                    </span>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 truncate">{agent.name || "Unnamed Agent"}</h3>
                                    <p className="text-xs text-gray-500 mt-0.5">ID: {agent.userId}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Email</p>
                                        <p className="text-sm font-medium text-gray-900 truncate">{agent.email || 'N/A'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500 mb-1">Phone</p>
                                        <p className="text-sm font-medium text-gray-900 truncate">{agent.phoneNumber || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-2">
                                <button
                                    onClick={() => setSelectedAgent(agent)}
                                    className="px-4 py-2 bg-white border border-gray-200 text-gray-900 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    View
                                </button>
                                <button
                                    onClick={() => navigate(`/agent/update/${agent._id}`)}
                                    className="flex-1 py-2 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors text-sm font-medium"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleBlockToggle(agent)}
                                    className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                                        agent.isBlocked
                                            ? 'bg-green-600 text-white hover:bg-green-700'
                                            : 'bg-gray-200 text-gray-700 hover:bg-red-100 hover:text-red-600'
                                    }`}
                                >
                                    {agent.isBlocked ? 'Unblock' : 'Block'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                )}

                {/* Pagination */}
                {filtered.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            totalItems={filtered.length}
                            itemsPerPage={itemsPerPage}
                        />
                    </div>
                )}

                {filtered.length === 0 && (
                    <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Agents Found</h3>
                        <p className="text-sm text-gray-500">
                            {searchTerm ? 'Try adjusting your search' : 'No agents registered yet'}
                        </p>
                    </div>
                )}
            </div>

            {/* Agent Details Modal */}
            {selectedAgent && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setSelectedAgent(null)}></div>
                    <div className="relative w-full max-w-5xl max-h-[90vh] bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                        {/* Modal Header */}
                        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-200">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900 tracking-tighter uppercase">{selectedAgent.name}</h2>
                                    <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.3em]">Agent ID: {selectedAgent.userId || selectedAgent._id}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedAgent(null)} className="p-3 hover:bg-white rounded-2xl transition-all text-gray-400 hover:text-red-600 border border-transparent hover:border-gray-100">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-8 md:p-12">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                                {/* Left Column: Identity & Images */}
                                <div className="space-y-10 group">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Profile Portrait</label>
                                        <div className="aspect-square rounded-[2.5rem] bg-gray-50 border-4 border-white shadow-xl overflow-hidden group/img">
                                            {selectedAgent.profilePic ? (
                                                <img src={selectedAgent.profilePic} alt="" className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-700" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-200">
                                                    <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Verification Document (CNIC)</label>
                                        <div className="aspect-video rounded-[2rem] bg-gray-50 border border-gray-100 overflow-hidden shadow-lg shadow-gray-100/50">
                                            {selectedAgent.idCardPic ? (
                                                <img src={selectedAgent.idCardPic} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300 italic text-[10px] font-black uppercase tracking-widest">
                                                    No Document Found
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Details */}
                                <div className="lg:col-span-2 space-y-12">
                                    {/* Identity Block */}
                                    <section className="space-y-6">
                                        <h4 className="text-[11px] font-black text-red-600 uppercase tracking-[0.2em] px-2 border-l-4 border-red-600">Agent Identity</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100/50">
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Full Legal Name</p>
                                                <p className="text-sm font-bold text-gray-900 uppercase tracking-tight">{selectedAgent.name}</p>
                                            </div>
                                            <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100/50">
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">System Username</p>
                                                <p className="text-sm font-bold text-gray-900 tracking-tight">{selectedAgent.userName || 'N/A'}</p>
                                            </div>
                                            <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100/50">
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Government ID (CNIC)</p>
                                                <p className="text-sm font-bold text-gray-900 tracking-tight">{selectedAgent.cnicNumber || 'PENDING'}</p>
                                            </div>
                                            <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100/50">
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Member Since</p>
                                                <p className="text-sm font-bold text-gray-900 tracking-tight">{new Date(selectedAgent.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>

                                        {/* Access Authorization */}
                                        {selectedAgent.userAccess && selectedAgent.userAccess.length > 0 && (
                                            <div className="col-span-full mt-4">
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">Authorized Access Areas</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedAgent.userAccess.map((access, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="px-4 py-2 bg-red-50 border border-red-100 text-red-700 rounded-xl text-[10px] font-black uppercase tracking-wider"
                                                        >
                                                            {access}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </section>

                                    {/* Status & Verification Block */}
                                    <section className="space-y-6">
                                        <h4 className="text-[11px] font-black text-red-600 uppercase tracking-[0.2em] px-2 border-l-4 border-red-600">Status & Verification</h4>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-2">Active Status</p>
                                                <div className={`inline-block px-3 py-1 rounded-lg text-[9px] font-black uppercase ${selectedAgent.isActive !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                    {selectedAgent.isActive !== false ? '✓ Active' : '✗ Inactive'}
                                                </div>
                                            </div>
                                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-2">Blocked</p>
                                                <div className={`inline-block px-3 py-1 rounded-lg text-[9px] font-black uppercase ${selectedAgent.isBlocked ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                                    {selectedAgent.isBlocked ? '✗ Blocked' : '✓ Clear'}
                                                </div>
                                            </div>
                                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-2">Verified</p>
                                                <div className={`inline-block px-3 py-1 rounded-lg text-[9px] font-black uppercase ${selectedAgent.isVerified ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'}`}>
                                                    {selectedAgent.isVerified ? '✓ Verified' : 'Pending'}
                                                </div>
                                            </div>
                                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-2">Email Verify</p>
                                                <div className={`inline-block px-3 py-1 rounded-lg text-[9px] font-black uppercase ${selectedAgent.emailVerify ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'}`}>
                                                    {selectedAgent.emailVerify ? '✓ Verified' : 'Pending'}
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    {/* Communication Block */}
                                    <section className="space-y-6">
                                        <h4 className="text-[11px] font-black text-red-600 uppercase tracking-[0.2em] px-2 border-l-4 border-red-600">Communication & Location</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100/50 flex items-center gap-4">
                                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-red-600 shadow-sm border border-gray-50">
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                                </div>
                                                <div className="flex-1 overflow-hidden">
                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Email</p>
                                                    <p className="text-[11px] font-bold text-gray-900 truncate">{selectedAgent.email}</p>
                                                </div>
                                            </div>
                                            <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100/50 flex items-center gap-4">
                                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm border border-gray-50">
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Phone Number</p>
                                                    <p className="text-sm font-bold text-gray-900">{selectedAgent.phoneNumber || 'N/A'}</p>
                                                </div>
                                            </div>
                                            {selectedAgent.WhatsappNumber && selectedAgent.WhatsappNumber !== selectedAgent.phoneNumber && (
                                                <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100/50 flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm border border-gray-50">
                                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">WhatsApp</p>
                                                        <p className="text-sm font-bold text-gray-900">{selectedAgent.WhatsappNumber}</p>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100/50 col-span-full">
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Physical Address</p>
                                                <p className="text-sm font-bold text-gray-900 leading-relaxed">{selectedAgent.Address || 'NO_ADDRESS_REGISTERED'}</p>
                                            </div>
                                        </div>
                                    </section>

                                    {/* Financial Block */}
                                    <section className="space-y-6">
                                        <h4 className="text-[11px] font-black text-red-600 uppercase tracking-[0.2em] px-2 border-l-4 border-red-600">Financial Information</h4>
                                        <div className="p-6 bg-gray-900 rounded-[2rem] text-white shadow-xl shadow-gray-200">
                                            <div className="flex justify-between items-center mb-8">
                                                <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-50">Wallet Balance</p>
                                                <div className="px-3 py-1 bg-white/10 rounded-lg text-[8px] font-black uppercase tracking-widest">Active Balance</div>
                                            </div>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-[10px] font-black opacity-50 uppercase">PKR</span>
                                                <h3 className="text-4xl font-black tracking-tighter">{selectedAgent.walletBalance?.toLocaleString() || '0'}</h3>
                                            </div>
                                        </div>

                                        {/* Bank Accounts */}
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Registered Bank Accounts</label>
                                            {selectedAgent.BankAccountinfo?.length > 0 ? selectedAgent.BankAccountinfo.map((bank, idx) => (
                                                <div key={idx} className="p-5 bg-gray-50 rounded-2xl border border-gray-100 flex justify-between items-center group/bank hover:border-red-200 transition-colors">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400 group-hover/bank:text-red-600 transition-colors">
                                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-black text-gray-900 uppercase tracking-tight">{bank.bankName}</p>
                                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{bank.accountName}</p>
                                                        </div>
                                                    </div>
                                                    <p className="text-[11px] font-mono font-black text-gray-400 group-hover/bank:text-gray-900 transition-colors">{bank.accountNumber}</p>
                                                </div>
                                            )) : (
                                                <div className="p-6 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100 flex items-center justify-center">
                                                    <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest">No bank accounts registered.</p>
                                                </div>
                                            )}
                                        </div>
                                    </section>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-8 border-t border-gray-100 flex justify-end gap-4 bg-gray-50/50">
                            <button
                                onClick={() => setSelectedAgent(null)}
                                className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => {
                                    const id = selectedAgent._id;
                                    setSelectedAgent(null);
                                    navigate(`/agent/update/${id}`);
                                }}
                                className="px-10 py-4 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-red-100 hover:bg-black hover:shadow-gray-200 transition-all active:scale-95"
                            >
                                Edit Agent
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AgentsList;
