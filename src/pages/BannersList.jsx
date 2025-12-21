import React, { useState, useEffect } from 'react';
import ApiBaseUrl from '../constants/apiUrl';
import { useNavigate } from 'react-router-dom';

const BannersList = () => {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        setLoading(true);
        try {
            // Note: your backend getAllOffers only returns active ones. 
            // If you need to manage ALL (including inactive), you might need a different endpoint 
            // or modify your backend to return all for admin.
            const res = await fetch(`${ApiBaseUrl}/getAllOffers`);
            const data = await res.json();
            // Backend returns array directly for getAllOffers based on your code
            setBanners(Array.isArray(data) ? data : []);
        } catch (err) {
            setError("Failed to fetch banners.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("ARE YOU SURE YOU WANT TO REMOVE THIS ASSET?")) return;
        try {
            const authData = JSON.parse(localStorage.getItem('adminAuth'));
            const res = await fetch(`${ApiBaseUrl}/deleteOffer/${id}`, {
                method: 'DELETE',
                headers: {
                    ...(authData?.token ? { Authorization: `Bearer ${authData.token}` } : {}),
                }
            });
            if (res.ok) {
                setBanners(banners.filter(b => b._id !== id));
            } else {
                alert("Deletion failed.");
            }
        } catch (err) {
            alert("Error communicating with server.");
        }
    };

    const toggleStatus = async (item) => {
        try {
            const authData = JSON.parse(localStorage.getItem('adminAuth'));
            const res = await fetch(`${ApiBaseUrl}/updateOffer/${item._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(authData?.token ? { Authorization: `Bearer ${authData.token}` } : {}),
                },
                body: JSON.stringify({ isActive: !item.isActive })
            });
            if (res.ok) {
                fetchBanners();
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="w-12 h-12 border-4 border-gray-100 border-t-red-600 rounded-full animate-spin"></div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Accessing Visual Assets...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">Visual Assets Management</h1>
                    <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.3em] mt-1">Banners & Promotions Console</p>
                </div>
                <button
                    onClick={() => navigate('/banner/add')}
                    className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] hover:bg-red-600 shadow-xl shadow-gray-200 transition-all active:scale-95"
                >
                    + Deploy New Banner
                </button>
            </div>

            {banners.length === 0 ? (
                <div className="p-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">No active banners in the deployment queue.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {banners.map((item) => (
                        <div key={item._id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden group hover:shadow-xl transition-all duration-500">
                            <div className="aspect-[21/9] relative overflow-hidden bg-gray-100">
                                <img src={item.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                <div className="absolute top-4 right-4 flex gap-2">
                                    <div className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${item.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                                        {item.isActive ? 'Active' : 'Standby'}
                                    </div>
                                    <div className="px-3 py-1.5 rounded-lg bg-white/90 backdrop-blur-sm text-[8px] font-black uppercase tracking-widest text-gray-900 border border-white">
                                        {item.category || 'Promo'}
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 space-y-4">
                                <div>
                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Redirection Link</p>
                                    <p className="text-xs font-bold text-gray-900 truncate">{item.link || 'Internal Route'}</p>
                                </div>

                                {item.expireDate && (
                                    <div>
                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Automatic Expiry</p>
                                        <p className="text-[10px] font-black text-red-600 uppercase italic">{new Date(item.expireDate).toLocaleDateString()}</p>
                                    </div>
                                )}

                                <div className="pt-4 flex gap-2 border-t border-gray-50">
                                    <button
                                        onClick={() => toggleStatus(item)}
                                        className="flex-1 py-3 bg-gray-50 text-gray-900 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all border border-gray-100"
                                    >
                                        {item.isActive ? 'Suspend' : 'Resume'}
                                    </button>
                                    <button
                                        onClick={() => navigate(`/banner/update/${item._id}`)}
                                        className="px-4 py-3 bg-gray-50 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-gray-100"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item._id)}
                                        className="px-4 py-3 bg-gray-50 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-gray-100"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default BannersList;
