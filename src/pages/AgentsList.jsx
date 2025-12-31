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
        </div>
    );
};

export default AgentsList;
