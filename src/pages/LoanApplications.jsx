import React, { useState, useEffect, useCallback } from 'react';
import ApiBaseUrl from '../constants/apiUrl';
import { useNavigate } from 'react-router-dom';

const LoanApplications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ total: 0, totalPages: 1, limit: 10 });
    const navigate = useNavigate();

    const fetchApplications = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const authData = JSON.parse(localStorage.getItem('adminAuth'));
            if (!authData?.token) {
                setError('Please log in to view loan applications.');
                setLoading(false);
                return;
            }
            const url = new URL(`${ApiBaseUrl}/getAllLoanApplications`);
            url.searchParams.set('page', String(page));
            url.searchParams.set('limit', '20');
            if (statusFilter !== 'all') {
                url.searchParams.set('status', statusFilter);
            }

            const res = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${authData.token}`,
                },
            });
            const data = await res.json();
            if (data.success) {
                setApplications(data.data || []);
                if (data.pagination) {
                    setPagination({
                        total: data.pagination.total,
                        totalPages: data.pagination.totalPages,
                        limit: data.pagination.limit,
                    });
                }
            } else {
                setError(data.message || 'Failed to fetch loan applications.');
                setApplications([]);
            }
        } catch (err) {
            setError('Failed to load loan applications. Please try again.');
            setApplications([]);
        } finally {
            setLoading(false);
        }
    }, [statusFilter, page]);

    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'pending': return 'bg-orange-50 text-orange-600 border-orange-100';
            case 'rejected': return 'bg-red-50 text-red-600 border-red-100';
            case 'in_progress': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'cancelled': return 'bg-gray-100 text-gray-500 border-gray-200';
            default: return 'bg-gray-50 text-gray-600 border-gray-100';
        }
    };

    const formatDate = (d) => {
        if (!d) return '—';
        const date = new Date(d);
        return date.toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const filteredBySearch = applications.filter((app) => {
        if (!searchTerm.trim()) return true;
        const fullName = app.applicantInfo?.fullName || '';
        const cnic = app.applicantInfo?.cnicNumber || '';
        const mobile = app.contactInfo?.mobileNumber || '';
        const appId = app.applicationId || app._id || '';
        const term = searchTerm.toLowerCase();
        return (
            fullName.toLowerCase().includes(term) ||
            cnic.includes(term) ||
            mobile.includes(term) ||
            String(appId).toLowerCase().includes(term)
        );
    });

    if (loading && applications.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="w-12 h-12 border-4 border-gray-100 border-t-red-600 rounded-full animate-spin"></div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Loading loan applications...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">Loan Applications</h1>
                    <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.3em] mt-1">All loan applications</p>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                    {['all', 'pending', 'in_progress', 'approved', 'rejected', 'cancelled'].map((status) => (
                        <button
                            key={status}
                            onClick={() => { setStatusFilter(status); setPage(1); }}
                            className={`px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${statusFilter === status ? 'bg-gray-900 text-white shadow-xl shadow-gray-200' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                        >
                            {status.replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            <div className="relative">
                <input
                    type="text"
                    placeholder="Search by name, CNIC, mobile or application ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-14 pr-6 py-5 bg-white border border-gray-100 rounded-[2rem] text-[11px] font-black uppercase tracking-widest outline-none transition-all shadow-sm focus:ring-4 focus:ring-red-50/50 focus:border-red-600"
                />
                <svg className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border-2 border-red-100 text-red-600 rounded-2xl font-bold uppercase text-[10px] tracking-widest">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBySearch.map((app) => {
                    const applicant = app.applicantInfo || {};
                    const contact = app.contactInfo || {};
                    return (
                        <div
                            key={app._id}
                            className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden flex flex-col"
                        >
                            <div className="p-8 flex-1 space-y-6">
                                <div className="flex justify-between items-start">
                                    <span className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${getStatusColor(app.status)}`}>
                                        {app.status?.replace('_', ' ') || '—'}
                                    </span>
                                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                                        {app.applicationId || app._id?.slice(-8) || '—'}
                                    </span>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-lg font-black text-gray-900 tracking-tight uppercase line-clamp-1">
                                            {applicant.fullName || 'Applicant'}
                                        </h3>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                            {contact.city || '—'} • {contact.mobileNumber || 'N/A'}
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
                                        <div>
                                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Product</p>
                                            <p className="text-xs font-black text-gray-900 line-clamp-1">{app.productName || '—'}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Bank</p>
                                            <p className="text-xs font-black text-gray-900 line-clamp-1">{app.bankName || '—'}</p>
                                        </div>
                                    </div>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                                        Applied {formatDate(app.createdAt)}
                                    </p>
                                </div>
                            </div>
                            <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-50">
                                <button
                                    onClick={() => navigate(`/loan/application/${app._id}`)}
                                    className="w-full py-3 bg-gray-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-gray-100"
                                >
                                    View details
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2 items-center flex-wrap">
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page <= 1}
                        className="px-4 py-2 rounded-xl text-sm font-bold bg-gray-100 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
                    >
                        Previous
                    </button>
                    <span className="text-sm font-bold text-gray-600">
                        Page {page} of {pagination.totalPages} ({pagination.total} total)
                    </span>
                    <button
                        onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                        disabled={page >= pagination.totalPages}
                        className="px-4 py-2 rounded-xl text-sm font-bold bg-gray-100 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
                    >
                        Next
                    </button>
                </div>
            )}

            {!loading && filteredBySearch.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h3 className="text-base font-black text-gray-900 uppercase tracking-tighter">No loan applications</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                        No loan applications found for the selected filter.
                    </p>
                </div>
            )}
        </div>
    );
};

export default LoanApplications;
