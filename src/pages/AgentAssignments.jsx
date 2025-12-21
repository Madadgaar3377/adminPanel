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
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="w-12 h-12 border-4 border-gray-100 border-t-red-600 rounded-full animate-spin"></div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Synching Agent Protocols...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="flex items-center gap-4">
                        <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">Agent Assignments</h1>
                        <span className="px-3 py-1 bg-red-100 text-red-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-red-200">
                            {filtered.length} Active
                        </span>
                    </div>
                    <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.3em] mt-1">Operational Field Deployment Ledger</p>
                </div>
                <div className="flex gap-2">
                    {['all', 'pending', 'in_progress', 'completed'].map(s => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${statusFilter === s ? 'bg-gray-900 text-white shadow-lg shadow-gray-200' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                        >
                            {s.replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Search Shell */}
            <div className="relative">
                <input
                    type="text"
                    placeholder="SEARCH BY AGENT ID, APP ID, OR CITY..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-14 pr-6 py-5 bg-white border border-gray-100 rounded-[2rem] text-[11px] font-black uppercase tracking-widest outline-none transition-all shadow-sm focus:border-red-600 focus:ring-4 focus:ring-red-50/50"
                />
                <svg className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>

            {/* Table Container */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Target & Application</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Agent Credentials</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Deployment Meta</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status Matrix</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Operational Logic</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filtered.map((item) => (
                                <tr key={item._id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div>
                                            <p className="text-sm font-black text-gray-900 uppercase tracking-tight">{item.category || 'N/A'}</p>
                                            <p className="text-[9px] font-bold text-red-600 uppercase tracking-widest">ID: {item.applicationId || 'NO_LINK'}</p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div>
                                            <p className="text-xs font-black text-gray-900 tracking-tight uppercase">Agent: {item.agentId}</p>
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">User: {item.userId}</p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div>
                                            <p className="text-[10px] font-black text-gray-900 uppercase">{item.city || 'GLOBAL'}</p>
                                            <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{item.assigenAt ? new Date(item.assigenAt).toLocaleDateString() : 'N/A'}</p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${getStatusStyle(item.status)}`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end gap-2">
                                            <select
                                                onChange={(e) => handleUpdateStatus(item._id, e.target.value)}
                                                value={item.status}
                                                className="bg-gray-50 px-3 py-2 rounded-xl text-[9px] font-black uppercase outline-none focus:border-red-600 border border-transparent transition-all"
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
