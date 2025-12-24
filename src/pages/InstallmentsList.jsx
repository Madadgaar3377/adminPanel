import React, { useState, useEffect } from 'react';
import ApiBaseUrl from '../constants/apiUrl';
import { NavLink, useNavigate } from 'react-router-dom';

const InstallmentsList = () => {
    const [installments, setInstallments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const navigate = useNavigate();

    useEffect(() => {
        fetchInstallments();
    }, []);

    const fetchInstallments = async () => {
        setLoading(true);
        try {
            const authData = JSON.parse(localStorage.getItem('adminAuth'));
            const res = await fetch(`${ApiBaseUrl}/getAllInstallments`, {
                headers: {
                    ...(authData?.token ? { Authorization: `Bearer ${authData.token}` } : {}),
                }
            });
            const data = await res.json();
            if (data.success) {
                setInstallments(data.data);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError("Failed to connect to server");
        } finally {
            setLoading(false);
        }
    };

    const filteredData = installments.filter(item => {
        const matchesSearch = item.productName.toLowerCase().includes(search.toLowerCase()) ||
            item.companyName.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const categories = ["All", ...new Set(installments.map(i => i.category))];

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Querying Ledger...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">Installment Ledger</h1>
                    <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.3em] mt-1">Active Plans & Financial Assets</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button onClick={() => navigate('/installments/add')} className="px-6 py-3 bg-red-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-100">
                        +  New Plan
                    </button>
                    <button onClick={fetchInstallments} className="p-3 bg-gray-50 text-gray-400 hover:text-gray-900 rounded-2xl transition-all border border-gray-100">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Filter Hub */}
            <div className="bg-white p-4 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <input
                        type="text"
                        placeholder="SEARCH BY PRODUCT OR BRAND..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-6 py-4 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-2xl text-xs font-black uppercase tracking-widest outline-none transition-all"
                    />
                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategoryFilter(cat)}
                            className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${categoryFilter === cat ? 'bg-gray-900 text-white shadow-xl shadow-gray-200' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {error && <div className="p-4 bg-red-50 border-2 border-red-100 text-red-600 rounded-2xl font-bold uppercase text-[10px] tracking-widest">{error}</div>}

            {/* Grid display */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                {filteredData.map((item) => (
                    <div key={item._id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 overflow-hidden group">
                        {/* Image / Category Badge */}
                        <div className="h-48 bg-gray-100 relative overflow-hidden">
                            {item.productImages?.[0] ? (
                                <img src={item.productImages[0]} alt={item.productName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                                    <svg className="w-12 h-12 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            )}
                            <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur rounded-lg text-[8px] font-black text-gray-900 uppercase tracking-widest shadow-sm">
                                {item.category}
                            </div>
                            <div className={`absolute top-4 right-4 px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest shadow-sm ${item.status === 'approved' ? 'bg-emerald-500 text-white' : 'bg-orange-500 text-white'}`}>
                                {item.status}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-4">
                            <div>
                                <h3 className="text-base font-black text-gray-900 uppercase tracking-tight line-clamp-1">{item.productName}</h3>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.companyName} • {item.city}</p>
                            </div>

                            <div className="flex justify-between items-end pb-4 border-b border-gray-50">
                                <div>
                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em] mb-0.5">Base Price</p>
                                    <p className="text-lg font-black text-red-600 tracking-tighter">PKR {item.price?.toLocaleString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em] mb-0.5">Plans Available</p>
                                    <p className="text-base font-black text-gray-900">{item.paymentPlans?.length || 0}</p>
                                </div>
                            </div>

                            {/* Plan Priview */}
                            {item.paymentPlans?.length > 0 && (
                                <div className="space-y-2">
                                    <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 group/plan hover:bg-red-50 hover:border-red-100 transition-colors">
                                        <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-gray-400 group-hover/plan:text-red-400">
                                            <span>{item.paymentPlans[0].planName}</span>
                                            <span>{item.paymentPlans[0].tenureMonths}M</span>
                                        </div>
                                        <div className="flex justify-between items-baseline mt-1">
                                            <span className="text-[10px] font-black text-gray-600 group-hover/plan:text-red-600">Monthly</span>
                                            <span className="text-xs font-black text-gray-900 group-hover/plan:text-red-900">PKR {item.paymentPlans[0].monthlyInstallment?.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    {item.paymentPlans.length > 1 && (
                                        <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest text-center">+ {item.paymentPlans.length - 1} more financial structures</p>
                                    )}
                                </div>
                            )}

                            <div className="pt-2 flex gap-2">
                                <button className="flex-1 py-3 bg-gray-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-gray-100">Details</button>
                                <NavLink to={`/installments/edit/${item._id}`} className="px-4 py-3 bg-gray-50 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-gray-100">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                </NavLink>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredData.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-base font-black text-gray-900 uppercase tracking-tighter">Negative Identification</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">No installment plans found matching your criteria.</p>
                </div>
            )}
        </div>
    );
};

export default InstallmentsList;
