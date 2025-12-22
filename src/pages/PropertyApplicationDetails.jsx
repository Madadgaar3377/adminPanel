import React, { useState, useEffect } from 'react';
import ApiBaseUrl from '../constants/apiUrl';
import { useParams, useNavigate } from 'react-router-dom';

const PropertyApplicationDetails = () => {
    const { id } = useParams(); // applicationId
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
            const res = await fetch(`${ApiBaseUrl}/getAllApplicationsForProperty`, {
                headers: {
                    ...(authData?.token ? { Authorization: `Bearer ${authData.token}` } : {}),
                }
            });
            const data = await res.json();
            if (data.success) {
                const found = data.applications.find(app => app.applicationId === id);
                if (found) setApplication(found);
                else setError("Application protocol not found in registry.");
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError("Connectivity error: Unable to synch with property vault.");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (newStatus) => {
        setUpdating(true);
        try {
            const authData = JSON.parse(localStorage.getItem('adminAuth'));
            const res = await fetch(`${ApiBaseUrl}/updateApplicationStatusForProperty`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(authData?.token ? { Authorization: `Bearer ${authData.token}` } : {}),
                },
                body: JSON.stringify({ applicationId: id, status: newStatus })
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
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Synching Acquisition Profile...</p>
        </div>
    );

    if (error) return <div className="p-20 text-center font-black text-red-600 uppercase tracking-widest bg-white rounded-3xl border border-red-50 shadow-xl">{error}</div>;
    if (!application) return <div className="p-20 text-center font-black text-gray-400 uppercase tracking-widest">No active protocol detected.</div>;

    const applicant = application.commonForm?.[0] || {};
    const property = application.propertyDetails?.[0] || {};

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-in fade-in duration-700">
            {/* Header */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-3 bg-gray-50 text-gray-400 hover:text-gray-900 rounded-2xl transition-all">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">Acquisition Profile</h1>
                        <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.3em] mt-1">ID: {application.applicationId}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <select
                        value={application.status}
                        disabled={updating}
                        onChange={(e) => handleStatusUpdate(e.target.value)}
                        className="px-8 py-4 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none shadow-xl shadow-gray-200 cursor-pointer hover:bg-black transition-all appearance-none"
                    >
                        <option value="pending">PENDING</option>
                        <option value="In_Progress">IN PROGRESS</option>
                        <option value="approved">APPROVE</option>
                        <option value="rejected">REJECT</option>
                        <option value="cancelled">CANCEL</option>
                    </select>
                </div>
            </div>

            {message && <div className="p-4 bg-emerald-50 border-2 border-emerald-100 text-emerald-600 rounded-2xl font-black uppercase text-[10px] tracking-widest text-center animate-bounce">{message}</div>}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Applicant Info */}
                <div className="lg:col-span-2 space-y-8">
                    <section className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm space-y-10">
                        <div>
                            <SectionTitle theme="red">Applicant Identification</SectionTitle>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                                <InfoItem label="Full Legal Name" value={applicant.name} />
                                <InfoItem label="Secure Mobile Line" value={applicant.number} />
                                <InfoItem label="Email Protocol" value={applicant.email} />
                                <InfoItem label="CNIC / Residency ID" value={applicant.cnic} />
                                <InfoItem label="City Sector" value={applicant.city} />
                                <InfoItem label="Regional Area" value={applicant.area} />
                                <InfoItem label="Reference Code" value={applicant.reference} />
                                <InfoItem label="WhatsApp Protocol" value={applicant.whatsApp} />
                            </div>
                        </div>

                        <div className="pt-10 border-t border-gray-50">
                            <SectionTitle theme="gray">Internal Narrative</SectionTitle>
                            <p className="mt-6 text-xs font-bold text-gray-400 italic leading-relaxed bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                "{application.applicationNote || "No additional override notes provided by the applicant."}"
                            </p>
                        </div>
                    </section>
                </div>

                {/* Property Detail Sidebar */}
                <div className="space-y-8">
                    <div className="bg-white rounded-[3rem] border border-gray-100 shadow-xl overflow-hidden">
                        <div className="bg-red-600 p-8 text-white">
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Target Asset</p>
                            <h3 className="text-2xl font-black uppercase tracking-tighter mt-1">{property.adTitle || property.name || 'N/A'}</h3>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Asset Value</span>
                                    <span className="text-sm font-black text-gray-900 tracking-tight">RS. {property.price?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Property Type</span>
                                    <span className="text-sm font-black text-gray-900 tracking-tight">{property.typeOfProperty}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Purpose</span>
                                    <span className="text-sm font-black text-gray-900 tracking-tight">{property.purpose}</span>
                                </div>
                                <div className="pt-4">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Location Profile</p>
                                    <p className="text-[11px] font-black text-gray-900 leading-relaxed uppercase">{property.address}</p>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate(`/property/edit/${property.propertyId}`)}
                                className="w-full py-4 bg-gray-900 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg"
                            >
                                View Asset Details
                            </button>
                        </div>
                    </div>

                    <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white space-y-4">
                        <h4 className="text-[10px] font-black text-red-600 uppercase tracking-widest">Deployment Context</h4>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-[9px] font-bold text-gray-500 uppercase">Assigned Agent</span>
                                <span className="text-[9px] font-black text-white uppercase">{application.assigenAgent || "UNASSIGNED"}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[9px] font-bold text-gray-500 uppercase">Applied date</span>
                                <span className="text-[9px] font-black text-white uppercase">{new Date(application.appliedAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SectionTitle = ({ children, theme }) => (
    <h2 className={`text-xl font-black uppercase tracking-tight pl-4 border-l-8 ${theme === 'red' ? 'border-red-600' : 'border-gray-200'}`}>
        {children}
    </h2>
);

const InfoItem = ({ label, value }) => (
    <div className="space-y-2">
        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</p>
        <div className="px-5 py-4 bg-gray-50 rounded-2xl border border-transparent font-bold text-xs text-gray-900">
            {value || "NOT PROVIDED"}
        </div>
    </div>
);

export default PropertyApplicationDetails;
