import React, { useState } from 'react';
import ApiBaseUrl from '../constants/apiUrl';
import { useNavigate } from 'react-router-dom';

const UpdatePassword = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const [form, setForm] = useState({
        password: "",
        newPassword: "",
        confirmPassword: ""
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (form.newPassword !== form.confirmPassword) {
            setError("New passwords do not match.");
            return;
        }

        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            const authData = JSON.parse(localStorage.getItem('adminAuth'));
            if (!authData || !authData.user) {
                navigate('/login');
                return;
            }

            const res = await fetch(`${ApiBaseUrl}/updatePassword`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authData.token}`
                },
                body: JSON.stringify({
                    userId: authData.user.userId,
                    password: form.password,
                    newPassword: form.newPassword
                })
            });

            const result = await res.json();
            if (result.success) {
                setMessage("Security credentials updated successfully.");
                setForm({ password: "", newPassword: "", confirmPassword: "" });
                setTimeout(() => navigate('/profile'), 2000);
            } else {
                setError(result.message || "Update rejected by security protocol.");
            }
        } catch (err) {
            setError("Broadcast failure: Network layer error.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">Security Protocol</h1>
                    <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.3em] mt-1">Credential Override System</p>
                </div>
                <button
                    onClick={() => navigate('/profile')}
                    className="px-6 py-3 bg-gray-50 text-gray-400 hover:text-gray-900 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest"
                >
                    Abort
                </button>
            </div>

            {message && (
                <div className="p-4 bg-emerald-50 border-2 border-emerald-100 text-emerald-600 rounded-2xl font-black uppercase text-[10px] tracking-widest text-center animate-bounce">
                    {message}
                </div>
            )}
            {error && (
                <div className="p-4 bg-red-50 border-2 border-red-100 text-red-600 rounded-2xl font-black uppercase text-[10px] tracking-widest text-center">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white rounded-[3rem] p-12 border border-gray-100 shadow-xl space-y-8">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Current Access Key</label>
                        <input
                            required
                            type="password"
                            placeholder="CURRENT PASSWORD..."
                            value={form.password}
                            onChange={e => setForm({ ...form, password: e.target.value })}
                            className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-2xl text-sm font-bold outline-none transition-all shadow-inner"
                        />
                    </div>

                    <div className="h-px bg-gray-50 mx-4"></div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">New Access Key</label>
                        <input
                            required
                            type="password"
                            placeholder="NEW PASSWORD..."
                            value={form.newPassword}
                            onChange={e => setForm({ ...form, newPassword: e.target.value })}
                            className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-2xl text-sm font-bold outline-none transition-all shadow-inner"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Initialize Verification (Confirm)</label>
                        <input
                            required
                            type="password"
                            placeholder="RE-TYPE NEW PASSWORD..."
                            value={form.confirmPassword}
                            onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                            className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-2xl text-sm font-bold outline-none transition-all shadow-inner"
                        />
                    </div>
                </div>

                <div className="pt-6">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full px-10 py-5 bg-red-600 text-white rounded-2xl font-black uppercase text-xs tracking-[0.3em] shadow-2xl shadow-red-200 hover:bg-black hover:shadow-gray-200 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {loading ? 'Re-writing Protocol...' : 'Override Security Credentials'}
                    </button>
                    <p className="text-center text-[8px] font-black text-gray-300 uppercase tracking-[0.2em] mt-6">
                        Warning: This action will permanently alter your authentication vector.
                    </p>
                </div>
            </form>
        </div>
    );
};

export default UpdatePassword;
