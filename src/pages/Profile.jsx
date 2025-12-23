import React, { useState, useEffect } from 'react';
import ApiBaseUrl from '../constants/apiUrl';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const loadProfile = () => {
            setLoading(true);
            try {
                const authData = JSON.parse(localStorage.getItem('adminAuth'));
                // console.log(authData.user.profilePic);
                if (authData && authData.user) {
                    setAdmin(authData.user);
                } else {
                    navigate('/login');
                }
            } catch (err) {
                setError("Failed to access local security registry.");
            } finally {
                setLoading(false);
            }
        };
        loadProfile();
    }, [navigate]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="w-12 h-12 border-4 border-gray-100 border-t-red-600 rounded-full animate-spin"></div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Accessing Identity Records...</p>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase"> Administrator Profile</h1>
                    <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.3em] mt-1">Personnel Information System</p>
                </div>
                <button
                    onClick={() => navigate('/update-password')}
                    className="px-6 py-3 bg-gray-900 text-white hover:bg-red-600 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest shadow-lg shadow-gray-200"
                >
                    Update Password
                </button>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border-2 border-red-100 text-red-600 rounded-2xl font-black uppercase text-[10px] tracking-widest text-center">
                    {error}
                </div>
            )}

            <div className="bg-white rounded-[3rem] p-12 border border-gray-100 shadow-xl overflow-hidden relative">
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 rounded-full -mr-32 -mt-32 opacity-50"></div>

                <div className="relative z-10 space-y-12">
                    {/* Identity Core */}
                    <div className="flex flex-col md:flex-row items-center gap-10 border-b border-gray-50 pb-12">
                        <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-tr from-gray-900 to-black flex items-center justify-center text-white text-4xl font-black shadow-2xl relative">
                            {admin?.profilePic ? (
                                <img src={admin.profilePic} alt="" className="w-full h-full object-cover rounded-[2.5rem]" />
                            ) : (
                                <span>{admin?.name?.substring(0, 2).toUpperCase() || 'AD'}</span>
                            )}
                            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full border-4 border-white"></div>
                        </div>
                        <div className="text-center md:text-left space-y-2">
                            <h2 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">{admin?.name || "UNNAMED_ADMIN"}</h2>
                            <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                <span className="px-4 py-1.5 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-red-100">
                                    {admin?.UserType || 'Administrator'}
                                </span>
                                <span className="px-4 py-1.5 bg-gray-50 text-gray-500 rounded-xl text-[10px] font-black uppercase tracking-widest border border-gray-100">
                                    UID: {admin?.userId}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Information Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                        <div className="space-y-1.5">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Official Email</p>
                            <div className="px-6 py-4 bg-gray-50 rounded-2xl text-sm font-bold text-gray-700 border border-gray-100">
                                {admin?.email || 'N/A'}
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Command Line (Phone)</p>
                            <div className="px-6 py-4 bg-gray-50 rounded-2xl text-sm font-bold text-gray-700 border border-gray-100">
                                {admin?.phoneNumber || 'N/A'}
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">CNIC Number</p>
                            <div className="px-6 py-4 bg-gray-50 rounded-2xl text-sm font-bold text-gray-700 border border-gray-100">
                                {admin?.cnicNumber || 'N/A'}
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Wallet Balance</p>
                            <div className="px-6 py-4 bg-gray-900 text-white rounded-2xl text-sm font-bold border border-gray-800 tracking-widest flex justify-between">
                                <span>PKR</span>
                                <span>{admin?.walletBalance?.toLocaleString() || '0'}</span>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Verification Status</p>
                            <div className="px-6 py-4 bg-gray-50 rounded-2xl text-sm font-bold text-gray-700 border border-gray-100 flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${admin?.isVerified ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-red-500'}`}></div>
                                {admin?.isVerified ? 'VERIFIED_PERSONNEL' : 'UNVERIFIED'}
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Account Deployment</p>
                            <div className="px-6 py-4 bg-gray-50 rounded-2xl text-sm font-bold text-gray-700 border border-gray-100">
                                {admin?.createdAt ? new Date(admin.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                            </div>
                        </div>
                    </div>

                    {/* Additional Metadata if any */}
                    {admin?.Address && (
                        <div className="pt-6 border-t border-gray-50">
                            <div className="space-y-1.5">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Operational Sector (Address)</p>
                                <div className="px-6 py-4 bg-gray-50 rounded-2xl text-sm font-bold text-gray-700 border border-gray-100">
                                    {admin.Address.toUpperCase()}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
