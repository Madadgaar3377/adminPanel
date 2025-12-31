import React, { useState, useEffect } from 'react';
import ApiBaseUrl from '../constants/apiUrl';
import { useNavigate } from 'react-router-dom';
import Pagination from '../compontents/Pagination';

const PropertyList = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('All');
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
                // Filter out the deleted property using propertyId from nested contact
                setProperties(properties.filter(p => {
                    const pid = p.project?.contact?.propertyId || p.individualProperty?.contact?.propertyId;
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

    // Pagination
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedProperties = filtered.slice(startIndex, endIndex);

    // Reset to page 1 when search or filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterType]);

    if (loading && properties.length === 0) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-gray-200 border-t-red-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-sm text-gray-500">Loading properties...</p>
            </div>
        </div>
    );

    return (
        <div className="p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Property Listings</h1>
                            <p className="text-sm text-gray-500 mt-1">Manage all properties</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => navigate('/property/add')}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add Property
                            </button>
                            <button
                                onClick={fetchProperties}
                                disabled={loading}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                            >
                                <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                    {/* Search */}
                    <div className="relative mb-4">
                        <input
                            type="text"
                            placeholder="Search by title, location, contact, or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                        />
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    {/* Type Filter */}
                    <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                            {['All', 'Project', 'Individual'].map(type => (
                                <button
                                    key={type}
                                    onClick={() => setFilterType(type)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        filterType === type
                                            ? 'bg-red-600 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                        <span className="text-sm text-gray-500">
                            {filtered.length} of {properties.length} properties
                        </span>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-red-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                )}

                {/* Property Grid */}
                {filtered.length > 0 ? (
                    <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {paginatedProperties.map((property) => {
                            const data = getPropertyData(property);
                            
                            return (
                                <div key={property._id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                                    {/* Image */}
                                    <div className="aspect-video relative overflow-hidden bg-gray-100">
                                        <img
                                            src={data.images[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800'}
                                            className="w-full h-full object-cover"
                                            alt={data.title}
                                            onError={(e) => {
                                                e.target.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800';
                                            }}
                                        />
                                        {/* Type Badge */}
                                        <div className="absolute top-3 left-3">
                                            <span className={`px-3 py-1 rounded-md text-xs font-semibold ${
                                                data.type === 'Project' 
                                                    ? 'bg-blue-600 text-white' 
                                                    : 'bg-purple-600 text-white'
                                            }`}>
                                                {data.type}
                                            </span>
                                        </div>
                                        {/* Transaction Type */}
                                        <div className="absolute top-3 right-3">
                                            <span className="px-3 py-1 bg-white text-gray-900 rounded-md text-xs font-semibold">
                                                {data.transactionType}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-5 space-y-4">
                                        {/* Title & Location */}
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 line-clamp-1 mb-1">
                                                {data.title}
                                            </h3>
                                            {data.location && (
                                                <p className="text-sm text-gray-500 flex items-center gap-1.5">
                                                    <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    <span className="truncate">{data.location}</span>
                                                </p>
                                            )}
                                        </div>

                                        {/* Price */}
                                        {data.price > 0 && (
                                            <div className="bg-red-50 rounded-lg p-3">
                                                <p className="text-xs text-red-600 font-medium mb-0.5">Price</p>
                                                <p className="text-lg font-bold text-red-700">PKR {data.price.toLocaleString()}</p>
                                            </div>
                                        )}

                                        {/* Stats */}
                                        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">
                                                    {data.type === 'Project' ? 'Total Area' : 'Size'}
                                                </p>
                                                <p className="text-sm font-semibold text-gray-900">{data.size}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-gray-500 mb-1">
                                                    {data.type === 'Project' ? 'Units' : 'Rooms'}
                                                </p>
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {data.type === 'Project' 
                                                        ? `${data.units} Units` 
                                                        : `${data.bedrooms || 0} Bed • ${data.bathrooms || 0} Bath`
                                                    }
                                                </p>
                                            </div>
                                        </div>

                                        {/* Footer */}
                                        <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                                            <span className="truncate max-w-[60%]">{data.contact}</span>
                                            <span className="text-red-600 font-medium">#{data.propertyId?.slice(-8)}</span>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => navigate(`/property/edit/${property._id}`)}
                                                className="flex-1 py-2 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors text-sm font-medium"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(data.propertyId)}
                                                className="px-4 py-2 bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600 border border-gray-200 hover:border-red-200 rounded-lg transition-colors"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    
                    {/* Pagination */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
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
                    <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Properties Found</h3>
                        <p className="text-sm text-gray-500">
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
