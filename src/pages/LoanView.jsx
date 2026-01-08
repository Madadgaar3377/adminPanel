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
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="w-12 h-12 border-4 border-gray-100 border-t-red-600 rounded-full animate-spin"></div>
                <p className="text-sm text-gray-500">Loading loan details...</p>
            </div>
        );
    }

    if (!loan) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Loan Plan Not Found</h2>
                    <p className="text-gray-500 mb-6">The loan plan you're looking for doesn't exist.</p>
                    <button
                        onClick={() => navigate('/loan/all')}
                        className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                        Back to Loan List
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                                <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">{loan.productName}</h1>
                                <p className="text-sm text-gray-500">Plan ID: {loan.planId}</p>
                            </div>
                        </div>
                        {loan.isActive && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Active
                            </span>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => navigate(`/loan/edit/${loan.planId}`)}
                            className="px-5 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-black transition flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                        </button>
                        <button
                            onClick={() => navigate('/loan/all')}
                            className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                        >
                            Back to List
                        </button>
                    </div>
                </div>
            </div>

            {/* Plan Image */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {loan.planImage ? (
                    <div className="relative">
                        <img 
                            src={loan.planImage} 
                            alt={loan.productName} 
                            className="w-full h-96 object-cover"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.parentElement.innerHTML = '<div class="w-full h-96 bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center"><svg class="w-32 h-32 text-red-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>';
                            }}
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
                            <p className="text-white font-semibold text-lg">{loan.productName}</p>
                            <p className="text-white/80 text-sm">{loan.bankName}</p>
                        </div>
                    </div>
                ) : (
                    <div className="w-full h-96 bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
                        <div className="text-center">
                            <svg className="w-32 h-32 text-red-200 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-gray-400 font-medium">No plan image available</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Basic Information */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Basic Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Bank Name</label>
                        <p className="text-lg font-semibold text-gray-900">{loan.bankName || 'N/A'}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Financing Type</label>
                        <p className="text-lg font-semibold text-gray-900">{loan.financingType || 'N/A'}</p>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-500 mb-1">Category</label>
                        <p className="text-lg font-semibold text-gray-900">{loan.majorCategory || 'N/A'}</p>
                    </div>
                    {loan.subCategory && (
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-500 mb-1">Sub-Category</label>
                            <p className="text-lg font-semibold text-gray-900">{loan.subCategory}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Financing Details */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Financing Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-red-50 to-orange-50 p-5 rounded-xl border border-red-100">
                        <label className="block text-sm font-medium text-red-700 mb-1">Financing Amount</label>
                        <p className="text-2xl font-bold text-red-600">
                            PKR {loan.minFinancingAmount?.toLocaleString() || '0'} - {loan.maxFinancingAmount?.toLocaleString() || '0'}
                        </p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-100">
                        <label className="block text-sm font-medium text-blue-700 mb-1">Tenure Period</label>
                        <p className="text-2xl font-bold text-blue-600">
                            {loan.minTenure || '0'} - {loan.maxTenure || '0'} {loan.tenureUnit || 'Months'}
                        </p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-xl border border-green-100">
                        <label className="block text-sm font-medium text-green-700 mb-1">Indicative Rate</label>
                        <p className="text-2xl font-bold text-green-600">{loan.indicativeRate || 'N/A'}</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-5 rounded-xl border border-purple-100">
                        <label className="block text-sm font-medium text-purple-700 mb-1">Rate Type</label>
                        <p className="text-2xl font-bold text-purple-600">{loan.rateType || 'N/A'}</p>
                    </div>
                </div>
            </div>

            {/* Eligibility Criteria */}
            {loan.eligibility && Object.keys(loan.eligibility).length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        Eligibility Criteria
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {loan.eligibility.minAge && (
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Minimum Age</label>
                                <p className="text-lg font-semibold text-gray-900">{loan.eligibility.minAge} years</p>
                            </div>
                        )}
                        {loan.eligibility.maxAge && (
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Maximum Age</label>
                                <p className="text-lg font-semibold text-gray-900">{loan.eligibility.maxAge} years</p>
                            </div>
                        )}
                        {loan.eligibility.minIncome && (
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-500 mb-1">Minimum Income</label>
                                <p className="text-lg font-semibold text-gray-900">PKR {loan.eligibility.minIncome?.toLocaleString()}</p>
                            </div>
                        )}
                        {loan.eligibility.employmentType && loan.eligibility.employmentType.length > 0 && (
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-500 mb-2">Employment Type</label>
                                <div className="flex flex-wrap gap-2">
                                    {loan.eligibility.employmentType.map((type, index) => (
                                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                            {type}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                        {loan.eligibility.requiredDocuments && loan.eligibility.requiredDocuments.length > 0 && (
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-500 mb-2">Required Documents</label>
                                <ul className="space-y-2">
                                    {loan.eligibility.requiredDocuments.map((doc, index) => (
                                        <li key={index} className="flex items-center gap-2 text-gray-700">
                                            <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {doc}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Target Audience */}
            {loan.targetAudience && loan.targetAudience.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Target Audience
                    </h2>
                    <div className="flex flex-wrap gap-3">
                        {loan.targetAudience.map((audience, index) => (
                            <span key={index} className="px-4 py-2 bg-gradient-to-r from-red-50 to-orange-50 text-red-700 rounded-lg text-sm font-semibold border border-red-100">
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

            {/* Plan Document */}
            {loan.planDocument && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        Plan Document
                    </h2>
                    <a
                        href={loan.planDocument}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download Plan Document
                    </a>
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
    );
};

export default LoanView;

