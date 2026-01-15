import React, { useState, useEffect } from 'react';
import ApiBaseUrl from '../constants/apiUrl';
import { useNavigate } from 'react-router-dom';
import Pagination from '../compontents/Pagination';
import cities from '../constants/cities';

const PropertyList = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('All');
    const [filterCity, setFilterCity] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
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
                setProperties(properties.filter(p => {
                    const pid = p.project?.propertyId || p.individualProperty?.propertyId;
                    return pid !== propertyId;
                }));
                alert('Property deleted successfully!');
            } else {
                alert(data.message || 'Failed to delete property');
            }
        } catch (err) {
            alert("Network error: Unable to delete property.");
        }
    };

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
                propertyId: property.project.propertyId || property._id,
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
                propertyId: property.individualProperty.propertyId || property._id,
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

    const filtered = properties.filter(property => {
        const data = getPropertyData(property);
        const matchesSearch = (
            data.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            data.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            data.contact?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            data.propertyId?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        const matchesType = filterType === 'All' || property.type === filterType;
        const propertyCity = property.type === 'Project' 
            ? property.project?.city 
            : property.individualProperty?.city;
        const matchesCity = filterCity === 'All' || propertyCity === filterCity;
        
        return matchesSearch && matchesType && matchesCity;
    });

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedProperties = filtered.slice(startIndex, endIndex);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterType, filterCity]);

    if (loading && properties.length === 0) return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="text-center">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-red-100 rounded-full mx-auto"></div>
                    <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin absolute top-0 left-1/2 -translate-x-1/2"></div>
                </div>
                <p className="mt-4 text-sm font-medium text-gray-600">Loading properties...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                {/* Modern Header - v2.0.5 */}
                <div className="relative overflow-hidden bg-gradient-to-r from-red-600 via-red-500 to-rose-600 rounded-3xl shadow-2xl p-8">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-40 h-40 bg-white opacity-5 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-40 h-40 bg-white opacity-5 rounded-full blur-3xl"></div>
                    
                    <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                                <div>
                                    <h1 className="text-3xl font-black text-white tracking-tight">Property Listings</h1>
                                    <p className="text-red-100 text-sm font-medium mt-0.5">Manage & monitor all properties • v2.0.5</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => navigate('/property/add')}
                                className="group px-6 py-3 bg-white text-red-600 rounded-xl hover:bg-red-50 transition-all duration-300 text-sm font-bold flex items-center gap-2 shadow-lg hover:shadow-xl active:scale-95"
                            >
                                <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                                </svg>
                                Add Property
                            </button>
                            <button
                                onClick={fetchProperties}
                                disabled={loading}
                                className="p-3 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-all duration-300 disabled:opacity-50 active:scale-95"
                            >
                                <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Modern Filters Section - v2.0.5 */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 space-y-5">
                    {/* Search */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search by title, location, contact, or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all font-medium text-gray-700 placeholder:text-gray-400"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        {/* Type Filter */}
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Property Type</label>
                            <div className="flex flex-wrap gap-2">
                                {['All', 'Project', 'Individual'].map(type => (
                                    <button
                                        key={type}
                                        onClick={() => setFilterType(type)}
                                        className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                                            filterType === type
                                                ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-200'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* City Filter */}
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Filter by City</label>
                            <div className="flex gap-2">
                                <select
                                    value={filterCity}
                                    onChange={(e) => setFilterCity(e.target.value)}
                                    className="flex-1 px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-sm font-bold text-gray-700"
                                >
                                    <option value="All">All Cities</option>
                                    {cities.map((city) => (
                                        <option key={city.value} value={city.value}>
                                            {city.title}
                                        </option>
                                    ))}
                                </select>
                                {filterCity !== 'All' && (
                                    <button
                                        onClick={() => setFilterCity('All')}
                                        className="px-4 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all font-bold flex items-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        Clear
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Results Counter */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <span className="text-sm font-bold text-gray-600">
                            Showing <span className="text-red-600">{filtered.length}</span> of <span className="text-gray-900">{properties.length}</span> properties
                        </span>
                        {(searchTerm || filterType !== 'All' || filterCity !== 'All') && (
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setFilterType('All');
                                    setFilterCity('All');
                                }}
                                className="text-sm font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Reset All Filters
                            </button>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-500 rounded-xl p-5 shadow-sm">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-bold text-red-900 mb-1">Error</h3>
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Property Grid - v2.0.5 */}
                {filtered.length > 0 ? (
                    <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {paginatedProperties.map((property) => {
                            const data = getPropertyData(property);
                            
                            return (
                                <div key={property._id} className="group bg-white rounded-2xl border-2 border-gray-100 hover:border-red-200 shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden">
                                    {/* Image */}
                                    <div className="aspect-[4/3] relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                                        <img
                                            src={data.images[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800'}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            alt={data.title}
                                            onError={(e) => {
                                                e.target.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800';
                                            }}
                                        />
                                        {/* Gradient Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                                        
                                        {/* Type Badge */}
                                        <div className="absolute top-4 left-4">
                                            <span className={`px-4 py-1.5 rounded-full text-xs font-black shadow-lg backdrop-blur-sm ${
                                                data.type === 'Project' 
                                                    ? 'bg-blue-600/90 text-white' 
                                                    : 'bg-purple-600/90 text-white'
                                            }`}>
                                                {data.type}
                                            </span>
                                        </div>
                                        
                                        {/* Transaction Badge */}
                                        <div className="absolute top-4 right-4">
                                            <span className="px-4 py-1.5 bg-white/95 backdrop-blur-sm text-gray-900 rounded-full text-xs font-black shadow-lg">
                                                For {data.transactionType}
                                            </span>
                                        </div>

                                        {/* ID Badge */}
                                        <div className="absolute bottom-4 right-4">
                                            <span className="px-3 py-1 bg-black/70 backdrop-blur-sm text-white rounded-lg text-xs font-mono font-bold">
                                                #{data.propertyId?.slice(-8)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6 space-y-4">
                                        {/* Title & Location */}
                                        <div>
                                            <h3 className="text-xl font-black text-gray-900 line-clamp-1 mb-2">
                                                {data.title}
                                            </h3>
                                            {data.location && (
                                                <p className="text-sm text-gray-500 flex items-center gap-2 font-medium">
                                                    <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    <span className="truncate">{data.location}</span>
                                                </p>
                                            )}
                                        </div>

                                        {/* Price */}
                                        {data.price > 0 && (
                                            <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-xl p-4 border border-red-100">
                                                <p className="text-xs text-red-600 font-bold uppercase tracking-wider mb-1">Price</p>
                                                <p className="text-2xl font-black text-red-700">PKR {data.price.toLocaleString()}</p>
                                            </div>
                                        )}

                                        {/* Stats */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-gray-50 rounded-xl p-3">
                                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">
                                                    {data.type === 'Project' ? 'Area' : 'Size'}
                                                </p>
                                                <p className="text-sm font-black text-gray-900">{data.size}</p>
                                            </div>
                                            <div className="bg-gray-50 rounded-xl p-3">
                                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">
                                                    {data.type === 'Project' ? 'Units' : 'Rooms'}
                                                </p>
                                                <p className="text-sm font-black text-gray-900">
                                                    {data.type === 'Project' 
                                                        ? `${data.units}` 
                                                        : `${data.bedrooms || 0} Bed • ${data.bathrooms || 0} Bath`
                                                    }
                                                </p>
                                            </div>
                                        </div>

                                        {/* Contact */}
                                        <div className="pt-4 border-t border-gray-100">
                                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Contact</p>
                                            <p className="text-sm font-bold text-gray-900 truncate">{data.contact}</p>
                                        </div>

                                        {/* Actions */}
                                        <div className="grid grid-cols-3 gap-2">
                                            <button
                                                onClick={() => navigate(`/property/view/${property._id}`)}
                                                className="py-3 bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200 text-blue-700 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all duration-300 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1 active:scale-95"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                                View
                                            </button>
                                            <button
                                                onClick={() => navigate(`/property/edit/${property._id}`)}
                                                className="py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-xl hover:from-gray-900 hover:to-black transition-all duration-300 text-xs font-black uppercase tracking-wider active:scale-95"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(data.propertyId)}
                                                className="py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 hover:from-red-50 hover:to-red-100 hover:text-red-600 border-2 border-gray-200 hover:border-red-200 rounded-xl transition-all duration-300 active:scale-95"
                                            >
                                                <svg className="w-4 h-4 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    
                    {/* Pagination */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            totalItems={filtered.length}
                            itemsPerPage={itemsPerPage}
                        />
                    </div>
                    </>
                ) : (
                    <div className="bg-white rounded-2xl border-2 border-gray-100 p-16 text-center">
                        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center">
                            <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 mb-2">No Properties Found</h3>
                        <p className="text-gray-500 font-medium mb-6">
                            {searchTerm || filterType !== 'All' || filterCity !== 'All'
                                ? 'Try adjusting your search or filters' 
                                : 'Get started by adding your first property'
                            }
                        </p>
                        {(searchTerm || filterType !== 'All' || filterCity !== 'All') && (
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setFilterType('All');
                                    setFilterCity('All');
                                }}
                                className="px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl hover:from-red-700 hover:to-rose-700 transition-all duration-300 font-bold shadow-lg active:scale-95"
                            >
                                Clear All Filters
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PropertyList;
