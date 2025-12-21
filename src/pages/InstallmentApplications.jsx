import React, { useState, useEffect } from 'react';
import ApiBaseUrl from '../constants/apiUrl';
import { useNavigate } from 'react-router-dom';

const InstallmentApplications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchApplications();
    }, [statusFilter]);

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const authData = JSON.parse(localStorage.getItem('adminAuth'));
            const url = new URL(`${ApiBaseUrl}/getAllApplications`);
            if (statusFilter !== 'all') {
                url.searchParams.append('status', statusFilter);
            }

            const res = await fetch(url, {
                headers: {
                    ...(authData?.token ? { Authorization: `Bearer ${authData.token}` } : {}),
                }
            });
            const data = await res.json();
            if (data.success) {
                setApplications(data.data);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError("Failed to fetch applications.");
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'pending': return 'bg-orange-50 text-orange-600 border-orange-100';
            case 'rejected': return 'bg-red-50 text-red-600 border-red-100';
            case 'in_progress': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'completed': return 'bg-purple-50 text-purple-600 border-purple-100';
            default: return 'bg-gray-50 text-gray-600 border-gray-100';
        }
    };

    const filteredApplications = applications.filter(app => {
        const user = app.UserInfo?.[0] || {};
        const matchesSearch =
            (user.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (user.phone?.includes(searchTerm)) ||
            (app.applicationId?.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesSearch;
    });

    if (loading && applications.length === 0) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="w-12 h-12 border-4 border-gray-100 border-t-red-600 rounded-full animate-spin"></div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Accessing Application Vault...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">Installment Applications</h1>
                    <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.3em] mt-1">Reviewing Consumer Credit Requests</p>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                    {['all', 'pending', 'in_progress', 'approved', 'rejected', 'completed'].map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${statusFilter === status ? 'bg-gray-900 text-white shadow-xl shadow-gray-200' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                        >
                            {status.replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <input
                    type="text"
                    placeholder="SEARCH BY APPLICANT NAME, PHONE OR APP ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-14 pr-6 py-5 bg-white border border-gray-100 rounded-[2rem] text-[11px] font-black uppercase tracking-widest outline-none transition-all shadow-sm focus:ring-4 focus:ring-red-50/50 focus:border-red-600"
                />
                <svg className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>

            {error && <div className="p-4 bg-red-50 border-2 border-red-100 text-red-600 rounded-2xl font-bold uppercase text-[10px] tracking-widest">{error}</div>}

            {/* Applications Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredApplications.map((app) => {
                    const user = app.UserInfo?.[0] || {};
                    const plan = app.PlanInfo?.[0] || {};
                    const fin = app.PlanInfo?.[1] || {};

                    return (
                        <div key={app._id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden flex flex-col group">
                            <div className="p-8 flex-1 space-y-6">
                                <div className="flex justify-between items-start">
                                    <div className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${getStatusColor(app.status)}`}>
                                        {app.status.replace('_', ' ')}
                                    </div>
                                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{app.applicationId || 'NO_ID'}</span>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-lg font-black text-gray-900 tracking-tight uppercase line-clamp-1">{user.name || 'Anonymous Applicant'}</h3>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{user.city || 'Remote'} • {user.phone || 'N/A'}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
                                        <div>
                                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Plan Selection</p>
                                            <p className="text-xs font-black text-gray-900 line-clamp-1">{plan.planType || 'Standard Plan'}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Income Bracket</p>
                                            <p className="text-xs font-black text-gray-900 line-clamp-1">{user.monthlyIncome || 'N/A'}</p>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
                                        <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-gray-400">
                                            <span>Monthly Burden</span>
                                            <span className="text-red-600">RS. {fin.monthlyInstallment?.toLocaleString() || '0'}</span>
                                        </div>
                                        <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                                            <div className="h-full bg-red-600 rounded-full" style={{ width: '40%' }}></div>
                                        </div>
                                        <div className="flex justify-between text-[8px] font-bold text-gray-400 uppercase">
                                            <span>Tenure: {fin.tenureMonths || '0'}M</span>
                                            <span>Downpayment: RS. {fin.downPayment?.toLocaleString() || '0'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-50 flex gap-2">
                                <button
                                    onClick={() => navigate(`/installments/application/${app.applicationId}`)}
                                    className="flex-1 py-3 bg-gray-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-gray-100"
                                >
                                    Full Profile
                                </button>
                                <button className="px-4 py-3 bg-white text-gray-400 hover:text-red-600 rounded-xl transition-all border border-gray-100">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredApplications.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h3 className="text-base font-black text-gray-900 uppercase tracking-tighter">No Active Protocols</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">No installment applications found in the selected category.</p>
                </div>
            )}
        </div>
    );
};

export default InstallmentApplications;
