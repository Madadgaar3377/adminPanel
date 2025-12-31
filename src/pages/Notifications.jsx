import React, { useState, useEffect } from 'react';
import ApiBaseUrl from '../constants/apiUrl';
import Pagination from '../compontents/Pagination';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        setLoading(true);
        setError(null);
        try {
            const authData = JSON.parse(localStorage.getItem('adminAuth'));
            const res = await fetch(`${ApiBaseUrl}/getAllNotifaction`, {
                headers: {
                    'Authorization': `Bearer ${authData.token}`,
                }
            });
            const data = await res.json();
            if (data.success) {
                setNotifications(data.data || []);
            } else {
                setError(data.message || 'Failed to fetch notifications');
            }
        } catch (err) {
            setError("Network error: Unable to fetch notifications.");
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (notificationId) => {
        try {
            const authData = JSON.parse(localStorage.getItem('adminAuth'));
            const res = await fetch(`${ApiBaseUrl}/readNotification`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authData.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ notificationId })
            });
            const data = await res.json();
            if (data.success) {
                // Update local state
                setNotifications(notifications.map(n => 
                    n._id === notificationId ? { ...n, notificationStatus: 'read' } : n
                ));
            }
        } catch (err) {
            console.error('Error marking notification as read:', err);
        }
    };

    // Filter notifications
    const filtered = notifications.filter(notification => {
        const matchesSearch = 
            notification.notificationMessage?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            notification.notificationType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            notification.userId?.includes(searchTerm);
        
        const matchesStatus = 
            filterStatus === 'all' || 
            notification.notificationStatus === filterStatus;
        
        return matchesSearch && matchesStatus;
    });

    // Pagination
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedNotifications = filtered.slice(startIndex, endIndex);

    // Reset to page 1 when search or filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterStatus]);

    const getNotificationIcon = (type) => {
        switch (type?.toLowerCase()) {
            case 'property':
                return (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                );
            case 'loan':
                return (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                );
            case 'user':
                return (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                );
            case 'installment':
                return (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                );
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
        });
    };

    const unreadCount = notifications.filter(n => n.notificationStatus === 'unread').length;

    if (loading && notifications.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-gray-200 border-t-red-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-sm text-gray-500">Loading notifications...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                                {unreadCount > 0 && (
                                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                                        {unreadCount} New
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-gray-500 mt-1">All system notifications and alerts</p>
                        </div>
                        <button
                            onClick={fetchNotifications}
                            disabled={loading}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search notifications..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                                />
                                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div>
                            <div className="flex gap-2">
                                {['all', 'unread', 'read'].map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => setFilterStatus(status)}
                                        className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors capitalize ${
                                            filterStatus === status
                                                ? 'bg-red-600 text-white'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center text-sm text-gray-500">
                            {filtered.length} of {notifications.length}
                        </div>
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

                {/* Notifications List */}
                {filtered.length > 0 ? (
                    <>
                    <div className="space-y-3">
                        {paginatedNotifications.map((notification) => (
                            <div
                                key={notification._id}
                                className={`bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow overflow-hidden ${
                                    notification.notificationStatus === 'unread'
                                        ? 'border-red-200 bg-red-50/30'
                                        : 'border-gray-200'
                                }`}
                            >
                                <div className="p-5">
                                    <div className="flex gap-4">
                                        {/* Icon */}
                                        <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                                            notification.notificationStatus === 'unread'
                                                ? 'bg-red-100 text-red-600'
                                                : 'bg-gray-100 text-gray-600'
                                        }`}>
                                            {getNotificationIcon(notification.notificationType)}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-medium capitalize">
                                                            {notification.notificationType || 'General'}
                                                        </span>
                                                        {notification.notificationStatus === 'unread' && (
                                                            <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm font-medium text-gray-900 mb-1">
                                                        {notification.notificationMessage || 'No message'}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        User ID: {notification.userId || 'System'} • {formatDate(notification.notificationTime || notification.createdAt)}
                                                    </p>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex gap-2">
                                                    {notification.notificationLink && (
                                                        <a
                                                            href={notification.notificationLink}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="View Link"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                            </svg>
                                                        </a>
                                                    )}
                                                    {notification.notificationStatus === 'unread' && (
                                                        <button
                                                            onClick={() => handleMarkAsRead(notification._id)}
                                                            className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        >
                                                            Mark as Read
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Image if available */}
                                            {notification.notificationImage && (
                                                <div className="mt-3">
                                                    <img
                                                        src={notification.notificationImage}
                                                        alt="Notification"
                                                        className="max-w-xs h-32 object-cover rounded-lg border border-gray-200"
                                                    />
                                                </div>
                                            )}

                                            {/* Additional Data */}
                                            {notification.notificationData && Object.keys(notification.notificationData).length > 0 && (
                                                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                                    <p className="text-xs font-semibold text-gray-600 mb-2">Additional Details:</p>
                                                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                                                        {Object.entries(notification.notificationData).map(([key, value]) => (
                                                            <div key={key}>
                                                                <span className="font-medium capitalize">{key}:</span>{' '}
                                                                <span>{typeof value === 'object' ? JSON.stringify(value) : value}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
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
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Notifications</h3>
                        <p className="text-sm text-gray-500">
                            {searchTerm || filterStatus !== 'all'
                                ? 'No notifications match your filters'
                                : 'You have no notifications at this time'
                            }
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;

