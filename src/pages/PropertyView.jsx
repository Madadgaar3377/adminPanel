import React, { useState, useEffect, useCallback } from 'react';
import ApiBaseUrl from '../constants/apiUrl';
import { useNavigate, useParams } from 'react-router-dom';

const PropertyView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchProperty = useCallback(async () => {
        setLoading(true);
        try {
            const authData = JSON.parse(localStorage.getItem('adminAuth'));
            const res = await fetch(`${ApiBaseUrl}/getProperty/${id}`, {
                headers: {
                    Authorization: `Bearer ${authData.token}`
                }
            });
            const data = await res.json();
            if (data.success) {
                setProperty(data.data);
            }
        } catch (err) {
            console.error('Error fetching property:', err);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchProperty();
    }, [fetchProperty]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] bg-gradient-to-br from-gray-50 to-white space-y-4">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-red-100 rounded-full"></div>
                    <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin absolute top-0"></div>
                </div>
                <p className="text-sm font-medium text-gray-600">Loading property details...</p>
            </div>
        );
    }

    if (!property) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-6">
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-12 text-center max-w-md">
                    <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mb-2">Property Not Found</h2>
                    <p className="text-gray-600 mb-6 font-medium">The property you're looking for doesn't exist.</p>
                    <button
                        onClick={() => navigate('/property/all')}
                        className="px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl hover:from-red-700 hover:to-rose-700 transition-all duration-300 font-bold shadow-lg shadow-red-200 active:scale-95"
                    >
                        Back to Property List
                    </button>
                </div>
            </div>
        );
    }

    const isProject = property.type === 'Project';
    const data = isProject ? property.project : property.individualProperty;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 px-4 sm:px-6 lg:px-8 py-8">
            <div className="max-w-6xl mx-auto space-y-6 pb-20">
                {/* Modern Header - v2.0.5 */}
                <div className="relative overflow-hidden bg-gradient-to-r from-red-600 via-red-500 to-rose-600 rounded-3xl shadow-2xl p-8">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-40 h-40 bg-white opacity-5 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-40 h-40 bg-white opacity-5 rounded-full blur-3xl"></div>
                    
                    <div className="relative">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className={`px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg border ${
                                        isProject 
                                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-blue-400' 
                                            : 'bg-gradient-to-r from-purple-500 to-pink-600 text-white border-purple-400'
                                    }`}>
                                        {property.type}
                                    </span>
                                    {data?.transaction?.type && (
                                        <span className="px-3 py-1.5 bg-white/10 backdrop-blur-sm text-white rounded-xl text-xs font-bold border-2 border-white/20 shadow-lg">
                                            For {data.transaction.type}
                                        </span>
                                    )}
                                </div>
                                <h1 className="text-3xl font-black text-white tracking-tight">
                                    {isProject ? data?.projectName : data?.title}
                                </h1>
                                {data?.city && (
                                    <p className="text-red-100 flex items-center gap-2 mt-1 font-medium">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span>{[data.area, data.city].filter(Boolean).join(', ')}</span>
                                    </p>
                                )}
                            </div>
                            <div className="flex gap-2">
                        <button
                            onClick={() => navigate(`/property/edit/${property._id}`)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2 text-sm font-medium"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                        </button>
                        <button
                            onClick={() => navigate('/property/all')}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
                        >
                            Back
                        </button>
                    </div>
                        </div>
                    </div>
                </div>

                {/* Images Gallery */}
            {data?.images && data.images.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Property Images
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {data.images.map((img, index) => (
                            <div key={index} className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                                <img 
                                    src={img} 
                                    alt={`Property ${index + 1}`} 
                                    className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                                    onClick={() => window.open(img, '_blank')}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Location Information */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Location Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data?.city && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <label className="block text-sm text-gray-500 mb-1">City</label>
                            <p className="text-base font-semibold text-gray-900">{data.city}</p>
                        </div>
                    )}
                    {data?.district && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <label className="block text-sm text-gray-500 mb-1">District</label>
                            <p className="text-base font-semibold text-gray-900">{data.district}</p>
                        </div>
                    )}
                    {data?.tehsil && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <label className="block text-sm text-gray-500 mb-1">Tehsil</label>
                            <p className="text-base font-semibold text-gray-900">{data.tehsil}</p>
                        </div>
                    )}
                    {data?.area && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <label className="block text-sm text-gray-500 mb-1">Area</label>
                            <p className="text-base font-semibold text-gray-900">{data.area}</p>
                        </div>
                    )}
                    {data?.street && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <label className="block text-sm text-gray-500 mb-1">Street</label>
                            <p className="text-base font-semibold text-gray-900">{data.street}</p>
                        </div>
                    )}
                    {data?.address && (
                        <div className="p-4 bg-gray-50 rounded-lg md:col-span-2">
                            <label className="block text-sm text-gray-500 mb-1">Full Address</label>
                            <p className="text-base font-semibold text-gray-900">{data.address}</p>
                        </div>
                    )}
                    {(data?.latitude || data?.longitude || data?.locationGPS) && (
                        <div className="p-4 bg-gray-50 rounded-lg md:col-span-2">
                            <label className="block text-sm text-gray-500 mb-1">GPS Coordinates</label>
                            <p className="text-base font-semibold text-gray-900">
                                {data.latitude && data.longitude 
                                    ? `${data.latitude}, ${data.longitude}` 
                                    : data.locationGPS || 'N/A'}
                            </p>
                        </div>
                    )}
                    {data?.location && (
                        <div className="p-4 bg-gray-50 rounded-lg md:col-span-2">
                            <label className="block text-sm text-gray-500 mb-1">Location</label>
                            <p className="text-base font-semibold text-gray-900">{data.location}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Project Specific Information */}
            {isProject && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        Project Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {data?.projectType && (
                            <div className="p-4 bg-blue-50 rounded-lg">
                                <label className="block text-sm text-blue-700 mb-1">Project Type</label>
                                <p className="text-base font-semibold text-blue-900">{data.projectType}</p>
                            </div>
                        )}
                        {data?.projectSubType && (
                            <div className="p-4 bg-blue-50 rounded-lg">
                                <label className="block text-sm text-blue-700 mb-1">Sub-Type</label>
                                <p className="text-base font-semibold text-blue-900">{data.projectSubType}</p>
                            </div>
                        )}
                        {data?.developmentType && (
                            <div className="p-4 bg-purple-50 rounded-lg">
                                <label className="block text-sm text-purple-700 mb-1">Development Type</label>
                                <p className="text-base font-semibold text-purple-900">{data.developmentType}</p>
                            </div>
                        )}
                        {data?.infrastructureStatus && (
                            <div className="p-4 bg-green-50 rounded-lg">
                                <label className="block text-sm text-green-700 mb-1">Infrastructure Status</label>
                                <p className="text-base font-semibold text-green-900">{data.infrastructureStatus}</p>
                            </div>
                        )}
                        {data?.projectStage && (
                            <div className="p-4 bg-orange-50 rounded-lg">
                                <label className="block text-sm text-orange-700 mb-1">Project Stage</label>
                                <p className="text-base font-semibold text-orange-900">{data.projectStage}</p>
                            </div>
                        )}
                        {data?.expectedCompletionDate && (
                            <div className="p-4 bg-yellow-50 rounded-lg">
                                <label className="block text-sm text-yellow-700 mb-1">Expected Completion</label>
                                <p className="text-base font-semibold text-yellow-900">{data.expectedCompletionDate}</p>
                            </div>
                        )}
                        {data?.possessionDate && (
                            <div className="p-4 bg-yellow-50 rounded-lg">
                                <label className="block text-sm text-yellow-700 mb-1">Possession Date</label>
                                <p className="text-base font-semibold text-yellow-900">{data.possessionDate}</p>
                            </div>
                        )}
                        {data?.totalLandArea && (
                            <div className="p-4 bg-indigo-50 rounded-lg">
                                <label className="block text-sm text-indigo-700 mb-1">Total Land Area</label>
                                <p className="text-base font-semibold text-indigo-900">
                                    {data.totalLandArea} {data.landAreaUnit || ''}
                                </p>
                            </div>
                        )}
                        {data?.totalUnits && (
                            <div className="p-4 bg-pink-50 rounded-lg">
                                <label className="block text-sm text-pink-700 mb-1">Total Units</label>
                                <p className="text-base font-semibold text-pink-900">{data.totalUnits}</p>
                            </div>
                        )}
                        {data?.typicalUnitSizes && (
                            <div className="p-4 bg-pink-50 rounded-lg">
                                <label className="block text-sm text-pink-700 mb-1">Typical Unit Sizes</label>
                                <p className="text-base font-semibold text-pink-900">{data.typicalUnitSizes}</p>
                            </div>
                        )}
                        {data?.developerBuilder && (
                            <div className="p-4 bg-teal-50 rounded-lg md:col-span-2 lg:col-span-3">
                                <label className="block text-sm text-teal-700 mb-1">Developer / Builder</label>
                                <p className="text-base font-semibold text-teal-900">{data.developerBuilder}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Individual Property Specific */}
            {!isProject && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Property Details
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {data?.propertyType && (
                            <div className="p-4 bg-purple-50 rounded-lg">
                                <label className="block text-sm text-purple-700 mb-1">Property Type</label>
                                <p className="text-base font-semibold text-purple-900">{data.propertyType}</p>
                            </div>
                        )}
                        {data?.areaSize && (
                            <div className="p-4 bg-blue-50 rounded-lg">
                                <label className="block text-sm text-blue-700 mb-1">Area Size</label>
                                <p className="text-base font-semibold text-blue-900">{data.areaSize} {data.areaUnit || ''}</p>
                            </div>
                        )}
                        {data?.bedrooms && (
                            <div className="p-4 bg-green-50 rounded-lg">
                                <label className="block text-sm text-green-700 mb-1">Bedrooms</label>
                                <p className="text-base font-semibold text-green-900">{data.bedrooms}</p>
                            </div>
                        )}
                        {data?.bathrooms && (
                            <div className="p-4 bg-green-50 rounded-lg">
                                <label className="block text-sm text-green-700 mb-1">Bathrooms</label>
                                <p className="text-base font-semibold text-green-900">{data.bathrooms}</p>
                            </div>
                        )}
                        {data?.kitchenType && (
                            <div className="p-4 bg-orange-50 rounded-lg">
                                <label className="block text-sm text-orange-700 mb-1">Kitchen Type</label>
                                <p className="text-base font-semibold text-orange-900">{data.kitchenType}</p>
                            </div>
                        )}
                        {data?.furnishingStatus && (
                            <div className="p-4 bg-yellow-50 rounded-lg">
                                <label className="block text-sm text-yellow-700 mb-1">Furnishing</label>
                                <p className="text-base font-semibold text-yellow-900">{data.furnishingStatus}</p>
                            </div>
                        )}
                        {data?.floor && (
                            <div className="p-4 bg-indigo-50 rounded-lg">
                                <label className="block text-sm text-indigo-700 mb-1">Floor</label>
                                <p className="text-base font-semibold text-indigo-900">{data.floor} / {data.totalFloors || 'N/A'}</p>
                            </div>
                        )}
                        {data?.possessionStatus && (
                            <div className="p-4 bg-pink-50 rounded-lg">
                                <label className="block text-sm text-pink-700 mb-1">Possession</label>
                                <p className="text-base font-semibold text-pink-900">{data.possessionStatus}</p>
                            </div>
                        )}
                        {data?.zoningType && (
                            <div className="p-4 bg-teal-50 rounded-lg">
                                <label className="block text-sm text-teal-700 mb-1">Zoning</label>
                                <p className="text-base font-semibold text-teal-900">{data.zoningType}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Description */}
            {data?.description && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Description
                    </h2>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{data.description}</p>
                </div>
            )}

            {/* Highlights */}
            {data?.highlights && data.highlights.filter(h => h).length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Key Features
                    </h2>
                    <ul className="space-y-2">
                        {data.highlights.filter(h => h).map((highlight, index) => (
                            <li key={index} className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-gray-700">{highlight}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Property Types Available (Project) */}
            {data?.propertyTypesAvailable && data.propertyTypesAvailable.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Property Types Available</h2>
                    <div className="flex flex-wrap gap-2">
                        {data.propertyTypesAvailable.map((type, index) => (
                            <span key={index} className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                                {type}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Utilities */}
            {data?.utilities && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Utilities
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {Object.entries(data.utilities).map(([key, value]) => value && (
                            <div key={key} className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                                <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-sm font-medium text-green-900 capitalize">
                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Amenities */}
            {data?.amenities && Object.values(data.amenities).some(v => v) && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                        Amenities
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {Object.entries(data.amenities).map(([key, value]) => value && (
                            <div key={key} className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
                                <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-sm font-medium text-purple-900 capitalize">
                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Transaction Details */}
            {data?.transaction && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Pricing Details
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {data.transaction.price > 0 && (
                            <div className="p-4 bg-red-50 rounded-lg border border-red-100 md:col-span-2 lg:col-span-3">
                                <label className="block text-sm text-red-700 mb-1">Price</label>
                                <p className="text-2xl font-bold text-red-600">PKR {data.transaction.price.toLocaleString()}</p>
                            </div>
                        )}
                        {data.transaction.priceRange && (
                            <div className="p-4 bg-red-50 rounded-lg border border-red-100 md:col-span-2 lg:col-span-3">
                                <label className="block text-sm text-red-700 mb-1">Price Range</label>
                                <p className="text-xl font-bold text-red-600">{data.transaction.priceRange}</p>
                            </div>
                        )}
                        {data.transaction.monthlyRent > 0 && (
                            <div className="p-4 bg-blue-50 rounded-lg">
                                <label className="block text-sm text-blue-700 mb-1">Monthly Rent</label>
                                <p className="text-lg font-bold text-blue-900">PKR {data.transaction.monthlyRent.toLocaleString()}</p>
                            </div>
                        )}
                        {data.transaction.advanceAmount > 0 && (
                            <div className="p-4 bg-blue-50 rounded-lg">
                                <label className="block text-sm text-blue-700 mb-1">Advance</label>
                                <p className="text-lg font-bold text-blue-900">PKR {data.transaction.advanceAmount.toLocaleString()}</p>
                            </div>
                        )}
                        {data.transaction.contractDuration && (
                            <div className="p-4 bg-blue-50 rounded-lg">
                                <label className="block text-sm text-blue-700 mb-1">Contract Duration</label>
                                <p className="text-base font-semibold text-blue-900">{data.transaction.contractDuration}</p>
                            </div>
                        )}
                        {data.transaction.bookingAmount > 0 && (
                            <div className="p-4 bg-green-50 rounded-lg">
                                <label className="block text-sm text-green-700 mb-1">Booking Amount</label>
                                <p className="text-lg font-bold text-green-900">PKR {data.transaction.bookingAmount.toLocaleString()}</p>
                            </div>
                        )}
                        {data.transaction.downPayment > 0 && (
                            <div className="p-4 bg-green-50 rounded-lg">
                                <label className="block text-sm text-green-700 mb-1">Down Payment</label>
                                <p className="text-lg font-bold text-green-900">PKR {data.transaction.downPayment.toLocaleString()}</p>
                            </div>
                        )}
                        {data.transaction.monthlyInstallment > 0 && (
                            <div className="p-4 bg-green-50 rounded-lg">
                                <label className="block text-sm text-green-700 mb-1">Monthly Installment</label>
                                <p className="text-lg font-bold text-green-900">PKR {data.transaction.monthlyInstallment.toLocaleString()}</p>
                            </div>
                        )}
                        {data.transaction.tenure && (
                            <div className="p-4 bg-purple-50 rounded-lg">
                                <label className="block text-sm text-purple-700 mb-1">Tenure</label>
                                <p className="text-base font-semibold text-purple-900">{data.transaction.tenure}</p>
                            </div>
                        )}
                        {data.transaction.totalPayable > 0 && (
                            <div className="p-4 bg-purple-50 rounded-lg">
                                <label className="block text-sm text-purple-700 mb-1">Total Payable</label>
                                <p className="text-lg font-bold text-purple-900">PKR {data.transaction.totalPayable.toLocaleString()}</p>
                            </div>
                        )}
                        {data.transaction.interestRate && (
                            <div className="p-4 bg-orange-50 rounded-lg">
                                <label className="block text-sm text-orange-700 mb-1">Interest Rate</label>
                                <p className="text-base font-semibold text-orange-900">{data.transaction.interestRate}</p>
                            </div>
                        )}
                        {data.transaction.additionalCharges && (
                            <div className="p-4 bg-yellow-50 rounded-lg md:col-span-2">
                                <label className="block text-sm text-yellow-700 mb-1">Additional Charges</label>
                                <p className="text-base font-semibold text-yellow-900">{data.transaction.additionalCharges}</p>
                            </div>
                        )}
                        {data.transaction.discountsOffers && (
                            <div className="p-4 bg-teal-50 rounded-lg md:col-span-2 lg:col-span-3">
                                <label className="block text-sm text-teal-700 mb-1">Discounts / Offers</label>
                                <p className="text-base font-semibold text-teal-900">{data.transaction.discountsOffers}</p>
                            </div>
                        )}
                        {data.transaction.additionalInfo && (
                            <div className="p-4 bg-gray-50 rounded-lg md:col-span-2 lg:col-span-3">
                                <label className="block text-sm text-gray-700 mb-1">Additional Information</label>
                                <p className="text-base text-gray-900">{data.transaction.additionalInfo}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Video */}
            {data?.video && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Property Video
                    </h2>
                    <a
                        href={data.video}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Watch Video
                    </a>
                </div>
            )}

            {/* Nearby Landmarks */}
            {data?.nearbyLandmarks && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                        Nearby Landmarks
                    </h2>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{data.nearbyLandmarks}</p>
                </div>
            )}

            {/* Remarks */}
            {data?.remarks && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Remarks / Notes</h2>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{data.remarks}</p>
                </div>
            )}

            {/* Contact Information */}
            {data?.contact && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Contact Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {data.contact.name && (
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <label className="block text-sm text-gray-500 mb-1">Name</label>
                                <p className="text-base font-semibold text-gray-900">{data.contact.name}</p>
                            </div>
                        )}
                        {data.contact.email && (
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <label className="block text-sm text-gray-500 mb-1">Email</label>
                                <p className="text-base font-semibold text-gray-900">{data.contact.email}</p>
                            </div>
                        )}
                        {data.contact.number && (
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <label className="block text-sm text-gray-500 mb-1">Phone</label>
                                <p className="text-base font-semibold text-gray-900">{data.contact.number}</p>
                            </div>
                        )}
                        {data.contact.whatsapp && (
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <label className="block text-sm text-gray-500 mb-1">WhatsApp</label>
                                <p className="text-base font-semibold text-gray-900">{data.contact.whatsapp}</p>
                            </div>
                        )}
                        {data.contact.cnic && (
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <label className="block text-sm text-gray-500 mb-1">CNIC</label>
                                <p className="text-base font-semibold text-gray-900">{data.contact.cnic}</p>
                            </div>
                        )}
                        {data.contact.city && (
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <label className="block text-sm text-gray-500 mb-1">City</label>
                                <p className="text-base font-semibold text-gray-900">{data.contact.city}</p>
                            </div>
                        )}
                        {data.contact.area && (
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <label className="block text-sm text-gray-500 mb-1">Area</label>
                                <p className="text-base font-semibold text-gray-900">{data.contact.area}</p>
                            </div>
                        )}
                        {data.contact.companyName && (
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <label className="block text-sm text-gray-500 mb-1">Company Name</label>
                                <p className="text-base font-semibold text-gray-900">{data.contact.companyName}</p>
                            </div>
                        )}
                        {data.contact.designation && (
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <label className="block text-sm text-gray-500 mb-1">Designation</label>
                                <p className="text-base font-semibold text-gray-900">{data.contact.designation}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Timestamps */}
            <div className="bg-gray-50 rounded-2xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {property.createdAt && (
                        <div className="flex items-center gap-2 text-gray-600">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Created: {new Date(property.createdAt).toLocaleString()}</span>
                        </div>
                    )}
                    {data?.createdAt && (
                        <div className="flex items-center gap-2 text-gray-600">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span>Updated: {new Date(data.createdAt).toLocaleString()}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
        </div>
        
    );
};

export default PropertyView;
