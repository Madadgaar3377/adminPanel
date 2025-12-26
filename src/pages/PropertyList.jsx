import React, { useState, useEffect } from 'react';
import ApiBaseUrl from '../constants/apiUrl';
import { useNavigate, NavLink } from 'react-router-dom';

const PropertyList = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchProperties();
    }, []);

    const fetchProperties = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${ApiBaseUrl}/getAllProperties`);
            const data = await res.json();
            if (data.success) {
                setProperties(data.properties);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError("Connectivity error: Unable to synch property ledger.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (propertyId) => {
        if (!window.confirm("ARE YOU SURE YOU WANT TO DESTRUCT THIS PROPERTY RECORD?")) return;
        try {
            const authData = JSON.parse(localStorage.getItem('adminAuth'));
            const res = await fetch(`${ApiBaseUrl}/deleteProperty/${propertyId}`, {
                method: 'DELETE',
                headers: {
                    ...(authData?.token ? { Authorization: `Bearer ${authData.token}` } : {}),
                }
            });
            const data = await res.json();
            if (data.success) {
                setProperties(properties.filter(p => p.propertyId !== propertyId));
            } else {
                alert(data.message);
            }
        } catch (err) {
            alert("Broadcast failure: Network layer error.");
        }
    };

    const filtered = properties.filter(p =>
        (p.adTitle?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.propertyId?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.fullName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.typeOfProperty?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading && properties.length === 0) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="w-12 h-12 border-4 border-gray-100 border-t-red-600 rounded-full animate-spin"></div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Accessing Property Spectrum...</p>
        </div>
    );

    return (
        <div className="space-y-4 xs:space-y-6 md:space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="bg-white p-4 xs:p-6 md:p-8 rounded-[1.5rem] xs:rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 xs:gap-6">
                <div>
                    <h1 className="text-xl xs:text-2xl md:text-3xl font-black text-gray-900 tracking-tighter uppercase">Property List</h1>
                    <p className="text-[8px] xs:text-[9px] md:text-[10px] font-black text-red-600 uppercase tracking-[0.2em] xs:tracking-[0.3em] mt-0.5 xs:mt-1">Managing Premium Property Assets</p>
                </div>
                <div className="flex gap-2 xs:gap-3 w-full md:w-auto">
                    <button
                        onClick={() => navigate('/property/add')}
                        className="tap-target flex-1 md:flex-none px-4 xs:px-5 md:px-6 py-2.5 xs:py-3 md:py-3.5 bg-red-600 text-white rounded-xl xs:rounded-2xl font-black uppercase text-[8px] xs:text-[9px] md:text-[10px] tracking-wider xs:tracking-widest hover:bg-black transition-all shadow-lg xs:shadow-xl shadow-red-100 active:scale-95"
                    >
                        + Create Listing
                    </button>
                    <button
                        onClick={fetchProperties}
                        className="tap-target p-2.5 xs:p-3 md:p-3.5 bg-gray-50 text-gray-400 hover:text-gray-900 rounded-xl xs:rounded-2xl transition-all border border-gray-100 active:scale-95 shrink-0"
                    >
                        <svg className="w-4 h-4 xs:w-5 xs:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <input
                    type="text"
                    placeholder="SEARCH BY TITLE, ID, TYPE OR OWNER..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 xs:pl-12 md:pl-14 pr-4 xs:pr-6 py-3 xs:py-4 md:py-5 bg-white border border-gray-100 rounded-[1.5rem] xs:rounded-[2rem] text-[9px] xs:text-[10px] md:text-[11px] font-black uppercase tracking-wider xs:tracking-widest outline-none transition-all shadow-sm focus:border-red-600 focus:ring-2 xs:focus:ring-4 focus:ring-red-50/50"
                />
                <svg className="absolute left-3 xs:left-4 md:left-6 top-1/2 -translate-y-1/2 w-4 h-4 xs:w-5 xs:h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>

            {error && <div className="p-4 bg-red-50 border-2 border-red-100 text-red-600 rounded-2xl font-black uppercase text-[10px] tracking-widest text-center">{error}</div>}

            {/* Grid */}
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-4 xs:gap-6 md:gap-8">
                {filtered.map((property) => (
                    <div key={property._id} className="bg-white rounded-[1.5rem] xs:rounded-[2rem] md:rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden flex flex-col group">
                        <div className="aspect-video relative overflow-hidden bg-gray-100">
                            <img
                                src={property.images?.[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                alt=""
                            />
                            <div className="absolute top-2 xs:top-3 md:top-4 left-2 xs:left-3 md:left-4">
                                <span className="px-2 xs:px-2.5 md:px-3 py-1 xs:py-1.5 bg-black/60 backdrop-blur-md text-white text-[7px] xs:text-[8px] font-black uppercase tracking-wider xs:tracking-widest rounded-md xs:rounded-lg border border-white/20">
                                    {property.purpose || 'SALE'}
                                </span>
                            </div>
                            <div className="absolute top-2 xs:top-3 md:top-4 right-2 xs:right-3 md:right-4">
                                <span className="px-2 xs:px-2.5 md:px-3 py-1 xs:py-1.5 bg-red-600 text-white text-[7px] xs:text-[8px] font-black uppercase tracking-wider xs:tracking-widest rounded-md xs:rounded-lg shadow-lg">
                                    RS. {property.price?.toLocaleString()}
                                </span>
                            </div>
                        </div>

                        <div className="p-4 xs:p-6 md:p-8 flex-1 space-y-4 xs:space-y-6">
                            <div className="space-y-1 xs:space-y-2">
                                <h3 className="text-base xs:text-lg md:text-xl font-black text-gray-900 tracking-tighter uppercase line-clamp-1">{property.adTitle || property.name || 'Untitled Project'}</h3>
                                <p className="text-[8px] xs:text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-wider xs:tracking-widest flex items-center gap-1.5 xs:gap-2">
                                    <svg className="w-2.5 h-2.5 xs:w-3 xs:h-3 text-red-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    <span className="truncate">{property.address || 'Location Pending'}</span>
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 xs:gap-4 py-3 xs:py-4 border-y border-gray-50">
                                <div>
                                    <p className="text-[7px] xs:text-[8px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest">Type / Size</p>
                                    <p className="text-[10px] xs:text-xs font-black text-gray-900 uppercase truncate">{property.typeOfProperty} • {property.areaSize || property.plotSize}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[7px] xs:text-[8px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest">Configuration</p>
                                    <p className="text-[10px] xs:text-xs font-black text-gray-900 uppercase">{property.bedRooms || '0'} Bed • {property.bathrooms || '0'} Bath</p>
                                </div>
                            </div>

                            <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-1 xs:gap-0 text-[8px] xs:text-[9px] font-black uppercase tracking-wider xs:tracking-widest text-gray-400">
                                <span className="truncate max-w-full xs:max-w-[60%]">Owner: {property.fullName || 'Private'}</span>
                                <span className="text-red-600 shrink-0">ID: {property.propertyId}</span>
                            </div>

                            <div className="flex gap-1.5 xs:gap-2">
                                <button
                                    onClick={() => navigate(`/property/edit/${property.propertyId}`)}
                                    className="tap-target flex-1 py-2.5 xs:py-3 bg-gray-900 text-white rounded-lg xs:rounded-xl text-[8px] xs:text-[9px] font-black uppercase tracking-wider xs:tracking-widest hover:bg-black transition-all shadow-lg shadow-gray-100 active:scale-95"
                                >
                                    Modify Assets
                                </button>
                                <button
                                    onClick={() => handleDelete(property.propertyId)}
                                    className="tap-target px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg xs:rounded-xl transition-all border border-gray-100 active:scale-95 shrink-0"
                                >
                                    <svg className="w-3.5 h-3.5 xs:w-4 xs:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filtered.length === 0 && (
                <div className="p-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-100 italic font-black text-gray-300 uppercase tracking-widest">
                    No matching assets in property sector.
                </div>
            )}
        </div>
    );
};

export default PropertyList;
