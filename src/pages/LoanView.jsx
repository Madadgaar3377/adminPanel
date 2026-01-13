import React, { useState, useEffect, useCallback } from 'react';
import ApiBaseUrl from '../constants/apiUrl';
import { useNavigate, useParams } from 'react-router-dom';

const LoanView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loan, setLoan] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchLoan = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`${ApiBaseUrl}/getAllLoans`);
            const data = await res.json();
            if (data.success) {
                const foundLoan = data.data.find(l => l.planId === id);
                setLoan(foundLoan || null);
            }
        } catch (err) {
            console.error('Error fetching loan:', err);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchLoan();
    }, [fetchLoan]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] bg-gradient-to-br from-gray-50 to-white space-y-4">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-red-100 rounded-full"></div>
                    <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin absolute top-0"></div>
                </div>
                <p className="text-sm font-medium text-gray-600">Loading loan details...</p>
            </div>
        );
    }

    if (!loan) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-6">
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-12 text-center max-w-md">
                    <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mb-2">Loan Plan Not Found</h2>
                    <p className="text-gray-600 mb-6 font-medium">The loan plan you're looking for doesn't exist.</p>
                    <button
                        onClick={() => navigate('/loan/all')}
                        className="px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl hover:from-red-700 hover:to-rose-700 transition-all duration-300 font-bold shadow-lg shadow-red-200 active:scale-95"
                    >
                        Back to Loan List
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 px-4 sm:px-6 lg:px-8 py-8">
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Modern Header - v2.0.5 */}
                <div className="relative overflow-hidden bg-gradient-to-r from-red-600 via-red-500 to-rose-600 rounded-3xl shadow-2xl p-8">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-40 h-40 bg-white opacity-5 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-40 h-40 bg-white opacity-5 rounded-full blur-3xl"></div>
                    
                    <div className="relative">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h1 className="text-3xl font-black text-white tracking-tight mb-2">{loan.productName}</h1>
                                <div className="flex items-center gap-3 flex-wrap">
                                    <p className="text-red-100 text-sm font-medium">ID: {loan.planId}</p>
                                    {loan.isActive && (
                                        <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl text-xs font-bold shadow-lg border border-green-400">
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            Active
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => navigate(`/loan/edit/${loan.planId}`)}
                                    className="px-6 py-3 bg-white text-red-600 rounded-xl hover:bg-red-50 transition-all duration-300 flex items-center gap-2 font-bold shadow-lg active:scale-95"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Edit
                                </button>
                                <button
                                    onClick={() => navigate('/loan/all')}
                                    className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-all duration-300 font-bold active:scale-95"
                                >
                                    Back
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Uploaded Files Section */}
            {(loan.planImage || loan.planDocument) && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Uploaded Files
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Plan Image */}
                        {loan.planImage && (
                            <div className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all">
                                <div className="p-4 bg-gray-50 border-b border-gray-200">
                                    <div className="flex items-center gap-2">
                                        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span className="font-semibold text-gray-900">Plan Image</span>
                                    </div>
                                </div>
                                <div className="aspect-video">
                                    <img 
                                        src={loan.planImage} 
                                        alt={loan.productName} 
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect fill="%23f3f4f6" width="400" height="300"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="16" fill="%239ca3af">Image Not Available</text></svg>';
                                        }}
                                    />
                                </div>
                                <div className="p-4">
                                    <a
                                        href={loan.planImage}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium text-sm"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                        View Image
                                    </a>
                                </div>
                            </div>
                        )}

                        {/* Plan Document */}
                        {loan.planDocument && (
                            <div className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all">
                                <div className="p-4 bg-gray-50 border-b border-gray-200">
                                    <div className="flex items-center gap-2">
                                        <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <span className="font-semibold text-gray-900">Plan Document</span>
                                    </div>
                                </div>
                                <div className="p-8 flex flex-col items-center justify-center min-h-[200px] bg-gray-50">
                                    <div className="w-20 h-20 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                                        <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-600 text-sm text-center">PDF Document</p>
                                </div>
                                <div className="p-4">
                                    <a
                                        href={loan.planDocument}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 w-full py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-medium text-sm"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Download PDF
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Basic Information */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Basic Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <label className="block text-sm text-gray-500 mb-1">Bank Name</label>
                        <p className="text-base font-semibold text-gray-900">{loan.bankName || 'N/A'}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <label className="block text-sm text-gray-500 mb-1">Type</label>
                        <p className="text-base font-semibold text-gray-900">{loan.financingType || 'N/A'}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg md:col-span-2">
                        <label className="block text-sm text-gray-500 mb-1">Category</label>
                        <p className="text-base font-semibold text-gray-900">{loan.majorCategory || 'N/A'}</p>
                    </div>
                    {loan.subCategory && (
                        <div className="p-4 bg-gray-50 rounded-lg md:col-span-2">
                            <label className="block text-sm text-gray-500 mb-1">Sub-Category</label>
                            <p className="text-base font-semibold text-gray-900">{loan.subCategory}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Loan Details */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Loan Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                        <label className="block text-sm text-red-700 mb-1">Amount</label>
                        <p className="text-xl font-bold text-red-600">
                            PKR {loan.minFinancingAmount?.toLocaleString() || '0'} - {loan.maxFinancingAmount?.toLocaleString() || '0'}
                        </p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <label className="block text-sm text-blue-700 mb-1">Duration</label>
                        <p className="text-xl font-bold text-blue-600">
                            {loan.minTenure || '0'} - {loan.maxTenure || '0'} {loan.tenureUnit || 'Months'}
                        </p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                        <label className="block text-sm text-green-700 mb-1">Interest Rate</label>
                        <p className="text-xl font-bold text-green-600">{loan.indicativeRate || 'N/A'}</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                        <label className="block text-sm text-purple-700 mb-1">Rate Type</label>
                        <p className="text-xl font-bold text-purple-600">{loan.rateType || 'N/A'}</p>
                    </div>
                </div>
            </div>

            {/* Eligibility Requirements */}
            {loan.eligibility && Object.keys(loan.eligibility).length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        Who Can Apply
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {loan.eligibility.minAge && (
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <label className="block text-sm text-gray-500 mb-1">Minimum Age</label>
                                <p className="text-base font-semibold text-gray-900">{loan.eligibility.minAge} years</p>
                            </div>
                        )}
                        {loan.eligibility.maxAge && (
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <label className="block text-sm text-gray-500 mb-1">Maximum Age</label>
                                <p className="text-base font-semibold text-gray-900">{loan.eligibility.maxAge} years</p>
                            </div>
                        )}
                        {loan.eligibility.minIncome && (
                            <div className="p-4 bg-gray-50 rounded-lg md:col-span-2">
                                <label className="block text-sm text-gray-500 mb-1">Minimum Income</label>
                                <p className="text-base font-semibold text-gray-900">PKR {loan.eligibility.minIncome?.toLocaleString()}</p>
                            </div>
                        )}
                        {loan.eligibility.employmentType && loan.eligibility.employmentType.length > 0 && (
                            <div className="p-4 bg-gray-50 rounded-lg md:col-span-2">
                                <label className="block text-sm text-gray-500 mb-2">Job Type</label>
                                <div className="flex flex-wrap gap-2">
                                    {loan.eligibility.employmentType.map((type, index) => (
                                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                                            {type}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                        {loan.eligibility.requiredDocuments && loan.eligibility.requiredDocuments.length > 0 && (
                            <div className="p-4 bg-gray-50 rounded-lg md:col-span-2">
                                <label className="block text-sm text-gray-500 mb-3">Required Documents</label>
                                <div className="space-y-2">
                                    {loan.eligibility.requiredDocuments.map((doc, index) => (
                                        <div key={index} className="flex items-center gap-2 text-gray-700">
                                            <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span className="text-sm">{doc}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Best For */}
            {loan.targetAudience && loan.targetAudience.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Best For
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        {loan.targetAudience.map((audience, index) => (
                            <span key={index} className="px-4 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-medium border border-red-100">
                                {audience}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Description */}
            {loan.description && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Description
                    </h2>
                    <div 
                        className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: loan.description }}
                        style={{
                            wordBreak: 'break-word'
                        }}
                    />
                </div>
            )}


            {/* Timestamps */}
            <div className="bg-gray-50 rounded-2xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {loan.createdAt && (
                        <div className="flex items-center gap-2 text-gray-600">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Created: {new Date(loan.createdAt).toLocaleString()}</span>
                        </div>
                    )}
                    {loan.updatedAt && (
                        <div className="flex items-center gap-2 text-gray-600">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span>Updated: {new Date(loan.updatedAt).toLocaleString()}</span>
                        </div>
                    )}
                </div>
            </div>
            </div>
        </div>
    );
};

export default LoanView;

