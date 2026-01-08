import React, { useState, useEffect } from 'react';
import ApiBaseUrl from '../constants/apiUrl';
import { useNavigate } from 'react-router-dom';
import Pagination from '../compontents/Pagination';

// Toast Notification Component
const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';

    return (
        <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-3 animate-in slide-in-from-top`}>
            {type === 'success' ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            )}
            <span className="font-medium">{message}</span>
            <button onClick={onClose} className="ml-2 hover:opacity-80 text-xl leading-none">&times;</button>
        </div>
    );
};

const LoanList = () => {
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [toast, setToast] = useState(null);
    const itemsPerPage = 10;
    const navigate = useNavigate();

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

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

    const handleDelete = async (loanId) => {
        if (!window.confirm("Are you sure you want to delete this loan plan? This action cannot be undone.")) return;
        
        try {
            const authData = JSON.parse(localStorage.getItem('adminAuth'));
            const res = await fetch(`${ApiBaseUrl}/deleteLoan/${loanId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authData.token}`,
                }
            });
            
            const data = await res.json();
            
            if (res.ok && data.success) {
                setLoans(loans.filter(loan => loan._id !== loanId));
                showToast('Loan plan deleted successfully!');
            } else {
                showToast(data.message || 'Failed to delete loan plan', 'error');
            }
        } catch (err) {
            showToast('Network error. Please try again.', 'error');
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
            {/* Toast Notification */}
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            
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
                    <div key={loan._id} className="bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col group border border-gray-100">
                        {/* Image */}
                        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-red-50 to-orange-50">
                            {loan.planImage ? (
                                <img 
                                    src={loan.planImage} 
                                    alt={loan.productName} 
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect fill="%23f3f4f6" width="400" height="300"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="18" fill="%23d1d5db">No Image</text></svg>';
                                    }}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <svg className="w-20 h-20 text-red-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            )}
                            {/* Financing Type Badge on Image */}
                            {loan.financingType && (
                                <div className="absolute top-3 left-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md ${
                                        loan.financingType === 'Islamic' 
                                            ? 'bg-green-500/90 text-white' 
                                            : 'bg-blue-500/90 text-white'
                                    }`}>
                                        {loan.financingType}
                                    </span>
                                </div>
                            )}
                            {/* Active Badge on Image */}
                            {loan.isActive && (
                                <div className="absolute top-3 right-3">
                                    <span className="px-3 py-1 bg-emerald-500 text-white rounded-full text-xs font-bold flex items-center gap-1 backdrop-blur-md">
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        Active
                                    </span>
                                </div>
                            )}
                        </div>
                        
                        {/* Content */}
                        <div className="p-5 flex-1 space-y-4">
                            {/* Header */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">{loan.productName || 'Unnamed Product'}</h3>
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-semibold text-red-600">{loan.bankName || 'N/A'}</p>
                                    <p className="text-xs text-gray-400 font-mono">#{loan.planId}</p>
                                </div>
                            </div>

                            {/* Category Badge */}
                            <div className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                                <span className="text-sm text-gray-600 truncate">{loan.majorCategory?.split('/')[0] || 'N/A'}</span>
                            </div>

                            {/* Key Details */}
                            <div className="space-y-3 pt-3 border-t border-gray-100">
                                {/* Financing Amount */}
                                <div className="bg-gradient-to-r from-red-50 to-orange-50 p-3 rounded-lg">
                                    <p className="text-xs text-gray-600 mb-1">Financing Amount</p>
                                    <p className="text-sm font-bold text-red-700">
                                        PKR {loan.minFinancingAmount?.toLocaleString() || '0'} - {loan.maxFinancingAmount?.toLocaleString() || '0'}
                                    </p>
                                </div>

                                {/* Rate & Tenure */}
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="bg-blue-50 p-3 rounded-lg">
                                        <p className="text-xs text-gray-600 mb-1">Rate</p>
                                        <p className="text-sm font-bold text-blue-700 truncate">{loan.indicativeRate || 'N/A'}</p>
                                        <p className="text-xs text-blue-600">{loan.rateType || 'N/A'}</p>
                                    </div>
                                    <div className="bg-green-50 p-3 rounded-lg">
                                        <p className="text-xs text-gray-600 mb-1">Tenure</p>
                                        <p className="text-sm font-bold text-green-700">{loan.minTenure || '0'}-{loan.maxTenure || '0'}</p>
                                        <p className="text-xs text-green-600">{loan.tenureUnit || 'Months'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="p-4 bg-gray-50/50 border-t border-gray-100 flex gap-2">
                            <button
                                onClick={() => navigate(`/loan/view/${loan.planId}`)}
                                className="flex-1 py-2.5 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-sm font-semibold hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105 active:scale-95 shadow-md flex items-center justify-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                View
                            </button>
                            <button
                                onClick={() => navigate(`/loan/edit/${loan.planId}`)}
                                className="flex-1 py-2.5 px-4 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-black transition-all transform hover:scale-105 active:scale-95 shadow-md flex items-center justify-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit
                            </button>
                            <button
                                onClick={() => handleDelete(loan._id)}
                                className="p-2.5 bg-white text-red-600 hover:bg-red-50 rounded-lg transition-all border border-red-100 transform hover:scale-105 active:scale-95"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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

