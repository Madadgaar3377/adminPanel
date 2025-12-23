import React, { useState, useEffect } from 'react';
import ApiBaseUrl from '../constants/apiUrl';
import { useNavigate } from 'react-router-dom';

const Partners = () => {
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchPartners();
    }, []);

    const fetchPartners = async () => {
        setLoading(true);
        try {
            const authData = JSON.parse(localStorage.getItem('adminAuth'));
            const res = await fetch(`${ApiBaseUrl}/getAllPartners`, {
                headers: {
                    'Authorization': `Bearer ${authData.token}`,
                }
            });
            const data = await res.json();
            if (data.success) {
                setPartners(data.partners || data.users || []);
            } else {
                setError(data.message || "Operation rejected by backend.");
            }
        } catch (err) {
            setError("Connection failure: Unable to sync partner directory.");
        } finally {
            setLoading(false);
        }
    };

    const filtered = partners.filter(p =>
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.userId?.toString().includes(searchTerm) ||
        p.phoneNumber?.includes(searchTerm)
    );

    if (loading && partners.length === 0) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="w-12 h-12 border-4 border-gray-100 border-t-red-600 rounded-full animate-spin"></div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Synching Partner Network...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">  Partners</h1>
                    <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.3em] mt-1">Collaboration Ledger</p>
                </div>
                <div className="hidden md:block">
                    <span className="px-6 py-3 bg-gray-50 text-gray-400 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-gray-100">
                        {partners.length} Active Partners
                    </span>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="p-4 bg-red-50 border-2 border-red-100 text-red-600 rounded-2xl font-black uppercase text-[10px] tracking-widest text-center">
                    {error}
                </div>
            )}

            {/* Search Shell */}
            <div className="relative">
                <input
                    type="text"
                    placeholder="SEARCH BY NAME, ID OR PHONE..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-14 pr-6 py-5 bg-white border border-gray-100 rounded-[2rem] text-[11px] font-black uppercase tracking-widest outline-none transition-all shadow-sm focus:border-red-600 focus:ring-4 focus:ring-red-50/50"
                />
                <svg className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>

            {/* Partners Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filtered.length > 0 ? filtered.map((partner) => (
                    <div key={partner._id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col group overflow-hidden">
                        <div className="p-8 flex-1 space-y-6">
                            <div className="flex justify-between items-start">
                                <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
                                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                                <div className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border border-emerald-100 bg-emerald-50 text-emerald-600`}>
                                    ACTIVE PARTNER
                                </div>
                            </div>

                            <div className="space-y-1">
                                <h3 className="text-xl font-black text-gray-900 tracking-tighter uppercase">{partner.name || "UNNAMED_ENTITY"}</h3>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Partner ID: {partner.userId}</p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-gray-600">
                                    <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                    <p className="text-[10px] font-bold uppercase truncate">{partner.email || 'NO_EMAIL'}</p>
                                </div>
                                <div className="flex items-center gap-3 text-gray-600">
                                    <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                    <p className="text-[10px] font-bold uppercase">{partner.phoneNumber || 'NO_PHONE'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-50">
                            <button
                                onClick={() => navigate(`/agent/update/${partner._id}`)}
                                className="w-full py-3 bg-gray-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-gray-100"
                            >
                                Management Console
                            </button>
                        </div>
                    </div>
                )) : (
                    <div className="col-span-full py-20 text-center bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">No strategic partners found in registry.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Partners;
