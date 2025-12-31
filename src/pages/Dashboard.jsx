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
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-gray-200 border-t-red-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-sm text-gray-500">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-lg border border-red-200 shadow-sm text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h2>
                <p className="text-sm text-gray-600 mb-6">{error}</p>
                <button
                    onClick={fetchDashboardData}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                >
                    Retry
                </button>
            </div>
        );
    }

    const cardData = [
        { label: 'Total Users', val: stats?.totalUsers || 0, theme: 'blue', icon: (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>, target: '/users' },
        { label: 'Applications', val: stats?.totalApplications || 0, theme: 'green', icon: (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>, target: '/notifications' },
        { label: 'Installments', val: stats?.totalInstallmentPlans || 0, theme: 'red', icon: (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>, target: '/installments/all' },
        { label: 'Market Offers', val: stats?.totalOffers || 0, theme: 'yellow', icon: (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>, target: '/banner/all' },
    ];

    const getThemeColors = (theme) => {
        const themes = {
            blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
            green: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-100' },
            red: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100' },
            yellow: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' }
        };
        return themes[theme] || themes.blue;
    };

    return (
        <div className="p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                        <p className="text-sm text-gray-500 mt-1">Welcome back, here's your overview</p>
                    </div>
                    <button
                        onClick={fetchDashboardData}
                        disabled={loading}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center gap-2 text-sm font-medium"
                    >
                        <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {cardData.map((card, idx) => {
                        const colors = getThemeColors(card.theme);
                        return (
                            <Link
                                key={idx}
                                to={card.target}
                                className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center`}>
                                        {card.icon({ className: `w-6 h-6 ${colors.text}` })}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-gray-900 mb-1">{card.val}</p>
                                    <p className="text-sm text-gray-600">{card.label}</p>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Bar Chart */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Overview</h3>
                                <p className="text-sm text-gray-500 mt-0.5">System statistics</p>
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
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">Distribution</h3>
                            <p className="text-sm text-gray-500 mt-0.5">Resource breakdown</p>
                        </div>

                        <div className="space-y-6">
                            {cardData.map((item, i) => {
                                const colors = getThemeColors(item.theme);
                                return (
                                    <div key={i}>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium text-gray-700">{item.label}</span>
                                            <span className="text-sm font-semibold text-gray-900">{item.val}</span>
                                        </div>
                                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${colors.bg.replace('50', '500')}`}
                                                style={{ width: `${(item.val / Math.max(stats.totalUsers, 1)) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
                            <span>Last updated: {new Date().toLocaleTimeString()}</span>
                            <span className="text-red-600 font-medium">Live</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
