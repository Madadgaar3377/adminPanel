import React, { useState, useEffect } from 'react';
import ApiBaseUrl from '../constants/apiUrl';
import { useNavigate } from 'react-router-dom';

const PropertyApplications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const authData = JSON.parse(localStorage.getItem('adminAuth'));
            const res = await fetch(`${ApiBaseUrl}/getAllApplicationsForProperty`, {
                headers: {
                    ...(authData?.token ? { Authorization: `Bearer ${authData.token}` } : {}),
                }
            });
            const data = await res.json();
            if (data.success) {
                setApplications(data.applications);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError("Connection to property vault failed.");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (applicationId, newStatus) => {
        try {
            const authData = JSON.parse(localStorage.getItem('adminAuth'));
            const res = await fetch(`${ApiBaseUrl}/updateApplicationStatusForProperty`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(authData?.token ? { Authorization: `Bearer ${authData.token}` } : {}),
                },
                body: JSON.stringify({ applicationId, status: newStatus })
            });
            const data = await res.json();
            if (data.success) {
                setApplications(applications.map(app => app.applicationId === applicationId ? { ...app, status: newStatus } : app));
                alert("Protocol Update Broadcasted Successfully.");
            } else {
                alert(data.message);
            }
        } catch (err) {
            alert("Broadcast failure.");
        }
    };

    const getStatusStyle = (status) => {
        switch (status?.toLowerCase()) {
            case 'approved': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'pending': return 'bg-orange-50 text-orange-600 border-orange-100';
            case 'rejected': return 'bg-red-50 text-red-600 border-red-100';
            case 'in_progress': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'cancelled': return 'bg-gray-100 text-gray-500 border-gray-200';
            default: return 'bg-gray-50 text-gray-600 border-gray-100';
        }
    };

    const filtered = applications.filter(app => {
        const applicant = app.commonForm?.[0] || {};
        const matchesSearch =
            (applicant.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (app.applicationId?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (applicant.city?.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStatus = statusFilter === 'all' || app.status?.toLowerCase() === statusFilter.toLowerCase();
        return matchesSearch && matchesStatus;
    });

    if (loading && applications.length === 0) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="w-12 h-12 border-4 border-gray-100 border-t-red-600 rounded-full animate-spin"></div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Synching Real Estate Applications...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">Property Acquisition Requests</h1>
                    <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.3em] mt-1">Reviewing High-Value Asset Inquiries</p>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                    {['all', 'pending', 'In_Progress', 'approved', 'rejected', 'cancelled'].map(s => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${statusFilter === s ? 'bg-gray-900 text-white shadow-xl shadow-gray-200' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
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
                    placeholder="SEARCH BY APPLICANT NAME, PROTOCOL ID OR CITY..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-14 pr-6 py-5 bg-white border border-gray-100 rounded-[2rem] text-[11px] font-black uppercase tracking-widest outline-none transition-all shadow-sm focus:border-red-600 focus:ring-4 focus:ring-red-50/50"
                />
                <svg className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>

            {error && <div className="p-4 bg-red-50 border-2 border-red-100 text-red-600 rounded-2xl font-black uppercase text-[10px] tracking-widest text-center">{error}</div>}

            {/* Applications List */}
            <div className="grid grid-cols-1 gap-4">
                {filtered.map((app) => {
                    const applicant = app.commonForm?.[0] || {};
                    const property = app.propertyDetails?.[0] || {};

                    return (
                        <div key={app._id} className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm hover:shadow-xl transition-all duration-500 group">
                            <div className="flex flex-col lg:flex-row justify-between gap-8">
                                {/* Left Side: Asset & ID */}
                                <div className="flex gap-6 items-center">
                                    <div className="w-20 h-20 rounded-3xl bg-gray-50 flex flex-col items-center justify-center text-gray-300 group-hover:bg-red-50 group-hover:text-red-600 transition-all border border-transparent group-hover:border-red-100">
                                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-10V4a1 1 0 011-1h2a1 1 0 011 1v3M12 21v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3M12 4h6m-6 4h6m2 5h.01M21 12h.01M21 16h.01" /></svg>
                                        <span className="text-[7px] font-black uppercase mt-1">Property</span>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em] mb-1">REQ ID: {app.applicationId}</p>
                                        <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter line-clamp-1">{property.adTitle || property.name || 'Untitled Asset'}</h3>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Target: {property.address || 'Location Pending'}</p>
                                    </div>
                                </div>

                                {/* Middle: Applicant Info */}
                                <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-6 pt-6 lg:pt-0 lg:border-l lg:pl-8 border-gray-100 border-t lg:border-t-0">
                                    <div className="space-y-1">
                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Applicant Protocol</p>
                                        <p className="text-[11px] font-black text-gray-900 uppercase">{applicant.name || 'Anonymous'}</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">{applicant.city || 'Remote'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Contact Channel</p>
                                        <p className="text-[11px] font-black text-gray-900 uppercase">{applicant.number || 'N/A'}</p>
                                        <p className="text-[10px] font-bold text-gray-400 lowercase">{applicant.email || 'N/A'}</p>
                                    </div>
                                    <div className="space-y-1 hidden md:block">
                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Identity Record</p>
                                        <p className="text-[11px] font-black text-gray-900 uppercase">CNIC: {applicant.cnic || 'REDACTED'}</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">Ref: {applicant.reference || 'Organic'}</p>
                                    </div>
                                </div>

                                {/* Right: Status & Actions */}
                                <div className="flex flex-row lg:flex-col justify-between items-end gap-4 min-w-[200px]">
                                    <div className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(app.status)}`}>
                                        {app.status?.replace('_', ' ')}
                                    </div>
                                    <div className="flex gap-2 w-full">
                                        <button
                                            onClick={() => navigate(`/property/application/${app.applicationId}`)}
                                            className="flex-1 py-3 bg-gray-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-gray-100"
                                        >
                                            Detailed Profile
                                        </button>
                                        <select
                                            onChange={(e) => handleUpdateStatus(app.applicationId, e.target.value)}
                                            value={app.status || 'pending'}
                                            className="flex-1 bg-gray-50 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none border border-transparent focus:border-red-600 transition-all"
                                        >
                                            <option value="pending">PENDING</option>
                                            <option value="In_Progress">IN PROGRESS</option>
                                            <option value="approved">APPROVE</option>
                                            <option value="rejected">REJECT</option>
                                            <option value="cancelled">CANCEL</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {app.applicationNote && (
                                <div className="mt-8 p-4 bg-gray-50 rounded-2xl border border-gray-100 italic text-[10px] font-bold text-gray-400">
                                    " {app.applicationNote} "
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {filtered.length === 0 && (
                <div className="p-32 text-center bg-white rounded-[3.5rem] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center">
                    <p className="text-[11px] font-black text-gray-300 uppercase tracking-widest">No matching acquisition protocols in current sector.</p>
                </div>
            )}
        </div>
    );
};

export default PropertyApplications;
