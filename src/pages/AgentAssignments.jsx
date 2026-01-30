import React, { useState, useEffect } from 'react';
import ApiBaseUrl from '../constants/apiUrl';
import { useNavigate } from 'react-router-dom';

const AgentAssignments = () => {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchAssignments();
    }, []);

    const fetchAssignments = async () => {
        setLoading(true);
        try {
            const authData = JSON.parse(localStorage.getItem('adminAuth'));
            const res = await fetch(`${ApiBaseUrl}/getAllRequests`, {
                headers: {
                    ...(authData?.token ? { Authorization: `Bearer ${authData.token}` } : {}),
                }
            });
            const data = await res.json();
            console.log("Assignment Feed Data:", data);

            if (Array.isArray(data)) {
                setAssignments(data);
            } else if (data.success) {
                // Try multiple common keys for the data array
                const list = data.data || data.requests || data.allRequests || data.assignments || [];
                setAssignments(list);
            } else {
                setError(data.message || "Protocol rejection.");
            }
        } catch (err) {
            setError("Connection failure to deployment matrix.");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (requestId, newStatus) => {
        try {
            const authData = JSON.parse(localStorage.getItem('adminAuth'));
            const res = await fetch(`${ApiBaseUrl}/updateRequestStatus`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(authData?.token ? { Authorization: `Bearer ${authData.token}` } : {}),
                },
                body: JSON.stringify({
                    requestId, // Adjust based on backend expectancy
                    status: newStatus
                })
            });
            const result = await res.json();
            if (result.success) {
                setAssignments(assignments.map(a => a._id === requestId ? { ...a, status: newStatus } : a));
                alert("Status Override Successful.");
            } else {
                alert(result.message || "Update rejected.");
            }
        } catch (err) {
            alert("Broadcast failure.");
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'approved': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'pending': return 'bg-orange-50 text-orange-600 border-orange-100';
            case 'rejected': return 'bg-red-50 text-red-600 border-red-100';
            case 'in_progress': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'completed': return 'bg-purple-50 text-purple-600 border-purple-100';
            default: return 'bg-gray-50 text-gray-600 border-gray-100';
        }
    };

    const filtered = assignments.filter(a => {
        const matchesSearch =
            (a.agentId?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (a.applicationId?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (a.city?.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (loading && assignments.length === 0) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] bg-gradient-to-br from-gray-50 to-white space-y-4">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-red-100 rounded-full"></div>
                <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin absolute top-0"></div>
            </div>
            <p className="text-sm font-medium text-gray-600">Loading agent assignments...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            {/* Modern Header - v2.0.5 */}
            <div className="relative overflow-hidden bg-gradient-to-r from-red-600 via-red-500 to-rose-600 rounded-3xl shadow-2xl p-8">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-40 h-40 bg-white opacity-5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-40 h-40 bg-white opacity-5 rounded-full blur-3xl"></div>
                
                <div className="relative flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tight">Agent Assignments</h1>
                        <p className="text-red-100 text-sm font-medium mt-0.5">View and manage agent assignments • v2.0.5</p>
                    </div>
                </div>
            </div>

            {/* Filters & Search - v2.0.5 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1">
                        <label className="text-xs font-bold text-gray-700 mb-3 block uppercase tracking-wide flex items-center gap-2">
                            <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                            </svg>
                            Filter by Status
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {['all', 'pending', 'in_progress', 'completed'].map(s => (
                                <button
                                    key={s}
                                    onClick={() => setStatusFilter(s)}
                                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 capitalize ${
                                        statusFilter === s 
                                            ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-200 scale-105' 
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                                    }`}
                                >
                                    {s.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="lg:w-1/3">
                        <label className="text-xs font-bold text-gray-700 mb-3 block uppercase tracking-wide flex items-center gap-2">
                            <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            Search
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search by agent, app ID, or city..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:bg-white outline-none transition-all font-medium"
                            />
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
                <div className="mt-4 flex items-center justify-between flex-wrap gap-4">
                    <div className="bg-gradient-to-r from-red-50 to-rose-50 px-4 py-2 rounded-xl border border-red-200 inline-flex items-center gap-2">
                        <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-sm font-bold text-red-700">{filtered.length} Assignments Found</span>
                    </div>
                </div>
            </div>

            {/* Table Container - v2.0.5 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                                <th className="px-6 py-4 text-xs font-black text-gray-700 uppercase tracking-wider">Application</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-700 uppercase tracking-wider">Agent</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-700 uppercase tracking-wider">Details</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-700 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-700 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filtered.map((item) => (
                                <tr key={item._id} className="hover:bg-gradient-to-r hover:from-red-50/50 hover:to-rose-50/50 transition-all duration-300">
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">{item.category || 'N/A'}</p>
                                            <p className="text-xs text-gray-500 font-medium">ID: {item.applicationId || 'N/A'}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">{item.agentId}</p>
                                            <p className="text-xs text-gray-500 font-medium">User: {item.userId}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">{item.city || 'N/A'}</p>
                                            <p className="text-xs text-gray-500 font-medium">{item.assigenAt ? new Date(item.assigenAt).toLocaleDateString() : 'N/A'}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm border capitalize ${getStatusStyle(item.status)}`}>
                                            {item.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <select
                                                onChange={(e) => handleUpdateStatus(item._id, e.target.value)}
                                                value={item.status}
                                                className="bg-gradient-to-br from-gray-100 to-gray-200 px-4 py-2 rounded-xl text-sm font-bold capitalize outline-none focus:border-red-500 border-2 border-transparent transition-all"
                                            >
                                                <option value="pending">PENDING</option>
                                                <option value="in_progress">IN PROGRESS</option>
                                                <option value="completed">COMPLETE</option>
                                                <option value="cancelled">CANCEL</option>
                                            </select>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filtered.length === 0 && (
                    <div className="p-20 text-center">
                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">No active deployments found in registry.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AgentAssignments;
