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
        if (!window.confirm("Are you sure you want to delete this banner?")) return;
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
        <div className="flex flex-col items-center justify-center min-h-[60vh] bg-gradient-to-br from-gray-50 to-white space-y-4">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-red-100 rounded-full"></div>
                <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin absolute top-0"></div>
            </div>
            <p className="text-sm font-medium text-gray-600">Loading banners...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            {/* Modern Header - v2.0.5 */}
            <div className="relative overflow-hidden bg-gradient-to-r from-red-600 via-red-500 to-rose-600 rounded-3xl shadow-2xl p-8">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-40 h-40 bg-white opacity-5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-40 h-40 bg-white opacity-5 rounded-full blur-3xl"></div>
                
                <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-white tracking-tight">Banners</h1>
                            <p className="text-red-100 text-sm font-medium mt-0.5">Manage promotional banners • v2.0.5</p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/banner/add')}
                        className="px-6 py-3 bg-white text-red-600 rounded-xl font-bold text-sm hover:bg-red-50 transition-all duration-300 shadow-lg active:scale-95 flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        New Banner
                    </button>
                </div>
            </div>

            {banners.length === 0 ? (
                <div className="p-20 text-center bg-white/80 backdrop-blur-sm rounded-3xl border-2 border-dashed border-gray-300">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <p className="text-sm font-bold text-gray-500">No banners found</p>
                    <p className="text-xs text-gray-400 mt-1">Create your first banner to get started</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {banners.map((item) => (
                        <div key={item._id} className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 group hover:scale-105">
                            <div className="aspect-[21/9] relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                                <img src={item.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                <div className="absolute top-3 right-3 flex gap-2">
                                    <div className={`px-3 py-1.5 rounded-xl text-xs font-bold backdrop-blur-md shadow-lg ${
                                        item.isActive 
                                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white border border-green-400' 
                                            : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white border border-gray-300'
                                    }`}>
                                        {item.isActive ? '✓ Active' : '✗ Inactive'}
                                    </div>
                                    <div className="px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-md text-xs font-bold text-gray-900 shadow-lg border border-gray-200">
                                        {item.category || 'Promo'}
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 space-y-4">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1 font-bold uppercase tracking-wide">Link</p>
                                    <p className="text-sm font-bold text-gray-900 truncate">{item.link || 'No link'}</p>
                                </div>

                                {item.expireDate && (
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1 font-bold uppercase tracking-wide">Expires On</p>
                                        <p className="text-sm font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">{new Date(item.expireDate).toLocaleDateString()}</p>
                                    </div>
                                )}

                                <div className="pt-4 flex gap-3 border-t-2 border-gray-100">
                                    <button
                                        onClick={() => toggleStatus(item)}
                                        className="flex-1 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-900 rounded-xl text-sm font-bold hover:from-gray-200 hover:to-gray-300 transition-all duration-300 shadow-sm active:scale-95"
                                    >
                                        {item.isActive ? 'Deactivate' : 'Activate'}
                                    </button>
                                    <button
                                        onClick={() => navigate(`/banner/update/${item._id}`)}
                                        className="px-4 py-3 bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 hover:text-red-600 rounded-xl transition-all duration-300 border-2 border-gray-200 hover:border-red-300 active:scale-95 shadow-sm"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item._id)}
                                        className="px-4 py-3 bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 hover:text-red-600 rounded-xl transition-all duration-300 border-2 border-gray-200 hover:border-red-300 active:scale-95 shadow-sm"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
