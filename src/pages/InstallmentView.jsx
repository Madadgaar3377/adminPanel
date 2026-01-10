import React, { useState, useEffect, useCallback } from 'react';
import ApiBaseUrl from '../constants/apiUrl';
import { useNavigate, useParams } from 'react-router-dom';

const InstallmentView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [installment, setInstallment] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchInstallment = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`${ApiBaseUrl}/getInstallment/${id}`);
            const data = await res.json();
            if (data.success) {
                setInstallment(data.data);
            }
        } catch (err) {
            console.error('Error fetching installment:', err);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchInstallment();
    }, [fetchInstallment]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="w-12 h-12 border-4 border-gray-100 border-t-red-600 rounded-full animate-spin"></div>
                <p className="text-sm text-gray-500">Loading installment details...</p>
            </div>
        );
    }

    if (!installment) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Installment Plan Not Found</h2>
                    <p className="text-gray-500 mb-6">The installment plan you're looking for doesn't exist.</p>
                    <button
                        onClick={() => navigate('/installments/all')}
                        className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                        Back to Installment List
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-20">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{installment.productName}</h1>
                        <div className="flex items-center gap-3 flex-wrap">
                            <p className="text-sm text-gray-500">ID: {installment.installmentPlanId || installment._id}</p>
                            {installment.status && (
                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                                    installment.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                }`}>
                                    {installment.status}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => navigate(`/installments/edit/${installment._id}`)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2 text-sm font-medium"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                        </button>
                        <button
                            onClick={() => navigate('/installments/all')}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
                        >
                            Back
                        </button>
                    </div>
                </div>
            </div>

            {/* Images Gallery */}
            {installment.productImages && installment.productImages.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Product Images
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {installment.productImages.map((img, index) => (
                            <div key={index} className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                                <img 
                                    src={img} 
                                    alt={`Product ${index + 1}`} 
                                    className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                                    onClick={() => window.open(img, '_blank')}
                                />
                            </div>
                        ))}
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
                        <label className="block text-sm text-gray-500 mb-1">Product Name</label>
                        <p className="text-base font-semibold text-gray-900">{installment.productName || 'N/A'}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <label className="block text-sm text-gray-500 mb-1">Company</label>
                        <p className="text-base font-semibold text-gray-900">{installment.companyName || installment.companyNameOther || 'N/A'}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <label className="block text-sm text-gray-500 mb-1">Category</label>
                        <p className="text-base font-semibold text-gray-900">{installment.category || installment.customCategory || 'N/A'}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <label className="block text-sm text-gray-500 mb-1">City</label>
                        <p className="text-base font-semibold text-gray-900">{installment.city || 'N/A'}</p>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg md:col-span-2 border border-red-100">
                        <label className="block text-sm text-red-700 mb-1">Base Price</label>
                        <p className="text-2xl font-bold text-red-600">PKR {installment.price?.toLocaleString() || '0'}</p>
                    </div>
                </div>
            </div>

            {/* Payment Plans */}
            {installment.paymentPlans && installment.paymentPlans.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Payment Plans ({installment.paymentPlans.length})
                    </h2>
                    <div className="space-y-4">
                        {installment.paymentPlans.map((plan, index) => (
                            <div key={index} className="border border-gray-200 rounded-xl p-5 hover:border-red-300 transition-colors">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">{plan.planName || `Plan ${index + 1}`}</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="p-3 bg-blue-50 rounded-lg">
                                        <p className="text-xs text-blue-700 mb-1">Duration</p>
                                        <p className="text-base font-semibold text-blue-900">{plan.tenureMonths} Months</p>
                                    </div>
                                    <div className="p-3 bg-green-50 rounded-lg">
                                        <p className="text-xs text-green-700 mb-1">Down Payment</p>
                                        <p className="text-base font-semibold text-green-900">PKR {plan.downPayment?.toLocaleString() || '0'}</p>
                                    </div>
                                    <div className="p-3 bg-purple-50 rounded-lg">
                                        <p className="text-xs text-purple-700 mb-1">Monthly Payment</p>
                                        <p className="text-base font-semibold text-purple-900">PKR {plan.monthlyInstallment?.toLocaleString() || '0'}</p>
                                    </div>
                                    <div className="p-3 bg-orange-50 rounded-lg">
                                        <p className="text-xs text-orange-700 mb-1">Interest Rate</p>
                                        <p className="text-base font-semibold text-orange-900">{plan.interestRatePercent || 0}%</p>
                                    </div>
                                </div>
                                {plan.interestType && (
                                    <div className="mt-3 pt-3 border-t border-gray-200">
                                        <p className="text-sm text-gray-600">
                                            <span className="font-medium">Interest Type:</span> {plan.interestType}
                                        </p>
                                    </div>
                                )}
                                {plan.otherChargesNote && (
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-600">
                                            <span className="font-medium">Other Charges:</span> {plan.otherChargesNote}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Description */}
            {installment.description && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Description
                    </h2>
                    <div 
                        className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: installment.description }}
                    />
                </div>
            )}

            {/* Video URL */}
            {installment.videoUrl && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Product Video
                    </h2>
                    <a
                        href={installment.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Watch Video
                    </a>
                </div>
            )}

            {/* Creator Information */}
            {installment.createdBy && installment.createdBy.length > 0 && installment.createdBy[0].name && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Posted By
                    </h2>
                    <div className="flex items-center gap-4">
                        {installment.createdBy[0].profileImage && (
                            <img 
                                src={installment.createdBy[0].profileImage} 
                                alt={installment.createdBy[0].name}
                                className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                            />
                        )}
                        <div>
                            <p className="text-lg font-semibold text-gray-900">{installment.createdBy[0].name}</p>
                            {installment.createdBy[0].email && (
                                <p className="text-sm text-gray-500">{installment.createdBy[0].email}</p>
                            )}
                            {installment.createdBy[0].phone && (
                                <p className="text-sm text-gray-500">{installment.createdBy[0].phone}</p>
                            )}
                            {installment.createdBy[0].userType && (
                                <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                    {installment.createdBy[0].userType}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Timestamps */}
            <div className="bg-gray-50 rounded-2xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {installment.createdAt && (
                        <div className="flex items-center gap-2 text-gray-600">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Created: {new Date(installment.createdAt).toLocaleString()}</span>
                        </div>
                    )}
                    {installment.updatedAt && (
                        <div className="flex items-center gap-2 text-gray-600">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span>Updated: {new Date(installment.updatedAt).toLocaleString()}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InstallmentView;

