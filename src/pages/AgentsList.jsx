import React, { useState, useEffect } from 'react';
import ApiBaseUrl from '../constants/apiUrl';
import { useNavigate } from 'react-router-dom';

const AgentsList = () => {
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchAgents();
    }, []);

    const fetchAgents = async () => {
        setLoading(true);
        try {
            const authData = JSON.parse(localStorage.getItem('adminAuth'));
            // Utilizing the existing getAllUsers and filtering for 'agent'
            const res = await fetch(`${ApiBaseUrl}/getAllUsers`, {
                headers: {
                    'Authorization': `Bearer ${authData.token}`,
                }
            });
            const data = await res.json();
            if (data.success) {
                const filtered = data.users.filter(u => u.UserType === 'agent');
                setAgents(filtered);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError("Failed to synch agent directory.");
        } finally {
            setLoading(false);
        }
    };

    const handleBlockToggle = async (user) => {
        const authData = JSON.parse(localStorage.getItem('adminAuth'));
        try {
            const res = await fetch(`${ApiBaseUrl}/updateUser`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${authData.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: user.userId,
                    updates: { isBlocked: !user.isBlocked }
                })
            });
            if (res.ok) fetchAgents();
        } catch (err) {
            alert("Blocked/Unblock broadcast failed.");
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
        <div className="space-y-4 xs:space-y-6 md:space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="bg-white p-4 xs:p-6 md:p-8 rounded-[1.5rem] xs:rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col xs:flex-row justify-between items-start xs:items-center gap-3 xs:gap-0">
                <div>
                    <h1 className="text-xl xs:text-2xl md:text-3xl font-black text-gray-900 tracking-tighter uppercase">All Agents</h1>
                    <p className="text-[8px] xs:text-[9px] md:text-[10px] font-black text-red-600 uppercase tracking-[0.2em] xs:tracking-[0.3em] mt-0.5 xs:mt-1">Authorized Personnel</p>
                </div>
                {/* <button
                    onClick={() => navigate('/agent/add')}
                    className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] hover:bg-red-600 transition-all shadow-xl shadow-gray-200 active:scale-95"
                >
                    + Recruit New Agent
                </button> */}
            </div>

            {/* Search Shell */}
            <div className="relative">
                <input
                    type="text"
                    placeholder="SEARCH BY NAME, ID OR PHONE..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 xs:pl-12 md:pl-14 pr-4 xs:pr-6 py-3 xs:py-4 md:py-5 bg-white border border-gray-100 rounded-[1.5rem] xs:rounded-[2rem] text-[9px] xs:text-[10px] md:text-[11px] font-black uppercase tracking-wider xs:tracking-widest outline-none transition-all shadow-sm focus:border-red-600 focus:ring-2 xs:focus:ring-4 focus:ring-red-50/50"
                />
                <svg className="absolute left-3 xs:left-4 md:left-6 top-1/2 -translate-y-1/2 w-4 h-4 xs:w-5 xs:h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>

            {/* Agents Grid */}
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-4 xs:gap-6 md:gap-8">
                {filtered.map((agent) => (
                    <div key={agent._id} className="bg-white rounded-[1.5rem] xs:rounded-[2rem] md:rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col group overflow-hidden">
                        <div className="p-4 xs:p-6 md:p-8 flex-1 space-y-4 xs:space-y-6">
                            <div className="flex justify-between items-start">
                                <div className={`w-12 h-12 xs:w-14 xs:h-14 rounded-xl xs:rounded-2xl bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-red-50 group-hover:text-red-600 transition-colors shrink-0`}>
                                    <svg className="w-6 h-6 xs:w-8 xs:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                </div>
                                <div className={`px-2 xs:px-3 py-0.5 xs:py-1 rounded-md xs:rounded-lg text-[7px] xs:text-[8px] font-black uppercase tracking-wider xs:tracking-widest border ${agent.isBlocked ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                    {agent.isBlocked ? 'Blocked' : 'Verified'}
                                </div>
                            </div>

                            <div className="space-y-0.5 xs:space-y-1">
                                <h3 className="text-base xs:text-lg md:text-xl font-black text-gray-900 tracking-tighter uppercase truncate">{agent.name || "UNNAMED_AGENT"}</h3>
                                <p className="text-[8px] xs:text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest">Core ID: {agent.userId}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 xs:gap-4 pt-3 xs:pt-4 border-t border-gray-50">
                                <div>
                                    <p className="text-[7px] xs:text-[8px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest">Channel</p>
                                    <p className="text-[9px] xs:text-[10px] font-bold text-gray-900 uppercase truncate">{agent.email || 'N/A'}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[7px] xs:text-[8px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest">Comms</p>
                                    <p className="text-[9px] xs:text-[10px] font-bold text-gray-900 uppercase truncate">{agent.phoneNumber || 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="px-4 xs:px-6 md:px-8 py-4 xs:py-5 md:py-6 bg-gray-50/50 border-t border-gray-50 flex gap-1.5 xs:gap-2">
                            <button
                                onClick={() => navigate(`/agent/update/${agent._id}`)}
                                className="tap-target flex-1 py-2.5 xs:py-3 bg-gray-900 text-white rounded-lg xs:rounded-xl text-[8px] xs:text-[9px] font-black uppercase tracking-wider xs:tracking-widest hover:bg-black transition-all shadow-lg shadow-gray-100 active:scale-95"
                            >
                                Control Profile
                            </button>
                            <button
                                onClick={() => handleBlockToggle(agent)}
                                className={`tap-target px-3 xs:px-4 py-2.5 xs:py-3 rounded-lg xs:rounded-xl transition-all border active:scale-95 shrink-0 ${agent.isBlocked ? 'bg-emerald-600 text-white border-transparent' : 'bg-white text-gray-400 hover:text-red-600 border-gray-100'}`}
                            >
                                <svg className="w-3.5 h-3.5 xs:w-4 xs:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    {agent.isBlocked ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zM10 7a2 2 0 012-2h0a2 2 0 012 2v2H10V7z" />
                                    )}
                                </svg>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AgentsList;
