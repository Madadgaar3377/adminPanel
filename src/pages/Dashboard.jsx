import React, { useState, useEffect, useCallback } from 'react';
import ApiBaseUrl from '../constants/apiUrl';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        setError('');
        const authData = JSON.parse(localStorage.getItem('adminAuth'));
        if (!authData || !authData.token) {
            setError('Authentication token missing');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${ApiBaseUrl}/adminDashboard`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authData.token}`,
                    'Content-Type': 'application/json'
                }
            });

            const result = await response.json();
            if (result.success) {
                setStats(result.data);
            } else {
                setError(result.message || 'Failed to fetch dashboard data');
            }
        } catch (err) {
            setError('Failed to connect to the server');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    if (loading && !stats) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
                <div className="relative w-20 h-20">
                    <div className="absolute inset-0 border-[6px] border-red-100 rounded-full"></div>
                    <div className="absolute inset-0 border-[6px] border-red-600 rounded-full border-t-transparent animate-spin"></div>
                </div>
                <div className="flex flex-col items-center">
                    <p className="text-xl font-black text-gray-900 uppercase tracking-tighter">Syncing Intelligence</p>
                    <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.4em] mt-2 animate-pulse">Initializing Data Stream...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-2xl mx-auto my-20 p-10 bg-white rounded-[3rem] border border-red-100 shadow-2xl text-center space-y-6 animate-in zoom-in duration-500">
                <div className="w-20 h-20 bg-red-50 rounded-[2.5rem] flex items-center justify-center mx-auto text-red-600">
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
                <div>
                    <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Diagnostic Failure</h2>
                    <p className="text-sm font-bold text-gray-400 mt-2">{error}</p>
                </div>
                <button
                    onClick={fetchDashboardData}
                    className="px-10 py-4 bg-red-600 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-black transition-all shadow-xl shadow-red-100"
                >
                    Retry Handshake
                </button>
            </div>
        );
    }

    const cardData = [
        { label: 'Total Users', val: stats?.totalUsers || 0, tag: 'User Registry', theme: 'indigo', icon: (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>, target: '/users' },
        { label: 'Applications', val: stats?.totalApplications || 0, tag: 'Pending Requests', theme: 'emerald', icon: (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>, target: '/notifications' },
        { label: 'Installments', val: stats?.totalInstallmentPlans || 0, tag: 'Finance Core', theme: 'red', icon: (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>, target: '/installments/all' },
        { label: 'Market Offers', val: stats?.totalOffers || 0, tag: 'Live Promotions', theme: 'amber', icon: (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>, target: '/banner/all' },
    ];

    return (
        <div className="space-y-6 xs:space-y-8 md:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Super Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 xs:gap-6 md:gap-8 pb-3 xs:pb-4 border-b border-gray-100">
                <div className="space-y-1 xs:space-y-2">
                    <div className="flex items-center gap-2 xs:gap-3">
                        <div className="w-1.5 xs:w-2 h-8 xs:h-10 bg-red-600 rounded-full"></div>
                        <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 tracking-tighter uppercase leading-none">Intelligence</h1>
                    </div>
                    <p className="text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs font-black text-gray-400 uppercase tracking-[0.2em] xs:tracking-[0.3em] md:tracking-[0.4em] ml-3 xs:ml-4 md:ml-5">Global Infrastructure Operations Terminal</p>
                </div>
                <div className="flex items-center gap-2 xs:gap-3 md:gap-4 ml-3 xs:ml-4 md:ml-5 lg:ml-0 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
                    <div className="flex items-center px-3 xs:px-4 md:px-6 py-2 xs:py-2.5 md:py-3 bg-emerald-50 text-emerald-600 rounded-xl xs:rounded-2xl border border-emerald-100 whitespace-nowrap">
                        <div className="w-1.5 h-1.5 xs:w-2 xs:h-2 rounded-full bg-emerald-500 mr-2 xs:mr-3 animate-ping"></div>
                        <span className="text-[8px] xs:text-[9px] md:text-[10px] font-black uppercase tracking-wider xs:tracking-widest">System Online</span>
                    </div>
                    <button
                        onClick={fetchDashboardData}
                        className="tap-target flex items-center px-3 xs:px-4 md:px-6 py-2 xs:py-2.5 md:py-3 bg-white border border-gray-100 rounded-xl xs:rounded-2xl hover:bg-gray-50 transition-all shadow-sm active:scale-95 group shrink-0"
                    >
                        <svg className={`h-3 w-3 xs:h-4 xs:w-4 text-gray-400 group-hover:text-red-600 mr-2 xs:mr-3 transition-colors ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span className="text-[8px] xs:text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-wider xs:tracking-widest group-hover:text-gray-900 transition-colors">Sync Data</span>
                    </button>
                </div>
            </div>

            {/* Premium Stat Cards */}
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 xs:gap-5 sm:gap-6 md:gap-8">
                {cardData.map((card, idx) => (
                    <Link
                        key={idx}
                        to={card.target}
                        className="group bg-white rounded-[2rem] xs:rounded-[2.5rem] md:rounded-[3rem] p-6 xs:p-8 md:p-10 border border-transparent hover:border-red-100 shadow-lg xs:shadow-xl shadow-gray-100/50 hover:shadow-red-100/20 transition-all duration-500 flex flex-col items-center text-center relative overflow-hidden active:scale-95"
                    >
                        {/* Interactive Background Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-red-50/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                        <div className={`w-12 h-12 xs:w-14 xs:h-14 md:w-16 md:h-16 rounded-[1.25rem] xs:rounded-[1.5rem] md:rounded-[1.75rem] flex items-center justify-center mb-4 xs:mb-5 md:mb-6 transition-all duration-500 relative z-10 
                            ${card.theme === 'indigo' ? 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-indigo-100' :
                                card.theme === 'emerald' ? 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-emerald-100' :
                                    card.theme === 'red' ? 'bg-red-50 text-red-600 group-hover:bg-red-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-red-100' :
                                        'bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-amber-100'}`}>
                            {card.icon({ className: 'w-5 h-5 xs:w-6 xs:w-6 md:w-7 md:h-7' })}
                        </div>

                        <div className="relative z-10 space-y-0.5 xs:space-y-1">
                            <h3 className="text-3xl xs:text-4xl md:text-5xl font-black text-gray-900 tracking-tighter group-hover:scale-110 transition-transform duration-500">{card.val}</h3>
                            <p className="text-[8px] xs:text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] xs:tracking-[0.25em] md:tracking-[0.3em]">{card.label}</p>
                        </div>

                        <div className="mt-4 xs:mt-5 md:mt-6 pt-4 xs:pt-5 md:pt-6 border-t border-gray-50 w-full">
                            <span className="text-[7px] xs:text-[8px] md:text-[9px] font-black text-red-600 uppercase tracking-wider xs:tracking-widest bg-red-50 px-2 xs:px-2.5 md:px-3 py-1 xs:py-1.5 rounded-lg xs:rounded-xl group-hover:bg-red-600 group-hover:text-white transition-all">
                                {card.tag}
                            </span >
                        </div>
                    </Link>
                ))}
            </div>

            {/* Visual Analytics & Data Visualization */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 xs:gap-8 lg:gap-12">
                {/* Visual Statistics Terminal */}
                <div className="bg-white p-6 xs:p-8 sm:p-10 md:p-12 rounded-[2rem] xs:rounded-[2.5rem] md:rounded-[3.5rem] shadow-xl xs:shadow-2xl shadow-gray-100/50 border border-gray-50 overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-red-50/30 rounded-full -mr-32 -mt-32 blur-3xl group-hover:scale-125 transition-transform duration-1000"></div>

                    <div className="relative z-10 space-y-8 xs:space-y-10 md:space-y-12">
                        <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3 xs:gap-4">
                            <div>
                                <h3 className="text-lg xs:text-xl md:text-2xl font-black text-gray-900 uppercase tracking-tighter">System Pulse</h3>
                                <p className="text-[8px] xs:text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mt-0.5 xs:mt-1">Resource Distribution Analytics</p>
                            </div>
                            <Link to="/analytics" className="tap-target px-4 xs:px-5 md:px-6 py-2 xs:py-2.5 bg-gray-900 text-white rounded-xl xs:rounded-2xl text-[8px] xs:text-[9px] font-black uppercase tracking-wider xs:tracking-widest hover:bg-red-600 transition-all shadow-lg xs:shadow-xl shadow-gray-200 active:scale-95 shrink-0">
                                Expand Data
                            </Link>
                        </div>

                        <div className="relative h-56 xs:h-64 sm:h-72 md:h-80 flex items-end justify-between px-2 xs:px-4 sm:px-6 md:px-8">
                            {/* Visual Bars Container */}
                            {Object.entries(stats || {}).map(([key, value], idx) => {
                                const maxValue = Math.max(...Object.values(stats || {}), 10);
                                const labels = { totalUsers: 'Users', totalApplications: 'Apps', totalInstallmentPlans: 'Fin', totalOffers: 'Mkt' };
                                const heightPC = (value / maxValue) * 100;
                                const colors = ['bg-indigo-600', 'bg-emerald-600', 'bg-red-600', 'bg-amber-600'];
                                return (
                                    <div key={idx} className="relative flex flex-col items-center h-full w-[18%] group/bar">
                                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 scale-0 group-hover/bar:scale-100 transition-all duration-300 origin-bottom bg-gray-900 text-white text-[10px] font-black py-1.5 px-3 rounded-xl z-20 whitespace-nowrap">
                                            {value} RECORDS
                                        </div>
                                        <div className="flex-1 w-full flex items-end justify-center pb-4">
                                            <div
                                                style={{ height: `${heightPC}%` }}
                                                className={`w-full max-w-[48px] ${colors[idx % colors.length]} rounded-t-3xl transition-all duration-1000 group-hover/bar:brightness-125 group-hover/bar:shadow-2xl relative overflow-hidden`}
                                            >
                                                <div className="absolute inset-0 bg-white/20 -translate-y-full group-hover/bar:translate-y-full transition-transform duration-[1500ms]"></div>
                                            </div>
                                        </div>
                                        <div className="h-10 flex items-center justify-center">
                                            <p className="text-[10px] font-black text-gray-400 uppercase vertical-text group-hover/bar:text-gray-900 transition-colors">
                                                {labels[key] || key.substring(0, 3)}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Progress Ledger Card */}
                <div className="bg-white p-6 xs:p-8 sm:p-10 md:p-12 rounded-[2rem] xs:rounded-[2.5rem] md:rounded-[3.5rem] shadow-xl xs:shadow-2xl shadow-gray-100/50 border border-gray-50 flex flex-col gap-6 xs:gap-8 md:gap-10">
                    <div className="space-y-0.5 xs:space-y-1">
                        <h3 className="text-lg xs:text-xl md:text-2xl font-black text-gray-900 uppercase tracking-tighter">Operational Distribution</h3>
                        <p className="text-[8px] xs:text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mt-0.5 xs:mt-1">Registry Saturation Metrics</p>
                    </div>

                    <div className="space-y-6 xs:space-y-8 flex-1 flex flex-col justify-center">
                        {cardData.map((item, i) => (
                            <div key={i} className="space-y-2 xs:space-y-3 group">
                                <div className="flex justify-between items-end gap-2">
                                    <div className="flex items-center gap-2 xs:gap-3 min-w-0">
                                        <div className={`w-2 h-2 xs:w-3 xs:h-3 rounded-full shrink-0 ${item.theme === 'indigo' ? 'bg-indigo-600' : item.theme === 'emerald' ? 'bg-emerald-600' : item.theme === 'red' ? 'bg-red-600' : 'bg-amber-600'} group-hover:scale-150 transition-transform`}></div>
                                        <span className="text-[10px] xs:text-xs font-black text-gray-600 uppercase tracking-wider xs:tracking-widest truncate">{item.label}</span>
                                    </div>
                                    <span className="text-base xs:text-lg font-black text-gray-900 tracking-tighter shrink-0">{item.val}</span>
                                </div>
                                <div className="h-2.5 xs:h-3 sm:h-4 bg-gray-50 rounded-full overflow-hidden border border-gray-100 p-0.5">
                                    <div
                                        className={`h-full rounded-full transition-all duration-1000 ${i === 0 ? 'bg-indigo-600' : i === 1 ? 'bg-emerald-600' : i === 2 ? 'bg-red-600' : 'bg-amber-600'
                                            }`}
                                        style={{ width: `${(item.val / Math.max(stats.totalUsers, 1)) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="pt-4 xs:pt-6 md:pt-8 border-t border-gray-50 flex flex-col xs:flex-row justify-between items-start xs:items-center gap-2 xs:gap-0 text-[7px] xs:text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest">
                        <span className="truncate">Sync: {new Date().toLocaleTimeString()}</span>
                        <span className="text-red-600 shrink-0">Region: Pakistan/LHR</span>
                    </div>
                </div>
            </div>

            <style>{`
                .vertical-text {
                    writing-mode: horizontal-tb;
                    letter-spacing: 0.1em;
                }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
};

export default Dashboard;
