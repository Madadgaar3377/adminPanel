import React, { useState, useEffect } from 'react';
import ApiBaseUrl from '../constants/apiUrl';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchDashboardData = async () => {
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
            console.error('Dashboard fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    if (loading) {

        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="relative">
                    <div className="w-12 h-12 border-4 border-red-200 rounded-full"></div>
                    <div className="absolute top-0 left-0 w-12 h-12 border-4 border-red-600 rounded-full border-t-transparent animate-spin"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl my-6">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-red-700 font-medium">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    const cardData = [
        { title: 'Total Users', value: stats?.totalUsers || 0, icon: 'Users', color: 'bg-blue-500', lightColor: 'bg-blue-50', textColor: 'text-blue-600', href: '/users' },
        { title: 'Applications', value: stats?.totalApplications || 0, icon: 'FileText', color: 'bg-green-500', lightColor: 'bg-green-50', textColor: 'text-green-600', href: '/notifications' },
        { title: 'Installment Plans', value: stats?.totalInstallmentPlans || 0, icon: 'CreditCard', color: 'bg-red-500', lightColor: 'bg-red-50', textColor: 'text-red-600', href: '/installments/all' },
        { title: 'Total Offers', value: stats?.totalOffers || 0, icon: 'Zap', color: 'bg-purple-500', lightColor: 'bg-purple-50', textColor: 'text-purple-600', href: '/offers' },
    ];

    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Admin Insights</h1>
                    <p className="text-sm text-gray-500">Real-time overview of your platform's performance</p>
                </div>
                <button
                    onClick={fetchDashboardData}
                    className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-red-200 hover:text-red-600 transition-all shadow-sm"
                >
                    <svg className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Refresh Data</span>
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cardData.map((card, idx) => {
                    const CardWrapper = card.href ? Link : 'div';
                    return (
                        <CardWrapper key={idx} to={card.href} className={`bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-red-50 transition-all duration-300 group ${card.href ? 'cursor-pointer active:scale-95' : ''}`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{card.title}</p>
                                    <h3 className="text-3xl font-bold text-gray-900 group-hover:text-red-600 transition-colors">{card.value}</h3>
                                </div>
                                <div className={`w-12 h-12 ${card.lightColor} rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300`}>
                                    <div className={`w-6 h-6 ${card.textColor}`}>
                                        {/* Inline Icons since we don't have lucide */}
                                        {card.title === 'Total Users' && <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
                                        {card.title === 'Applications' && <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                                        {card.title === 'Installment Plans' && <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>}
                                        {card.title === 'Total Offers' && <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 flex items-center space-x-2">
                                <span className="text-xs font-medium text-green-500 flex items-center">
                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12 7l-2-2-2 2M10 5v10" clipRule="evenodd" /></svg>
                                    +12%
                                </span>
                                <span className="text-xs text-gray-400 font-medium">from last week</span>
                            </div>
                        </CardWrapper>
                    );
                })}
            </div>

            {/* Visual Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Custom Bar Chart Card */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Resource Statistics</h3>
                            <p className="text-sm text-gray-500">Overview of all system resources</p>
                        </div>
                        <button className="text-sm font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl transition-all">
                            Full Report
                        </button>
                    </div>

                    <div className="relative h-64 flex items-end space-x-6 justify-around pt-10 px-4">
                        {/* Vertical Grid Lines */}
                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-2">
                            {[1, 2, 3, 4].map((_, i) => (
                                <div key={i} className="w-full border-t border-gray-50 h-0 text-right">
                                    <span className="text-[10px] text-gray-300 -mt-2 absolute right-0"></span>
                                </div>
                            ))}
                        </div>

                        {/* Bars representing values */}
                        {Object.entries(stats).map(([key, value], idx) => {
                            const maxValue = Math.max(...Object.values(stats), 10);
                            const heightPercentage = (value / maxValue) * 100;
                            const labels = {
                                totalUsers: 'Users',
                                totalApplications: 'Apps',
                                totalInstallmentPlans: 'Plans',
                                totalOffers: 'Offers'
                            };
                            return (
                                <div key={idx} className="relative flex-1 group">
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-[10px] py-1 px-2 rounded-md z-10">
                                        {value}
                                    </div>
                                    <div
                                        style={{ height: `${heightPercentage}%` }}
                                        className={`w-full max-w-[40px] mx-auto rounded-t-xl transition-all duration-1000 ease-out animate-bar-grow relative overflow-hidden ${idx === 0 ? 'bg-indigo-500 shadow-indigo-100' :
                                            idx === 1 ? 'bg-purple-500 shadow-purple-100' :
                                                idx === 2 ? 'bg-red-500 shadow-red-100' : 'bg-emerald-500 shadow-emerald-100'
                                            } shadow-lg`}
                                    >
                                        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    </div>
                                    <p className="mt-4 text-[10px] font-bold text-gray-400 group-hover:text-gray-600 text-center uppercase tracking-tighter">
                                        {labels[key] || key}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Status List Card */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Recent Distribution</h3>
                    <div className="space-y-6">
                        {cardData.map((item, i) => (
                            <div key={i} className="flex items-center group">
                                <div className={`w-10 h-10 ${item.lightColor} rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform`}>
                                    <div className={`w-5 h-5 ${item.textColor}`}>
                                        {item.title === 'Total Users' && <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
                                        {item.title === 'Applications' && <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                                        {item.title === 'Installment Plans' && <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>}
                                        {item.title === 'Total Offers' && <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-semibold text-gray-700">{item.title}</span>
                                        <span className="text-sm font-bold text-gray-900">{item.value}</span>
                                    </div>
                                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${item.textColor.replace('text', 'bg')} rounded-full transition-all duration-1000`}
                                            style={{ width: `${(item.value / stats.totalUsers) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style sx>{`
                @keyframes bar-grow {
                    from { height: 0; }
                }
                .animate-bar-grow {
                    animation: bar-grow 1s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default Dashboard;
