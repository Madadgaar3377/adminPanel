import React, { useState, useEffect } from 'react';
import ApiBaseUrl from '../constants/apiUrl';
import { useNavigate } from 'react-router-dom';

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
    const [showPassword, setShowPassword] = useState(false);
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

    const filtered = partners.filter(p =>
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.userId?.toString().includes(searchTerm) ||
        p.phoneNumber?.includes(searchTerm) ||
        p.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">Partners</h1>
                    <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.3em] mt-1">Collaboration Ledger & Ecosystem</p>
                </div>

                <div className="flex bg-gray-50 p-1.5 rounded-[1.5rem] border border-gray-100">
                    <button
                        onClick={() => setActiveTab('list')}
                        className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        All Partners
                    </button>
                    <button
                        onClick={() => { setActiveTab('add'); setError(null); setSuccessMessage(null); }}
                        className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'add' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        + Add Partner
                    </button>
                </div>
            </div>

            {/* Content Area */}
            {activeTab === 'list' ? (
                <div className="space-y-8">
                    {/* Error Message */}
                    {error && (
                        <div className="p-4 bg-red-50 border-2 border-red-100 text-red-600 rounded-2xl font-black uppercase text-[10px] tracking-widest text-center">
                            {error}
                        </div>
                    )}

                    {/* Search Shell */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="SEARCH BY NAME, ID, EMAIL OR PHONE..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-14 pr-6 py-5 bg-white border border-gray-100 rounded-[2rem] text-[11px] font-black uppercase tracking-widest outline-none transition-all shadow-sm focus:border-red-600 focus:ring-4 focus:ring-red-50/50"
                        />
                        <svg className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
                            <div className="w-12 h-12 border-4 border-gray-100 border-t-red-600 rounded-full animate-spin"></div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Querying Database...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filtered.length > 0 ? filtered.map((partner) => (
                                <div key={partner._id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col group overflow-hidden">
                                    <div className="p-8 flex-1 space-y-6">
                                        <div className="flex justify-between items-start">
                                            <div className="w-14 h-14 rounded-2xl bg-gray-50 overflow-hidden flex items-center justify-center text-gray-300 group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
                                                {partner.profilePic ? (
                                                    <img src={partner.profilePic} alt={partner.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                    </svg>
                                                )}
                                            </div>
                                            <div className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${partner.isActive !== false ? 'border-emerald-100 bg-emerald-50 text-emerald-600' : 'border-red-100 bg-red-50 text-red-600'}`}>
                                                {partner.isActive !== false ? 'ACTIVE PARTNER' : 'INACTIVE'}
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <h3 className="text-xl font-black text-gray-900 tracking-tighter uppercase truncate">{partner.name || "UNNAMED_ENTITY"}</h3>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ID: {partner.userId || partner._id?.slice(-6)}</p>
                                            {partner.userAccess && partner.userAccess.length > 0 && (
                                                <div className="flex items-center gap-1 mt-2">
                                                    <span className="text-[8px] font-black text-red-600 uppercase tracking-widest">
                                                        {partner.userAccess.length} Access Area{partner.userAccess.length > 1 ? 's' : ''}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3 text-gray-600">
                                                <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                                <p className="text-[10px] font-bold uppercase truncate">{partner.email || 'NO_EMAIL'}</p>
                                            </div>
                                            <div className="flex items-center gap-3 text-gray-600">
                                                <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                                <p className="text-[10px] font-bold uppercase">{partner.phoneNumber || partner.WhatsappNumber || 'NO_CONTACT'}</p>
                                            </div>
                                            {partner.Address && (
                                                <div className="flex items-center gap-3 text-gray-600">
                                                    <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                    <p className="text-[10px] font-bold uppercase truncate">{partner.Address}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 flex gap-3">
                                        <button
                                            onClick={() => setSelectedPartner(partner)}
                                            className="flex-1 py-4 bg-white border border-gray-200 text-gray-900 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all active:scale-95"
                                        >
                                            View Dossier
                                        </button>
                                        <button
                                            onClick={() => navigate(`/partners/update/${partner._id}`)}
                                            className="flex-1 py-4 bg-gray-900 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-gray-200 active:scale-95"
                                        >
                                            Edit Protocol
                                        </button>
                                    </div>
                                </div>
                            )) : (
                                <div className="col-span-full py-20 text-center bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">No strategic partners found in registry.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                <div className="max-w-5xl mx-auto">
                    <form onSubmit={handleCreatePartner} className="bg-white rounded-[3rem] p-8 md:p-12 border border-gray-100 shadow-xl space-y-10">
                        <div className="flex justify-between items-center border-b border-gray-50 pb-8">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 tracking-tighter uppercase">New Commission</h2>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-1">Initialize Partner Profile</p>
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
                                {submitting ? 'Broadcasting Data...' : 'Confirm Commission'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Partner Detail Modal */}
            {selectedPartner && (
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
                                    <h2 className="text-2xl font-black text-gray-900 tracking-tighter uppercase">{selectedPartner.name}</h2>
                                    <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.3em]">Operational ID: {selectedPartner.userId || selectedPartner._id}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedPartner(null)} className="p-3 hover:bg-white rounded-2xl transition-all text-gray-400 hover:text-red-600 border border-transparent hover:border-gray-100">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
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

                                    {/* Communication Block */}
                                    <section className="space-y-6">
                                        <h4 className="text-[11px] font-black text-red-600 uppercase tracking-[0.2em] px-2 border-l-4 border-red-600">Communication & Location</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100/50 flex items-center gap-4">
                                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-red-600 shadow-sm border border-gray-50">
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                                </div>
                                                <div className="flex-1 overflow-hidden">
                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Digital Corridor</p>
                                                    <p className="text-[11px] font-bold text-gray-900 truncate uppercase">{selectedPartner.email}</p>
                                                </div>
                                            </div>
                                            <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100/50 flex items-center gap-4">
                                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm border border-gray-50">
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Mobile Line</p>
                                                    <p className="text-sm font-bold text-gray-900">{selectedPartner.phoneNumber || selectedPartner.WhatsappNumber || 'N/A'}</p>
                                                </div>
                                            </div>
                                            <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100/50 col-span-full">
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Command HQ (Physical Address)</p>
                                                <p className="text-sm font-bold text-gray-900 uppercase tracking-tight leading-relaxed">{selectedPartner.Address || 'NO_ADDRESS_REGISTERED'}</p>
                                            </div>
                                        </div>
                                    </section>

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
                                className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors"
                            >
                                Dismiss Dossier
                            </button>
                            <button
                                onClick={() => {
                                    const id = selectedPartner._id;
                                    setSelectedPartner(null);
                                    navigate(`/partners/update/${id}`);
                                }}
                                className="px-10 py-4 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-red-100 hover:bg-black hover:shadow-gray-200 transition-all active:scale-95"
                            >
                                Initialize Edit Override
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Partners;

