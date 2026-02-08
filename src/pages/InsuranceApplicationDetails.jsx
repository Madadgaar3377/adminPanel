import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ApiBaseUrl from '../constants/apiUrl';
import Layout from '../compontents/Layout';

const InsuranceApplicationDetails = ({ onLogout }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    useEffect(() => {
        fetchApplicationDetails();
    }, [id]);

    const fetchApplicationDetails = async () => {
        setLoading(true);
        setError(null);
        try {
            const authData = JSON.parse(localStorage.getItem('adminAuth'));
            // Use getAllInsuranceApplications and find by ID
            const res = await fetch(`${ApiBaseUrl}/getAllInsuranceApplications?limit=1000`, {
                headers: {
                    'Authorization': `Bearer ${authData.token}`,
                }
            });
            const data = await res.json();
            
            if (data.success && data.data) {
                // Find the specific application from the list
                const foundApp = data.data.find(app => app._id === id);
                if (foundApp) {
                    setApplication(foundApp);
                } else {
                    setError('Application not found');
                }
            } else {
                setError(data.message || 'Failed to load application details');
            }
        } catch (err) {
            setError("Failed to connect to server");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (newStatus) => {
        const adminNote = window.prompt(`Update status to ${newStatus}. Add a note (optional):`) || '';
        
        if (!window.confirm(`Are you sure you want to update status to ${newStatus}?`)) {
            return;
        }

        setUpdatingStatus(true);
        try {
            const authData = JSON.parse(localStorage.getItem('adminAuth'));
            const res = await fetch(`${ApiBaseUrl}/updateInsuranceApplicationStatus/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${authData.token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    status: newStatus,
                    adminNote: adminNote
                })
            });
            
            const data = await res.json();
            
            if (res.ok && data.success) {
                fetchApplicationDetails();
                alert(`Application status updated to ${newStatus}`);
            } else {
                alert(data.message || 'Failed to update status');
            }
        } catch (err) {
            alert('Network error. Please try again.');
        } finally {
            setUpdatingStatus(false);
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            new: 'bg-blue-100 text-blue-800 border-blue-200',
            under_review: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            docs_required: 'bg-orange-100 text-orange-800 border-orange-200',
            submitted: 'bg-purple-100 text-purple-800 border-purple-200',
            approved: 'bg-green-100 text-green-800 border-green-200',
            rejected: 'bg-red-100 text-red-800 border-red-200',
        };
        return badges[status] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <Layout onLogout={onLogout}>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
                </div>
            </Layout>
        );
    }

    if (error || !application) {
        return (
            <Layout onLogout={onLogout}>
                <div className="p-6">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-800">{error || 'Application not found'}</p>
                        <button
                            onClick={() => navigate('/insurance/applications')}
                            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                            Back to Applications
                        </button>
                    </div>
                </div>
            </Layout>
        );
    }

    const policyDetails = application.policySpecificDetails || {};
    const documents = application.documents || {};

    return (
        <Layout onLogout={onLogout}>
            <div className="p-6">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <button
                            onClick={() => navigate('/insurance/applications')}
                            className="mb-4 flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            <span>Back to Applications</span>
                        </button>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Application Details</h1>
                        <p className="text-gray-600">Application ID: {application.applicationId || application._id}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className={`px-4 py-2 rounded-lg text-sm font-semibold border-2 ${getStatusBadge(application.status)}`}>
                            {application.status?.replace('_', ' ').toUpperCase() || 'NEW'}
                        </span>
                        <select
                            value={application.status || 'new'}
                            onChange={(e) => handleStatusUpdate(e.target.value)}
                            disabled={updatingStatus}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
                        >
                            <option value="new">New</option>
                            <option value="under_review">Under Review</option>
                            <option value="docs_required">Docs Required</option>
                            <option value="submitted">Submitted</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Applicant Information */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Applicant Information
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-semibold text-gray-500">Full Name</label>
                                    <p className="text-gray-900 font-medium">{application.applicantInfo?.fullName || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-500">CNIC</label>
                                    <p className="text-gray-900 font-medium">{application.applicantInfo?.cnic || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-500">Mobile Number</label>
                                    <p className="text-gray-900 font-medium">{application.applicantInfo?.mobileNumber || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-500">Email</label>
                                    <p className="text-gray-900 font-medium">{application.applicantInfo?.email || 'N/A'}</p>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-sm font-semibold text-gray-500">Residential Address</label>
                                    <p className="text-gray-900 font-medium">{application.applicantInfo?.residentialAddress || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-500">City</label>
                                    <p className="text-gray-900 font-medium">{application.applicantInfo?.city || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-500">Preferred Contact Method</label>
                                    <p className="text-gray-900 font-medium">{application.applicantInfo?.preferredContactMethod || 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Plan Information */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Plan Information
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-semibold text-gray-500">Plan Name</label>
                                    <p className="text-gray-900 font-medium">{application.planName || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-500">Policy Type</label>
                                    <p className="text-gray-900 font-medium">
                                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                            {application.policyType || 'N/A'}
                                        </span>
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-500">Insurance Company</label>
                                    <p className="text-gray-900 font-medium">{application.registeredCompanyName || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-500">Application Date</label>
                                    <p className="text-gray-900 font-medium">{formatDate(application.createdAt)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Policy-Specific Details */}
                        {application.policyType && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    {application.policyType} Insurance Details
                                </h2>
                                <div className="space-y-4">
                                    {application.policyType === 'Life' && policyDetails.lifeInsurance && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm font-semibold text-gray-500">Nominee Name</label>
                                                <p className="text-gray-900 font-medium">{policyDetails.lifeInsurance.nomineeName || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-semibold text-gray-500">Relationship with Nominee</label>
                                                <p className="text-gray-900 font-medium">{policyDetails.lifeInsurance.relationshipWithNominee || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-semibold text-gray-500">Sum Assured</label>
                                                <p className="text-gray-900 font-medium">{policyDetails.lifeInsurance.sumAssured ? `PKR ${policyDetails.lifeInsurance.sumAssured.toLocaleString()}` : 'N/A'}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-semibold text-gray-500">Beneficiary CNIC</label>
                                                <p className="text-gray-900 font-medium">{policyDetails.lifeInsurance.beneficiaryCNIC || 'N/A'}</p>
                                            </div>
                                        </div>
                                    )}

                                    {application.policyType === 'Health' && policyDetails.healthInsurance && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm font-semibold text-gray-500">Insured Person Name</label>
                                                <p className="text-gray-900 font-medium">{policyDetails.healthInsurance.insuredPersonName || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-semibold text-gray-500">Relationship</label>
                                                <p className="text-gray-900 font-medium">{policyDetails.healthInsurance.relationship || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-semibold text-gray-500">Age</label>
                                                <p className="text-gray-900 font-medium">{policyDetails.healthInsurance.age || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-semibold text-gray-500">Pre-existing Conditions</label>
                                                <p className="text-gray-900 font-medium">{policyDetails.healthInsurance.preExistingConditions || 'None'}</p>
                                            </div>
                                        </div>
                                    )}

                                    {application.policyType === 'Motor' && policyDetails.motorInsurance && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm font-semibold text-gray-500">Vehicle Type</label>
                                                <p className="text-gray-900 font-medium">{policyDetails.motorInsurance.vehicleType || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-semibold text-gray-500">Vehicle Model</label>
                                                <p className="text-gray-900 font-medium">{policyDetails.motorInsurance.vehicleModel || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-semibold text-gray-500">Registration Number</label>
                                                <p className="text-gray-900 font-medium">{policyDetails.motorInsurance.vehicleRegistrationNumber || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-semibold text-gray-500">Year of Manufacture</label>
                                                <p className="text-gray-900 font-medium">{policyDetails.motorInsurance.yearOfManufacture || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-semibold text-gray-500">Driving License Number</label>
                                                <p className="text-gray-900 font-medium">{policyDetails.motorInsurance.drivingLicenseNumber || 'N/A'}</p>
                                            </div>
                                        </div>
                                    )}

                                    {application.policyType === 'Travel' && policyDetails.travelInsurance && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm font-semibold text-gray-500">Travel Start Date</label>
                                                <p className="text-gray-900 font-medium">{formatDate(policyDetails.travelInsurance.travelStartDate)}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-semibold text-gray-500">Travel End Date</label>
                                                <p className="text-gray-900 font-medium">{formatDate(policyDetails.travelInsurance.travelEndDate)}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-semibold text-gray-500">Destination Country</label>
                                                <p className="text-gray-900 font-medium">{policyDetails.travelInsurance.destinationCountry || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-semibold text-gray-500">Destination City</label>
                                                <p className="text-gray-900 font-medium">{policyDetails.travelInsurance.destinationCity || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-semibold text-gray-500">Traveler Age</label>
                                                <p className="text-gray-900 font-medium">{policyDetails.travelInsurance.travelerAge || 'N/A'}</p>
                                            </div>
                                        </div>
                                    )}

                                    {application.policyType === 'Property' && policyDetails.propertyInsurance && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm font-semibold text-gray-500">Property Type</label>
                                                <p className="text-gray-900 font-medium">{policyDetails.propertyInsurance.propertyType || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-semibold text-gray-500">Estimated Property Value</label>
                                                <p className="text-gray-900 font-medium">{policyDetails.propertyInsurance.estimatedPropertyValue ? `PKR ${policyDetails.propertyInsurance.estimatedPropertyValue.toLocaleString()}` : 'N/A'}</p>
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="text-sm font-semibold text-gray-500">Property Address</label>
                                                <p className="text-gray-900 font-medium">{policyDetails.propertyInsurance.propertyAddress || 'N/A'}</p>
                                            </div>
                                        </div>
                                    )}

                                    {application.policyType === 'Takaful' && policyDetails.takaful && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm font-semibold text-gray-500">Participant Name</label>
                                                <p className="text-gray-900 font-medium">{policyDetails.takaful.participantName || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-semibold text-gray-500">Contribution Amount</label>
                                                <p className="text-gray-900 font-medium">{policyDetails.takaful.contributionAmount ? `PKR ${policyDetails.takaful.contributionAmount.toLocaleString()}` : 'N/A'}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-semibold text-gray-500">Beneficiary Nominee</label>
                                                <p className="text-gray-900 font-medium">{policyDetails.takaful.beneficiaryNominee || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-semibold text-gray-500">Shariah Compliance Agreement</label>
                                                <p className="text-gray-900 font-medium">{policyDetails.takaful.shariahComplianceAgreement ? 'Yes' : 'No'}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Documents */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Documents
                            </h2>
                            <div className="space-y-4">
                                {documents.cnicCopy && (
                                    <div>
                                        <label className="text-sm font-semibold text-gray-500 block mb-2">CNIC Copy</label>
                                        <a href={documents.cnicCopy} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline flex items-center gap-2">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                            View CNIC Copy
                                        </a>
                                    </div>
                                )}

                                {application.policyType === 'Motor' && documents.vehicleRC && (
                                    <div>
                                        <label className="text-sm font-semibold text-gray-500 block mb-2">Vehicle Registration Certificate</label>
                                        <a href={documents.vehicleRC} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline flex items-center gap-2">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                            View Vehicle RC
                                        </a>
                                    </div>
                                )}

                                {application.policyType === 'Property' && documents.propertyProof && documents.propertyProof.length > 0 && (
                                    <div>
                                        <label className="text-sm font-semibold text-gray-500 block mb-2">Property Proof Documents</label>
                                        <div className="space-y-2">
                                            {documents.propertyProof.map((doc, idx) => (
                                                <a key={idx} href={doc} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline flex items-center gap-2">
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                    </svg>
                                                    Property Proof {idx + 1}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {application.policyType === 'Health' && documents.medicalReports && documents.medicalReports.length > 0 && (
                                    <div>
                                        <label className="text-sm font-semibold text-gray-500 block mb-2">Medical Reports</label>
                                        <div className="space-y-2">
                                            {documents.medicalReports.map((doc, idx) => (
                                                <a key={idx} href={doc} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline flex items-center gap-2">
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                    </svg>
                                                    Medical Report {idx + 1}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {application.policyType === 'Travel' && documents.travelTickets && documents.travelTickets.length > 0 && (
                                    <div>
                                        <label className="text-sm font-semibold text-gray-500 block mb-2">Travel Tickets</label>
                                        <div className="space-y-2">
                                            {documents.travelTickets.map((doc, idx) => (
                                                <a key={idx} href={doc} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline flex items-center gap-2">
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                    </svg>
                                                    Travel Ticket {idx + 1}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {documents.planSpecificDocuments && documents.planSpecificDocuments.length > 0 && (
                                    <div>
                                        <label className="text-sm font-semibold text-gray-500 block mb-2">Plan Specific Documents</label>
                                        <div className="space-y-2">
                                            {documents.planSpecificDocuments.map((doc, idx) => (
                                                <a key={idx} href={doc} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline flex items-center gap-2">
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                    </svg>
                                                    Document {idx + 1}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {documents.nomineeBeneficiaryDocuments && documents.nomineeBeneficiaryDocuments.length > 0 && (
                                    <div>
                                        <label className="text-sm font-semibold text-gray-500 block mb-2">Nominee/Beneficiary Documents</label>
                                        <div className="space-y-2">
                                            {documents.nomineeBeneficiaryDocuments.map((doc, idx) => (
                                                <a key={idx} href={doc} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline flex items-center gap-2">
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                    </svg>
                                                    Nominee Document {idx + 1}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {documents.otherSupportingDocuments && documents.otherSupportingDocuments.length > 0 && (
                                    <div>
                                        <label className="text-sm font-semibold text-gray-500 block mb-2">Other Supporting Documents</label>
                                        <div className="space-y-2">
                                            {documents.otherSupportingDocuments.map((doc, idx) => (
                                                <a key={idx} href={doc} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline flex items-center gap-2">
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                    </svg>
                                                    Supporting Document {idx + 1}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {!documents.cnicCopy && 
                                 !documents.vehicleRC && 
                                 (!documents.propertyProof || documents.propertyProof.length === 0) &&
                                 (!documents.medicalReports || documents.medicalReports.length === 0) &&
                                 (!documents.travelTickets || documents.travelTickets.length === 0) &&
                                 (!documents.planSpecificDocuments || documents.planSpecificDocuments.length === 0) &&
                                 (!documents.nomineeBeneficiaryDocuments || documents.nomineeBeneficiaryDocuments.length === 0) &&
                                 (!documents.otherSupportingDocuments || documents.otherSupportingDocuments.length === 0) && (
                                    <p className="text-gray-500 text-sm">No documents uploaded</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Quick Info Card */}
                        <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-xl shadow-lg p-6 text-white">
                            <h3 className="text-lg font-bold mb-4">Application Summary</h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-red-100">Application ID</p>
                                    <p className="font-semibold">{application.applicationId || application._id}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-red-100">Status</p>
                                    <p className="font-semibold">{application.status?.replace('_', ' ').toUpperCase() || 'NEW'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-red-100">Applied Date</p>
                                    <p className="font-semibold">{formatDate(application.createdAt)}</p>
                                </div>
                                {application.updatedAt && (
                                    <div>
                                        <p className="text-sm text-red-100">Last Updated</p>
                                        <p className="font-semibold">{formatDate(application.updatedAt)}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Authorization & Notes */}
                        {(application.authorization || application.adminNotes) && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-4">Notes & Authorization</h3>
                                {application.authorization && (
                                    <div className="mb-4">
                                        <p className="text-sm font-semibold text-gray-500 mb-2">Authorization</p>
                                        <div className="space-y-2 text-sm text-gray-700">
                                            {application.authorization.authorizationToList && <p>✓ Authorized to list</p>}
                                            {application.authorization.confirmationOfAccuracy && <p>✓ Confirmed accuracy</p>}
                                            {application.authorization.consentForLeadSharing && <p>✓ Consent for lead sharing</p>}
                                        </div>
                                    </div>
                                )}
                                {application.adminNotes && (
                                    <div>
                                        <p className="text-sm font-semibold text-gray-500 mb-2">Admin Notes</p>
                                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{application.adminNotes}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default InsuranceApplicationDetails;
