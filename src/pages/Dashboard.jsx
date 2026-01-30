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
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="text-center">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-red-100 rounded-full mx-auto"></div>
                        <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin absolute top-0 left-1/2 -translate-x-1/2"></div>
                    </div>
                    <p className="mt-4 text-sm font-medium text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-white rounded-3xl border-2 border-red-100 shadow-2xl p-10 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mb-3">Error Loading Dashboard</h2>
                    <p className="text-gray-600 font-medium mb-8">{error}</p>
                    <button
                        onClick={fetchDashboardData}
                        className="px-8 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl hover:from-red-700 hover:to-rose-700 transition-all duration-300 font-bold shadow-lg active:scale-95"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const cardData = [
        { label: 'Total Users', val: stats?.totalUsers || 0, theme: 'blue', icon: (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>, target: '/users' },
        { label: 'Properties', val: stats?.totalProperties || 0, theme: 'purple', icon: (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>, target: '/property/all' },
        { label: 'Loan Plans', val: stats?.totalLoanPlans || 0, theme: 'indigo', icon: (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>, target: '/loan/all' },
        { label: 'Applications', val: stats?.totalApplications || 0, theme: 'green', icon: (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>, target: '/notifications' },
        { label: 'Installments', val: stats?.totalInstallmentPlans || 0, theme: 'red', icon: (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>, target: '/installments/all' },
        { label: 'Market Offers', val: stats?.totalOffers || 0, theme: 'yellow', icon: (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>, target: '/banner/all' },
        { label: 'Commission Rules', val: stats?.totalCommissionRules || 0, theme: 'emerald', icon: (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, target: '/commission/all' },
        { label: 'Active Cases', val: stats?.totalCases || 0, theme: 'teal', icon: (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>, target: '/cases/all' },
        { label: 'Unverified Partners', val: stats?.unverifiedPartners || 0, theme: 'orange', icon: (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>, target: '/partners' },
    ];

    const getThemeColors = (theme) => {
        const themes = {
            blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
            purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100' },
            indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100' },
            green: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-100' },
            red: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100' },
            yellow: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' },
            orange: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100' },
            emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
            teal: { bg: 'bg-teal-50', text: 'text-teal-600', border: 'border-teal-100' }
        };
        return themes[theme] || themes.blue;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
            <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-4 xs:py-6 sm:py-8 space-y-4 sm:space-y-6">
                {/* Modern Header - v2.0.5 */}
                <div className="relative overflow-hidden bg-gradient-to-r from-red-600 via-red-500 to-rose-600 rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-40 h-40 bg-white opacity-5 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-40 h-40 bg-white opacity-5 rounded-full blur-3xl"></div>
                    
                    <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                                    <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <div className="min-w-0">
                                    <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight truncate">Dashboard</h1>
                                    <p className="text-red-100 text-xs sm:text-sm font-medium mt-0.5">Welcome back, here's your overview • v2.0.5</p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={fetchDashboardData}
                            disabled={loading}
                            className="px-4 sm:px-6 py-2 sm:py-3 bg-white/10 backdrop-blur-sm text-white rounded-lg sm:rounded-xl hover:bg-white/20 transition-all duration-300 disabled:opacity-50 flex items-center gap-2 font-bold active:scale-95 text-sm sm:text-base flex-shrink-0"
                        >
                            <svg className={`w-4 h-4 sm:w-5 sm:h-5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span className="hidden xs:inline">Refresh</span>
                        </button>
                    </div>
                </div>

                {/* Modern Stats Cards - v2.0.5 */}
                <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {cardData.map((card, idx) => {
                        const colors = getThemeColors(card.theme);
                        const gradients = {
                            blue: 'from-blue-500 to-blue-600',
                            purple: 'from-purple-500 to-purple-600',
                            indigo: 'from-indigo-500 to-indigo-600',
                            green: 'from-green-500 to-green-600',
                            red: 'from-red-500 to-red-600',
                            yellow: 'from-amber-500 to-amber-600',
                            orange: 'from-orange-500 to-orange-600'
                        };
                        return (
                            <Link
                                key={idx}
                                to={card.target}
                                className="group bg-white rounded-xl sm:rounded-2xl border-2 border-gray-100 hover:border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-300 p-4 sm:p-6 hover:-translate-y-1"
                            >
                                <div className="flex items-start justify-between mb-4 sm:mb-6">
                                    <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${gradients[card.theme]} rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
                                        {card.icon({ className: `w-6 h-6 sm:w-7 sm:h-7 text-white` })}
                                    </div>
                                </div>
                                <div className="min-w-0">
                                    <p className="text-3xl sm:text-4xl font-black text-gray-900 mb-1 sm:mb-2 truncate">{card.val}</p>
                                    <p className="text-xs sm:text-sm font-bold text-gray-500 uppercase tracking-wider line-clamp-2">{card.label}</p>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* Modern Charts Section - v2.0.5 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {/* Bar Chart */}
                    <div className="bg-white rounded-xl sm:rounded-2xl border-2 border-gray-100 shadow-lg p-4 sm:p-6 lg:p-8">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900">Overview</h3>
                                <p className="text-sm font-medium text-gray-500 mt-1">System statistics</p>
                            </div>
                        </div>

                        <div className="relative h-64 flex items-end justify-between gap-4">
                            {Object.entries(stats || {}).map(([key, value], idx) => {
                                const maxValue = Math.max(...Object.values(stats || {}), 10);
                                const labels = { totalUsers: 'Users', totalApplications: 'Apps', totalInstallmentPlans: 'Plans', totalOffers: 'Offers' };
                                const heightPC = (value / maxValue) * 100;
                                const colors = ['bg-blue-500', 'bg-green-500', 'bg-red-500', 'bg-amber-500'];
                                return (
                                    <div key={idx} className="flex-1 flex flex-col items-center">
                                        <div className="w-full flex items-end justify-center mb-3 h-48">
                                            <div
                                                style={{ height: `${heightPC}%` }}
                                                className={`w-full ${colors[idx % colors.length]} rounded-t-lg hover:opacity-80 transition-opacity relative group`}
                                            >
                                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                    {value}
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-600 font-medium">
                                            {labels[key] || key}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Progress Bars */}
                    <div className="bg-white rounded-xl sm:rounded-2xl border-2 border-gray-100 shadow-lg p-4 sm:p-6 lg:p-8">
                        <div className="mb-8">
                            <h3 className="text-2xl font-black text-gray-900">Distribution</h3>
                            <p className="text-sm font-medium text-gray-500 mt-1">Resource breakdown</p>
                        </div>

                        <div className="space-y-6">
                            {cardData.map((item, i) => {
                                const colors = getThemeColors(item.theme);
                                return (
                                    <div key={i}>
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">{item.label}</span>
                                            <span className="text-lg font-black text-gray-900">{item.val}</span>
                                        </div>
                                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${colors.bg.replace('50', '500')}`}
                                                style={{ width: `${(item.val / Math.max(stats.totalUsers, 1)) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-8 pt-6 border-t-2 border-gray-100 flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-500">Last updated: {new Date().toLocaleTimeString()}</span>
                            <span className="px-3 py-1 bg-green-100 text-green-700 font-bold text-xs rounded-full uppercase tracking-wider">Live</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
