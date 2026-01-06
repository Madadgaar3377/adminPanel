import React, { useState, useEffect, useCallback } from 'react';
import ApiBaseUrl from '../constants/apiUrl';
import { useNavigate } from 'react-router-dom';

// Simple Toast Component
const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';

    return (
        <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-in slide-in-from-top duration-300 flex items-center gap-3`}>
            {type === 'success' ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            )}
            <span className="font-medium">{message}</span>
            <button onClick={onClose} className="ml-2 hover:opacity-80">×</button>
        </div>
    );
};

const Profile = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [toast, setToast] = useState(null);

    const [userData, setUserData] = useState({
        userId: '',
        name: '',
        email: '',
        userName: '',
        profilePic: '',
        cnicNumber: '',
        phoneNumber: '',
        WhatsappNumber: '',
        Address: '',
        UserType: '',
        isVerified: false,
    });

    const showToast = useCallback((message, type = 'success') => {
        setToast({ message, type });
    }, []);

    const fetchUserProfile = useCallback(async () => {
        setLoading(true);
        try {
            // Get auth token from localStorage
            let authToken = localStorage.getItem('authToken') || localStorage.getItem('access_token');
            const adminAuth = JSON.parse(localStorage.getItem('adminAuth') || 'null');
            if (adminAuth && adminAuth.token) {
                authToken = adminAuth.token;
            }

            if (!authToken) {
                showToast('Authentication token not found', 'error');
                setLoading(false);
                return;
            }

            const response = await fetch(`${ApiBaseUrl}/getuser`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });

            const data = await response.json();
            const hasUserData = data.data || data.user;
            const isPlaceholderResponse = data.message && data.message.includes('non-core route');

            if (response.ok && data.success && hasUserData && !isPlaceholderResponse) {
                const userInfo = data.data || data.user || {};
                setUserData({
                    userId: userInfo.userId || '',
                    name: userInfo.name || userInfo.fullName || '',
                    email: userInfo.email || '',
                    userName: userInfo.userName || userInfo.businessName || '',
                    profilePic: userInfo.profilePic || userInfo.profileImage || '',
                    cnicNumber: userInfo.cnicNumber || userInfo.cnic || '',
                    phoneNumber: userInfo.phoneNumber || userInfo.number || '',
                    WhatsappNumber: userInfo.WhatsappNumber || userInfo.whatsappNumber || '',
                    Address: userInfo.Address || userInfo.address || '',
                    UserType: userInfo.UserType || userInfo.userType || '',
                    isVerified: userInfo.isVerified || false,
                });
            } else {
                // Load from localStorage
                const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
                const adminAuthUser = adminAuth ? adminAuth.user : null;
                const fallbackUser = adminAuthUser || storedUser;

                if (fallbackUser) {
                    setUserData({
                        userId: fallbackUser.userId || '',
                        name: fallbackUser.name || fallbackUser.fullName || '',
                        email: fallbackUser.email || '',
                        userName: fallbackUser.userName || fallbackUser.businessName || '',
                        profilePic: fallbackUser.profilePic || fallbackUser.profileImage || '',
                        cnicNumber: fallbackUser.cnicNumber || fallbackUser.cnic || '',
                        phoneNumber: fallbackUser.phoneNumber || fallbackUser.number || '',
                        WhatsappNumber: fallbackUser.WhatsappNumber || fallbackUser.whatsappNumber || '',
                        Address: fallbackUser.Address || fallbackUser.address || '',
                        UserType: fallbackUser.UserType || fallbackUser.userType || '',
                        isVerified: fallbackUser.isVerified || false,
                    });
                }
            }
        } catch (err) {
            showToast('Failed to load profile', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchUserProfile();
    }, [fetchUserProfile]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingImage(true);
        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch(`${ApiBaseUrl}/upload-image`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setUserData(prev => ({ ...prev, profilePic: data.url }));
                showToast('Profile picture uploaded successfully!');
            } else {
                showToast(data.message || 'Upload failed', 'error');
            }
        } catch (err) {
            showToast('Failed to upload image', 'error');
        } finally {
            setUploadingImage(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!userData.userId) {
            showToast('User ID not found', 'error');
            return;
        }

        setUpdating(true);
        try {
            let authToken = localStorage.getItem('authToken') || localStorage.getItem('access_token');
            const adminAuth = JSON.parse(localStorage.getItem('adminAuth') || 'null');
            if (adminAuth && adminAuth.token) {
                authToken = adminAuth.token;
            }

            if (!authToken) {
                showToast('Authentication token not found', 'error');
                setUpdating(false);
                return;
            }

            const updates = {
                name: userData.name || '',
                userName: userData.userName || '',
                profilePic: userData.profilePic || '',
                cnicNumber: userData.cnicNumber || '',
                phoneNumber: userData.phoneNumber || '',
                WhatsappNumber: userData.WhatsappNumber || '',
                Address: userData.Address || '',
            };

            const payload = { userId: userData.userId, updates };

            const response = await fetch(`${ApiBaseUrl}/updateUser`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok && data.success) {
                showToast('Profile updated successfully!');

                // Update localStorage
                try {
                    const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
                    if (storedUser) {
                        storedUser.fullName = userData.name;
                        storedUser.number = userData.phoneNumber;
                        storedUser.whatsappNumber = userData.WhatsappNumber;
                        storedUser.cnic = userData.cnicNumber;
                        storedUser.address = userData.Address;
                        storedUser.profileImage = userData.profilePic;
                        localStorage.setItem('user', JSON.stringify(storedUser));
                    }
                    if (adminAuth && adminAuth.user) {
                        adminAuth.user.name = userData.name;
                        adminAuth.user.phoneNumber = userData.phoneNumber;
                        adminAuth.user.WhatsappNumber = userData.WhatsappNumber;
                        adminAuth.user.cnicNumber = userData.cnicNumber;
                        adminAuth.user.Address = userData.Address;
                        adminAuth.user.profilePic = userData.profilePic;
                        localStorage.setItem('adminAuth', JSON.stringify(adminAuth));
                    }
                } catch (e) {
                    console.error('Error updating localStorage:', e);
                }

                setTimeout(() => fetchUserProfile(), 1000);
            } else {
                showToast(data.message || 'Failed to update profile', 'error');
            }
        } catch (err) {
            showToast('Network error. Please try again.', 'error');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-gray-200 border-t-red-600 rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading Profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-6">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Profile Header */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <div className="flex flex-col md:flex-row items-center gap-6">
                    {/* Profile Picture */}
                    <div className="relative">
                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-100">
                            {userData.profilePic ? (
                                <img src={userData.profilePic} alt={userData.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                                    <span className="text-white text-4xl font-bold">
                                        {userData.name?.charAt(0) || 'A'}
                                    </span>
                                </div>
                            )}
                        </div>
                        <label className="absolute bottom-0 right-0 bg-red-600 text-white p-2 rounded-full cursor-pointer hover:bg-red-700 transition">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                disabled={uploadingImage}
                                className="hidden"
                            />
                        </label>
                        {uploadingImage && (
                            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        )}
                    </div>

                    {/* Profile Info */}
                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-3xl font-bold text-gray-900">{userData.name || 'Admin'}</h1>
                        <p className="text-red-600 font-medium mt-1">{userData.UserType || 'Administrator'}</p>
                        {userData.isVerified && (
                            <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Verified
                            </span>
                        )}
                    </div>

                    {/* Actions */}
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>

            {/* Profile Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Full Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={userData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                            placeholder="Enter your full name"
                        />
                    </div>

                    {/* Username */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Username
                        </label>
                        <input
                            type="text"
                            name="userName"
                            value={userData.userName}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                            placeholder="Enter username"
                        />
                    </div>

                    {/* Email (Read-only) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={userData.email}
                            disabled
                            className="w-full px-4 py-2 border border-gray-200 bg-gray-50 rounded-lg text-gray-500 cursor-not-allowed"
                        />
                    </div>

                    {/* User ID (Read-only) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            User ID
                        </label>
                        <input
                            type="text"
                            value={userData.userId}
                            disabled
                            className="w-full px-4 py-2 border border-gray-200 bg-gray-50 rounded-lg text-gray-500 cursor-not-allowed"
                        />
                    </div>

                    {/* Phone Number */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            name="phoneNumber"
                            value={userData.phoneNumber}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                            placeholder="e.g., +92 300 1234567"
                        />
                    </div>

                    {/* WhatsApp Number */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            WhatsApp Number
                        </label>
                        <input
                            type="tel"
                            name="WhatsappNumber"
                            value={userData.WhatsappNumber}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                            placeholder="e.g., +92 300 1234567"
                        />
                    </div>

                    {/* CNIC Number */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            CNIC Number
                        </label>
                        <input
                            type="text"
                            name="cnicNumber"
                            value={userData.cnicNumber}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                            placeholder="e.g., 12345-1234567-1"
                        />
                    </div>

                    {/* Address */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Address
                        </label>
                        <textarea
                            name="Address"
                            value={userData.Address}
                            onChange={handleChange}
                            rows="3"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition resize-none"
                            placeholder="Enter your complete address"
                        />
                    </div>
                </div>

                {/* Submit Button */}
                <div className="mt-6 flex justify-end">
                    <button
                        type="submit"
                        disabled={updating || !userData.userId}
                        className={`px-8 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition flex items-center gap-2 ${
                            updating || !userData.userId ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        {updating ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Updating...
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Profile;
