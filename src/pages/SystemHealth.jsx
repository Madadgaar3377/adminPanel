import React, { useState, useEffect, useCallback, useRef } from 'react';
import ApiBaseUrl from '../constants/apiUrl';

const SystemHealth = () => {
    const [healthData, setHealthData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [refreshInterval, setRefreshInterval] = useState(null);
    const [loginActivity, setLoginActivity] = useState({ list: [], mapPoints: [] });
    const [loginActivityLoading, setLoginActivityLoading] = useState(false);
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);

    const fetchHealthData = useCallback(async () => {
        try {
            const response = await fetch(`${ApiBaseUrl}/health`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const result = await response.json();
            if (result.success) {
                setHealthData(result);
                setError('');
            } else {
                setError(result.message || 'Failed to fetch health data');
            }
        } catch (err) {
            setError('Failed to connect to the server');
            console.error('Health check error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchLoginActivity = useCallback(async () => {
        setLoginActivityLoading(true);
        try {
            const authData = JSON.parse(localStorage.getItem('adminAuth') || '{}');
            const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
            const res = await fetch(`${ApiBaseUrl}/admin/system/login-activity?since=${encodeURIComponent(since)}&limit=200`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authData.token || ''}`,
                },
            });
            const data = await res.json();
            if (data.success && data.list) {
                setLoginActivity({ list: data.list, mapPoints: data.mapPoints || [] });
            }
        } catch (err) {
            console.error('Login activity fetch error:', err);
        } finally {
            setLoginActivityLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchHealthData();
        fetchLoginActivity();
        
        if (autoRefresh) {
            const interval = setInterval(() => {
                fetchHealthData();
            }, 5000); // Refresh every 5 seconds
            setRefreshInterval(interval);
            
            return () => clearInterval(interval);
        } else if (refreshInterval) {
            clearInterval(refreshInterval);
        }
    }, [autoRefresh, fetchHealthData, fetchLoginActivity]);

    const formatUptime = (seconds) => {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        if (days > 0) return `${days}d ${hours}h ${minutes}m`;
        if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
        if (minutes > 0) return `${minutes}m ${secs}s`;
        return `${secs}s`;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'healthy':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'warning':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'error':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getMemoryUsageColor = (percent) => {
        if (percent >= 90) return 'text-red-600';
        if (percent >= 70) return 'text-yellow-600';
        return 'text-green-600';
    };

    // Leaflet map for login activity (repeated areas)
    useEffect(() => {
        const points = loginActivity.mapPoints || [];
        if (!window.L || !mapRef.current || points.length === 0) return;
        if (mapInstanceRef.current) {
            mapInstanceRef.current.remove();
            mapInstanceRef.current = null;
        }
        const L = window.L;
        const map = L.map(mapRef.current).setView([31.5204, 74.3587], 5);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);
        const maxCount = Math.max(...points.map((p) => p.count), 1);
        points.forEach((p) => {
            const radius = 8 + Math.min(22, (p.count / maxCount) * 22);
            const circle = L.circleMarker([p.lat, p.lon], {
                radius,
                fillColor: '#dc2626',
                color: '#b91c1c',
                weight: 1,
                opacity: 1,
                fillOpacity: 0.6,
            });
            circle.bindPopup(
                `<strong>${p.ip}</strong><br/>${p.address || 'Unknown'}<br/>Logins: ${p.count}<br/>Madadgaar: ${p.sources?.madadgaar || 0} | Agent: ${p.sources?.agent || 0} | Partner: ${p.sources?.partner || 0} | Admin: ${p.sources?.admin || 0}`
            );
            circle.addTo(map);
        });
        mapInstanceRef.current = map;
        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [loginActivity.mapPoints]);

    if (loading && !healthData) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="text-center">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto"></div>
                    </div>
                    <p className="mt-4 text-gray-600 font-medium">Loading system health...</p>
                </div>
            </div>
        );
    }

    if (error && !healthData) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                    <div className="text-red-600 text-lg font-semibold mb-2">Error Loading Health Data</div>
                    <p className="text-red-700">{error}</p>
                    <button
                        onClick={fetchHealthData}
                        className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const { server, requests, performance, status, timestamp } = healthData || {};
    const memoryPercent = server?.memory?.used?.percent ? parseFloat(server.memory.used.percent) : 0;

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">System Health</h1>
                    <p className="text-gray-600 mt-1">Monitor server performance and resource usage</p>
                </div>
                <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={autoRefresh}
                            onChange={(e) => setAutoRefresh(e.target.checked)}
                            className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                        />
                        <span className="text-sm text-gray-700">Auto-refresh (5s)</span>
                    </label>
                    <button
                        onClick={fetchHealthData}
                        disabled={loading}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh
                    </button>
                </div>
            </div>

            {/* Status Badge */}
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${getStatusColor(status)}`}>
                <div className={`w-2 h-2 rounded-full ${status === 'healthy' ? 'bg-green-500' : status === 'error' ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                <span className="font-semibold capitalize">{status || 'Unknown'}</span>
                {timestamp && (
                    <span className="text-xs opacity-75 ml-2">
                        Last updated: {new Date(timestamp).toLocaleTimeString()}
                    </span>
                )}
            </div>

            {/* System Information Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Server Info */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Server</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Platform:</span>
                            <span className="font-medium">{server?.platform || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Architecture:</span>
                            <span className="font-medium">{server?.arch || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Hostname:</span>
                            <span className="font-medium">{server?.hostname || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Node Version:</span>
                            <span className="font-medium">{server?.nodeVersion || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Process ID:</span>
                            <span className="font-medium">{server?.processId || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Uptime:</span>
                            <span className="font-medium">{server?.uptime ? formatUptime(server.uptime.seconds) : 'N/A'}</span>
                        </div>
                    </div>
                </div>

                {/* CPU Info */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">CPU</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Model:</span>
                            <span className="font-medium text-xs">{server?.cpu?.model || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Cores:</span>
                            <span className="font-medium">{server?.cpu?.cores || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Threads:</span>
                            <span className="font-medium">{server?.cpu?.threads || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Usage:</span>
                            <span className="font-medium">{server?.cpu?.usage || 'N/A'}</span>
                        </div>
                    </div>
                </div>

                {/* Memory Info */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Memory</h3>
                    </div>
                    <div className="space-y-3">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">Usage</span>
                                <span className={`font-semibold ${getMemoryUsageColor(memoryPercent)}`}>
                                    {server?.memory?.used?.percent || '0%'}
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full ${
                                        memoryPercent >= 90 ? 'bg-red-500' :
                                        memoryPercent >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                                    }`}
                                    style={{ width: `${memoryPercent}%` }}
                                ></div>
                            </div>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Total:</span>
                                <span className="font-medium">{server?.memory?.total?.formatted || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Used:</span>
                                <span className="font-medium">{server?.memory?.used?.formatted || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Free:</span>
                                <span className="font-medium">{server?.memory?.free?.formatted || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Request Statistics */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Request Statistics</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-sm text-gray-600 mb-1">Total Requests</div>
                        <div className="text-2xl font-bold text-gray-900">{requests?.total || 0}</div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                        <div className="text-sm text-blue-600 mb-1">Active Requests</div>
                        <div className="text-2xl font-bold text-blue-600">{requests?.active || 0}</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                        <div className="text-sm text-green-600 mb-1">Requests/sec</div>
                        <div className="text-2xl font-bold text-green-600">{performance?.requestsPerSecond || '0'}</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                        <div className="text-sm text-purple-600 mb-1">Avg Response Time</div>
                        <div className="text-2xl font-bold text-purple-600">{performance?.avgResponseTime || '0ms'}</div>
                    </div>
                </div>

                {/* Requests by Method */}
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Requests by Method</h3>
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                        {requests?.byMethod && Object.entries(requests.byMethod).map(([method, count]) => (
                            <div key={method} className="bg-gray-50 rounded-lg p-3 text-center">
                                <div className="text-xs text-gray-600 mb-1">{method}</div>
                                <div className="text-lg font-bold text-gray-900">{count}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Endpoints */}
                {requests?.topEndpoints && requests.topEndpoints.length > 0 && (
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Top 10 Endpoints</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        <th className="text-left p-3 font-semibold text-gray-700">Endpoint</th>
                                        <th className="text-left p-3 font-semibold text-gray-700">Method</th>
                                        <th className="text-right p-3 font-semibold text-gray-700">Requests</th>
                                        <th className="text-right p-3 font-semibold text-gray-700">Avg Response</th>
                                        <th className="text-left p-3 font-semibold text-gray-700">Last Accessed</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {requests.topEndpoints.map((endpoint, idx) => (
                                        <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="p-3 text-gray-900 font-medium">{endpoint.path}</td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                    endpoint.method === 'GET' ? 'bg-blue-100 text-blue-700' :
                                                    endpoint.method === 'POST' ? 'bg-green-100 text-green-700' :
                                                    endpoint.method === 'PUT' ? 'bg-yellow-100 text-yellow-700' :
                                                    endpoint.method === 'DELETE' ? 'bg-red-100 text-red-700' :
                                                    'bg-gray-100 text-gray-700'
                                                }`}>
                                                    {endpoint.method}
                                                </span>
                                            </td>
                                            <td className="p-3 text-right font-semibold text-gray-900">{endpoint.totalRequests}</td>
                                            <td className="p-3 text-right text-gray-700">{endpoint.avgResponseTime}</td>
                                            <td className="p-3 text-gray-600 text-xs">
                                                {endpoint.lastAccessed ? new Date(endpoint.lastAccessed).toLocaleString() : 'N/A'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Process Memory */}
            {server?.memory?.process && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Process Memory</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="text-sm text-gray-600 mb-1">RSS</div>
                            <div className="text-lg font-bold text-gray-900">{server.memory.process.rss?.formatted || 'N/A'}</div>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-4">
                            <div className="text-sm text-blue-600 mb-1">Heap Total</div>
                            <div className="text-lg font-bold text-blue-600">{server.memory.process.heapTotal?.formatted || 'N/A'}</div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4">
                            <div className="text-sm text-green-600 mb-1">Heap Used</div>
                            <div className="text-lg font-bold text-green-600">{server.memory.process.heapUsed?.formatted || 'N/A'}</div>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-4">
                            <div className="text-sm text-purple-600 mb-1">External</div>
                            <div className="text-lg font-bold text-purple-600">{server.memory.process.external?.formatted || 'N/A'}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Login Activity & IP Map */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Login Activity & IP Locations</h2>
                    <button
                        onClick={fetchLoginActivity}
                        disabled={loginActivityLoading}
                        className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                    >
                        {loginActivityLoading ? 'Loading...' : 'Refresh'}
                    </button>
                </div>
                <p className="text-sm text-gray-500 mb-4">IP addresses stored on login (Madadgaar, Agent, Partner, Admin). Map shows areas with more repeated logins.</p>

                {loginActivity.list.length > 0 ? (
                    <>
                        <div className="overflow-x-auto mb-6">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        <th className="text-left p-3 font-semibold text-gray-700">IP</th>
                                        <th className="text-left p-3 font-semibold text-gray-700">Location</th>
                                        <th className="text-right p-3 font-semibold text-gray-700">Count</th>
                                        <th className="text-left p-3 font-semibold text-gray-700">Madadgaar / Agent / Partner / Admin</th>
                                        <th className="text-left p-3 font-semibold text-gray-700">Last seen</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loginActivity.list.map((row, idx) => (
                                        <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="p-3 font-mono text-gray-900">{row.ip}</td>
                                            <td className="p-3 text-gray-700">{row.address || '—'}</td>
                                            <td className="p-3 text-right font-semibold text-gray-900">{row.count}</td>
                                            <td className="p-3">
                                                <span className="text-blue-600">{row.sources?.madadgaar || 0}</span>
                                                <span className="text-gray-400 mx-1">/</span>
                                                <span className="text-amber-600">{row.sources?.agent || 0}</span>
                                                <span className="text-gray-400 mx-1">/</span>
                                                <span className="text-green-600">{row.sources?.partner || 0}</span>
                                                <span className="text-gray-400 mx-1">/</span>
                                                <span className="text-red-600">{row.sources?.admin || 0}</span>
                                            </td>
                                            <td className="p-3 text-gray-600">{row.lastSeen ? new Date(row.lastSeen).toLocaleString() : '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {loginActivity.mapPoints.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Map (repeated logins by area)</h3>
                                <div ref={mapRef} className="w-full h-[400px] rounded-xl border border-gray-200 bg-gray-100" />
                            </div>
                        )}
                    </>
                ) : (
                    <p className="text-gray-500 py-4">{loginActivityLoading ? 'Loading login activity...' : 'No login activity in the last 30 days.'}</p>
                )}
            </div>
        </div>
    );
};

export default SystemHealth;
