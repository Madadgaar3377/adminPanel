import React, { useState, useEffect } from 'react';
import ApiBaseUrl from '../constants/apiUrl';
import { useNavigate, useParams } from 'react-router-dom';

const accessOptions = [
    'Installments',
    'Loan',
    'Property',
    'Insurance',
];

const AgentUpdate = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [uploadingProfile, setUploadingProfile] = useState(false);
    const [uploadingIdCard, setUploadingIdCard] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [userData, setUserData] = useState(null);

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
        userAccess: [],
        isActive: true,
        isBlocked: false
    });

    useEffect(() => {
        fetchUserData();
    }, [id]);

    const fetchUserData = async () => {
        setLoading(true);
        try {
            const authData = JSON.parse(localStorage.getItem('adminAuth'));
            const res = await fetch(`${ApiBaseUrl}/getAllUsers`, {
                headers: {
                    'Authorization': `Bearer ${authData.token}`,
                }
            });
            const data = await res.json();
            
            if (data.success) {
                const user = data.users.find(u => u._id === id);
                if (user) {
                    setUserData(user);
                    setForm({
                        name: user.name || "",
                        email: user.email || "",
                        password: "",
                        userName: user.userName || "",
                        profilePic: user.profilePic || "",
                        phoneNumber: user.phoneNumber || "",
                        WhatsappNumber: user.WhatsappNumber || "",
                        Address: user.Address || "",
                        idCardPic: user.idCardPic || "",
                        cnicNumber: user.cnicNumber || "",
                        userAccess: user.userAccess || [],
                        isActive: user.isActive !== false,
                        isBlocked: user.isBlocked || false
                    });
                } else {
                    setError("User not found");
                }
            } else {
                setError(data.message || "Failed to load user data");
            }
        } catch (err) {
            setError("Network error: Unable to load user data");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? checked : value 
        }));
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

        if (!file.type.startsWith('image/')) {
            setError('Please select a valid image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError('Image size should not exceed 5MB');
            return;
        }

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
                setSuccessMessage(`${isProfile ? 'Profile picture' : 'ID card'} uploaded successfully!`);
                setTimeout(() => setSuccessMessage(null), 3000);
            } else {
                setError(body.message || "Upload failed");
            }
        } catch (err) {
            setError("Failed to upload image");
        } finally {
            isProfile ? setUploadingProfile(false) : setUploadingIdCard(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        
        if (uploadingProfile || uploadingIdCard) {
            setError("Please wait for uploads to complete");
            return;
        }

        setSubmitting(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const authData = JSON.parse(localStorage.getItem('adminAuth'));
            
            // Prepare updates object - only include fields that should be updated
            const updates = {
                name: form.name,
                email: form.email,
                userName: form.userName,
                profilePic: form.profilePic,
                phoneNumber: form.phoneNumber,
                WhatsappNumber: form.WhatsappNumber,
                Address: form.Address,
                idCardPic: form.idCardPic,
                cnicNumber: form.cnicNumber,
                userAccess: form.userAccess,
                isActive: form.isActive,
                isBlocked: form.isBlocked
            };

            // Only include password if it's being changed
            if (form.password && form.password.trim() !== "") {
                updates.password = form.password;
            }

            const res = await fetch(`${ApiBaseUrl}/updateUser`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authData.token}`,
                },
                body: JSON.stringify({
                    userId: userData.userId,
                    updates: updates
                })
            });

            const data = await res.json();
            
            if (data.success) {
                setSuccessMessage("User updated successfully!");
                setTimeout(() => {
                    if (userData.UserType === 'partner') {
                        navigate('/partners');
                    } else if (userData.UserType === 'agent') {
                        navigate('/agent/all');
                    } else {
                        navigate('/users');
                    }
                }, 2000);
            } else {
                setError(data.message || "Failed to update user");
            }
        } catch (err) {
            setError("Network error: Failed to update user");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="w-12 h-12 border-4 border-gray-100 border-t-red-600 rounded-full animate-spin"></div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Loading User Data...</p>
            </div>
        );
    }

    if (!userData) {
        return (
            <div className="p-8">
                <div className="max-w-2xl mx-auto text-center">
                    <div className="p-8 bg-red-50 border-2 border-red-100 rounded-3xl">
                        <p className="text-red-600 font-black uppercase text-sm tracking-widest">User not found</p>
                        <button
                            onClick={() => navigate(-1)}
                            className="mt-4 px-6 py-3 bg-red-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">
                            Edit {userData.UserType || 'User'}
                        </h1>
                        <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.3em] mt-1">
                            ID: {userData.userId || userData._id}
                        </p>
                    </div>
                    <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-3 bg-gray-100 text-gray-600 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-gray-200 transition-all active:scale-95"
                    >
                        ← Back
                    </button>
                </div>
            </div>

            {/* Form */}
            <div className="max-w-6xl mx-auto">
                <form onSubmit={handleUpdate} className="bg-white rounded-[3rem] p-8 md:p-12 border border-gray-100 shadow-xl space-y-10">
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
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name *</label>
                                <input 
                                    required 
                                    name="name" 
                                    value={form.name} 
                                    onChange={handleInputChange} 
                                    type="text" 
                                    placeholder="Enter full name" 
                                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-2xl text-sm font-bold outline-none transition-all shadow-inner" 
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Username</label>
                                <input 
                                    name="userName" 
                                    value={form.userName} 
                                    onChange={handleInputChange} 
                                    type="text" 
                                    placeholder="Unique identifier" 
                                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-2xl text-sm font-bold outline-none transition-all shadow-inner" 
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">CNIC Number</label>
                                <input 
                                    name="cnicNumber" 
                                    value={form.cnicNumber} 
                                    onChange={handleInputChange} 
                                    type="text" 
                                    placeholder="00000-0000000-0" 
                                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-2xl text-sm font-bold outline-none transition-all shadow-inner" 
                                />
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-8">
                            <h4 className="text-[11px] font-black text-red-600 uppercase tracking-[0.2em] px-2 mb-4 border-l-4 border-red-600">Contact Information</h4>
                            
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address *</label>
                                <input 
                                    required 
                                    name="email" 
                                    value={form.email} 
                                    onChange={handleInputChange} 
                                    type="email" 
                                    placeholder="user@example.com" 
                                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-2xl text-sm font-bold outline-none transition-all shadow-inner" 
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                                <input 
                                    name="phoneNumber" 
                                    value={form.phoneNumber} 
                                    onChange={handleInputChange} 
                                    type="tel" 
                                    placeholder="+92 XXX XXXXXXX" 
                                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-2xl text-sm font-bold outline-none transition-all shadow-inner" 
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">WhatsApp Number</label>
                                <input 
                                    name="WhatsappNumber" 
                                    value={form.WhatsappNumber} 
                                    onChange={handleInputChange} 
                                    type="tel" 
                                    placeholder="+92 XXX XXXXXXX" 
                                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-2xl text-sm font-bold outline-none transition-all shadow-inner" 
                                />
                            </div>
                        </div>

                        {/* Security & Status */}
                        <div className="space-y-8">
                            <h4 className="text-[11px] font-black text-red-600 uppercase tracking-[0.2em] px-2 mb-4 border-l-4 border-red-600">Security & Status</h4>
                            
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">New Password (Leave blank to keep current)</label>
                                <div className="relative">
                                    <input 
                                        name="password" 
                                        value={form.password} 
                                        onChange={handleInputChange} 
                                        type={showPassword ? "text" : "password"} 
                                        placeholder="Enter new password" 
                                        className="w-full px-6 py-4 pr-12 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-2xl text-sm font-bold outline-none transition-all shadow-inner" 
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-600 transition-colors"
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
                            
                            <div className="space-y-4">
                                <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl cursor-pointer hover:bg-gray-100 transition-colors">
                                    <input
                                        type="checkbox"
                                        name="isActive"
                                        checked={form.isActive}
                                        onChange={handleInputChange}
                                        className="w-5 h-5 text-red-600 bg-white border-gray-300 rounded focus:ring-red-500"
                                    />
                                    <span className="text-sm font-bold text-gray-700">Active Status</span>
                                </label>
                                
                                <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl cursor-pointer hover:bg-gray-100 transition-colors">
                                    <input
                                        type="checkbox"
                                        name="isBlocked"
                                        checked={form.isBlocked}
                                        onChange={handleInputChange}
                                        className="w-5 h-5 text-red-600 bg-white border-gray-300 rounded focus:ring-red-500"
                                    />
                                    <span className="text-sm font-bold text-gray-700">Block User</span>
                                </label>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Address</label>
                                <textarea 
                                    name="Address" 
                                    value={form.Address} 
                                    onChange={handleInputChange} 
                                    rows="3" 
                                    placeholder="Full address" 
                                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-2xl text-sm font-bold outline-none transition-all shadow-inner resize-none"
                                ></textarea>
                            </div>
                        </div>

                        {/* Images */}
                        <div className="space-y-8">
                            <h4 className="text-[11px] font-black text-red-600 uppercase tracking-[0.2em] px-2 mb-4 border-l-4 border-red-600">Profile Images</h4>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Profile Picture</label>
                                <div className="relative group aspect-square bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center overflow-hidden">
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
                                            <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Upload Photo</span>
                                            <input type="file" onChange={(e) => handleImageUpload(e, 'profile')} className="hidden" accept="image/*" />
                                        </label>
                                    )}
                                    {uploadingProfile && (
                                        <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                                            <div className="w-6 h-6 border-3 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">ID Card</label>
                                <div className="relative group aspect-video bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center overflow-hidden">
                                    {form.idCardPic ? (
                                        <>
                                            <img src={form.idCardPic} alt="ID Card" className="w-full h-full object-cover" />
                                            <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-all">
                                                <span className="text-white text-[9px] font-black uppercase tracking-widest">Change Document</span>
                                                <input type="file" onChange={(e) => handleImageUpload(e, 'idcard')} className="hidden" accept="image/*" />
                                            </label>
                                        </>
                                    ) : (
                                        <label className="flex flex-col items-center gap-2 cursor-pointer p-4">
                                            <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Upload ID Card</span>
                                            <input type="file" onChange={(e) => handleImageUpload(e, 'idcard')} className="hidden" accept="image/*" />
                                        </label>
                                    )}
                                    {uploadingIdCard && (
                                        <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                                            <div className="w-6 h-6 border-3 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Access Control */}
                    {(userData.UserType === 'partner' || userData.UserType === 'agent') && (
                        <div className="space-y-6 pt-8 border-t border-gray-100">
                            <h4 className="text-[11px] font-black text-red-600 uppercase tracking-[0.2em] px-2 mb-4 border-l-4 border-red-600">Access Authorization</h4>
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-4 block">Select Access Areas</label>
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
                    )}

                    {/* Submit Button */}
                    <div className="flex justify-center gap-4 pt-6">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="px-12 py-5 bg-gray-100 text-gray-600 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] hover:bg-gray-200 transition-all active:scale-95"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || uploadingProfile || uploadingIdCard}
                            className="px-16 py-5 bg-red-600 text-white rounded-[2rem] font-black uppercase text-xs tracking-[0.3em] shadow-2xl shadow-red-200 hover:bg-black hover:shadow-gray-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? 'Updating...' : 'Update User'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AgentUpdate;

