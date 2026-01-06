import React, { useState, useEffect } from 'react';
import ApiBaseUrl from '../constants/apiUrl';
import { useNavigate } from 'react-router-dom';
import Pagination from '../compontents/Pagination';

const LoanList = () => {
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const navigate = useNavigate();

    useEffect(() => {
        fetchLoans();
    }, []);

    const fetchLoans = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${ApiBaseUrl}/getAllLoans`);
            const data = await res.json();
            if (data.success) {
                setLoans(data.data || []);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError("Failed to connect to server");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (planId) => {
        if (!window.confirm("ARE YOU SURE YOU WANT TO DELETE THIS LOAN PLAN?")) return;
        try {
            const authData = JSON.parse(localStorage.getItem('adminAuth'));
            const res = await fetch(`${ApiBaseUrl}/deleteLoan/${planId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authData.token}`,
                }
            });
            if (res.ok) {
                setLoans(loans.filter(loan => loan.planId !== planId));
            } else {
                alert("Deletion failed.");
            }
        } catch (err) {
            alert("Network error.");
        }
    };

    const filtered = loans.filter(loan => {
        const matchesSearch = 
            loan.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            loan.bankName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            loan.majorCategory?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            loan.planId?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'All' || loan.majorCategory === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const majorCategories = ['All', ...new Set(loans.map(l => l.majorCategory).filter(Boolean))];
    
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedLoans = filtered.slice(startIndex, startIndex + itemsPerPage);

    if (loading && loans.length === 0) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="w-12 h-12 border-4 border-gray-100 border-t-red-600 rounded-full animate-spin"></div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Loading Loan Registry...</p>
        </div>
    );

    return (
        <div className="space-y-4 xs:space-y-6 md:space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="bg-white p-4 xs:p-6 md:p-8 rounded-[1.5rem] xs:rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 xs:gap-6">
                <div>
                    <h1 className="text-xl xs:text-2xl md:text-3xl font-black text-gray-900 tracking-tighter uppercase">Loan Plans</h1>
                    <p className="text-[8px] xs:text-[9px] md:text-[10px] font-black text-red-600 uppercase tracking-[0.2em] xs:tracking-[0.3em] mt-0.5 xs:mt-1">Financial Products Management</p>
                </div>
                <div className="flex gap-2 xs:gap-3 w-full md:w-auto">
                    <button
                        onClick={() => navigate('/loan/add')}
                        className="tap-target flex-1 md:flex-none px-4 xs:px-5 md:px-6 py-2.5 xs:py-3 md:py-3.5 bg-red-600 text-white rounded-xl xs:rounded-2xl font-black uppercase text-[8px] xs:text-[9px] md:text-[10px] tracking-wider xs:tracking-widest hover:bg-black transition-all shadow-lg xs:shadow-xl shadow-red-100 active:scale-95"
                    >
                        + New Loan Plan
                    </button>
                    <button
                        onClick={fetchLoans}
                        className="tap-target p-2.5 xs:p-3 md:p-3.5 bg-gray-50 text-gray-400 hover:text-gray-900 rounded-xl xs:rounded-2xl transition-all border border-gray-100 active:scale-95 shrink-0"
                    >
                        <svg className="w-4 h-4 xs:w-5 xs:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    </button>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col xs:flex-row gap-3 xs:gap-4">
                <div className="relative flex-1">
                    <input
                        type="text"
                        placeholder="SEARCH BY PRODUCT NAME, BANK, CATEGORY OR ID..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full pl-10 xs:pl-12 md:pl-14 pr-4 xs:pr-6 py-3 xs:py-4 md:py-5 bg-white border border-gray-100 rounded-[1.5rem] xs:rounded-[2rem] text-[9px] xs:text-[10px] md:text-[11px] font-black uppercase tracking-wider xs:tracking-widest outline-none transition-all shadow-sm focus:border-red-600 focus:ring-2 xs:focus:ring-4 focus:ring-red-50/50"
                    />
                    <svg className="absolute left-3 xs:left-4 md:left-6 top-1/2 -translate-y-1/2 w-4 h-4 xs:w-5 xs:h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>

                <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                    {majorCategories.slice(0, 4).map(category => (
                        <button
                            key={category}
                            onClick={() => {
                                setFilterCategory(category);
                                setCurrentPage(1);
                            }}
                            className={`tap-target px-4 xs:px-6 py-2.5 xs:py-3 md:py-4 rounded-xl xs:rounded-2xl text-[9px] xs:text-[10px] font-black uppercase tracking-wider xs:tracking-widest whitespace-nowrap transition-all ${
                                filterCategory === category
                                    ? 'bg-gray-900 text-white shadow-lg xs:shadow-xl shadow-gray-200'
                                    : 'bg-white border border-gray-100 text-gray-400 hover:bg-gray-50'
                            }`}
                        >
                            {category === 'All' ? 'All' : category.split('/')[0].trim()}
                        </button>
                    ))}
                </div>
            </div>

            {error && <div className="p-3 xs:p-4 bg-red-50 border-2 border-red-100 text-red-600 rounded-xl xs:rounded-2xl font-black uppercase text-[9px] xs:text-[10px] tracking-widest text-center">{error}</div>}

            {/* Loans Grid */}
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-4 xs:gap-6 md:gap-8">
                {paginatedLoans.map((loan) => (
                    <div key={loan._id} className="bg-white rounded-[1.5rem] xs:rounded-[2rem] md:rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden flex flex-col group">
                        {/* Image */}
                        {loan.planImage && (
                            <div className="h-32 xs:h-40 overflow-hidden">
                                <img src={loan.planImage} alt={loan.productName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            </div>
                        )}
                        
                        {/* Header */}
                        <div className="p-4 xs:p-6 md:p-8 flex-1 space-y-4 xs:space-y-6">
                            <div className="flex justify-between items-start">
                                <div className="w-12 h-12 xs:w-14 xs:h-14 rounded-xl xs:rounded-2xl bg-red-50 flex items-center justify-center text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors">
                                    <svg className="w-6 h-6 xs:w-8 xs:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                {loan.isActive && (
                                    <span className="px-2 xs:px-3 py-0.5 xs:py-1 bg-emerald-50 text-emerald-600 rounded-md xs:rounded-lg text-[7px] xs:text-[8px] font-black uppercase tracking-wider xs:tracking-widest border border-emerald-100">
                                        Active
                                    </span>
                                )}
                            </div>

                            <div className="space-y-1 xs:space-y-2">
                                <h3 className="text-base xs:text-lg md:text-xl font-black text-gray-900 tracking-tighter uppercase truncate">{loan.productName || 'Unnamed Product'}</h3>
                                <p className="text-[8px] xs:text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest">ID: {loan.planId}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 xs:gap-4 py-3 xs:py-4 border-y border-gray-50">
                                <div>
                                    <p className="text-[7px] xs:text-[8px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest">Bank</p>
                                    <p className="text-[10px] xs:text-xs font-black text-gray-900 uppercase truncate">{loan.bankName || 'N/A'}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[7px] xs:text-[8px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest">Type</p>
                                    <p className="text-[10px] xs:text-xs font-black text-gray-900 uppercase truncate">{loan.financingType || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="space-y-1.5 xs:space-y-2">
                                <div className="flex items-center gap-1.5 xs:gap-2 text-[9px] xs:text-[10px] text-gray-500">
                                    <svg className="w-3 h-3 xs:w-3.5 xs:h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                    </svg>
                                    <span className="truncate">{loan.majorCategory?.split('/')[0] || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-1.5 xs:gap-2 text-[9px] xs:text-[10px] text-gray-500">
                                    <svg className="w-3 h-3 xs:w-3.5 xs:h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="truncate">PKR {loan.minFinancingAmount?.toLocaleString() || '0'} - {loan.maxFinancingAmount?.toLocaleString() || '0'}</span>
                                </div>
                                <div className="flex items-center gap-1.5 xs:gap-2 text-[9px] xs:text-[10px] text-gray-500">
                                    <svg className="w-3 h-3 xs:w-3.5 xs:h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                    <span className="truncate">Rate: {loan.indicativeRate || 'N/A'} ({loan.rateType || 'N/A'})</span>
                                </div>
                                <div className="flex items-center gap-1.5 xs:gap-2 text-[9px] xs:text-[10px] text-gray-500">
                                    <svg className="w-3 h-3 xs:w-3.5 xs:h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="truncate">{loan.minTenure || '0'}-{loan.maxTenure || '0'} {loan.tenureUnit || 'Months'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="px-4 xs:px-6 md:px-8 py-4 xs:py-5 md:py-6 bg-gray-50/50 border-t border-gray-50 flex gap-1.5 xs:gap-2">
                            <button
                                onClick={() => navigate(`/loan/edit/${loan.planId}`)}
                                className="tap-target flex-1 py-2.5 xs:py-3 bg-gray-900 text-white rounded-lg xs:rounded-xl text-[8px] xs:text-[9px] font-black uppercase tracking-wider xs:tracking-widest hover:bg-black transition-all shadow-lg shadow-gray-100 active:scale-95"
                            >
                                Edit Plan
                            </button>
                            <button
                                onClick={() => handleDelete(loan.planId)}
                                className="tap-target px-3 xs:px-4 py-2.5 xs:py-3 bg-white text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg xs:rounded-xl transition-all border border-gray-100 active:scale-95 shrink-0"
                            >
                                <svg className="w-3.5 h-3.5 xs:w-4 xs:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {filtered.length === 0 && (
                <div className="p-16 xs:p-20 md:p-24 text-center bg-white rounded-[2rem] xs:rounded-[3rem] border-2 border-dashed border-gray-100 italic font-black text-gray-300 uppercase tracking-widest text-xs xs:text-sm">
                    No loan plans found in registry.
                </div>
            )}

            {/* Pagination */}
            {filtered.length > 0 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    totalItems={filtered.length}
                    itemsPerPage={itemsPerPage}
                />
            )}
        </div>
    );
};

export default LoanList;

