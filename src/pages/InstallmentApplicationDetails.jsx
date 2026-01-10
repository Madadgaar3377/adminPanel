import React, { useState, useEffect } from 'react';
import ApiBaseUrl from '../constants/apiUrl';
import { useParams, useNavigate } from 'react-router-dom';

const InstallmentApplicationDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        if (id) fetchDetails();
    }, [id]);

    const fetchDetails = async () => {
        setLoading(true);
        try {
            const authData = JSON.parse(localStorage.getItem('adminAuth'));
            // Backend endpoint: /getApplication/:applicationId
            // Note: If your backend uses the MongoDB _id for this route, ensure consistency
            const res = await fetch(`${ApiBaseUrl}/getApplication/${id}`, {
                headers: {
                    ...(authData?.token ? { Authorization: `Bearer ${authData.token}` } : {}),
                }
            });
            const data = await res.json();
            if (data.success) {
                setApplication(data.data);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError("Failed to load application details.");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (newStatus) => {
        setUpdating(true);
        try {
            const authData = JSON.parse(localStorage.getItem('adminAuth'));
            const res = await fetch(`${ApiBaseUrl}/updateApplicationStatus`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(authData?.token ? { Authorization: `Bearer ${authData.token}` } : {}),
                },
                body: JSON.stringify({
                    applicationId: id,
                    status: newStatus,
                    approvedBy: authData?.user?.name || 'Admin'
                })
            });
            const data = await res.json();
            if (data.success) {
                setMessage(`Status updated to: ${newStatus}`);
                setApplication({ ...application, status: newStatus });
                setTimeout(() => setMessage(null), 3000);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError("Failed to update status.");
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="w-12 h-12 border-4 border-gray-100 border-t-red-600 rounded-full animate-spin"></div>
            <p className="text-sm text-gray-500">Loading application details...</p>
        </div>
    );

    if (!application) return <div className="p-20 text-center text-gray-500">Application not found.</div>;

    const user = application.UserInfo?.[0] || {};
    const plan = application.PlanInfo?.[0] || {};
    const fin = application.PlanInfo?.[1] || {};

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-20">
            {/* Header */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-50 rounded-lg transition-all text-gray-400">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <h1 className="text-2xl font-bold text-gray-900">Application Details</h1>
                    </div>
                    <p className="text-sm text-gray-500 mt-1 ml-10">ID: {application.applicationId}</p>
                </div>
                <div className="flex gap-3">
                    <select
                        value={application.status}
                        disabled={updating}
                        onChange={(e) => handleStatusUpdate(e.target.value)}
                        className="px-4 py-2 bg-red-600 text-white border-none rounded-lg text-sm font-medium outline-none cursor-pointer hover:bg-red-700 transition-all"
                    >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>
            </div>

            {message && <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm text-center">{message}</div>}
            {error && <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm text-center">{error}</div>}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Applicant Information */}
                <div className="lg:col-span-2 space-y-6">
                    <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-6">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Personal Information
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InfoItem label="Name" value={user.name} />
                                <InfoItem label="Email" value={user.email} />
                                <InfoItem label="Phone" value={user.phone} />
                                <InfoItem label="City" value={user.city} />
                                <InfoItem label="Address" value={user.address} className="md:col-span-2" />
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                Employment Details
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InfoItem label="Occupation" value={user.occupation} />
                                <InfoItem label="Monthly Income" value={user.monthlyIncome} highlight />
                                <InfoItem label="Employer" value={user.employerName} />
                                <InfoItem label="Job Title" value={user.jobTitle} />
                                <InfoItem label="Work Phone" value={user.workContactNumber} />
                                <InfoItem label="Other Income" value={user.otherIncomeSources} />
                            </div>
                        </div>
                    </section>

                    {application.applicationNote && (
                        <section className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                            <h2 className="text-lg font-bold text-gray-900 mb-3">Notes</h2>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                {application.applicationNote}
                            </p>
                        </section>
                    )}
                </div>

                {/* Financial Summary */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="bg-red-600 p-5 text-white">
                            <p className="text-xs text-white/80 mb-1">Selected Plan</p>
                            <h3 className="text-xl font-bold">{plan.planType || "N/A"}</h3>
                        </div>
                        <div className="p-5 space-y-4">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500">Price</span>
                                    <span className="text-sm font-semibold text-gray-900">PKR {plan.planPrice?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500">Down Payment</span>
                                    <span className="text-sm font-semibold text-gray-900">PKR {fin.downPayment?.toLocaleString()}</span>
                                </div>
                                <div className="h-px bg-gray-200"></div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-sm font-medium text-red-600">Monthly Payment</span>
                                    <span className="text-lg font-bold text-gray-900">PKR {fin.monthlyInstallment?.toLocaleString()}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-center">
                                        <p className="text-xs text-gray-500 mb-1">Duration</p>
                                        <p className="text-sm font-semibold text-gray-900">{fin.tenureMonths} Months</p>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-center">
                                        <p className="text-xs text-gray-500 mb-1">Interest</p>
                                        <p className="text-sm font-semibold text-gray-900">
                                            {fin.interestRatePercent}%
                                        </p>
                                    </div>
                                </div>
                                {fin.interestType && (
                                    <div className="pt-2">
                                        <p className="text-xs text-gray-500">Type: {fin.interestType}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Additional Info */}
                    <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200 space-y-3">
                        <h4 className="text-sm font-bold text-gray-900">Additional Information</h4>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-500">Assigned Agent</span>
                                <span className="text-xs font-medium text-gray-900">{application.assigenAgent || "Not Assigned"}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-500">Plan ID</span>
                                <span className="text-xs font-medium text-gray-900">{application.installmentPlanId}</span>
                            </div>
                            {application.approval?.[0] && (
                                <div className="pt-3 mt-3 border-t border-gray-300">
                                    <p className="text-xs text-green-600 font-medium mb-1">Approved By</p>
                                    <p className="text-xs text-gray-900">{application.approval[0].approvedBy}</p>
                                    <p className="text-xs text-gray-500">{new Date(application.approval[0].approvedAt).toLocaleDateString()}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const InfoItem = ({ label, value, highlight = false, className = "" }) => (
    <div className={`${className}`}>
        <label className="block text-sm text-gray-500 mb-1">{label}</label>
        <div className={`px-4 py-3 bg-gray-50 rounded-lg border font-medium text-sm ${highlight ? 'text-red-600 border-red-200 bg-red-50' : 'text-gray-900 border-gray-200'}`}>
            {value || "N/A"}
        </div>
    </div>
);

export default InstallmentApplicationDetails;
