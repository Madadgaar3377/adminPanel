import React, { useState, useEffect, useRef, useCallback } from 'react';
import ApiBaseUrl from '../constants/apiUrl';
import { useParams, useNavigate } from 'react-router-dom';

const EMPTY_LABEL = 'Not provided';

const FormRow = ({ label, value, compact }) => {
    const isEmpty = value === undefined || value === null || value === '';
    const display = isEmpty ? EMPTY_LABEL : (typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value));
    return (
        <div className={compact ? 'flex justify-between items-center gap-4 py-1' : 'py-2'}>
            <span className="text-sm font-semibold text-gray-500">{label}</span>
            <span className={`text-sm font-medium ${isEmpty ? 'text-gray-400 italic' : 'text-gray-900'}`}>
                {display}
            </span>
        </div>
    );
};

const Section = ({ title, children }) => (
    <div className="p-6 border-t border-gray-100 space-y-4">
        <h2 className="text-lg font-black text-gray-900 uppercase">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    </div>
);

const LoanApplicationDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [application, setApplication] = useState(null);
    const [userDetails, setUserDetails] = useState(null);
    const [agentDetails, setAgentDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState(null);
    const [downloadOpen, setDownloadOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const downloadRef = useRef(null);

    const fetchDetails = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const authData = JSON.parse(localStorage.getItem('adminAuth'));
            const res = await fetch(`${ApiBaseUrl}/getLoanApplication/${id}`, {
                headers: authData?.token ? { Authorization: `Bearer ${authData.token}` } : {},
            });
            const data = await res.json();
            if (data.success) {
                setApplication(data.data);
                // Fetch user + agent profile details (admin-only endpoint)
                try {
                    const tokenHeader = authData?.token ? { Authorization: `Bearer ${authData.token}` } : {};
                    const userId = data.data?.userId;
                    const agentId = data.data?.assignedAgent;

                    const fetchProfile = async (uid) => {
                        if (!uid) return null;
                        const r = await fetch(`${ApiBaseUrl}/getUserByUserId/${uid}`, { headers: tokenHeader });
                        const j = await r.json();
                        return j?.success ? j.user : null;
                    };

                    const [u, a] = await Promise.all([fetchProfile(userId), fetchProfile(agentId)]);
                    setUserDetails(u);
                    setAgentDetails(a);
                } catch (_) {
                    // Non-blocking: still show IDs even if profile fetch fails
                    setUserDetails(null);
                    setAgentDetails(null);
                }
            } else {
                setError(data.message || 'Failed to load application.');
            }
        } catch (err) {
            setError('Failed to load application details.');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (id) fetchDetails();
    }, [id, fetchDetails]);

    useEffect(() => {
        const close = (e) => {
            if (downloadRef.current && !downloadRef.current.contains(e.target)) setDownloadOpen(false);
        };
        document.addEventListener('click', close);
        return () => document.removeEventListener('click', close);
    }, []);

    const handleStatusUpdate = async (newStatus) => {
        setUpdating(true);
        try {
            const authData = JSON.parse(localStorage.getItem('adminAuth'));
            const res = await fetch(`${ApiBaseUrl}/updateLoanApplicationStatus/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(authData?.token ? { Authorization: `Bearer ${authData.token}` } : {}),
                },
                body: JSON.stringify({ status: newStatus }),
            });
            const data = await res.json();
            if (data.success) {
                setApplication((prev) => (prev ? { ...prev, status: newStatus } : null));
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Failed to update status.');
        } finally {
            setUpdating(false);
        }
    };

    const formatDate = (d) => {
        if (!d) return EMPTY_LABEL;
        return new Date(d).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const handleDelete = async () => {
        if (!window.confirm('Delete this loan application? This will also remove uploaded documents (CNIC, salary slip, bank statement) from storage. This action cannot be undone.')) {
            return;
        }
        setDeleting(true);
        try {
            const authData = JSON.parse(localStorage.getItem('adminAuth'));
            const res = await fetch(`${ApiBaseUrl}/deleteLoanApplication/${id}`, {
                method: 'DELETE',
                headers: authData?.token ? { Authorization: `Bearer ${authData.token}` } : {},
            });
            const data = await res.json();
            if (data.success) {
                navigate('/loan/all-applications');
            } else {
                setError(data.message || 'Failed to delete application.');
            }
        } catch (err) {
            setError('Failed to delete application.');
        } finally {
            setDeleting(false);
        }
    };

    const allRows = () => {
        if (!application) return [];
        const app = application;
        const applicant = app.applicantInfo || {};
        const contact = app.contactInfo || {};
        const income = app.incomeDetails || {};
        const banking = app.bankingDetails || {};
        const loanReq = app.loanRequirement || {};
        const islamic = app.islamicFinancing || {};
        const security = app.security || {};
        const declarations = app.declarations || {};
        const docs = app.documents || {};
        const existingLoan = banking.existingLoan || {};
        const rows = [
            ['Application ID', app.applicationId || app._id],
            ['Status', app.status],
            ['Plan ID', app.planId],
            ['Product', app.productName],
            ['Bank', app.bankName],
            ['Category', app.productCategory],
            ['Financing type', app.financingType],
            ['Indicative rate', app.indicativeRate],
            ['Min financing', app.minFinancingAmount],
            ['Max financing', app.maxFinancingAmount],
            ['Tenure', app.minTenure != null && app.maxTenure != null ? `${app.minTenure}-${app.maxTenure} ${app.tenureUnit || 'Months'}` : null],
            ['Full name', applicant.fullName],
            ['Father / Husband', applicant.fatherOrHusbandName],
            ['CNIC', applicant.cnicNumber],
            ['CNIC expiry', formatDate(applicant.cnicExpiryDate)],
            ['Date of birth', formatDate(applicant.dateOfBirth)],
            ['Marital status', applicant.maritalStatus],
            ['Number of dependents', applicant.numberOfDependents],
            ['Mobile', contact.mobileNumber],
            ['WhatsApp', contact.whatsappNumber],
            ['Email', contact.email],
            ['Current address', contact.currentAddress],
            ['City', contact.city],
            ['Residence type', contact.residenceType],
            ['Income type', income.incomeType],
            ['Employer name', income.employerName],
            ['Business name', income.businessName],
            ['Designation', income.designation],
            ['Job status', income.jobStatus],
            ['Monthly net salary', income.monthlyNetSalary],
            ['Nature of business', income.natureOfBusiness],
            ['Years in business', income.yearsInBusiness],
            ['NTN available', income.ntnAvailable != null ? (income.ntnAvailable ? 'Yes' : 'No') : null],
            ['Approx monthly income', income.approxMonthlyIncome],
            ['Bank names', Array.isArray(banking.bankNames) ? banking.bankNames.join(', ') : banking.bankNames],
            ['Account type', banking.accountType],
            ['Existing loan type', existingLoan.loanType],
            ['Existing loan bank', existingLoan.bankName],
            ['Existing monthly installment', existingLoan.monthlyInstallment],
            ['Loan type', loanReq.loanType],
            ['Required amount', loanReq.requiredAmount],
            ['Preferred tenure', loanReq.preferredTenure],
            ['Financing preference', loanReq.financingPreference],
            ['Islamic preferred mode', islamic.preferredMode],
            ['Shariah terms accepted', islamic.shariahTermsAccepted != null ? (islamic.shariahTermsAccepted ? 'Yes' : 'No') : null],
            ['Security offered', security.securityOffered],
            ['Estimated value', security.estimatedValue],
            ['Credit check consent', declarations.creditCheckConsent != null ? (declarations.creditCheckConsent ? 'Yes' : 'No') : null],
            ['Information confirmed', declarations.informationConfirmed != null ? (declarations.informationConfirmed ? 'Yes' : 'No') : null],
            ['Applicant signature', declarations.applicantSignature ? 'Provided' : null],
            ['Signed at', formatDate(declarations.signedAt)],
            ['CNIC front', docs.cnicFront ? 'Uploaded' : null],
            ['CNIC back', docs.cnicBack ? 'Uploaded' : null],
            ['Salary slip', docs.salarySlip ? 'Uploaded' : null],
            ['Bank statement', docs.bankStatement ? 'Uploaded' : null],
            ['Other documents', Array.isArray(docs.otherDocuments) && docs.otherDocuments.length ? docs.otherDocuments.length + ' file(s)' : null],
            ['Application note', app.applicationNote],
            ['Admin note', app.adminNote],
            ['User ID', app.userId],
            ['Assigned agent', app.assignedAgent],
            ['Applied at', formatDate(app.createdAt)],
            ['Updated at', formatDate(app.updatedAt)],
        ];
        return rows;
    };

    const downloadCSV = () => {
        const rows = allRows();
        const header = 'Field,Value\n';
        const body = rows.map(([k, v]) => {
            const val = v === undefined || v === null ? '' : String(v).replace(/"/g, '""');
            return `"${String(k).replace(/"/g, '""')}","${val}"`;
        }).join('\n');
        const csv = header + body;
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `loan-application-${application?.applicationId || id}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        setDownloadOpen(false);
    };

    const downloadPDF = () => {
        const rows = allRows();
        const printContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Loan Application ${application?.applicationId || id}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 24px; color: #333; max-width: 800px; margin: 0 auto; }
    h1 { font-size: 20px; border-bottom: 2px solid #dc2626; padding-bottom: 8px; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    th, td { text-align: left; padding: 8px 12px; border-bottom: 1px solid #eee; }
    th { background: #f5f5f5; font-weight: 600; width: 35%; }
    .empty { color: #999; font-style: italic; }
  </style>
</head>
<body>
  <h1>Loan Application – ${application?.applicationId || id}</h1>
  <p><strong>Status:</strong> ${application?.status || ''} &nbsp;| &nbsp;<strong>Generated:</strong> ${new Date().toLocaleString()}</p>
  <table>
    <thead><tr><th>Field</th><th>Value</th></tr></thead>
    <tbody>
      ${rows.map(([k, v]) => {
          const empty = v === undefined || v === null || v === '';
          const val = empty ? EMPTY_LABEL : (typeof v === 'boolean' ? (v ? 'Yes' : 'No') : String(v));
          return `<tr><td>${k}</td><td class="${empty ? 'empty' : ''}">${val}</td></tr>`;
      }).join('')}
    </tbody>
  </table>
</body>
</html>`;
        const win = window.open('', '_blank');
        win.document.write(printContent);
        win.document.close();
        win.focus();
        setTimeout(() => {
            win.print();
            win.close();
        }, 250);
        setDownloadOpen(false);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="w-12 h-12 border-4 border-gray-100 border-t-red-600 rounded-full animate-spin"></div>
                <p className="text-sm text-gray-500">Loading application...</p>
            </div>
        );
    }

    if (error || !application) {
        return (
            <div className="p-8">
                <p className="text-red-600 font-semibold">{error || 'Application not found.'}</p>
                <button
                    onClick={() => navigate('/loan/all-applications')}
                    className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-bold"
                >
                    Back to applications
                </button>
            </div>
        );
    }

    const applicant = application.applicantInfo || {};
    const contact = application.contactInfo || {};
    const income = application.incomeDetails || {};
    const banking = application.bankingDetails || {};
    const loanReq = application.loanRequirement || {};
    const islamic = application.islamicFinancing || {};
    const security = application.security || {};
    const declarations = application.declarations || {};
    const docs = application.documents || {};
    const existingLoan = banking.existingLoan || {};
    const statusOptions = ['pending', 'in_progress', 'approved', 'rejected', 'cancelled'];

    return (
        <div className="space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Loan Application</h1>
                    <p className="text-xs font-bold text-gray-500 mt-1">
                        {application.applicationId || application._id} • {application.status}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative" ref={downloadRef}>
                        <button
                            onClick={() => setDownloadOpen(!downloadOpen)}
                            className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 flex items-center gap-2"
                        >
                            Download
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </button>
                        {downloadOpen && (
                            <div className="absolute right-0 mt-1 py-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                                <button onClick={downloadCSV} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                    Download as CSV
                                </button>
                                <button onClick={downloadPDF} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                    Download as PDF
                                </button>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => navigate('/loan/all-applications')}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-200"
                    >
                        ← Back to list
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="px-4 py-2 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-bold hover:bg-red-100 disabled:opacity-50"
                    >
                        {deleting ? 'Deleting...' : 'Delete'}
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex flex-wrap items-center gap-4">
                    <span className="text-sm font-bold text-gray-500">Status</span>
                    <select
                        value={application.status}
                        onChange={(e) => handleStatusUpdate(e.target.value)}
                        disabled={updating}
                        className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-900"
                    >
                        {statusOptions.map((s) => (
                            <option key={s} value={s}>{s.replace('_', ' ')}</option>
                        ))}
                    </select>
                    {updating && <span className="text-sm text-gray-500">Updating...</span>}
                </div>

                <Section title="Applicant information">
                    <FormRow label="Full name" value={applicant.fullName} />
                    <FormRow label="Father / Husband" value={applicant.fatherOrHusbandName} />
                    <FormRow label="CNIC" value={applicant.cnicNumber} />
                    <FormRow label="CNIC expiry" value={formatDate(applicant.cnicExpiryDate)} />
                    <FormRow label="Date of birth" value={formatDate(applicant.dateOfBirth)} />
                    <FormRow label="Marital status" value={applicant.maritalStatus} />
                    <FormRow label="Number of dependents" value={applicant.numberOfDependents} />
                </Section>

                <Section title="Contact & address">
                    <FormRow label="Mobile" value={contact.mobileNumber} />
                    <FormRow label="WhatsApp" value={contact.whatsappNumber} />
                    <FormRow label="Email" value={contact.email} />
                    <FormRow label="Current address" value={contact.currentAddress} />
                    <FormRow label="City" value={contact.city} />
                    <FormRow label="Residence type" value={contact.residenceType} />
                </Section>

                <Section title="Loan product">
                    <FormRow label="Product" value={application.productName} />
                    <FormRow label="Bank" value={application.bankName} />
                    <FormRow label="Category" value={application.productCategory} />
                    <FormRow label="Plan ID" value={application.planId} />
                    <FormRow label="Financing type" value={application.financingType} />
                    <FormRow label="Indicative rate" value={application.indicativeRate} />
                    <FormRow label="Min financing amount" value={application.minFinancingAmount != null ? application.minFinancingAmount.toLocaleString() : null} />
                    <FormRow label="Max financing amount" value={application.maxFinancingAmount != null ? application.maxFinancingAmount.toLocaleString() : null} />
                    <FormRow label="Tenure" value={application.minTenure != null && application.maxTenure != null ? `${application.minTenure}-${application.maxTenure} ${application.tenureUnit || 'Months'}` : null} />
                </Section>

                <Section title="Income / employment">
                    <FormRow label="Income type" value={income.incomeType} />
                    <FormRow label="Employer name" value={income.employerName} />
                    <FormRow label="Business name" value={income.businessName} />
                    <FormRow label="Designation" value={income.designation} />
                    <FormRow label="Job status" value={income.jobStatus} />
                    <FormRow label="Monthly net salary" value={income.monthlyNetSalary != null ? income.monthlyNetSalary.toLocaleString() : null} />
                    <FormRow label="Nature of business" value={income.natureOfBusiness} />
                    <FormRow label="Years in business" value={income.yearsInBusiness} />
                    <FormRow label="NTN available" value={income.ntnAvailable != null ? (income.ntnAvailable ? 'Yes' : 'No') : null} />
                    <FormRow label="Approx monthly income" value={income.approxMonthlyIncome != null ? income.approxMonthlyIncome.toLocaleString() : null} />
                </Section>

                <Section title="Banking & liabilities">
                    <FormRow label="Bank names" value={Array.isArray(banking.bankNames) ? banking.bankNames.join(', ') : banking.bankNames} />
                    <FormRow label="Account type" value={banking.accountType} />
                    <FormRow label="Existing loan type" value={existingLoan.loanType} />
                    <FormRow label="Existing loan bank" value={existingLoan.bankName} />
                    <FormRow label="Existing monthly installment" value={existingLoan.monthlyInstallment != null ? existingLoan.monthlyInstallment.toLocaleString() : null} />
                </Section>

                <Section title="Loan requirement">
                    <FormRow label="Loan type" value={loanReq.loanType} />
                    <FormRow label="Required amount" value={loanReq.requiredAmount != null ? loanReq.requiredAmount.toLocaleString() : null} />
                    <FormRow label="Preferred tenure" value={loanReq.preferredTenure} />
                    <FormRow label="Financing preference" value={loanReq.financingPreference} />
                </Section>

                <Section title="Islamic financing">
                    <FormRow label="Preferred mode" value={islamic.preferredMode} />
                    <FormRow label="Shariah terms accepted" value={islamic.shariahTermsAccepted != null ? (islamic.shariahTermsAccepted ? 'Yes' : 'No') : null} />
                </Section>

                <Section title="Security / asset">
                    <FormRow label="Security offered" value={security.securityOffered} />
                    <FormRow label="Estimated value" value={security.estimatedValue != null ? security.estimatedValue.toLocaleString() : null} />
                </Section>

                <Section title="Declarations">
                    <FormRow label="Credit check consent" value={declarations.creditCheckConsent != null ? (declarations.creditCheckConsent ? 'Yes' : 'No') : null} />
                    <FormRow label="Information confirmed" value={declarations.informationConfirmed != null ? (declarations.informationConfirmed ? 'Yes' : 'No') : null} />
                    <FormRow label="Applicant signature" value={declarations.applicantSignature ? 'Provided' : null} />
                    <FormRow label="Signed at" value={formatDate(declarations.signedAt)} />
                </Section>

                <Section title="Documents">
                    <FormRow label="CNIC front" value={docs.cnicFront ? 'Uploaded' : null} />
                    <FormRow label="CNIC back" value={docs.cnicBack ? 'Uploaded' : null} />
                    <FormRow label="Salary slip" value={docs.salarySlip ? 'Uploaded' : null} />
                    <FormRow label="Bank statement" value={docs.bankStatement ? 'Uploaded' : null} />
                    <FormRow label="Other documents" value={Array.isArray(docs.otherDocuments) && docs.otherDocuments.length ? docs.otherDocuments.length + ' file(s)' : null} />
                </Section>

                <div className="p-6 border-t border-gray-100 space-y-4">
                    <h2 className="text-lg font-black text-gray-900 uppercase">Notes & system</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormRow label="Application note" value={application.applicationNote} />
                        <FormRow label="Admin note" value={application.adminNote} />
                        <FormRow label="User ID" value={application.userId} />
                        <FormRow label="User name" value={userDetails?.name} />
                        <FormRow label="User email" value={userDetails?.email} />
                        <FormRow label="User phone" value={userDetails?.phoneNumber} />
                        <FormRow label="User type" value={userDetails?.UserType} />
                        <FormRow label="Assigned agent" value={application.assignedAgent} />
                        <FormRow label="Agent name" value={agentDetails?.name} />
                        <FormRow label="Agent email" value={agentDetails?.email} />
                        <FormRow label="Agent phone" value={agentDetails?.phoneNumber} />
                        <FormRow label="Agent type" value={agentDetails?.UserType} />
                        <FormRow label="Applied at" value={formatDate(application.createdAt)} />
                        <FormRow label="Updated at" value={formatDate(application.updatedAt)} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoanApplicationDetails;
