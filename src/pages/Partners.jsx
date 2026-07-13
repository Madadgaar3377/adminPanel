import React, { useState, useEffect } from 'react';
import ApiBaseUrl from '../constants/apiUrl';
import { useNavigate } from 'react-router-dom';
import Pagination from '../compontents/Pagination';
import AdminBulkDataModal from '../components/mada-data/AdminBulkDataModal';
import AdminExportModal from '../components/mada-data/AdminExportModal';

const accessOptions = [
    'Installments',
    'Loan',
    'Property',
    'Insurance',
];

const Partners = () => {
    const [activeTab, setActiveTab] = useState('list'); // 'list' or 'add'
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [uploadingProfile, setUploadingProfile] = useState(false);
    const [uploadingIdCard, setUploadingIdCard] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPartner, setSelectedPartner] = useState(null);
    const [showBulkData, setShowBulkData] = useState(false);
    const [bulkPartner, setBulkPartner] = useState(null);
    const [showExportModal, setShowExportModal] = useState(false);
    const [exportDefaultPartnerId, setExportDefaultPartnerId] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [filterStatus, setFilterStatus] = useState('all');
    const itemsPerPage = 10;
    const navigate = useNavigate();

    // Form state for adding partner
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        userName: "",
        profilePic: "",
        phoneNumber: "",
        WhatsappNumber: "",
        Address: "",
        idCardPic: "",
        cnicNumber: "",
        userAccess: []
    });

    useEffect(() => {
        fetchPartners();
    }, []);

    const fetchPartners = async () => {
        setLoading(true);
        try {
            const authData = JSON.parse(localStorage.getItem('adminAuth'));
            if (!authData?.token) {
                setError("Authentication session expired.");
                setLoading(false);
                return;
            }
            const res = await fetch(`${ApiBaseUrl}/getAllPartners`, {
                headers: {
                    'Authorization': `Bearer ${authData.token}`,
                }
            });
            const data = await res.json();
            if (data.success) {
                setPartners(data.data || data.partners || data.users || []);
            } else {
                setError(data.message || "Operation rejected by backend.");
            }
        } catch (err) {
            setError("Connection failure: Unable to sync partner directory.");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleAccessToggle = (access) => {
        setForm((prev) => {
            const newAccess = prev.userAccess.includes(access)
                ? prev.userAccess.filter((a) => a !== access)
                : [...prev.userAccess, access];
            return { ...prev, userAccess: newAccess };
        });
    };

    const handleImageUpload = async (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        const isProfile = type === 'profile';
        isProfile ? setUploadingProfile(true) : setUploadingIdCard(true);
        setError(null);

        try {
            const authData = JSON.parse(localStorage.getItem('adminAuth'));
            const fd = new FormData();
            fd.append("image", file);

            const res = await fetch(`${ApiBaseUrl}/upload-image`, {
                method: "POST",
                headers: authData?.token ? { Authorization: `Bearer ${authData.token}` } : {},
                body: fd,
            });

            const body = await res.json();
            if (res.ok || body.success) {
                const url = body.imageUrl || body.url || body.data?.url || body.data;
                setForm(f => ({ ...f, [isProfile ? 'profilePic' : 'idCardPic']: url }));
            } else {
                setError(body.message || "Asset upload protocol failure.");
            }
        } catch (err) {
            setError("Broadcast failure: Network layer error during asset upload.");
        } finally {
            isProfile ? setUploadingProfile(false) : setUploadingIdCard(false);
        }
    };

    const handleCreatePartner = async (e) => {
        e.preventDefault();
        if (uploadingProfile || uploadingIdCard) {
            setError("Please wait for asset synchronization to complete.");
            return;
        }

        if (form.userAccess.length === 0) {
            setError("Please select at least one access area for the partner.");
            return;
        }

        setSubmitting(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const authData = JSON.parse(localStorage.getItem('adminAuth'));
            const res = await fetch(`${ApiBaseUrl}/createPartner`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authData.token}`,
                },
                body: JSON.stringify({ data: form })
            });

            const data = await res.json();
            if (data.success) {
                setSuccessMessage("Strategic partner onboarded successfully.");
                setForm({
                    name: "",
                    email: "",
                    password: "",
                    userName: "",
                    profilePic: "",
                    phoneNumber: "",
                    WhatsappNumber: "",
                    Address: "",
                    idCardPic: "",
                    cnicNumber: "",
                    userAccess: []
                });
                fetchPartners();
                setTimeout(() => setActiveTab('list'), 2000);
            } else {
                setError(data.message || "Failed to create partner.");
            }
        } catch (err) {
            setError("Broadcast failure: Network layer error during partner creation.");
        } finally {
            setSubmitting(false);
        }
    };

    const filtered = partners.filter((p) => {
        const matchesSearch =
            p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.userId?.toString().includes(searchTerm) ||
            p.phoneNumber?.includes(searchTerm) ||
            p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.companyDetails?.RegisteredCompanyName?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
            filterStatus === 'all' ||
            (filterStatus === 'active' && p.isActive !== false && !p.isBlocked) ||
            (filterStatus === 'inactive' && p.isActive === false) ||
            (filterStatus === 'blocked' && p.isBlocked) ||
            (filterStatus === 'verified' && p.isVerified) ||
            (filterStatus === 'unverified' && !p.isVerified);

        return matchesSearch && matchesStatus;
    });

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const paginatedPartners = filtered.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterStatus]);

    const activeCount = partners.filter((p) => p.isActive !== false && !p.isBlocked).length;
    const verifiedCount = partners.filter((p) => p.isVerified).length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-4 sm:space-y-6">
            {activeTab === 'list' ? (
                <>
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 rounded-xl p-4 flex items-center justify-between">
                            <p className="text-red-700 text-sm font-medium">{error}</p>
                            <button type="button" onClick={() => setError(null)} className="text-red-500 hover:text-red-700">✕</button>
                        </div>
                    )}

                    {/* Header */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sm:p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Partners</h1>
                                <p className="text-gray-500 text-sm mt-0.5">Manage all platform partners</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={() => { setExportDefaultPartnerId(''); setShowExportModal(true); }}
                                    className="px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100"
                                >
                                    Download records
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setActiveTab('add'); setError(null); setSuccessMessage(null); }}
                                    className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700"
                                >
                                    + Add partner
                                </button>
                                <button
                                    type="button"
                                    onClick={fetchPartners}
                                    disabled={loading}
                                    className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                                    title="Refresh"
                                >
                                    <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        {[
                            { label: 'Total', value: partners.length },
                            { label: 'Active', value: activeCount },
                            { label: 'Verified', value: verifiedCount },
                            { label: 'Showing', value: filtered.length },
                        ].map((stat) => (
                            <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{stat.label}</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Search & filters */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sm:p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Search</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search by name, ID, email, phone, company..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                                    />
                                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Status</label>
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none"
                                >
                                    <option value="all">All partners</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="verified">Verified</option>
                                    <option value="unverified">Unverified</option>
                                    <option value="blocked">Blocked</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
                                <p className="mt-3 text-sm text-gray-500">Loading partners...</p>
                            </div>
                        ) : paginatedPartners.length === 0 ? (
                            <div className="py-16 text-center">
                                <p className="text-gray-500 text-sm">No partners found.</p>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('add')}
                                    className="mt-3 text-sm font-semibold text-red-600 hover:underline"
                                >
                                    Add your first partner
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[720px]">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Partner</th>
                                                <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Contact</th>
                                                <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Access</th>
                                                <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                                <th className="px-5 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {paginatedPartners.map((partner) => (
                                                <tr key={partner._id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-3">
                                                            {partner.profilePic ? (
                                                                <img src={partner.profilePic} alt="" className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                                                            ) : (
                                                                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold text-sm shrink-0">
                                                                    {(partner.name || 'P').charAt(0).toUpperCase()}
                                                                </div>
                                                            )}
                                                            <div className="min-w-0">
                                                                <p className="font-semibold text-gray-900 text-sm truncate">{partner.name || 'Unnamed'}</p>
                                                                <p className="text-xs text-gray-500">ID: {partner.userId || partner._id?.slice(-6)}</p>
                                                                {partner.companyDetails?.RegisteredCompanyName && (
                                                                    <p className="text-xs text-gray-400 truncate">{partner.companyDetails.RegisteredCompanyName}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4 hidden md:table-cell">
                                                        <p className="text-sm text-gray-700 truncate max-w-[200px]">{partner.email || '—'}</p>
                                                        <p className="text-xs text-gray-500">{partner.phoneNumber || partner.WhatsappNumber || '—'}</p>
                                                    </td>
                                                    <td className="px-5 py-4 hidden lg:table-cell">
                                                        <div className="flex flex-wrap gap-1 max-w-[220px]">
                                                            {(partner.userAccess || []).slice(0, 3).map((access) => (
                                                                <span key={access} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-semibold">
                                                                    {access}
                                                                </span>
                                                            ))}
                                                            {(partner.userAccess || []).length > 3 && (
                                                                <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-[10px] font-semibold">
                                                                    +{partner.userAccess.length - 3}
                                                                </span>
                                                            )}
                                                            {!(partner.userAccess || []).length && <span className="text-xs text-gray-400">—</span>}
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <div className="flex flex-wrap gap-1">
                                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                                                partner.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                                            }`}>
                                                                {partner.isActive !== false ? 'Active' : 'Inactive'}
                                                            </span>
                                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                                                partner.isVerified ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                                                            }`}>
                                                                {partner.isVerified ? 'Verified' : 'Pending'}
                                                            </span>
                                                            {partner.isBlocked && (
                                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-red-100 text-red-700">Blocked</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <div className="flex justify-end flex-wrap gap-1.5">
                                                            <button
                                                                type="button"
                                                                onClick={() => setSelectedPartner(partner)}
                                                                className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                                            >
                                                                View
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => navigate(`/partners/update/${partner._id}`)}
                                                                className="px-3 py-1.5 text-xs font-semibold text-white bg-gray-900 rounded-lg hover:bg-black"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setBulkPartner(partner);
                                                                    setShowBulkData(true);
                                                                }}
                                                                className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hidden xl:inline-flex"
                                                            >
                                                                Bulk
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={setCurrentPage}
                                    totalItems={filtered.length}
                                    itemsPerPage={itemsPerPage}
                                />
                            </>
                        )}
                    </div>
                </>
            ) : (
                <div className="max-w-5xl mx-auto space-y-4">
                    <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Add new partner</h2>
                            <p className="text-sm text-gray-500">Create a partner account</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => { setActiveTab('list'); setError(null); setSuccessMessage(null); }}
                            className="px-4 py-2 text-sm font-semibold text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            ← Back to list
                        </button>
                    </div>
                    <form onSubmit={handleCreatePartner} className="bg-white rounded-2xl p-6 md:p-10 border border-gray-200 shadow-sm space-y-10">
                        <div className="flex justify-between items-center border-b border-gray-100 pb-6">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Partner details</h2>
                                <p className="text-sm text-gray-500 mt-0.5">Fill in the information below</p>
                            </div>
                            <div className="w-16 h-16 rounded-3xl bg-red-50 flex items-center justify-center text-red-600">
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                </svg>
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-50 border-2 border-red-100 text-red-600 rounded-2xl font-black uppercase text-[10px] tracking-widest text-center animate-shake">
                                {error}
                            </div>
                        )}
                        {successMessage && (
                            <div className="p-4 bg-emerald-50 border-2 border-emerald-100 text-emerald-600 rounded-2xl font-black uppercase text-[10px] tracking-widest text-center">
                                {successMessage}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                            {/* Personal Info */}
                            <div className="space-y-8">
                                <h4 className="text-[11px] font-black text-red-600 uppercase tracking-[0.2em] px-2 mb-4 border-l-4 border-red-600">Identity Details</h4>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Legal Name</label>
                                    <input required name="name" value={form.name} onChange={handleInputChange} type="text" placeholder="ENTER FULL NAME..." className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-2xl text-sm font-bold outline-none transition-all shadow-inner" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Universal Username</label>
                                    <input name="userName" value={form.userName} onChange={handleInputChange} type="text" placeholder="UNIQUE IDENTIFIER..." className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-2xl text-sm font-bold outline-none transition-all shadow-inner" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">CNIC / ID Number</label>
                                    <input name="cnicNumber" value={form.cnicNumber} onChange={handleInputChange} type="text" placeholder="00000-0000000-0..." className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-2xl text-sm font-bold outline-none transition-all shadow-inner" />
                                </div>
                            </div>

                            {/* Contact Info */}
                            <div className="space-y-8">
                                <h4 className="text-[11px] font-black text-red-600 uppercase tracking-[0.2em] px-2 mb-4 border-l-4 border-red-600">Communication Nodes</h4>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                                    <input required name="email" value={form.email} onChange={handleInputChange} type="email" placeholder="PARTNER@MADADGAAR.COM..." className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-2xl text-sm font-bold outline-none transition-all shadow-inner" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                                    <input name="phoneNumber" value={form.phoneNumber} onChange={handleInputChange} type="tel" placeholder="+92 XXX XXXXXXX..." className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-2xl text-sm font-bold outline-none transition-all shadow-inner" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">WhatsApp Secure Line</label>
                                    <input name="WhatsappNumber" value={form.WhatsappNumber} onChange={handleInputChange} type="tel" placeholder="+92 XXX XXXXXXX..." className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-2xl text-sm font-bold outline-none transition-all shadow-inner" />
                                </div>
                            </div>

                            {/* Security & Presence */}
                            <div className="space-y-8">
                                <h4 className="text-[11px] font-black text-red-600 uppercase tracking-[0.2em] px-2 mb-4 border-l-4 border-red-600">Access & Presence</h4>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Secure Passphrase</label>
                                    <div className="relative">
                                        <input 
                                            required 
                                            name="password" 
                                            value={form.password} 
                                            onChange={handleInputChange} 
                                            type={showPassword ? "text" : "password"} 
                                            placeholder="MIN. 8 CHARACTERS..." 
                                            className="w-full px-6 py-4 pr-12 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-2xl text-sm font-bold outline-none transition-all shadow-inner" 
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-600 focus:outline-none transition-colors"
                                        >
                                            {showPassword ? (
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                </svg>
                                            ) : (
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Physical HQ Address</label>
                                    <textarea name="Address" value={form.Address} onChange={handleInputChange} rows="3" placeholder="FULL OPERATIONAL ADDRESS..." className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-2xl text-sm font-bold outline-none transition-all shadow-inner resize-none"></textarea>
                                </div>
                            </div>

                            {/* Assets */}
                            <div className="space-y-8">
                                <h4 className="text-[11px] font-black text-red-600 uppercase tracking-[0.2em] px-2 mb-4 border-l-4 border-red-600">Digital Assets</h4>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Profile Picture</label>
                                    <div className="relative group aspect-video bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center overflow-hidden">
                                        {form.profilePic ? (
                                            <>
                                                <img src={form.profilePic} alt="Profile" className="w-full h-full object-cover" />
                                                <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-all">
                                                    <span className="text-white text-[9px] font-black uppercase tracking-widest">Change Photo</span>
                                                    <input type="file" onChange={(e) => handleImageUpload(e, 'profile')} className="hidden" accept="image/*" />
                                                </label>
                                            </>
                                        ) : (
                                            <label className="flex flex-col items-center gap-2 cursor-pointer p-4">
                                                <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Upload Portrait</span>
                                                <input type="file" onChange={(e) => handleImageUpload(e, 'profile')} className="hidden" accept="image/*" />
                                            </label>
                                        )}
                                        {uploadingProfile && <div className="absolute inset-0 bg-white/60 flex items-center justify-center"><div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div></div>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">ID Card Document</label>
                                    <div className="relative group aspect-video bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center overflow-hidden">
                                        {form.idCardPic ? (
                                            <>
                                                <img src={form.idCardPic} alt="ID Card" className="w-full h-full object-cover" />
                                                <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-all">
                                                    <span className="text-white text-[9px] font-black uppercase tracking-widest">Replace Document</span>
                                                    <input type="file" onChange={(e) => handleImageUpload(e, 'idcard')} className="hidden" accept="image/*" />
                                                </label>
                                            </>
                                        ) : (
                                            <label className="flex flex-col items-center gap-2 cursor-pointer p-4">
                                                <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Upload Front/Back</span>
                                                <input type="file" onChange={(e) => handleImageUpload(e, 'idcard')} className="hidden" accept="image/*" />
                                            </label>
                                        )}
                                        {uploadingIdCard && <div className="absolute inset-0 bg-white/60 flex items-center justify-center"><div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div></div>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* User Access Selection */}
                        <div className="space-y-6 pt-8 border-t border-gray-100">
                            <h4 className="text-[11px] font-black text-red-600 uppercase tracking-[0.2em] px-2 mb-4 border-l-4 border-red-600">Access Authorization Matrix</h4>
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-4 block">Select Access Areas * (Choose at least one)</label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {accessOptions.map((option) => (
                                        <button
                                            key={option}
                                            type="button"
                                            onClick={() => handleAccessToggle(option)}
                                            className={`py-4 px-6 rounded-2xl border-2 transition-all font-black text-xs uppercase tracking-wider ${
                                                form.userAccess.includes(option)
                                                    ? 'border-red-600 bg-red-50 text-red-700 shadow-lg shadow-red-100'
                                                    : 'border-gray-200 bg-white text-gray-500 hover:border-red-400 hover:bg-red-50'
                                            }`}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center pt-6">
                            <button
                                type="submit"
                                disabled={submitting || uploadingProfile || uploadingIdCard}
                                className="w-full md:w-auto px-20 py-6 bg-red-600 text-white rounded-[2rem] font-black uppercase text-xs tracking-[0.3em] shadow-2xl shadow-red-200 hover:bg-black hover:shadow-gray-200 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {submitting ? 'Creating...' : 'Create partner'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Partner Detail Modal */}
            {selectedPartner && !showBulkData && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setSelectedPartner(null)}></div>
                    <div className="relative w-full max-w-5xl max-h-[90vh] bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                        {/* Modal Header */}
                        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-200">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">{selectedPartner.name}</h2>
                                    <p className="text-sm text-gray-500">Partner ID: {selectedPartner.userId || selectedPartner._id}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setExportDefaultPartnerId(selectedPartner.userId || selectedPartner._id);
                                    setShowExportModal(true);
                                }}
                                className="px-4 py-2 text-sm font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                            >
                                Download
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setBulkPartner(selectedPartner);
                                    setShowBulkData(true);
                                }}
                                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700"
                            >
                                Bulk data
                            </button>
                            <button onClick={() => setSelectedPartner(null)} className="p-3 hover:bg-white rounded-2xl transition-all text-gray-400 hover:text-red-600 border border-transparent hover:border-gray-100">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-8 md:p-12">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                                {/* Left Column: Identity & Images */}
                                <div className="space-y-10 group">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Profile Portrait</label>
                                        <div className="aspect-square rounded-[2.5rem] bg-gray-50 border-4 border-white shadow-xl overflow-hidden group/img">
                                            {selectedPartner.profilePic ? (
                                                <img src={selectedPartner.profilePic} alt="" className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-700" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-200">
                                                    <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Verification Document (CNIC)</label>
                                        <div className="aspect-video rounded-[2rem] bg-gray-50 border border-gray-100 overflow-hidden shadow-lg shadow-gray-100/50">
                                            {selectedPartner.idCardPic ? (
                                                <img src={selectedPartner.idCardPic} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300 italic text-[10px] font-black uppercase tracking-widest">
                                                    No Document Found
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Technical Ledger */}
                                <div className="lg:col-span-2 space-y-12">
                                    {/* Identity Block */}
                                    <section className="space-y-6">
                                        <h4 className="text-[11px] font-black text-red-600 uppercase tracking-[0.2em] px-2 border-l-4 border-red-600">Strategic Identity</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100/50">
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Full Legal Alias</p>
                                                <p className="text-sm font-bold text-gray-900 uppercase tracking-tight">{selectedPartner.name}</p>
                                            </div>
                                            <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100/50">
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">System Username</p>
                                                <p className="text-sm font-bold text-gray-900 tracking-tight">{selectedPartner.userName || 'N/A'}</p>
                                            </div>
                                            <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100/50">
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Government ID (CNIC)</p>
                                                <p className="text-sm font-bold text-gray-900 tracking-tight">{selectedPartner.cnicNumber || 'PENDING'}</p>
                                            </div>
                                            <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100/50">
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Member Since</p>
                                                <p className="text-sm font-bold text-gray-900 tracking-tight">{new Date(selectedPartner.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>

                                        {/* Access Authorization */}
                                        {selectedPartner.userAccess && selectedPartner.userAccess.length > 0 && (
                                            <div className="col-span-full mt-4">
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">Authorized Access Areas</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedPartner.userAccess.map((access, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="px-4 py-2 bg-red-50 border border-red-100 text-red-700 rounded-xl text-[10px] font-black uppercase tracking-wider"
                                                        >
                                                            {access}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </section>

                                    {/* Status & Verification Block */}
                                    <section className="space-y-6">
                                        <h4 className="text-[11px] font-black text-red-600 uppercase tracking-[0.2em] px-2 border-l-4 border-red-600">Status & Verification</h4>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-2">Active Status</p>
                                                <div className={`inline-block px-3 py-1 rounded-lg text-[9px] font-black uppercase ${selectedPartner.isActive !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                    {selectedPartner.isActive !== false ? '✓ Active' : '✗ Inactive'}
                                                </div>
                                            </div>
                                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-2">Blocked</p>
                                                <div className={`inline-block px-3 py-1 rounded-lg text-[9px] font-black uppercase ${selectedPartner.isBlocked ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                                    {selectedPartner.isBlocked ? '✗ Blocked' : '✓ Clear'}
                                                </div>
                                            </div>
                                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-2">Verified</p>
                                                <div className={`inline-block px-3 py-1 rounded-lg text-[9px] font-black uppercase ${selectedPartner.isVerified ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'}`}>
                                                    {selectedPartner.isVerified ? '✓ Verified' : 'Pending'}
                                                </div>
                                            </div>
                                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-2">Email Verify</p>
                                                <div className={`inline-block px-3 py-1 rounded-lg text-[9px] font-black uppercase ${selectedPartner.emailVerify ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'}`}>
                                                    {selectedPartner.emailVerify ? '✓ Verified' : 'Pending'}
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    {/* Communication Block */}
                                    <section className="space-y-6">
                                        <h4 className="text-[11px] font-black text-red-600 uppercase tracking-[0.2em] px-2 border-l-4 border-red-600">Communication & Location</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100/50 flex items-center gap-4">
                                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-red-600 shadow-sm border border-gray-50">
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                                </div>
                                                <div className="flex-1 overflow-hidden">
                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Email</p>
                                                    <p className="text-[11px] font-bold text-gray-900 truncate">{selectedPartner.email}</p>
                                                </div>
                                            </div>
                                            <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100/50 flex items-center gap-4">
                                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm border border-gray-50">
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Phone Number</p>
                                                    <p className="text-sm font-bold text-gray-900">{selectedPartner.phoneNumber || 'N/A'}</p>
                                                </div>
                                            </div>
                                            {selectedPartner.WhatsappNumber && selectedPartner.WhatsappNumber !== selectedPartner.phoneNumber && (
                                                <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100/50 flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm border border-gray-50">
                                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">WhatsApp</p>
                                                        <p className="text-sm font-bold text-gray-900">{selectedPartner.WhatsappNumber}</p>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100/50 col-span-full">
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Physical Address</p>
                                                <p className="text-sm font-bold text-gray-900 leading-relaxed">{selectedPartner.Address || 'NO_ADDRESS_REGISTERED'}</p>
                                            </div>
                                        </div>
                                    </section>

                                    {/* Company Details Block */}
                                    {selectedPartner.companyDetails && (
                                        <section className="space-y-6">
                                            <h4 className="text-[11px] font-black text-red-600 uppercase tracking-[0.2em] px-2 border-l-4 border-red-600">Company Information</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {selectedPartner.companyDetails.RegisteredCompanyName && (
                                                    <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100/50">
                                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Registered Company Name</p>
                                                        <p className="text-sm font-bold text-gray-900 tracking-tight">{selectedPartner.companyDetails.RegisteredCompanyName}</p>
                                                    </div>
                                                )}
                                                {selectedPartner.companyDetails.PartnerType && (
                                                    <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100/50">
                                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Partner Type</p>
                                                        <p className="text-sm font-bold text-gray-900 tracking-tight">{selectedPartner.companyDetails.PartnerType}</p>
                                                    </div>
                                                )}
                                                {selectedPartner.companyDetails.SECPRegistrationNumber && (
                                                    <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100/50">
                                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">SECP Registration Number</p>
                                                        <p className="text-sm font-bold text-gray-900 tracking-tight">{selectedPartner.companyDetails.SECPRegistrationNumber}</p>
                                                    </div>
                                                )}
                                                {selectedPartner.companyDetails.NTN && (
                                                    <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100/50">
                                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">NTN</p>
                                                        <p className="text-sm font-bold text-gray-900 tracking-tight">{selectedPartner.companyDetails.NTN}</p>
                                                    </div>
                                                )}
                                                {selectedPartner.companyDetails.STRN && (
                                                    <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100/50">
                                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">STRN</p>
                                                        <p className="text-sm font-bold text-gray-900 tracking-tight">{selectedPartner.companyDetails.STRN}</p>
                                                    </div>
                                                )}
                                                {selectedPartner.companyDetails.AuthorizationReference && (
                                                    <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100/50">
                                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Authorization Reference</p>
                                                        <p className="text-sm font-bold text-gray-900 tracking-tight">{selectedPartner.companyDetails.AuthorizationReference}</p>
                                                    </div>
                                                )}
                                                {selectedPartner.companyDetails.HeadOfficeAddress && (
                                                    <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100/50 col-span-full">
                                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Head Office Address</p>
                                                        <p className="text-sm font-bold text-gray-900 leading-relaxed">{selectedPartner.companyDetails.HeadOfficeAddress}</p>
                                                    </div>
                                                )}
                                                {selectedPartner.companyDetails.OfficialWebsite && (
                                                    <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100/50">
                                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Official Website</p>
                                                        <a href={selectedPartner.companyDetails.OfficialWebsite} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-red-600 hover:text-red-800 underline break-all">{selectedPartner.companyDetails.OfficialWebsite}</a>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Commission Details */}
                                            {(selectedPartner.companyDetails.CommissionType || selectedPartner.companyDetails.CommissionPercentage) && (
                                                <div className="mt-4 p-6 bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl border-2 border-emerald-200">
                                                    <p className="text-[10px] font-black text-emerald-900 uppercase tracking-widest mb-4">Commission Structure</p>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        {selectedPartner.companyDetails.CommissionType && (
                                                            <div>
                                                                <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest mb-1">Type</p>
                                                                <p className="text-sm font-bold text-emerald-900">{selectedPartner.companyDetails.CommissionType}</p>
                                                            </div>
                                                        )}
                                                        {selectedPartner.companyDetails.CommissionPercentage && (
                                                            <div>
                                                                <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest mb-1">Percentage</p>
                                                                <p className="text-sm font-bold text-emerald-900">{selectedPartner.companyDetails.CommissionPercentage}%</p>
                                                            </div>
                                                        )}
                                                        {selectedPartner.companyDetails.CommissionLock && (
                                                            <div>
                                                                <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest mb-1">Lock Status</p>
                                                                <p className="text-sm font-bold text-emerald-900">{selectedPartner.companyDetails.CommissionLock}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Documents */}
                                            {(selectedPartner.companyDetails.SECPRegistrationCertificate || selectedPartner.companyDetails.DeliveryPolicyDocument || selectedPartner.companyDetails.CompanyProfilePDF || selectedPartner.companyDetails.AuthorizedAgencyLetter) && (
                                                <div className="mt-4 space-y-3">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Company Documents</p>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        {selectedPartner.companyDetails.SECPRegistrationCertificate && (
                                                            <a href={selectedPartner.companyDetails.SECPRegistrationCertificate} target="_blank" rel="noopener noreferrer" className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl flex items-center gap-3 hover:bg-blue-100 transition-colors group">
                                                                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                                <span className="text-[10px] font-black text-blue-900 uppercase tracking-wide">SECP Certificate</span>
                                                            </a>
                                                        )}
                                                        {selectedPartner.companyDetails.DeliveryPolicyDocument && (
                                                            <a href={selectedPartner.companyDetails.DeliveryPolicyDocument} target="_blank" rel="noopener noreferrer" className="p-4 bg-purple-50 border-2 border-purple-200 rounded-xl flex items-center gap-3 hover:bg-purple-100 transition-colors group">
                                                                <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                                <span className="text-[10px] font-black text-purple-900 uppercase tracking-wide">Delivery Policy</span>
                                                            </a>
                                                        )}
                                                        {selectedPartner.companyDetails.CompanyProfilePDF && (
                                                            <a href={selectedPartner.companyDetails.CompanyProfilePDF} target="_blank" rel="noopener noreferrer" className="p-4 bg-indigo-50 border-2 border-indigo-200 rounded-xl flex items-center gap-3 hover:bg-indigo-100 transition-colors group">
                                                                <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                                <span className="text-[10px] font-black text-indigo-900 uppercase tracking-wide">Company Profile</span>
                                                            </a>
                                                        )}
                                                        {selectedPartner.companyDetails.AuthorizedAgencyLetter && (
                                                            <a href={selectedPartner.companyDetails.AuthorizedAgencyLetter} target="_blank" rel="noopener noreferrer" className="p-4 bg-rose-50 border-2 border-rose-200 rounded-xl flex items-center gap-3 hover:bg-rose-100 transition-colors group">
                                                                <svg className="w-5 h-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                                <span className="text-[10px] font-black text-rose-900 uppercase tracking-wide">Agency Letter</span>
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Authorized Contact Persons */}
                                            {selectedPartner.companyDetails.AuthorizedContactPerson && selectedPartner.companyDetails.AuthorizedContactPerson.length > 0 && (
                                                <div className="mt-4 space-y-3">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Authorized Contact Persons</p>
                                                    {selectedPartner.companyDetails.AuthorizedContactPerson.map((person, idx) => (
                                                        <div key={idx} className="p-5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                {person.fullName && (
                                                                    <div>
                                                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Full Name</p>
                                                                        <p className="text-sm font-bold text-gray-900">{person.fullName}</p>
                                                                    </div>
                                                                )}
                                                                {person.Designation && (
                                                                    <div>
                                                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Designation</p>
                                                                        <p className="text-sm font-bold text-gray-900">{person.Designation}</p>
                                                                    </div>
                                                                )}
                                                                {person.phoneNumber && (
                                                                    <div>
                                                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Phone</p>
                                                                        <p className="text-sm font-bold text-gray-900">{person.phoneNumber}</p>
                                                                    </div>
                                                                )}
                                                                {person.email && (
                                                                    <div>
                                                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Email</p>
                                                                        <p className="text-sm font-bold text-gray-900">{person.email}</p>
                                                                    </div>
                                                                )}
                                                                {person.OfficeAddress && (
                                                                    <div className="col-span-full">
                                                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Office Address</p>
                                                                        <p className="text-sm font-bold text-gray-900">{person.OfficeAddress}</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </section>
                                    )}

                                    {/* Financial & Security Block */}
                                    <section className="space-y-6">
                                        <h4 className="text-[11px] font-black text-red-600 uppercase tracking-[0.2em] px-2 border-l-4 border-red-600">Financial Ledger</h4>
                                        <div className="p-6 bg-gray-900 rounded-[2rem] text-white shadow-xl shadow-gray-200">
                                            <div className="flex justify-between items-center mb-8">
                                                <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-50">Current Treasury</p>
                                                <div className="px-3 py-1 bg-white/10 rounded-lg text-[8px] font-black uppercase tracking-widest">Active Balance</div>
                                            </div>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-[10px] font-black opacity-50 uppercase">PKR</span>
                                                <h3 className="text-4xl font-black tracking-tighter">{selectedPartner.walletBalance?.toLocaleString() || '0'}</h3>
                                            </div>
                                        </div>

                                        {/* Bank Accounts */}
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Registered Financial Nodes</label>
                                            {selectedPartner.BankAccountinfo?.length > 0 ? selectedPartner.BankAccountinfo.map((bank, idx) => (
                                                <div key={idx} className="p-5 bg-gray-50 rounded-2xl border border-gray-100 flex justify-between items-center group/bank hover:border-red-200 transition-colors">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400 group-hover/bank:text-red-600 transition-colors">
                                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-black text-gray-900 uppercase tracking-tight">{bank.bankName}</p>
                                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{bank.accountName}</p>
                                                        </div>
                                                    </div>
                                                    <p className="text-[11px] font-mono font-black text-gray-400 group-hover/bank:text-gray-900 transition-colors">{bank.accountNumber}</p>
                                                </div>
                                            )) : (
                                                <div className="p-6 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100 flex items-center justify-center">
                                                    <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest">No banking protocols established.</p>
                                                </div>
                                            )}
                                        </div>
                                    </section>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-8 border-t border-gray-100 flex justify-end gap-4 bg-gray-50/50">
                            <button
                                onClick={() => setSelectedPartner(null)}
                                className="px-6 py-3 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => {
                                    const id = selectedPartner._id;
                                    setSelectedPartner(null);
                                    navigate(`/partners/update/${id}`);
                                }}
                                className="px-8 py-3 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-all"
                            >
                                Edit partner
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showBulkData && bulkPartner && (
                <AdminBulkDataModal
                    partner={bulkPartner}
                    onClose={() => { setShowBulkData(false); setBulkPartner(null); }}
                />
            )}

            {showExportModal && (
                <AdminExportModal
                    partners={partners}
                    defaultPartnerId={exportDefaultPartnerId}
                    onClose={() => { setShowExportModal(false); setExportDefaultPartnerId(''); }}
                />
            )}
            </div>
        </div>
    );
};

export default Partners;

