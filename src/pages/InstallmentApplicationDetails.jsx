import React, { useState, useEffect } from 'react';
import ApiBaseUrl from '../constants/apiUrl';
import { useParams, useNavigate } from 'react-router-dom';

const InstallmentApplicationDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [application, setApplication] = useState(null);
    const [installmentPlanDetails, setInstallmentPlanDetails] = useState(null);
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
            const res = await fetch(`${ApiBaseUrl}/getApplication/${id}`, {
                headers: {
                    ...(authData?.token ? { Authorization: `Bearer ${authData.token}` } : {}),
                }
            });
            const data = await res.json();
            if (data.success) {
                setApplication(data.data);
                setInstallmentPlanDetails(null);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError("Failed to load application details.");
        } finally {
            setLoading(false);
        }
    };

    // Fetch plan details by installmentPlanId so we can show price/down/monthly/duration/interest
    // (application.PlanInfo only stores planType/planPrice/planpic due to schema; finance fields are not saved)
    useEffect(() => {
        if (!application?.installmentPlanId) return;
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch(`${ApiBaseUrl}/getInstallment/${application.installmentPlanId}`);
                const data = await res.json();
                if (!cancelled && data.success && data.data) setInstallmentPlanDetails(data.data);
            } catch (_) { /* ignore */ }
        })();
        return () => { cancelled = true; };
    }, [application?.installmentPlanId]);

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
    // Match application's plan type to plan's paymentPlans (backend schema only stores planType/planPrice/planpic in PlanInfo[0])
    const paymentPlans = installmentPlanDetails?.paymentPlans || [];
    const selectedPaymentPlan = paymentPlans.find((p) => (p.planName || '').trim() === (plan.planType || '').trim())
        || paymentPlans[0];
    const downPayment = fin.downPayment ?? plan.downPayment ?? selectedPaymentPlan?.downPayment ?? installmentPlanDetails?.downpayment;
    const monthlyInstallment = fin.monthlyInstallment ?? plan.monthlyInstallment ?? selectedPaymentPlan?.monthlyInstallment ?? installmentPlanDetails?.installment;
    const tenureMonths = fin.tenureMonths ?? plan.tenureMonths ?? selectedPaymentPlan?.tenureMonths;
    const interestRatePercent = fin.interestRatePercent ?? plan.interestRatePercent ?? selectedPaymentPlan?.interestRatePercent;
    const interestType = fin.interestType ?? plan.interestType ?? selectedPaymentPlan?.interestType;
    const planPrice = plan.planPrice ?? selectedPaymentPlan?.installmentPrice ?? installmentPlanDetails?.price;
    const planPic = plan.planpic || installmentPlanDetails?.productImages?.[0];
    const agent = application.agentDetails || null;
    const partner = application.partnerDetails || null;
    const formatDate = (d) => d ? new Date(d).toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' }) : '—';
    const formatPkr = (n) => (n != null && n !== '') ? `PKR ${Number(n).toLocaleString()}` : '—';

    const hasPlanData = !!(
        application.installmentPlanId ||
        plan.planType ||
        (planPrice != null && planPrice !== '') ||
        planPic ||
        (downPayment != null && downPayment !== '') ||
        (monthlyInstallment != null && monthlyInstallment !== '') ||
        (tenureMonths != null && tenureMonths !== '') ||
        (interestRatePercent != null && interestRatePercent !== '')
    );

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-slate-50/80 print:bg-white">
            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    .print-area, .print-area * { visibility: visible; }
                    .print-area { position: absolute; left: 0; top: 0; width: 100%; background: white; padding: 0; }
                    .no-print { display: none !important; }
                    .print\\:block { display: block !important; }
                    .print-area .shadow-sm { box-shadow: none !important; border: 1px solid #e2e8f0 !important; }
                }
            `}</style>
            <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 space-y-6 pb-20 print-area">
                {/* Header layer */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden">
                    <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="no-print p-2.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300 transition-all shrink-0"
                                aria-label="Back"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                            </button>
                            <div>
                                <h1 className="text-xl font-bold text-slate-900 tracking-tight">Application Details</h1>
                                <p className="text-sm text-slate-500 mt-0.5">ID: <span className="font-mono text-slate-700">{application.applicationId}</span></p>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-slate-400">
                                    <span>Created {formatDate(application.createdAt)}</span>
                                    {application.updatedAt && <span>Updated {formatDate(application.updatedAt)}</span>}
                                    {application.userId && <span>User: {application.userId}</span>}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                            <button
                                type="button"
                                onClick={handlePrint}
                                className="no-print flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 hover:border-slate-400 transition-all"
                            >
                                <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6v2m0-8V4a2 2 0 012-2h2a2 2 0 012 2v8a2 2 0 01-2 2h-2m-4-6h8m-4-6H5a2 2 0 00-2 2v6a2 2 0 002 2h2" />
                                </svg>
                                Print / Save as PDF
                            </button>
                            <span className={`no-print px-3 py-1.5 rounded-md text-sm font-semibold capitalize border ${
                                application.status === 'approved' || application.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                application.status === 'rejected' || application.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                                'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                                {application.status}
                            </span>
                            <select
                                value={application.status}
                                disabled={updating}
                                onChange={(e) => handleStatusUpdate(e.target.value)}
                                className="no-print px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 text-sm font-medium focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none cursor-pointer"
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
                </div>

                {message && <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-medium text-center">{message}</div>}
                {error && <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm text-center">{error}</div>}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left column: form layers */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Layer 1: Personal Information */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden">
                            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                                    <span className="w-1 h-4 bg-red-500 rounded-full" />
                                    Personal Information
                                </h2>
                            </div>
                            <div className="p-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 border border-slate-100 rounded-lg overflow-hidden">
                                    {[
                                        { label: 'Name', value: user.name },
                                        { label: 'Email', value: user.email },
                                        { label: 'Phone', value: user.phone },
                                        { label: 'City', value: user.city },
                                        { label: 'State / Province', value: user.state },
                                        { label: 'Postal / Zip', value: user.zip },
                                        { label: 'Country', value: user.country },
                                    ].map(({ label, value }) => (
                                        <FormRow key={label} label={label} value={value} />
                                    ))}
                                </div>
                                <div className="mt-4">
                                    <FormRow label="Address" value={user.address} fullWidth />
                                </div>
                            </div>
                        </div>

                        {/* Layer 2: Employment Details */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden">
                            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                                    <span className="w-1 h-4 bg-red-500 rounded-full" />
                                    Employment Details
                                </h2>
                            </div>
                            <div className="p-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 border border-slate-100 rounded-lg overflow-hidden">
                                    {[
                                        { label: 'Occupation', value: user.occupation },
                                        { label: 'Monthly Income', value: user.monthlyIncome, highlight: true },
                                        { label: 'Employer', value: user.employerName },
                                        { label: 'Job Title', value: user.jobTitle },
                                        { label: 'Work Phone', value: user.workContactNumber },
                                        { label: 'Other Income', value: user.otherIncomeSources },
                                    ].map(({ label, value, highlight }) => (
                                        <FormRow key={label} label={label} value={value} highlight={highlight} />
                                    ))}
                                </div>
                                <div className="mt-4">
                                    <FormRow label="Employer Address" value={user.employerAddress} fullWidth />
                                </div>
                            </div>
                        </div>

                        {application.applicationNote && (
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden">
                                <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                                    <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                                        <span className="w-1 h-4 bg-red-500 rounded-full" />
                                        Application Notes
                                    </h2>
                                </div>
                                <div className="p-5">
                                    <p className="text-slate-600 text-sm leading-relaxed">{application.applicationNote}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right column: sidebar layers */}
                    <div className="space-y-6">
                        {/* Plan layer – only show when we have real plan/finance data */}
                        {hasPlanData && (
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden">
                                <div className="bg-red-600 px-5 py-4">
                                    <p className="text-xs text-red-100 uppercase tracking-wider font-semibold">Selected Plan</p>
                                    <p className="text-lg font-bold text-white mt-0.5">{plan.planType || "N/A"}</p>
                                </div>
                                {planPic && (
                                    <div className="p-3 border-b border-slate-100">
                                        <img src={Array.isArray(planPic) ? planPic[0] : planPic} alt="Plan" className="w-full h-36 object-contain rounded-lg bg-slate-50" onError={(e) => e.target.style.display = 'none'} />
                                    </div>
                                )}
                                <div className="p-5 space-y-3">
                                    <FormRow label="Price" value={formatPkr(planPrice)} />
                                    <FormRow label="Down Payment" value={formatPkr(downPayment)} />
                                    <div className="py-2 border-t border-slate-100">
                                        <FormRow label="Monthly Payment" value={formatPkr(monthlyInstallment)} highlight />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 pt-1">
                                        <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3 text-center">
                                            <p className="text-xs text-slate-500 font-medium">Duration</p>
                                            <p className="text-sm font-semibold text-slate-900 mt-0.5">{tenureMonths != null && tenureMonths !== '' ? `${tenureMonths} mo` : '—'}</p>
                                        </div>
                                        <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3 text-center">
                                            <p className="text-xs text-slate-500 font-medium">Interest</p>
                                            <p className="text-sm font-semibold text-slate-900 mt-0.5">{interestRatePercent != null && interestRatePercent !== '' ? `${interestRatePercent}%` : '—'}</p>
                                        </div>
                                    </div>
                                    {interestType && <p className="text-xs text-slate-500 pt-1">Type: {interestType}</p>}
                                </div>
                            </div>
                        )}

                        {/* Application Info layer */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden">
                            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                                    <span className="w-1 h-4 bg-slate-400 rounded-full" />
                                    Application Info
                                </h2>
                            </div>
                            <div className="p-5 space-y-0 divide-y divide-slate-100">
                                <FormRow label="Application ID" value={application.applicationId} compact />
                                <FormRow label="Plan ID" value={application.installmentPlanId} compact />
                                <FormRow label="User ID" value={application.userId} compact />
                                {application.createdBy && <FormRow label="Created By" value={application.createdBy} compact />}
                                {application.updatedBy && <FormRow label="Updated By" value={application.updatedBy} compact />}
                            </div>
                        </div>

                        {/* Agent layer */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden">
                            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                                    <span className="w-1 h-4 bg-blue-500 rounded-full" />
                                    Assigned Agent
                                </h2>
                            </div>
                            <div className="p-5">
                                {agent ? (
                                    <div className="space-y-0 divide-y divide-slate-100">
                                        <FormRow label="Name" value={agent.name} compact />
                                        <FormRow label="Agent ID" value={agent.userId || application.assigenAgent} compact />
                                        <FormRow label="Email" value={agent.email} compact />
                                        <FormRow label="Phone" value={agent.phoneNumber} compact />
                                        <FormRow label="WhatsApp" value={agent.WhatsappNumber} compact />
                                        {agent.Address && <FormRow label="Address" value={agent.Address} compact fullWidth />}
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-500">{application.assigenAgent ? `Agent ID: ${application.assigenAgent}` : 'Not Assigned'}</p>
                                )}
                            </div>
                        </div>

                        {partner && (
                            <div className="bg-white rounded-xl shadow-sm border border-amber-200/80 overflow-hidden">
                                <div className="px-5 py-4 border-b border-amber-100 bg-amber-50/50">
                                    <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                                        <span className="w-1 h-4 bg-amber-500 rounded-full" />
                                        Partner / Creator
                                    </h2>
                                </div>
                                <div className="p-5 space-y-0 divide-y divide-slate-100">
                                    <FormRow label="Name" value={partner.name} compact />
                                    <FormRow label="User ID" value={partner.userId} compact />
                                    <FormRow label="Email" value={partner.email} compact />
                                    <FormRow label="Phone" value={partner.phoneNumber} compact />
                                    <FormRow label="WhatsApp" value={partner.WhatsappNumber} compact />
                                    {partner.Address && <FormRow label="Address" value={partner.Address} compact fullWidth />}
                                    {partner.companyDetails?.RegisteredCompanyName && <FormRow label="Company" value={partner.companyDetails.RegisteredCompanyName} compact />}
                                </div>
                            </div>
                        )}

                        {application.approval?.length > 0 && (
                            <div className="bg-white rounded-xl shadow-sm border border-emerald-200/80 overflow-hidden">
                                <div className="px-5 py-4 border-b border-emerald-100 bg-emerald-50/50">
                                    <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                                        <span className="w-1 h-4 bg-emerald-500 rounded-full" />
                                        Approval History
                                    </h2>
                                </div>
                                <div className="p-5 space-y-4">
                                    {application.approval.map((a, i) => (
                                        <div key={i} className="rounded-lg border border-emerald-100 bg-emerald-50/30 p-3 text-sm">
                                            <p className="font-semibold text-slate-900">Approved by: {a.approvedBy || '—'}</p>
                                            <p className="text-slate-500 text-xs mt-1">{formatDate(a.approvedAt)}</p>
                                            {a.commissionProcessed != null && <p className="text-slate-600 text-xs mt-1">Commission processed: {a.commissionProcessed ? 'Yes' : 'No'}</p>}
                                            {a.commissionAmount != null && a.commissionAmount > 0 && <p className="text-emerald-700 text-xs font-medium mt-1">Commission: PKR {Number(a.commissionAmount).toLocaleString()}</p>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const FormRow = ({ label, value, highlight = false, compact = false, fullWidth = false }) => (
    <div className={`flex ${compact ? 'flex-row items-center gap-3 py-2.5 px-0' : 'flex-col gap-1 p-4'} ${fullWidth ? 'sm:col-span-2' : ''}`}>
        <span className={`${compact ? 'text-slate-500 text-sm w-28 shrink-0' : 'text-xs font-medium text-slate-500 uppercase tracking-wider'}`}>{label}</span>
        <span className={`font-medium text-slate-900 ${highlight ? 'text-red-600' : ''} ${compact ? 'text-sm' : 'text-sm'}`}>
            {value || "—"}
        </span>
    </div>
);

export default InstallmentApplicationDetails;
