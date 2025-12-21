import React, { useState, useEffect } from 'react';
import ApiBaseUrl from '../constants/apiUrl';
import { useNavigate, useParams } from 'react-router-dom';

const AgentAdd = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        UserType: "agent",
        isVerified: true
    });

    useEffect(() => {
        if (id) fetchAgentDetails();
    }, [id]);

    const fetchAgentDetails = async () => {
        setFetching(true);
        try {
            const authData = JSON.parse(localStorage.getItem('adminAuth'));
            const res = await fetch(`${ApiBaseUrl}/getAllUsers`, {
                headers: { 'Authorization': `Bearer ${authData.token}` }
            });
            const data = await res.json();
            const agent = data.users.find(u => u._id === id);
            if (agent) {
                setForm({
                    name: agent.name || "",
                    email: agent.email || "",
                    phone: agent.phone || "",
                    password: "", // Handled separately usually
                    UserType: "agent",
                    isVerified: agent.isVerified ?? true
                });
            }
        } catch (err) {
            setError("Protocol failure: Unable to fetch target data.");
        } finally {
            setFetching(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const authData = JSON.parse(localStorage.getItem('adminAuth'));
            // Backend endpoint for adding/updating users
            // Assuming register for add and updateUser for update
            const endpoint = id ? `${ApiBaseUrl}/updateUser` : `${ApiBaseUrl}/register`;
            const method = id ? 'PUT' : 'POST';

            const payload = id
                ? { userId: form.userId || id, updates: form }
                : form;

            const res = await fetch(endpoint, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    ...(authData?.token ? { Authorization: `Bearer ${authData.token}` } : {}),
                },
                body: JSON.stringify(payload)
            });

            const result = await res.json();
            if (res.ok || result.success) {
                setMessage(id ? "Agent profile overwritten." : "New agent commissioned.");
                setTimeout(() => navigate('/agent/all'), 1500);
            } else {
                setError(result.message || "Operation rejected by backend.");
            }
        } catch (err) {
            setError("Broadcast failure: Network layer error.");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="w-12 h-12 border-4 border-gray-100 border-t-red-600 rounded-full animate-spin"></div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Synching Personnel Data...</p>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">{id ? 'Override Agent' : 'Recruit Agent'}</h1>
                    <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.3em] mt-1">Field Intelligence Deployment</p>
                </div>
                <button onClick={() => navigate('/agent/all')} className="px-6 py-3 bg-gray-50 text-gray-400 hover:text-gray-900 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest">
                    Abort
                </button>
            </div>

            {message && <div className="p-4 bg-emerald-50 border-2 border-emerald-100 text-emerald-600 rounded-2xl font-black uppercase text-[10px] tracking-widest text-center">{message}</div>}
            {error && <div className="p-4 bg-red-50 border-2 border-red-100 text-red-600 rounded-2xl font-black uppercase text-[10px] tracking-widest text-center">{error}</div>}

            <form onSubmit={handleSubmit} className="bg-white rounded-[3rem] p-12 border border-gray-100 shadow-xl space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Identity</label>
                        <input
                            required
                            type="text"
                            placeholder="AGENT NAME..."
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-2xl text-sm font-bold outline-none transition-all shadow-inner"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Communication Channel (Email)</label>
                        <input
                            required
                            type="email"
                            placeholder="AGENT@MADADGAAR.COM..."
                            value={form.email}
                            onChange={e => setForm({ ...form, email: e.target.value })}
                            className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-2xl text-sm font-bold outline-none transition-all shadow-inner"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Mobile Secure Line</label>
                        <input
                            required
                            type="tel"
                            placeholder="PHONE NUMBER..."
                            value={form.phone}
                            onChange={e => setForm({ ...form, phone: e.target.value })}
                            className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-2xl text-sm font-bold outline-none transition-all shadow-inner"
                        />
                    </div>
                    {!id && (
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Access Pass (Password)</label>
                            <input
                                required
                                type="password"
                                placeholder="INITIAL PASSWORD..."
                                value={form.password}
                                onChange={e => setForm({ ...form, password: e.target.value })}
                                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-2xl text-sm font-bold outline-none transition-all shadow-inner"
                            />
                        </div>
                    )}
                </div>

                <div className="flex justify-center pt-6">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full md:w-auto px-20 py-5 bg-red-600 text-white rounded-2xl font-black uppercase text-xs tracking-[0.3em] shadow-2xl shadow-red-200 hover:bg-black hover:shadow-gray-200 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {loading ? 'Committing...' : (id ? 'Override Protocol' : 'Commission Agent')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AgentAdd;
