import React, { useState, useEffect } from 'react';
import ApiBaseUrl from '../constants/apiUrl';
import { useNavigate } from 'react-router-dom';

const UnverifiedAgents = () => {
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchUnverifiedAgents();
    }, []);

    const fetchUnverifiedAgents = async () => {
        setLoading(true);
        try {
            const authData = JSON.parse(localStorage.getItem('adminAuth'));
            const res = await fetch(`${ApiBaseUrl}/getAllUnverifiedAgents`, {
                headers: {
                    'Authorization': `Bearer ${authData.token}`,
                }
            });
            const data = await res.json();
            if (data.success) {
                setAgents(data.agents || data.users || []);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError("Failed to synch unverified agent registry.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyToggle = async (agent) => {
        const authData = JSON.parse(localStorage.getItem('adminAuth'));
        try {
            const res = await fetch(`${ApiBaseUrl}/updateUser`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${authData.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: agent.userId,
                    updates: { isVerified: true }
                })
            });
            const data = await res.json();
            if (data.success) {
                fetchUnverifiedAgents();
            } else {
                alert(data.message || "Verification failed");
            }
        } catch (err) {
            alert("Verification broadcast failed.");
        }
    };

    const filtered = agents.filter(a =>
        a.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.userId?.toString().includes(searchTerm) ||
        a.phoneNumber?.includes(searchTerm)
    );

    if (loading && agents.length === 0) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="w-12 h-12 border-4 border-gray-100 border-t-red-600 rounded-full animate-spin"></div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Accessing Agent Registry...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase"> Unverified Agents</h1>
                    <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.3em] mt-1">Pending Authorization</p>
                </div>
            </div>

            {/* Search Shell */}
            <div className="relative">
                <input
                    type="text"
                    placeholder="SEARCH BY NAME, ID OR PHONE..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-14 pr-6 py-5 bg-white border border-gray-100 rounded-[2rem] text-[11px] font-black uppercase tracking-widest outline-none transition-all shadow-sm focus:border-red-600 focus:ring-4 focus:ring-red-50/50"
                />
                <svg className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>

            {/* Agents Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filtered.length > 0 ? filtered.map((agent) => (
                    <div key={agent._id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col group overflow-hidden">
                        <div className="p-8 flex-1 space-y-6">
                            <div className="flex justify-between items-start">
                                <div className={`w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-red-50 group-hover:text-red-600 transition-colors`}>
                                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                </div>
                                <div className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border bg-amber-50 text-amber-600 border-amber-100`}>
                                    Pending Verification
                                </div>
                            </div>

                            <div className="space-y-1">
                                <h3 className="text-xl font-black text-gray-900 tracking-tighter uppercase">{agent.name || "UNNAMED_AGENT"}</h3>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Core ID: {agent.userId}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
                                <div>
                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Channel</p>
                                    <p className="text-[10px] font-bold text-gray-900 uppercase truncate">{agent.email || 'N/A'}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Comms</p>
                                    <p className="text-[10px] font-bold text-gray-900 uppercase">{agent.phoneNumber || 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-50 flex gap-2">
                            <button
                                onClick={() => handleVerifyToggle(agent)}
                                className="flex-1 py-3 bg-red-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-red-100"
                            >
                                Verify Agent
                            </button>
                            <button
                                onClick={() => navigate(`/agent/update/${agent._id}`)}
                                className="px-4 py-3 bg-white text-gray-400 hover:text-red-600 border border-gray-100 rounded-xl transition-all"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )) : (
                    <div className="col-span-full py-20 text-center bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">No unverified agents found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UnverifiedAgents;
