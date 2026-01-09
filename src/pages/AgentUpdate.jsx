import React, { useState, useEffect, useCallback } from 'react';
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
    const [currentStep, setCurrentStep] = useState(1);

    // Define steps based on user type
    const getSteps = () => {
        const baseSteps = [
            { number: 1, title: 'Basic Info', icon: '👤' },
            { number: 2, title: 'Contact', icon: '📞' },
            { number: 3, title: 'Security', icon: '🔒' },
        ];

        if (userData?.UserType === 'partner' || userData?.UserType === 'agent') {
            baseSteps.push({ number: 4, title: 'Access', icon: '🔑' });
        }

        if (userData?.UserType === 'partner') {
            baseSteps.push(
                { number: 5, title: 'Company', icon: '🏢' },
                { number: 6, title: 'Commission', icon: '💰' },
                { number: 7, title: 'Documents', icon: '📄' },
                { number: 8, title: 'Contacts', icon: '👥' },
                { number: 9, title: 'Declarations', icon: '✅' }
            );
        }

        return baseSteps;
    };

    const steps = getSteps();
    const totalSteps = steps.length;

    const nextStep = () => {
        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

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
        isBlocked: false,
        companyDetails: {
            RegisteredCompanyName: "",
            PartnerType: "",
            SECPRegistrationCertificate: "",
            SECPRegistrationNumber: "",
            NTN: "",
            STRN: "",
            AuthorizationReference: "",
            HeadOfficeAddress: "",
            OfficialWebsite: "",
            DeliveryPolicyDocument: "",
            CompanyProfilePDF: "",
            CommissionType: "",
            CommissionPercentage: "",
            CommissionLock: "",
            cnicPic: [],
            AuthorizedAgencyLetter: "",
            AuthorizedContactPerson: [],
            AuthorizationDeclaration: [
                { text: 'I declare that all information provided is accurate and true', isTrue: false },
                { text: 'I agree to the terms and conditions of the partnership', isTrue: false },
                { text: 'I authorize Madadgaar to verify the provided information', isTrue: false }
            ]
        }
    });

    const fetchUserData = useCallback(async () => {
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
                    const baseForm = {
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
                    };

                    // Add company details if user is a partner
                    if (user.UserType === 'partner') {
                        const companyData = user.companyDetails || {};
                        baseForm.companyDetails = {
                            RegisteredCompanyName: companyData.RegisteredCompanyName || "",
                            PartnerType: companyData.PartnerType || "",
                            SECPRegistrationCertificate: companyData.SECPRegistrationCertificate || "",
                            SECPRegistrationNumber: companyData.SECPRegistrationNumber || "",
                            NTN: companyData.NTN || "",
                            STRN: companyData.STRN || "",
                            AuthorizationReference: companyData.AuthorizationReference || "",
                            HeadOfficeAddress: companyData.HeadOfficeAddress || "",
                            OfficialWebsite: companyData.OfficialWebsite || "",
                            DeliveryPolicyDocument: companyData.DeliveryPolicyDocument || "",
                            CompanyProfilePDF: companyData.CompanyProfilePDF || "",
                            CommissionType: companyData.CommissionType || "",
                            CommissionPercentage: companyData.CommissionPercentage || "",
                            CommissionLock: companyData.CommissionLock || "",
                            cnicPic: companyData.cnicPic || [],
                            AuthorizedAgencyLetter: companyData.AuthorizedAgencyLetter || "",
                            AuthorizedContactPerson: companyData.AuthorizedContactPerson || [],
                            AuthorizationDeclaration: companyData.AuthorizationDeclaration && companyData.AuthorizationDeclaration.length > 0 
                                ? companyData.AuthorizationDeclaration 
                                : [
                                    { text: 'I declare that all information provided is accurate and true', isTrue: false },
                                    { text: 'I agree to the terms and conditions of the partnership', isTrue: false },
                                    { text: 'I authorize Madadgaar to verify the provided information', isTrue: false }
                                ]
                        };
                    }

                    setForm(baseForm);
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
    }, [id]);

    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);

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

    // Handle company details changes
    const handleCompanyDetailsChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            companyDetails: {
                ...prev.companyDetails,
                [name]: value
            }
        }));
    };

    // Handle authorized contact person changes
    const handleContactPersonChange = (index, field, value) => {
        setForm(prev => {
            const updatedContacts = [...(prev.companyDetails?.AuthorizedContactPerson || [])];
            if (!updatedContacts[index]) {
                updatedContacts[index] = {};
            }
            updatedContacts[index][field] = value;
            return {
                ...prev,
                companyDetails: {
                    ...prev.companyDetails,
                    AuthorizedContactPerson: updatedContacts
                }
            };
        });
    };

    const addContactPerson = () => {
        setForm(prev => ({
            ...prev,
            companyDetails: {
                ...prev.companyDetails,
                AuthorizedContactPerson: [
                    ...(prev.companyDetails?.AuthorizedContactPerson || []),
                    { fullName: "", Designation: "", phoneNumber: "", OfficeAddress: "", email: "" }
                ]
            }
        }));
    };

    const removeContactPerson = (index) => {
        setForm(prev => ({
            ...prev,
            companyDetails: {
                ...prev.companyDetails,
                AuthorizedContactPerson: prev.companyDetails.AuthorizedContactPerson.filter((_, i) => i !== index)
            }
        }));
    };

    // Handle authorization declaration toggle
    const handleDeclarationToggle = (index) => {
        setForm(prev => {
            const updatedDeclarations = [...(prev.companyDetails?.AuthorizationDeclaration || [])];
            updatedDeclarations[index] = {
                ...updatedDeclarations[index],
                isTrue: !updatedDeclarations[index].isTrue
            };
            return {
                ...prev,
                companyDetails: {
                    ...prev.companyDetails,
                    AuthorizationDeclaration: updatedDeclarations
                }
            };
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

    // Handle document upload for company documents
    const handleDocumentUpload = async (e, fieldName) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setError('File size should not exceed 5MB');
            return;
        }

        setError(null);
        setSuccessMessage(`Uploading ${fieldName}...`);

        try {
            const authData = JSON.parse(localStorage.getItem('adminAuth'));
            const fd = new FormData();
            fd.append("document", file);

            const res = await fetch(`${ApiBaseUrl}/upload-document`, {
                method: "POST",
                headers: authData?.token ? { Authorization: `Bearer ${authData.token}` } : {},
                body: fd,
            });

            const body = await res.json();
            if (res.ok || body.success) {
                const url = body.url || body.data?.url || body.data;
                setForm(prev => ({
                    ...prev,
                    companyDetails: {
                        ...prev.companyDetails,
                        [fieldName]: url
                    }
                }));
                setSuccessMessage(`${fieldName} uploaded successfully!`);
                setTimeout(() => setSuccessMessage(null), 3000);
            } else {
                setError(body.message || "Upload failed");
            }
        } catch (err) {
            setError("Failed to upload document");
            setSuccessMessage(null);
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

            // Include company details if user is a partner
            if (userData.UserType === 'partner' && form.companyDetails) {
                updates.companyDetails = form.companyDetails;
            }

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

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return renderBasicInfo();
            case 2:
                return renderContactInfo();
            case 3:
                return renderSecurity();
            case 4:
                return renderAccessControl();
            case 5:
                return renderCompanyInfo();
            case 6:
                return renderCommission();
            case 7:
                return renderDocuments();
            case 8:
                return renderContacts();
            case 9:
                return renderDeclarations();
            default:
                return null;
        }
    };

    const renderBasicInfo = () => (
        <div className="space-y-8 animate-in fade-in duration-300">
            <div className="text-center mb-8">
                <h3 className="text-2xl font-black text-gray-900 tracking-tighter uppercase">Basic Information</h3>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-2">Personal identity details</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Profile Picture</label>
                    <div className="relative group aspect-square bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden hover:border-red-400 transition-colors">
                        {form.profilePic ? (
                            <>
                                <img src={form.profilePic} alt="Profile" className="w-full h-full object-cover" />
                                <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-all">
                                    <span className="text-white text-[9px] font-black uppercase tracking-widest">Change Photo</span>
                                    <input type="file" onChange={(e) => handleImageUpload(e, 'profile')} className="hidden" accept="image/*" />
                                </label>
                            </>
                        ) : (
                            <label className="flex flex-col items-center gap-3 cursor-pointer p-8">
                                <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Upload Photo</span>
                                <input type="file" onChange={(e) => handleImageUpload(e, 'profile')} className="hidden" accept="image/*" />
                            </label>
                        )}
                        {uploadingProfile && (
                            <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                                <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">ID Card (CNIC)</label>
                    <div className="relative group aspect-square bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden hover:border-red-400 transition-colors">
                        {form.idCardPic ? (
                            <>
                                <img src={form.idCardPic} alt="ID Card" className="w-full h-full object-cover" />
                                <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-all">
                                    <span className="text-white text-[9px] font-black uppercase tracking-widest">Change Document</span>
                                    <input type="file" onChange={(e) => handleImageUpload(e, 'idcard')} className="hidden" accept="image/*" />
                                </label>
                            </>
                        ) : (
                            <label className="flex flex-col items-center gap-3 cursor-pointer p-8">
                                <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Upload ID Card</span>
                                <input type="file" onChange={(e) => handleImageUpload(e, 'idcard')} className="hidden" accept="image/*" />
                            </label>
                        )}
                        {uploadingIdCard && (
                            <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                                <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderContactInfo = () => (
        <div className="space-y-8 animate-in fade-in duration-300">
            <div className="text-center mb-8">
                <h3 className="text-2xl font-black text-gray-900 tracking-tighter uppercase">Contact Information</h3>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-2">Communication details</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                
                <div className="space-y-2 col-span-full">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Complete Address</label>
                    <textarea 
                        name="Address" 
                        value={form.Address} 
                        onChange={handleInputChange} 
                        rows="4" 
                        placeholder="Enter full address with city and postal code" 
                        className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-2xl text-sm font-bold outline-none transition-all shadow-inner resize-none"
                    ></textarea>
                </div>
            </div>
        </div>
    );

    const renderSecurity = () => (
        <div className="space-y-8 animate-in fade-in duration-300">
            <div className="text-center mb-8">
                <h3 className="text-2xl font-black text-gray-900 tracking-tighter uppercase">Security & Status</h3>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-2">Password and account status</p>
            </div>
            <div className="max-w-2xl mx-auto space-y-8">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">New Password (Leave blank to keep current)</label>
                    <div className="relative">
                        <input 
                            name="password" 
                            value={form.password} 
                            onChange={handleInputChange} 
                            type={showPassword ? "text" : "password"} 
                            placeholder="Enter new password" 
                            className="w-full px-6 py-4 pr-14 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-2xl text-sm font-bold outline-none transition-all shadow-inner" 
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    <label className="flex items-center gap-4 p-6 bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl cursor-pointer hover:shadow-lg transition-all border-2 border-emerald-200">
                        <input
                            type="checkbox"
                            name="isActive"
                            checked={form.isActive}
                            onChange={handleInputChange}
                            className="w-6 h-6 text-emerald-600 bg-white border-gray-300 rounded focus:ring-emerald-500"
                        />
                        <div>
                            <span className="text-sm font-black text-emerald-900 uppercase block">Active Status</span>
                            <span className="text-[9px] text-emerald-700 font-bold">User can access the system</span>
                        </div>
                    </label>
                    
                    <label className="flex items-center gap-4 p-6 bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl cursor-pointer hover:shadow-lg transition-all border-2 border-red-200">
                        <input
                            type="checkbox"
                            name="isBlocked"
                            checked={form.isBlocked}
                            onChange={handleInputChange}
                            className="w-6 h-6 text-red-600 bg-white border-gray-300 rounded focus:ring-red-500"
                        />
                        <div>
                            <span className="text-sm font-black text-red-900 uppercase block">Block User</span>
                            <span className="text-[9px] text-red-700 font-bold">Prevent system access</span>
                        </div>
                    </label>
                </div>
            </div>
        </div>
    );

    const renderAccessControl = () => (
        <div className="space-y-8 animate-in fade-in duration-300">
            <div className="text-center mb-8">
                <h3 className="text-2xl font-black text-gray-900 tracking-tighter uppercase">Access Authorization</h3>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-2">Select permitted access areas</p>
            </div>
            <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {accessOptions.map((option) => (
                        <button
                            key={option}
                            type="button"
                            onClick={() => handleAccessToggle(option)}
                            className={`group relative py-8 px-6 rounded-3xl border-3 transition-all font-black text-sm uppercase tracking-wider overflow-hidden ${
                                form.userAccess.includes(option)
                                    ? 'border-red-600 bg-gradient-to-br from-red-50 to-orange-50 text-red-700 shadow-2xl shadow-red-200 scale-105'
                                    : 'border-gray-200 bg-white text-gray-500 hover:border-red-400 hover:bg-red-50 hover:scale-105'
                            }`}
                        >
                            <div className="flex flex-col items-center gap-3">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                                    form.userAccess.includes(option) ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-red-100 group-hover:text-red-600'
                                }`}>
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <span>{option}</span>
                            </div>
                            {form.userAccess.includes(option) && (
                                <div className="absolute top-2 right-2">
                                    <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderCompanyInfo = () => (
        <div className="space-y-8 animate-in fade-in duration-300">
            <div className="text-center mb-8">
                <h3 className="text-2xl font-black text-gray-900 tracking-tighter uppercase">🏢 Company Information</h3>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-2">Business registration details</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Registered Company Name</label>
                    <input 
                        name="RegisteredCompanyName" 
                        value={form.companyDetails?.RegisteredCompanyName || ""} 
                        onChange={handleCompanyDetailsChange} 
                        type="text" 
                        placeholder="Enter registered company name" 
                        className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-2xl text-sm font-bold outline-none transition-all shadow-inner" 
                    />
                </div>
                
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Partner Type</label>
                    <select 
                        name="PartnerType" 
                        value={form.companyDetails?.PartnerType || ""} 
                        onChange={handleCompanyDetailsChange} 
                        className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-2xl text-sm font-bold outline-none transition-all shadow-inner"
                    >
                        <option value="">Select Partner Type</option>
                        <option value="Corporate">Corporate</option>
                        <option value="Individual">Individual</option>
                        <option value="SME">SME</option>
                        <option value="Enterprise">Enterprise</option>
                    </select>
                </div>
                
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">SECP Registration Number</label>
                    <input 
                        name="SECPRegistrationNumber" 
                        value={form.companyDetails?.SECPRegistrationNumber || ""} 
                        onChange={handleCompanyDetailsChange} 
                        type="text" 
                        placeholder="Enter SECP number" 
                        className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-2xl text-sm font-bold outline-none transition-all shadow-inner" 
                    />
                </div>
                
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">NTN (National Tax Number)</label>
                    <input 
                        name="NTN" 
                        value={form.companyDetails?.NTN || ""} 
                        onChange={handleCompanyDetailsChange} 
                        type="text" 
                        placeholder="Enter NTN" 
                        className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-2xl text-sm font-bold outline-none transition-all shadow-inner" 
                    />
                </div>
                
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">STRN (Sales Tax Registration)</label>
                    <input 
                        name="STRN" 
                        value={form.companyDetails?.STRN || ""} 
                        onChange={handleCompanyDetailsChange} 
                        type="text" 
                        placeholder="Enter STRN" 
                        className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-2xl text-sm font-bold outline-none transition-all shadow-inner" 
                    />
                </div>
                
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Authorization Reference</label>
                    <input 
                        name="AuthorizationReference" 
                        value={form.companyDetails?.AuthorizationReference || ""} 
                        onChange={handleCompanyDetailsChange} 
                        type="text" 
                        placeholder="Enter authorization reference" 
                        className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-2xl text-sm font-bold outline-none transition-all shadow-inner" 
                    />
                </div>
                
                <div className="space-y-2 col-span-full">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Head Office Address</label>
                    <textarea 
                        name="HeadOfficeAddress" 
                        value={form.companyDetails?.HeadOfficeAddress || ""} 
                        onChange={handleCompanyDetailsChange} 
                        rows="3" 
                        placeholder="Enter complete head office address" 
                        className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-2xl text-sm font-bold outline-none transition-all shadow-inner resize-none"
                    ></textarea>
                </div>
                
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Official Website</label>
                    <input 
                        name="OfficialWebsite" 
                        value={form.companyDetails?.OfficialWebsite || ""} 
                        onChange={handleCompanyDetailsChange} 
                        type="url" 
                        placeholder="https://example.com" 
                        className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-2xl text-sm font-bold outline-none transition-all shadow-inner" 
                    />
                </div>
            </div>
        </div>
    );

    const renderCommission = () => (
        <div className="space-y-8 animate-in fade-in duration-300">
            <div className="text-center mb-8">
                <h3 className="text-2xl font-black text-gray-900 tracking-tighter uppercase">💰 Commission Structure</h3>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-2">Partnership terms & rates</p>
            </div>
            <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Commission Type</label>
                    <select 
                        name="CommissionType" 
                        value={form.companyDetails?.CommissionType || ""} 
                        onChange={handleCompanyDetailsChange} 
                        className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-2xl text-sm font-bold outline-none transition-all shadow-inner"
                    >
                        <option value="">Select Type</option>
                        <option value="Percentage">Percentage</option>
                        <option value="Fixed">Fixed</option>
                        <option value="Tiered">Tiered</option>
                    </select>
                </div>
                
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Commission Rate (%)</label>
                    <input 
                        name="CommissionPercentage" 
                        value={form.companyDetails?.CommissionPercentage || ""} 
                        onChange={handleCompanyDetailsChange} 
                        type="number" 
                        step="0.01"
                        placeholder="e.g. 5.5" 
                        className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-2xl text-sm font-bold outline-none transition-all shadow-inner" 
                    />
                </div>
                
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Commission Lock</label>
                    <select 
                        name="CommissionLock" 
                        value={form.companyDetails?.CommissionLock || ""} 
                        onChange={handleCompanyDetailsChange} 
                        className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-2xl text-sm font-bold outline-none transition-all shadow-inner"
                    >
                        <option value="">Select Status</option>
                        <option value="Locked">Locked</option>
                        <option value="Unlocked">Unlocked</option>
                    </select>
                </div>
            </div>
        </div>
    );

    const renderDocuments = () => (
        <div className="space-y-8 animate-in fade-in duration-300">
            <div className="text-center mb-8">
                <h3 className="text-2xl font-black text-gray-900 tracking-tighter uppercase">📄 Company Documents</h3>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-2">Upload required certificates & documents</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* SECP Certificate */}
                <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl border-2 border-blue-200">
                    <h4 className="text-xs font-black text-blue-900 uppercase tracking-wider mb-4">SECP Registration Certificate</h4>
                    {form.companyDetails?.SECPRegistrationCertificate ? (
                        <div className="space-y-3">
                            <div className="p-4 bg-white rounded-2xl flex items-center justify-between">
                                <a href={form.companyDetails.SECPRegistrationCertificate} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                    View Document
                                </a>
                            </div>
                            <label className="block w-full cursor-pointer">
                                <div className="py-3 px-4 bg-blue-600 text-white rounded-xl text-center text-xs font-black uppercase tracking-wider hover:bg-blue-700 transition-colors">
                                    Change Document
                                </div>
                                <input type="file" onChange={(e) => handleDocumentUpload(e, 'SECPRegistrationCertificate')} className="hidden" />
                            </label>
                        </div>
                    ) : (
                        <label className="block cursor-pointer">
                            <div className="py-12 px-6 bg-white border-2 border-dashed border-blue-300 rounded-2xl hover:border-blue-500 transition-colors">
                                <div className="flex flex-col items-center gap-3">
                                    <svg className="w-10 h-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                                    <span className="text-xs font-black text-blue-700 uppercase">Upload Certificate</span>
                                </div>
                            </div>
                            <input type="file" onChange={(e) => handleDocumentUpload(e, 'SECPRegistrationCertificate')} className="hidden" />
                        </label>
                    )}
                </div>

                {/* Delivery Policy */}
                <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl border-2 border-purple-200">
                    <h4 className="text-xs font-black text-purple-900 uppercase tracking-wider mb-4">Delivery Policy Document</h4>
                    {form.companyDetails?.DeliveryPolicyDocument ? (
                        <div className="space-y-3">
                            <div className="p-4 bg-white rounded-2xl flex items-center justify-between">
                                <a href={form.companyDetails.DeliveryPolicyDocument} target="_blank" rel="noopener noreferrer" className="text-sm text-purple-600 hover:underline flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                    View Document
                                </a>
                            </div>
                            <label className="block w-full cursor-pointer">
                                <div className="py-3 px-4 bg-purple-600 text-white rounded-xl text-center text-xs font-black uppercase tracking-wider hover:bg-purple-700 transition-colors">
                                    Change Document
                                </div>
                                <input type="file" onChange={(e) => handleDocumentUpload(e, 'DeliveryPolicyDocument')} className="hidden" />
                            </label>
                        </div>
                    ) : (
                        <label className="block cursor-pointer">
                            <div className="py-12 px-6 bg-white border-2 border-dashed border-purple-300 rounded-2xl hover:border-purple-500 transition-colors">
                                <div className="flex flex-col items-center gap-3">
                                    <svg className="w-10 h-10 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                                    <span className="text-xs font-black text-purple-700 uppercase">Upload Policy</span>
                                </div>
                            </div>
                            <input type="file" onChange={(e) => handleDocumentUpload(e, 'DeliveryPolicyDocument')} className="hidden" />
                        </label>
                    )}
                </div>

                {/* Company Profile PDF */}
                <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl border-2 border-green-200">
                    <h4 className="text-xs font-black text-green-900 uppercase tracking-wider mb-4">Company Profile PDF</h4>
                    {form.companyDetails?.CompanyProfilePDF ? (
                        <div className="space-y-3">
                            <div className="p-4 bg-white rounded-2xl flex items-center justify-between">
                                <a href={form.companyDetails.CompanyProfilePDF} target="_blank" rel="noopener noreferrer" className="text-sm text-green-600 hover:underline flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                    View Document
                                </a>
                            </div>
                            <label className="block w-full cursor-pointer">
                                <div className="py-3 px-4 bg-green-600 text-white rounded-xl text-center text-xs font-black uppercase tracking-wider hover:bg-green-700 transition-colors">
                                    Change Document
                                </div>
                                <input type="file" onChange={(e) => handleDocumentUpload(e, 'CompanyProfilePDF')} className="hidden" />
                            </label>
                        </div>
                    ) : (
                        <label className="block cursor-pointer">
                            <div className="py-12 px-6 bg-white border-2 border-dashed border-green-300 rounded-2xl hover:border-green-500 transition-colors">
                                <div className="flex flex-col items-center gap-3">
                                    <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                                    <span className="text-xs font-black text-green-700 uppercase">Upload Profile</span>
                                </div>
                            </div>
                            <input type="file" onChange={(e) => handleDocumentUpload(e, 'CompanyProfilePDF')} className="hidden" />
                        </label>
                    )}
                </div>

                {/* Agency Letter */}
                <div className="p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl border-2 border-orange-200">
                    <h4 className="text-xs font-black text-orange-900 uppercase tracking-wider mb-4">Authorized Agency Letter</h4>
                    {form.companyDetails?.AuthorizedAgencyLetter ? (
                        <div className="space-y-3">
                            <div className="p-4 bg-white rounded-2xl flex items-center justify-between">
                                <a href={form.companyDetails.AuthorizedAgencyLetter} target="_blank" rel="noopener noreferrer" className="text-sm text-orange-600 hover:underline flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                    View Document
                                </a>
                            </div>
                            <label className="block w-full cursor-pointer">
                                <div className="py-3 px-4 bg-orange-600 text-white rounded-xl text-center text-xs font-black uppercase tracking-wider hover:bg-orange-700 transition-colors">
                                    Change Document
                                </div>
                                <input type="file" onChange={(e) => handleDocumentUpload(e, 'AuthorizedAgencyLetter')} className="hidden" />
                            </label>
                        </div>
                    ) : (
                        <label className="block cursor-pointer">
                            <div className="py-12 px-6 bg-white border-2 border-dashed border-orange-300 rounded-2xl hover:border-orange-500 transition-colors">
                                <div className="flex flex-col items-center gap-3">
                                    <svg className="w-10 h-10 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                                    <span className="text-xs font-black text-orange-700 uppercase">Upload Letter</span>
                                </div>
                            </div>
                            <input type="file" onChange={(e) => handleDocumentUpload(e, 'AuthorizedAgencyLetter')} className="hidden" />
                        </label>
                    )}
                </div>
            </div>
        </div>
    );

    const renderContacts = () => (
        <div className="space-y-8 animate-in fade-in duration-300">
            <div className="text-center mb-8">
                <h3 className="text-2xl font-black text-gray-900 tracking-tighter uppercase">👥 Authorized Contacts</h3>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-2">Key personnel information</p>
            </div>
            
            <div className="flex justify-center mb-6">
                <button
                    type="button"
                    onClick={addContactPerson}
                    className="px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-2xl text-xs font-black uppercase tracking-wider hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-3"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Contact Person
                </button>
            </div>
            
            {form.companyDetails?.AuthorizedContactPerson?.length > 0 ? (
                <div className="space-y-6">
                    {form.companyDetails.AuthorizedContactPerson.map((contact, index) => (
                        <div key={index} className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl border-2 border-gray-300 space-y-6 relative">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white font-black">
                                        {index + 1}
                                    </div>
                                    <h5 className="text-sm font-black text-gray-700 uppercase tracking-wider">Contact Person</h5>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeContactPerson(index)}
                                    className="px-4 py-2 bg-red-100 text-red-700 rounded-xl text-xs font-black uppercase hover:bg-red-600 hover:text-white transition-all"
                                >
                                    Remove
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    value={contact.fullName || ""}
                                    onChange={(e) => handleContactPersonChange(index, 'fullName', e.target.value)}
                                    placeholder="Full Name"
                                    className="px-5 py-4 bg-white border-2 border-transparent focus:border-red-600 rounded-xl text-sm font-bold outline-none transition-all shadow-sm"
                                />
                                <input
                                    type="text"
                                    value={contact.Designation || ""}
                                    onChange={(e) => handleContactPersonChange(index, 'Designation', e.target.value)}
                                    placeholder="Designation / Title"
                                    className="px-5 py-4 bg-white border-2 border-transparent focus:border-red-600 rounded-xl text-sm font-bold outline-none transition-all shadow-sm"
                                />
                                <input
                                    type="tel"
                                    value={contact.phoneNumber || ""}
                                    onChange={(e) => handleContactPersonChange(index, 'phoneNumber', e.target.value)}
                                    placeholder="Phone Number"
                                    className="px-5 py-4 bg-white border-2 border-transparent focus:border-red-600 rounded-xl text-sm font-bold outline-none transition-all shadow-sm"
                                />
                                <input
                                    type="email"
                                    value={contact.email || ""}
                                    onChange={(e) => handleContactPersonChange(index, 'email', e.target.value)}
                                    placeholder="Email Address"
                                    className="px-5 py-4 bg-white border-2 border-transparent focus:border-red-600 rounded-xl text-sm font-bold outline-none transition-all shadow-sm"
                                />
                                <input
                                    type="text"
                                    value={contact.OfficeAddress || ""}
                                    onChange={(e) => handleContactPersonChange(index, 'OfficeAddress', e.target.value)}
                                    placeholder="Office Address"
                                    className="px-5 py-4 bg-white border-2 border-transparent focus:border-red-600 rounded-xl text-sm font-bold outline-none transition-all shadow-sm col-span-full"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="p-16 bg-gray-50 border-2 border-dashed border-gray-300 rounded-3xl text-center">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="text-sm text-gray-400 font-bold uppercase tracking-wide">No contact persons added yet</p>
                    <p className="text-xs text-gray-400 mt-2">Click the button above to add authorized contacts</p>
                </div>
            )}
        </div>
    );

    const renderDeclarations = () => (
        <div className="space-y-8 animate-in fade-in duration-300">
            <div className="text-center mb-8">
                <h3 className="text-2xl font-black text-gray-900 tracking-tighter uppercase">✅ Authorization Declarations</h3>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-2">Required agreements & confirmations</p>
            </div>
            <div className="max-w-3xl mx-auto space-y-6">
                {form.companyDetails?.AuthorizationDeclaration?.map((declaration, index) => (
                    <label key={index} className={`flex items-start gap-5 p-8 rounded-3xl cursor-pointer transition-all border-3 ${
                        declaration.isTrue 
                            ? 'bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-500 shadow-xl shadow-emerald-100' 
                            : 'bg-white border-gray-200 hover:border-red-300 hover:shadow-lg'
                    }`}>
                        <input
                            type="checkbox"
                            checked={declaration.isTrue || false}
                            onChange={() => handleDeclarationToggle(index)}
                            className="w-7 h-7 mt-1 text-emerald-600 bg-white border-2 border-gray-300 rounded-lg focus:ring-emerald-500 cursor-pointer"
                        />
                        <div className="flex-1">
                            <span className={`text-base font-bold leading-relaxed block ${declaration.isTrue ? 'text-emerald-900' : 'text-gray-700'}`}>
                                {declaration.text}
                            </span>
                            {declaration.isTrue && (
                                <div className="mt-2 flex items-center gap-2 text-emerald-600">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-xs font-black uppercase">Confirmed</span>
                                </div>
                            )}
                        </div>
                    </label>
                ))}
            </div>
        </div>
    );

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

            {/* Progress Steps */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                <div className="flex items-center justify-between overflow-x-auto pb-4">
                    {steps.map((step, index) => (
                        <div key={step.number} className="flex items-center flex-1 min-w-[120px]">
                            <div className="flex flex-col items-center flex-1">
                                <button
                                    type="button"
                                    onClick={() => setCurrentStep(step.number)}
                                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all mb-2 ${
                                        currentStep === step.number
                                            ? 'bg-red-600 text-white shadow-xl shadow-red-200 scale-110'
                                            : currentStep > step.number
                                            ? 'bg-emerald-500 text-white shadow-lg'
                                            : 'bg-gray-100 text-gray-400'
                                    }`}
                                >
                                    {currentStep > step.number ? '✓' : step.icon}
                                </button>
                                <span className={`text-[9px] font-black uppercase tracking-wider text-center ${
                                    currentStep === step.number ? 'text-red-600' : 'text-gray-400'
                                }`}>
                                    {step.title}
                                </span>
                            </div>
                            {index < steps.length - 1 && (
                                <div className={`h-1 flex-1 mx-2 rounded-full transition-all ${
                                    currentStep > step.number ? 'bg-emerald-500' : 'bg-gray-200'
                                }`}></div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Form */}
            <div className="max-w-6xl mx-auto">
                <form onSubmit={handleUpdate} className="bg-white rounded-[3rem] p-8 md:p-12 border border-gray-100 shadow-xl space-y-10">
                    {error && (
                        <div className="p-6 bg-red-50 border-2 border-red-100 text-red-600 rounded-3xl font-black uppercase text-xs tracking-widest text-center animate-bounce">
                            {error}
                        </div>
                    )}
                    {successMessage && (
                        <div className="p-6 bg-emerald-50 border-2 border-emerald-100 text-emerald-600 rounded-3xl font-black uppercase text-xs tracking-widest text-center">
                            {successMessage}
                        </div>
                    )}

                    {/* Step Content */}
                    <div className="min-h-[500px]">
                        {renderStepContent()}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex justify-between items-center pt-10 border-t-2 border-gray-100">
                        <button
                            type="button"
                            onClick={prevStep}
                            disabled={currentStep === 1}
                            className={`px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-wider transition-all flex items-center gap-3 ${
                                currentStep === 1
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-gray-900 text-white hover:bg-black hover:shadow-xl hover:scale-105 active:scale-95'
                            }`}
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                            </svg>
                            Previous
                        </button>

                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="px-8 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black uppercase text-xs tracking-wider hover:bg-gray-200 transition-all active:scale-95"
                            >
                                Cancel
                            </button>

                            {currentStep < totalSteps ? (
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="px-12 py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-2xl font-black uppercase text-xs tracking-wider shadow-2xl shadow-red-200 hover:shadow-3xl hover:scale-105 transition-all active:scale-95 flex items-center gap-3"
                                >
                                    Next Step
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={submitting || uploadingProfile || uploadingIdCard}
                                    className="px-16 py-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-2xl font-black uppercase text-xs tracking-wider shadow-2xl shadow-emerald-200 hover:shadow-3xl hover:scale-105 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
                                >
                                    {submitting ? (
                                        <>
                                            <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Update & Save
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AgentUpdate;
