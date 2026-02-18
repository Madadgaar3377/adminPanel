import React, { useState, useEffect } from 'react';
import ApiBaseUrl from '../constants/apiUrl';
import RichTextEditor from '../compontents/RichTextEditor';

const BulkEmail = () => {
    const [loading, setLoading] = useState(false);
    const [fetchingStats, setFetchingStats] = useState(true);
    const [stats, setStats] = useState(null);
    const [toast, setToast] = useState(null);
    
    const [form, setForm] = useState({
        subject: '',
        message: '',
        emailType: 'general',
        targetAudience: 'all',
        includeHtml: true
    });

    useEffect(() => {
        fetchEmailStats();
    }, []);

    const fetchEmailStats = async () => {
        setFetchingStats(true);
        try {
            const authData = JSON.parse(localStorage.getItem('adminAuth'));
            const res = await fetch(`${ApiBaseUrl}/getEmailStats`, {
                headers: {
                    'Authorization': `Bearer ${authData.token}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await res.json();
            if (data.success) {
                setStats(data.data);
            }
        } catch (err) {
            console.error('Error fetching stats:', err);
        } finally {
            setFetchingStats(false);
        }
    };

    const showToast = (message, type) => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 5000);
    };

    const updateForm = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Validation
        if (!form.subject || !form.subject.trim()) {
            showToast('Subject is required', 'error');
            setLoading(false);
            return;
        }

        if (!form.message || !form.message.trim()) {
            showToast('Message is required', 'error');
            setLoading(false);
            return;
        }

        // Check if message has actual content
        const textContent = form.message.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
        if (textContent.length === 0) {
            showToast('Message must contain actual text, not just HTML tags', 'error');
            setLoading(false);
            return;
        }

        try {
            const authData = JSON.parse(localStorage.getItem('adminAuth'));
            const res = await fetch(`${ApiBaseUrl}/sendBulkEmail`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authData.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    subject: form.subject.trim(),
                    message: form.message.trim(),
                    emailType: form.emailType,
                    targetAudience: form.targetAudience,
                    includeHtml: form.includeHtml
                })
            });

            const data = await res.json();
            if (data.success) {
                showToast(
                    `✓ Email sent successfully! ${data.data.sent} emails sent, ${data.data.failed} failed.`,
                    'success'
                );
                // Reset form
                setForm({
                    subject: '',
                    message: '',
                    emailType: 'general',
                    targetAudience: 'all',
                    includeHtml: true
                });
            } else {
                showToast(data.message || 'Failed to send bulk email', 'error');
            }
        } catch (err) {
            console.error('Error sending bulk email:', err);
            showToast('Network error. Please check your connection and try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 pb-20">
            <div className="max-w-5xl mx-auto p-6 space-y-8">
                {/* Header */}
                <div className="relative overflow-hidden bg-gradient-to-r from-red-600 via-red-500 to-rose-600 rounded-3xl shadow-2xl p-8">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-40 h-40 bg-white opacity-5 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-40 h-40 bg-white opacity-5 rounded-full blur-3xl"></div>
                    
                    <div className="relative">
                        <h1 className="text-3xl font-black text-white tracking-tight mb-2">
                            Send Bulk Email / Notification
                        </h1>
                        <p className="text-red-100 text-sm font-medium">
                            Send offers, notifications, or announcements to all users
                        </p>
                    </div>
                </div>

                {/* Email Statistics */}
                {stats && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Email Statistics</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="text-sm text-gray-600 mb-1">Total Users</div>
                                <div className="text-2xl font-bold text-gray-900">{stats.total || 0}</div>
                            </div>
                            <div className="bg-blue-50 rounded-lg p-4">
                                <div className="text-sm text-blue-600 mb-1">Verified Users</div>
                                <div className="text-2xl font-bold text-blue-600">{stats.verified || 0}</div>
                            </div>
                            <div className="bg-yellow-50 rounded-lg p-4">
                                <div className="text-sm text-yellow-600 mb-1">Unverified Users</div>
                                <div className="text-2xl font-bold text-yellow-600">{stats.unverified || 0}</div>
                            </div>
                            <div className="bg-green-50 rounded-lg p-4">
                                <div className="text-sm text-green-600 mb-1">With Email</div>
                                <div className="text-2xl font-bold text-green-600">{stats.withEmail || 0}</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Email Form */}
                <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl border border-gray-50 overflow-hidden">
                    <div className="p-10 space-y-8">
                        {/* Email Type & Audience */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Email Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={form.emailType}
                                    onChange={(e) => updateForm('emailType', e.target.value)}
                                    className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-2xl text-sm font-bold transition-all outline-none focus:border-red-600 focus:bg-white"
                                >
                                    <option value="general">General Notification</option>
                                    <option value="offer">Special Offer</option>
                                    <option value="property">Property Update</option>
                                    <option value="notification">System Notification</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Target Audience <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={form.targetAudience}
                                    onChange={(e) => updateForm('targetAudience', e.target.value)}
                                    className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-2xl text-sm font-bold transition-all outline-none focus:border-red-600 focus:bg-white"
                                >
                                    <option value="all">All Users ({stats?.total || 0})</option>
                                    <option value="verified">Verified Users Only ({stats?.verified || 0})</option>
                                    <option value="unverified">Unverified Users Only ({stats?.unverified || 0})</option>
                                </select>
                            </div>
                        </div>

                        {/* Subject */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Subject <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={form.subject}
                                onChange={(e) => updateForm('subject', e.target.value)}
                                placeholder="Enter email subject..."
                                required
                                className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-2xl text-sm font-bold transition-all outline-none focus:border-red-600 focus:bg-white"
                            />
                        </div>

                        {/* Message */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Message <span className="text-red-500">*</span>
                            </label>
                            <RichTextEditor
                                value={form.message}
                                onChange={(value) => updateForm('message', value)}
                                placeholder="Write your email message here..."
                            />
                        </div>

                        {/* Options */}
                        <div className="bg-gray-50 rounded-xl p-6">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={form.includeHtml}
                                    onChange={(e) => updateForm('includeHtml', e.target.checked)}
                                    className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
                                />
                                <span className="text-sm font-bold text-gray-700">Send as HTML email (recommended)</span>
                            </label>
                            <p className="text-xs text-gray-500 mt-2 ml-8">
                                If unchecked, email will be sent as plain text only
                            </p>
                        </div>

                        {/* Warning */}
                        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                                <svg className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <div>
                                    <p className="text-sm font-semibold text-yellow-800 mb-1">Important Notice</p>
                                    <p className="text-xs text-yellow-700">
                                        This will send emails to all selected users. Make sure your message is correct before sending. 
                                        Large batches may take several minutes to complete.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-8 bg-gray-50/50 border-t border-gray-100 flex justify-end items-center gap-4">
                        <button
                            type="button"
                            onClick={() => {
                                setForm({
                                    subject: '',
                                    message: '',
                                    emailType: 'general',
                                    targetAudience: 'all',
                                    includeHtml: true
                                });
                            }}
                            className="px-10 py-4 font-black uppercase text-[10px] tracking-widest text-gray-400 hover:text-gray-900 transition-all"
                        >
                            Reset
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-12 py-4 bg-red-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] hover:bg-red-700 shadow-xl shadow-red-100 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Sending...' : 'Send Email'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Toast Notification */}
            {toast && (
                <div className={`fixed top-20 right-6 z-[9999] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-top-4 duration-300 min-w-[320px] max-w-md ${
                    toast.type === 'success' 
                        ? 'bg-gradient-to-r from-emerald-500 to-green-600 border-2 border-emerald-400 text-white' 
                        : 'bg-gradient-to-r from-red-500 to-rose-600 border-2 border-red-400 text-white'
                }`}>
                    <div className="flex-shrink-0">
                        {toast.type === 'success' ? (
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        ) : (
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                        )}
                    </div>
                    <div className="flex-1">
                        <p className="font-bold text-sm leading-relaxed">{toast.message}</p>
                    </div>
                    <button 
                        onClick={() => setToast(null)} 
                        className="flex-shrink-0 w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded-lg transition-all active:scale-95"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}
        </div>
    );
};

export default BulkEmail;
