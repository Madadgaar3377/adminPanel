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
            setError("Failed to synch application details.");
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
                setMessage(`PROTOCOL STATUS OVERRIDE: ${newStatus.toUpperCase()}`);
                setApplication({ ...application, status: newStatus });
                setTimeout(() => setMessage(null), 3000);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError("Update broadcast failed.");
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="w-12 h-12 border-4 border-gray-100 border-t-red-600 rounded-full animate-spin"></div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Synching Application Spectrum...</p>
        </div>
    );

    if (!application) return <div className="p-20 text-center uppercase font-black text-gray-400">Application not found in local sector.</div>;

    const user = application.UserInfo?.[0] || {};
    const plan = application.PlanInfo?.[0] || {};
    const fin = application.PlanInfo?.[1] || {};

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20 animate-in fade-in duration-700">
            {/* Action Header */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-50 rounded-xl transition-all text-gray-400">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">Application Profile</h1>
                    </div>
                    <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.3em] mt-1 ml-10 flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-600 rounded-full animate-ping"></span>
                        LIVE LOG: {application.applicationId}
                    </p>
                </div>
                <div className="flex gap-3">
                    <select
                        value={application.status}
                        disabled={updating}
                        onChange={(e) => handleStatusUpdate(e.target.value)}
                        className="px-6 py-3.5 bg-gray-900 text-white border-none rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none shadow-xl shadow-gray-200 cursor-pointer appearance-none hover:bg-black transition-all"
                    >
                        <option value="pending">PENDING</option>
                        <option value="in_progress">IN PROGRESS</option>
                        <option value="approved">APPROVE</option>
                        <option value="rejected">REJECT</option>
                        <option value="cancelled">CANCEL</option>
                        <option value="completed">COMPLETE</option>
                    </select>
                </div>
            </div>

            {message && <div className="p-4 bg-emerald-50 border-2 border-emerald-100 text-emerald-600 rounded-2xl font-black uppercase text-[10px] tracking-widest text-center animate-bounce">{message}</div>}
            {error && <div className="p-4 bg-red-50 border-2 border-red-100 text-red-600 rounded-2xl font-black uppercase text-[10px] tracking-widest text-center">{error}</div>}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Applicant Core Information */}
                <div className="lg:col-span-2 space-y-8">
                    <section className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm space-y-8">
                        <div>
                            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight border-l-8 border-red-600 pl-4 mb-8">Personal Credentials</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <InfoItem label="Full Name" value={user.name} />
                                <InfoItem label="Email System" value={user.email} />
                                <InfoItem label="Cell Protocol" value={user.phone} />
                                <InfoItem label="City / Region" value={user.city} />
                                <InfoItem label="Residential Line" value={user.address} className="md:col-span-2" />
                            </div>
                        </div>

                        <div className="pt-8 border-t border-gray-50">
                            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight border-l-8 border-gray-200 pl-4 mb-8">Professional Meta</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <InfoItem label="Occupation" value={user.occupation} />
                                <InfoItem label="Income Level" value={user.monthlyIncome} highlight />
                                <InfoItem label="Employer Entity" value={user.employerName} />
                                <InfoItem label="Job Designation" value={user.jobTitle} />
                                <InfoItem label="Work Contact" value={user.workContactNumber} />
                                <InfoItem label="Other Sources" value={user.otherIncomeSources} />
                            </div>
                        </div>
                    </section>

                    <section className="bg-gray-900 rounded-[3rem] p-10 text-white space-y-8 shadow-2xl">
                        <h2 className="text-xl font-black uppercase tracking-tight border-l-8 border-red-600 pl-4">Application Notes</h2>
                        <p className="text-gray-400 text-xs font-bold leading-relaxed italic">
                            "{application.applicationNote || "No additional override notes provided by the applicant."}"
                        </p>
                    </section>
                </div>

                {/* Financial Summary Card */}
                <div className="space-y-8">
                    <div className="bg-white rounded-[3rem] border border-gray-100 shadow-xl overflow-hidden">
                        <div className="bg-red-600 p-8 text-white">
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Selection Protocol</p>
                            <h3 className="text-2xl font-black uppercase tracking-tighter mt-1">{plan.planType || "N/A"}</h3>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Product Price</span>
                                    <span className="text-sm font-black text-gray-900 tracking-tight">PKR {plan.planPrice?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Downpayment</span>
                                    <span className="text-sm font-black text-gray-900 tracking-tight">PKR {fin.downPayment?.toLocaleString()}</span>
                                </div>
                                <div className="h-px bg-gray-100"></div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">Monthly Burden</span>
                                    <span className="text-xl font-black text-gray-900 tracking-tight">PKR {fin.monthlyInstallment?.toLocaleString()}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4 pt-4">
                                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center">
                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Tenure</p>
                                        <p className="text-xs font-black text-gray-900 uppercase tracking-tighter">{fin.tenureMonths} Months</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center">
                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Interest</p>
                                        <p className="text-xs font-black text-gray-900 uppercase tracking-tighter">
                                            {fin.interestRatePercent}% {fin.interestType === 'Flat Rate' ? 'FLT' : (fin.interestType === 'Profit-Based (Islamic/Shariah)' ? 'ISL' : 'RED')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Agent Section */}
                    <div className="bg-gray-50 rounded-[2.5rem] p-8 border border-gray-100 space-y-4">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Operational Metadata</h4>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-[9px] font-bold text-gray-500 uppercase">Assigned Agent</span>
                                <span className="text-[9px] font-black text-gray-900 uppercase">{application.assigenAgent || "UNASSIGNED"}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[9px] font-bold text-gray-500 uppercase">Core ID</span>
                                <span className="text-[9px] font-black text-gray-400 uppercase">{application.installmentPlanId}</span>
                            </div>
                            {application.approval?.[0] && (
                                <div className="pt-4 mt-4 border-t border-gray-200">
                                    <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest mb-1">Approved By</p>
                                    <p className="text-[10px] font-bold text-gray-900 uppercase">{application.approval[0].approvedBy} @ {new Date(application.approval[0].approvedAt).toLocaleDateString()}</p>
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
    <div className={`space-y-1.5 ${className}`}>
        <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">{label}</p>
        <div className={`px-5 py-4 bg-gray-50 rounded-2xl border border-transparent font-bold text-sm ${highlight ? 'text-red-600 border-red-100' : 'text-gray-800'}`}>
            {value || "N/A"}
        </div>
    </div>
);

export default InstallmentApplicationDetails;
