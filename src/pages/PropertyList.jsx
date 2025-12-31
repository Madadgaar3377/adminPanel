import React, { useState, useEffect } from 'react';
import ApiBaseUrl from '../constants/apiUrl';
import { useNavigate } from 'react-router-dom';

const PropertyList = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('All'); // 'All', 'Project', 'Individual'
    const navigate = useNavigate();

    useEffect(() => {
        fetchProperties();
    }, []);

    const fetchProperties = async () => {
        setLoading(true);
        try {
            const authData = JSON.parse(localStorage.getItem('adminAuth'));
            const res = await fetch(`${ApiBaseUrl}/getAllProperties`, {
                headers: {
                    ...(authData?.token ? { Authorization: `Bearer ${authData.token}` } : {}),
                }
            });
            const data = await res.json();
            if (data.success) {
                setProperties(data.properties || []);
            } else {
                setError(data.message || 'Failed to fetch properties');
            }
        } catch (err) {
            setError("Network error: Unable to fetch properties.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (propertyId) => {
        if (!window.confirm("Are you sure you want to delete this property?")) return;
        try {
            const authData = JSON.parse(localStorage.getItem('adminAuth'));
            const res = await fetch(`${ApiBaseUrl}/deleteProperty/${propertyId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${authData.token}`
                }
            });
            const data = await res.json();
            if (data.success) {
                setProperties(properties.filter(p => p._id !== propertyId));
            } else {
                alert(data.message || 'Failed to delete property');
            }
        } catch (err) {
            alert("Network error: Unable to delete property.");
        }
    };

    // Helper function to extract property data based on type
    const getPropertyData = (property) => {
        if (!property) return {};
        
        if (property.type === 'Project' && property.project) {
            return {
                type: 'Project',
                title: property.project.projectName || 'Untitled Project',
                location: `${property.project.area || ''}, ${property.project.city || ''}`.trim(),
                price: property.project.transaction?.price || property.project.transaction?.totalPayable || 0,
                transactionType: property.project.transaction?.type || 'Sale',
                size: property.project.totalLandArea || 'N/A',
                units: property.project.totalUnits || 'N/A',
                images: property.project.images || [],
                contact: property.project.contact?.name || 'N/A',
                propertyId: property.project.contact?.propertyId || property._id,
                description: property.project.description || '',
                projectType: property.project.projectType || 'N/A',
            };
        } else if (property.type === 'Individual' && property.individualProperty) {
            return {
                type: 'Individual',
                title: property.individualProperty.title || 'Untitled Property',
                location: `${property.individualProperty.location || ''}, ${property.individualProperty.city || ''}`.trim(),
                price: property.individualProperty.transaction?.price || property.individualProperty.transaction?.totalPayable || 0,
                transactionType: property.individualProperty.transaction?.type || 'Sale',
                size: `${property.individualProperty.areaSize || 'N/A'} ${property.individualProperty.areaUnit || ''}`.trim(),
                bedrooms: property.individualProperty.bedrooms || 0,
                bathrooms: property.individualProperty.bathrooms || 0,
                images: property.individualProperty.images || [],
                contact: property.individualProperty.contact?.name || 'N/A',
                propertyId: property.individualProperty.contact?.propertyId || property._id,
                description: property.individualProperty.description || '',
                propertyType: property.individualProperty.propertyType || 'N/A',
            };
        }
        
        return {
            type: 'Unknown',
            title: 'Property Data Missing',
            location: 'N/A',
            price: 0,
            size: 'N/A',
            images: [],
        };
    };

    // Filter properties
    const filtered = properties.filter(property => {
        const data = getPropertyData(property);
        const matchesSearch = (
            data.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            data.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            data.contact?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            data.propertyId?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        const matchesType = filterType === 'All' || property.type === filterType;
        return matchesSearch && matchesType;
    });

    if (loading && properties.length === 0) return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
            <div className="max-w-7xl mx-auto px-3 xs:px-4 md:px-6 py-4 xs:py-6 md:py-8">
                <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-gray-100 border-t-red-600 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-red-400 rounded-full animate-spin" style={{ animationDuration: '1.5s' }}></div>
                    </div>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Loading Properties...</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
            <div className="max-w-7xl mx-auto px-3 xs:px-4 md:px-6 py-4 xs:py-6 md:py-8 space-y-4 xs:space-y-6 md:space-y-8 animate-in fade-in duration-700">
                {/* Header */}
                <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 xs:p-8 md:p-10 rounded-2xl xs:rounded-3xl shadow-2xl shadow-red-200/50 border border-red-500/20 relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
                    </div>
                    
                    <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 xs:w-12 xs:h-12 bg-white/20 backdrop-blur-sm rounded-xl xs:rounded-2xl flex items-center justify-center">
                                    <svg className="w-5 h-5 xs:w-6 xs:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                                <h1 className="text-2xl xs:text-3xl md:text-4xl font-black text-white tracking-tighter">
                                    Property Listings
                                </h1>
                            </div>
                            <p className="text-[10px] xs:text-xs md:text-sm font-bold text-white/80 uppercase tracking-wider xs:tracking-widest ml-0 xs:ml-14">
                                Managing Premium Real Estate Assets
                            </p>
                        </div>
                        <div className="flex gap-2 xs:gap-3 w-full md:w-auto">
                            <button
                                onClick={() => navigate('/property/add')}
                                className="tap-target group flex-1 md:flex-none flex items-center justify-center gap-2 px-5 xs:px-6 py-2.5 xs:py-3 bg-white text-red-600 rounded-xl xs:rounded-2xl font-bold uppercase text-[9px] xs:text-[10px] tracking-widest hover:bg-white/90 transition-all shadow-lg active:scale-95"
                            >
                                <svg className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                                </svg>
                                Add Property
                            </button>
                            <button
                                onClick={fetchProperties}
                                disabled={loading}
                                className="tap-target group p-2.5 xs:p-3 bg-white/10 backdrop-blur-sm text-white border-2 border-white/20 rounded-xl xs:rounded-2xl hover:bg-white/20 hover:border-white/40 transition-all active:scale-95 shrink-0 disabled:opacity-50"
                            >
                                <svg className={`w-4 h-4 xs:w-5 xs:h-5 group-hover:rotate-180 transition-transform duration-500 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white p-5 xs:p-6 rounded-2xl xs:rounded-3xl shadow-xl border border-gray-100/50">
                    {/* Search */}
                    <div className="relative mb-4 xs:mb-5">
                        <input
                            type="text"
                            placeholder="Search by title, location, contact, or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 xs:pl-14 pr-4 xs:pr-6 py-3 xs:py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-transparent focus:border-red-600 rounded-xl xs:rounded-2xl text-xs xs:text-sm font-semibold outline-none transition-all"
                        />
                        <svg className="absolute left-4 xs:left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    {/* Type Filter */}
                    <div className="flex items-center gap-2 xs:gap-3">
                        <span className="text-[10px] xs:text-xs font-black text-gray-500 uppercase tracking-wider">Filter:</span>
                        <div className="flex gap-2">
                            {['All', 'Project', 'Individual'].map(type => (
                                <button
                                    key={type}
                                    onClick={() => setFilterType(type)}
                                    className={`tap-target px-3 xs:px-4 py-1.5 xs:py-2 rounded-lg xs:rounded-xl text-[9px] xs:text-[10px] font-bold uppercase tracking-wider transition-all ${
                                        filterType === type
                                            ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-200'
                                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                    }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                        <div className="ml-auto flex items-center gap-2 text-[10px] xs:text-xs font-bold text-gray-500">
                            <span>{filtered.length}</span>
                            <span className="text-gray-300">of</span>
                            <span>{properties.length}</span>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="bg-gradient-to-r from-red-50 to-red-100/50 border-l-4 border-red-500 p-4 xs:p-5 rounded-2xl shadow-lg shadow-red-100">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-5 h-5 xs:w-6 xs:h-6 bg-red-500 rounded-full flex items-center justify-center">
                                <svg className="w-3 h-3 xs:w-4 xs:h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            <p className="text-xs xs:text-sm text-red-700 font-bold flex-1">{error}</p>
                        </div>
                    </div>
                )}

                {/* Property Grid */}
                {filtered.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 xs:gap-6">
                        {filtered.map((property) => {
                            const data = getPropertyData(property);
                            
                            return (
                                <div key={property._id} className="group bg-white rounded-2xl xs:rounded-3xl border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col">
                                    {/* Image */}
                                    <div className="aspect-[4/3] relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                                        <img
                                            src={data.images[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800'}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            alt={data.title}
                                            onError={(e) => {
                                                e.target.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800';
                                            }}
                                        />
                                        {/* Type Badge */}
                                        <div className="absolute top-3 xs:top-4 left-3 xs:left-4">
                                            <span className={`px-3 xs:px-4 py-1.5 xs:py-2 rounded-xl xs:rounded-2xl text-[8px] xs:text-[9px] font-black uppercase tracking-wider shadow-lg ${
                                                data.type === 'Project' 
                                                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white' 
                                                    : 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
                                            }`}>
                                                {data.type}
                                            </span>
                                        </div>
                                        {/* Transaction Type */}
                                        <div className="absolute top-3 xs:top-4 right-3 xs:right-4">
                                            <span className="px-3 xs:px-4 py-1.5 xs:py-2 bg-white/90 backdrop-blur-sm text-gray-900 rounded-xl xs:rounded-2xl text-[8px] xs:text-[9px] font-black uppercase tracking-wider shadow-lg">
                                                {data.transactionType}
                                            </span>
                                        </div>
                                        {/* Price */}
                                        {data.price > 0 && (
                                            <div className="absolute bottom-3 xs:bottom-4 left-3 xs:left-4 right-3 xs:right-4">
                                                <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-xl shadow-2xl">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[9px] xs:text-[10px] font-bold uppercase tracking-wider opacity-90">Price</span>
                                                        <span className="text-sm xs:text-base font-black">PKR {data.price.toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="p-5 xs:p-6 flex-1 space-y-4 xs:space-y-5">
                                        {/* Title & Location */}
                                        <div className="space-y-2">
                                            <h3 className="text-base xs:text-lg font-black text-gray-900 tracking-tight line-clamp-2">
                                                {data.title}
                                            </h3>
                                            {data.location && (
                                                <p className="text-[10px] xs:text-xs font-semibold text-gray-500 flex items-center gap-2">
                                                    <svg className="w-3 h-3 xs:w-4 xs:h-4 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    <span className="truncate">{data.location}</span>
                                                </p>
                                            )}
                                        </div>

                                        {/* Stats */}
                                        <div className="grid grid-cols-2 gap-3 py-3 xs:py-4 border-y border-gray-100">
                                            <div>
                                                <p className="text-[9px] xs:text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                                                    {data.type === 'Project' ? 'Total Area' : 'Size'}
                                                </p>
                                                <p className="text-xs xs:text-sm font-black text-gray-900">{data.size}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[9px] xs:text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                                                    {data.type === 'Project' ? 'Units' : 'Rooms'}
                                                </p>
                                                <p className="text-xs xs:text-sm font-black text-gray-900">
                                                    {data.type === 'Project' 
                                                        ? `${data.units} Units` 
                                                        : `${data.bedrooms || 0} Bed • ${data.bathrooms || 0} Bath`
                                                    }
                                                </p>
                                            </div>
                                        </div>

                                        {/* Footer */}
                                        <div className="flex items-center justify-between text-[9px] xs:text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                            <span className="truncate max-w-[60%]">Contact: {data.contact}</span>
                                            <span className="text-red-600 shrink-0">ID: {data.propertyId?.slice(-8)}</span>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => navigate(`/property/edit/${property._id}`)}
                                                className="tap-target flex-1 py-2.5 xs:py-3 bg-gradient-to-r from-gray-900 to-black text-white rounded-xl font-bold uppercase text-[9px] xs:text-[10px] tracking-wider hover:from-black hover:to-gray-900 transition-all shadow-lg shadow-gray-200 active:scale-95"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(property._id)}
                                                className="tap-target group px-4 py-2.5 xs:py-3 bg-gradient-to-br from-gray-50 to-gray-100 text-gray-400 hover:from-red-50 hover:to-red-100 hover:text-red-600 border-2 border-gray-200 hover:border-red-200 rounded-xl transition-all active:scale-95 shrink-0"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-white p-16 xs:p-20 md:p-24 text-center rounded-3xl border-2 border-dashed border-gray-200">
                        <div className="w-20 h-20 xs:w-24 xs:h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center">
                            <svg className="w-10 h-10 xs:w-12 xs:h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                        </div>
                        <h3 className="text-lg xs:text-xl font-black text-gray-400 uppercase tracking-tight mb-2">
                            No Properties Found
                        </h3>
                        <p className="text-xs xs:text-sm text-gray-400 font-medium">
                            {searchTerm || filterType !== 'All' 
                                ? 'Try adjusting your search or filters' 
                                : 'Get started by adding your first property'
                            }
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PropertyList;
