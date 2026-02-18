import React, { useState, useEffect } from 'react';
import ApiBaseUrl from '../constants/apiUrl';
import { useNavigate } from 'react-router-dom';

const AgentAssignments = () => {
    const [assignments, setAssignments] = useState([]);
    const [agentDetails, setAgentDetails] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [detailsData, setDetailsData] = useState({ agent: null, partner: null, user: null });
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

            let assignmentList = [];
            if (Array.isArray(data)) {
                assignmentList = data;
            } else if (data.success) {
                assignmentList = data.data || data.requests || data.allRequests || data.assignments || [];
            } else {
                setError(data.message || "Protocol rejection.");
                return;
            }

            setAssignments(assignmentList);

            // Fetch agent details for all unique agent IDs
            const uniqueAgentIds = [...new Set(assignmentList.map(a => a.agentId).filter(Boolean))];
            await fetchAgentDetails(uniqueAgentIds, authData?.token);
        } catch (err) {
            setError("Connection failure to deployment matrix.");
        } finally {
            setLoading(false);
        }
    };

    const fetchAgentDetails = async (agentIds, token) => {
        try {
            const details = {};
            for (const agentId of agentIds) {
                try {
                    const res = await fetch(`${ApiBaseUrl}/getUserByUserId/${agentId}`, {
                        headers: {
                            ...(token ? { Authorization: `Bearer ${token}` } : {}),
                        }
                    });
                    const data = await res.json();
                    if (data.success && data.user) {
                        details[agentId] = data.user;
                    }
                } catch (err) {
                    console.error(`Error fetching agent ${agentId}:`, err);
                }
            }
            setAgentDetails(details);
        } catch (err) {
            console.error("Error fetching agent details:", err);
        }
    };

    const fetchUserByUserId = async (userId, token) => {
        if (!userId || !token) return null;
        try {
            const res = await fetch(`${ApiBaseUrl}/getUserByUserId/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            return (data.success && data.user) ? data.user : null;
        } catch (err) {
            console.error(`Error fetching user ${userId}:`, err);
            return null;
        }
    };

    const handleViewDetails = async (assignment) => {
        setSelectedAssignment(assignment);
        setDetailsModalOpen(true);
        setDetailsData({ agent: null, partner: null, user: null });
        setDetailsLoading(true);
        const authData = JSON.parse(localStorage.getItem('adminAuth'));
        const token = authData?.token;
        if (!token) {
            setDetailsLoading(false);
            return;
        }
        try {
            const [agent, partner, user] = await Promise.all([
                fetchUserByUserId(assignment.agentId, token),
                assignment.partnerId ? fetchUserByUserId(assignment.partnerId, token) : Promise.resolve(null),
                assignment.userId ? fetchUserByUserId(assignment.userId, token) : Promise.resolve(null),
            ]);
            setDetailsData({ agent, partner, user });
        } catch (err) {
            console.error("Error loading details:", err);
        } finally {
            setDetailsLoading(false);
        }
    };

    const handleUpdateStatus = async (assignment, newStatus) => {
        const applicationId = assignment?.applicationId;
        const agentId = assignment?.agentId;
        if (!applicationId || !newStatus) {
            alert("Application ID and status are required.");
            return;
        }
        try {
            const authData = JSON.parse(localStorage.getItem('adminAuth'));
            const res = await fetch(`${ApiBaseUrl}/updateRequestStatus`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(authData?.token ? { Authorization: `Bearer ${authData.token}` } : {}),
                },
                body: JSON.stringify({
                    applicationId,
                    agentId: agentId || undefined,
                    status: newStatus,
                }),
            });
            const result = await res.json();
            if (result.success) {
                setAssignments(assignments.map(a =>
                    (a.applicationId === applicationId && (!agentId || a.agentId === agentId))
                        ? { ...a, status: newStatus }
                        : a
                ));
                alert("Status updated successfully.");
            } else {
                alert(result.message || "Update failed.");
            }
        } catch (err) {
            alert("Network error. Please try again.");
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
                        <h1 className="text-3xl font-black text-white tracking-tight">Assignment Details</h1>
                        <p className="text-red-100 text-sm font-medium mt-0.5">View assignment details — Agent, Partner & User (Applicant) • v2.0.5</p>
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
                                            <p className="text-sm font-bold text-gray-900">{agentDetails[item.agentId]?.name || item.agentId || 'N/A'}</p>
                                            <p className="text-xs text-gray-500 font-medium">ID: {item.agentId}</p>
                                            {agentDetails[item.agentId]?.email && (
                                                <p className="text-xs text-gray-400 font-medium">{agentDetails[item.agentId].email}</p>
                                            )}
                                            {agentDetails[item.agentId]?.phoneNumber && (
                                                <p className="text-xs text-gray-400 font-medium">📞 {agentDetails[item.agentId].phoneNumber}</p>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">{item.city || 'N/A'}</p>
                                            <p className="text-xs text-gray-500 font-medium">{item.assigenAt ? new Date(item.assigenAt).toLocaleDateString() : 'N/A'}</p>
                                            {item.commissionInfo?.eligibleCommission && (
                                                <p className="text-xs text-green-600 font-bold mt-1">
                                                    Commission: PKR {item.commissionInfo.eligibleCommission.toLocaleString()}
                                                </p>
                                            )}
                                            {agentDetails[item.agentId]?.BankAccountinfo && agentDetails[item.agentId].BankAccountinfo.length > 0 && (
                                                <div className="mt-2 pt-2 border-t border-gray-200">
                                                    <p className="text-xs font-bold text-gray-700 uppercase mb-1">Bank Account:</p>
                                                    {agentDetails[item.agentId].BankAccountinfo.map((account, idx) => (
                                                        <div key={idx} className="text-xs text-gray-600">
                                                            <p className="font-medium">{account.bankName || 'N/A'}</p>
                                                            <p>Account: {account.accountNumber || 'N/A'}</p>
                                                            <p>Name: {account.accountName || 'N/A'}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm border capitalize ${getStatusStyle(item.status)}`}>
                                            {item.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end items-center gap-2 flex-wrap">
                                            <button
                                                type="button"
                                                onClick={() => handleViewDetails(item)}
                                                className="px-3 py-2 rounded-xl text-xs font-bold bg-red-100 text-red-700 hover:bg-red-200 border border-red-200 transition-all"
                                            >
                                                View details
                                            </button>
                                            <select
                                                onChange={(e) => handleUpdateStatus(item, e.target.value)}
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

            {/* Complete details modal */}
            {detailsModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setDetailsModalOpen(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-red-50 to-rose-50">
                            <h3 className="text-lg font-bold text-gray-900">Assignment details — Agent, Partner & User</h3>
                            <button type="button" onClick={() => setDetailsModalOpen(false)} className="p-2 rounded-lg hover:bg-red-100 text-gray-600 hover:text-red-700">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto flex-1 space-y-6">
                            {detailsLoading ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4" />
                                    <p className="text-sm text-gray-600">Loading details...</p>
                                </div>
                            ) : selectedAssignment && (
                                <>
                                    {/* Assignment info */}
                                    <section>
                                        <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-2 flex items-center gap-2">
                                            <span className="w-1 h-4 bg-red-600 rounded" /> Assignment
                                        </h4>
                                        <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                                            <p><span className="font-semibold text-gray-600">Category:</span> {selectedAssignment.category || 'N/A'}</p>
                                            <p><span className="font-semibold text-gray-600">Application ID:</span> {selectedAssignment.applicationId || 'N/A'}</p>
                                            <p><span className="font-semibold text-gray-600">Status:</span> <span className={`capitalize ${getStatusStyle(selectedAssignment.status)} px-2 py-0.5 rounded`}>{selectedAssignment.status?.replace('_', ' ')}</span></p>
                                            <p><span className="font-semibold text-gray-600">City:</span> {selectedAssignment.city || 'N/A'}</p>
                                            <p><span className="font-semibold text-gray-600">Assigned at:</span> {selectedAssignment.assigenAt ? new Date(selectedAssignment.assigenAt).toLocaleString() : 'N/A'}</p>
                                            {selectedAssignment.transactionType && <p><span className="font-semibold text-gray-600">Transaction type:</span> {selectedAssignment.transactionType}</p>}
                                            {selectedAssignment.note && <p><span className="font-semibold text-gray-600">Note:</span> {selectedAssignment.note}</p>}
                                            {selectedAssignment.commissionInfo && (
                                                <div className="pt-2 border-t border-gray-200 mt-2">
                                                    <p className="font-semibold text-gray-600 mb-1">Commission</p>
                                                    <p>Eligible: PKR {(selectedAssignment.commissionInfo.eligibleCommission || 0).toLocaleString()}</p>
                                                    <p>Status: {selectedAssignment.commissionInfo.commissionStatus || 'N/A'}</p>
                                                    {selectedAssignment.commissionInfo.dealValue != null && <p>Deal value: PKR {Number(selectedAssignment.commissionInfo.dealValue).toLocaleString()}</p>}
                                                </div>
                                            )}
                                        </div>
                                    </section>

                                    {/* Agent */}
                                    <section>
                                        <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-2 flex items-center gap-2">
                                            <span className="w-1 h-4 bg-red-600 rounded" /> Agent
                                        </h4>
                                        <div className="bg-gray-50 rounded-xl p-4 text-sm">
                                            {detailsData.agent ? (
                                                <>
                                                    <p><span className="font-semibold text-gray-600">Name:</span> {detailsData.agent.name || 'N/A'}</p>
                                                    <p><span className="font-semibold text-gray-600">User ID:</span> {detailsData.agent.userId || selectedAssignment.agentId}</p>
                                                    <p><span className="font-semibold text-gray-600">Email:</span> {detailsData.agent.email || 'N/A'}</p>
                                                    <p><span className="font-semibold text-gray-600">Phone:</span> {detailsData.agent.phoneNumber || 'N/A'}</p>
                                                    {detailsData.agent.BankAccountinfo?.length > 0 && (
                                                        <div className="mt-2 pt-2 border-t border-gray-200">
                                                            <p className="font-semibold text-gray-600">Bank:</p>
                                                            {detailsData.agent.BankAccountinfo.map((acc, i) => (
                                                                <p key={i}>{acc.bankName} – {acc.accountNumber} ({acc.accountName})</p>
                                                            ))}
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <p className="text-gray-500">Agent ID: {selectedAssignment.agentId} (details not loaded)</p>
                                            )}
                                        </div>
                                    </section>

                                    {/* Partner */}
                                    {(selectedAssignment.partnerId || detailsData.partner) && (
                                        <section>
                                            <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-2 flex items-center gap-2">
                                                <span className="w-1 h-4 bg-red-600 rounded" /> Partner
                                            </h4>
                                            <div className="bg-gray-50 rounded-xl p-4 text-sm">
                                                {detailsData.partner ? (
                                                    <>
                                                        <p><span className="font-semibold text-gray-600">Name:</span> {detailsData.partner.name || 'N/A'}</p>
                                                        <p><span className="font-semibold text-gray-600">User ID:</span> {detailsData.partner.userId || selectedAssignment.partnerId}</p>
                                                        <p><span className="font-semibold text-gray-600">Email:</span> {detailsData.partner.email || 'N/A'}</p>
                                                        <p><span className="font-semibold text-gray-600">Phone:</span> {detailsData.partner.phoneNumber || 'N/A'}</p>
                                                        {detailsData.partner.companyDetails?.RegisteredCompanyName && (
                                                            <p><span className="font-semibold text-gray-600">Company:</span> {detailsData.partner.companyDetails.RegisteredCompanyName}</p>
                                                        )}
                                                    </>
                                                ) : (
                                                    <p className="text-gray-500">Partner ID: {selectedAssignment.partnerId}</p>
                                                )}
                                            </div>
                                        </section>
                                    )}

                                    {/* User / Applicant */}
                                    <section>
                                        <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-2 flex items-center gap-2">
                                            <span className="w-1 h-4 bg-red-600 rounded" /> User (Applicant)
                                        </h4>
                                        <div className="bg-gray-50 rounded-xl p-4 text-sm">
                                            {detailsData.user ? (
                                                <>
                                                    <p><span className="font-semibold text-gray-600">Name:</span> {detailsData.user.name || 'N/A'}</p>
                                                    <p><span className="font-semibold text-gray-600">User ID:</span> {detailsData.user.userId || selectedAssignment.userId}</p>
                                                    <p><span className="font-semibold text-gray-600">Email:</span> {detailsData.user.email || 'N/A'}</p>
                                                    <p><span className="font-semibold text-gray-600">Phone:</span> {detailsData.user.phoneNumber || 'N/A'}</p>
                                                </>
                                            ) : selectedAssignment.userId ? (
                                                <p className="text-gray-500">User ID: {selectedAssignment.userId}</p>
                                            ) : (
                                                <p className="text-gray-500">No applicant user linked</p>
                                            )}
                                        </div>
                                    </section>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AgentAssignments;
