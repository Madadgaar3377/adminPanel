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
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="w-12 h-12 border-4 border-gray-100 border-t-red-600 rounded-full animate-spin"></div>
            <p className="text-sm text-gray-500">Loading banners...</p>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Banners
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Manage promotional banners</p>
                </div>
                <button
                    onClick={() => navigate('/banner/add')}
                    className="px-5 py-2.5 bg-red-600 text-white rounded-lg font-medium text-sm hover:bg-red-700 transition-all"
                >
                    + New Banner
                </button>
            </div>

            {banners.length === 0 ? (
                <div className="p-20 text-center bg-white rounded-2xl border-2 border-dashed border-gray-200">
                    <p className="text-sm text-gray-500">No banners found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {banners.map((item) => (
                        <div key={item._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg transition-all">
                            <div className="aspect-[21/9] relative overflow-hidden bg-gray-100">
                                <img src={item.image} alt="" className="w-full h-full object-cover" />
                                <div className="absolute top-3 right-3 flex gap-2">
                                    <div className={`px-2.5 py-1 rounded-lg text-xs font-medium ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                        {item.isActive ? 'Active' : 'Inactive'}
                                    </div>
                                    <div className="px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-900">
                                        {item.category || 'Promo'}
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 space-y-4">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Link</p>
                                    <p className="text-sm font-medium text-gray-900 truncate">{item.link || 'No link'}</p>
                                </div>

                                {item.expireDate && (
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Expires On</p>
                                        <p className="text-sm font-medium text-red-600">{new Date(item.expireDate).toLocaleDateString()}</p>
                                    </div>
                                )}

                                <div className="pt-4 flex gap-2 border-t border-gray-100">
                                    <button
                                        onClick={() => toggleStatus(item)}
                                        className="flex-1 py-2.5 bg-gray-50 text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-100 transition-all"
                                    >
                                        {item.isActive ? 'Deactivate' : 'Activate'}
                                    </button>
                                    <button
                                        onClick={() => navigate(`/banner/update/${item._id}`)}
                                        className="px-4 py-2.5 bg-gray-50 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item._id)}
                                        className="px-4 py-2.5 bg-gray-50 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
