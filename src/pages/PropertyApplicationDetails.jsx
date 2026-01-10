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
                else setError("Application not found.");
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

    if (error) return <div className="p-20 text-center text-red-600 bg-white rounded-2xl border border-red-200">{error}</div>;
    if (!application) return <div className="p-20 text-center text-gray-500">Application not found.</div>;

    const applicant = application.commonForm?.[0] || {};
    const property = application.propertyDetails?.[0] || {};

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-20">
            {/* Header */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-50 rounded-lg transition-all text-gray-400">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Property Application</h1>
                        <p className="text-sm text-gray-500 mt-1">ID: {application.applicationId}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <select
                        value={application.status}
                        disabled={updating}
                        onChange={(e) => handleStatusUpdate(e.target.value)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium outline-none cursor-pointer hover:bg-red-700 transition-all"
                    >
                        <option value="pending">Pending</option>
                        <option value="In_Progress">In Progress</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            {message && <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm text-center">{message}</div>}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Applicant Info */}
                <div className="lg:col-span-2 space-y-6">
                    <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-6">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Applicant Information
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InfoItem label="Name" value={applicant.name} />
                                <InfoItem label="Phone" value={applicant.number} />
                                <InfoItem label="Email" value={applicant.email} />
                                <InfoItem label="CNIC" value={applicant.cnic} />
                                <InfoItem label="City" value={applicant.city} />
                                <InfoItem label="Area" value={applicant.area} />
                                <InfoItem label="Reference" value={applicant.reference} />
                                <InfoItem label="WhatsApp" value={applicant.whatsApp} />
                            </div>
                        </div>

                        {application.applicationNote && (
                            <div className="pt-6 border-t border-gray-100">
                                <h2 className="text-lg font-bold text-gray-900 mb-3">Notes</h2>
                                <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    {application.applicationNote}
                                </p>
                            </div>
                        )}
                    </section>
                </div>

                {/* Property Details */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="bg-red-600 p-5 text-white">
                            <p className="text-xs text-white/80 mb-1">Property</p>
                            <h3 className="text-xl font-bold">{property.adTitle || property.name || 'N/A'}</h3>
                        </div>
                        <div className="p-5 space-y-4">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="text-sm text-gray-500">Price</span>
                                    <span className="text-sm font-semibold text-gray-900">RS. {property.price?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="text-sm text-gray-500">Type</span>
                                    <span className="text-sm font-semibold text-gray-900">{property.typeOfProperty}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="text-sm text-gray-500">Purpose</span>
                                    <span className="text-sm font-semibold text-gray-900">{property.purpose}</span>
                                </div>
                                {property.address && (
                                    <div className="pt-2">
                                        <p className="text-xs text-gray-500 mb-2">Location</p>
                                        <p className="text-sm text-gray-900">{property.address}</p>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => navigate(`/property/edit/${property.propertyId}`)}
                                className="w-full py-3 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-black transition-all"
                            >
                                View Property Details
                            </button>
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200 space-y-3">
                        <h4 className="text-sm font-bold text-gray-900">Additional Information</h4>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-500">Assigned Agent</span>
                                <span className="text-xs font-medium text-gray-900">{application.assigenAgent || "Not Assigned"}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-500">Applied Date</span>
                                <span className="text-xs font-medium text-gray-900">{new Date(application.appliedAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const InfoItem = ({ label, value }) => (
    <div>
        <label className="block text-sm text-gray-500 mb-1">{label}</label>
        <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 font-medium text-sm text-gray-900">
            {value || "N/A"}
        </div>
    </div>
);

export default PropertyApplicationDetails;
