import React, { useState, useEffect } from 'react';
import ApiBaseUrl from '../constants/apiUrl';
import { useNavigate, useParams } from 'react-router-dom';

// Toast Notification Component - Enhanced
const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const styles = type === 'success' 
        ? 'bg-gradient-to-r from-emerald-500 to-green-600 border-emerald-400' 
        : 'bg-gradient-to-r from-red-500 to-rose-600 border-red-400';

    return (
        <div className={`fixed top-20 right-6 ${styles} text-white px-6 py-4 rounded-2xl shadow-2xl z-[9999] flex items-center gap-4 animate-in slide-in-from-top-4 duration-300 border-2 min-w-[320px] max-w-md`}>
            <div className="flex-shrink-0">
                {type === 'success' ? (
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
                <p className="font-bold text-sm leading-relaxed">{message}</p>
            </div>
            <button 
                onClick={onClose} 
                className="flex-shrink-0 w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded-lg transition-all active:scale-95"
                aria-label="Close notification"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
};

const BannersAdd = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const [toast, setToast] = useState(null);

    const showToast = (message, type) => {
        setToast({ message, type });
    };

    const [form, setForm] = useState({
        category: "Hero Slider",
        image: "",
        link: "",
        expireDate: "",
        isActive: true
    });

    useEffect(() => {
        if (id) fetchOfferDetails();
    }, [id]);

    const fetchOfferDetails = async () => {
        setFetching(true);
        try {
            const res = await fetch(`${ApiBaseUrl}/getAllOffers`);
            const data = await res.json();
            const offer = data.find(o => o._id === id);
            if (offer) {
                setForm({
                    category: offer.category || "Hero Slider",
                    image: offer.image || "",
                    link: offer.link || "",
                    expireDate: offer.expireDate ? offer.expireDate.split('T')[0] : "",
                    isActive: offer.isActive ?? true
                });
            }
        } catch (err) {
            const errorMsg = err.message || "Failed to fetch asset data.";
            setError(errorMsg);
            showToast(errorMsg, 'error');
        } finally {
            setFetching(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            showToast('⚠️ Please select a valid image file (JPG, PNG, GIF, etc.)', 'error');
            e.target.value = null;
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            showToast('⚠️ Image size should not exceed 5MB', 'error');
            e.target.value = null;
            return;
        }

        setUploading(true);
        showToast('Uploading banner image...', 'success');
        try {
            const authData = JSON.parse(localStorage.getItem('adminAuth'));
            const fd = new FormData();
            fd.append("image", file);

            const res = await fetch(`${ApiBaseUrl}/upload-image`, {
                method: "POST",
                headers: authData?.token ? { Authorization: `Bearer ${authData.token}` } : {},
                body: fd,
            });
            const body = await res.json();
            
            if (res.ok && body.success) {
                const url = body.imageUrl || body.url || body.data?.url || body.data;
                setForm(f => ({ ...f, image: url }));
                setMessage("Asset uploaded successfully.");
                showToast('✓ Banner image uploaded successfully!', 'success');
            } else {
                throw new Error(body.message || 'Upload failed');
            }
        } catch (err) {
            const errorMsg = err.message || "Asset upload failed. Please try again.";
            setError(errorMsg);
            showToast(errorMsg, 'error');
            e.target.value = null;
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Client-side validation
        if (!form.image) {
            const errorMsg = "⚠️ Please upload a banner image";
            setError(errorMsg);
            showToast(errorMsg, 'error');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const authData = JSON.parse(localStorage.getItem('adminAuth'));
            const url = id
                ? `${ApiBaseUrl}/updateOffer/${id}`
                : `${ApiBaseUrl}/createOffer`;

            const res = await fetch(url, {
                method: id ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(authData?.token ? { Authorization: `Bearer ${authData.token}` } : {}),
                },
                body: JSON.stringify(form),
            });

            if (res.ok) {
                const successMsg = id ? "✓ Banner updated successfully!" : "✓ New banner created successfully!";
                setMessage(successMsg);
                showToast(successMsg, 'success');
                setTimeout(() => navigate('/banner/all'), 1500);
            } else {
                const data = await res.json();
                const errorMsg = data.message || "Operation failed. Please try again.";
                setError(errorMsg);
                showToast(errorMsg, 'error');
            }
        } catch (err) {
            const errorMsg = err.message || "Network error. Please check your connection and try again.";
            setError(errorMsg);
            showToast(errorMsg, 'error');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="w-12 h-12 border-4 border-gray-100 border-t-red-600 rounded-full animate-spin"></div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Synching Asset Data...</p>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">{id ? 'Override Banner' : 'Add Banner'}</h1>
                    <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.3em] mt-1">Banners & Promotions </p>
                </div>
                <button onClick={() => navigate('/banner/all')} className="p-4 bg-gray-50 text-gray-400 hover:text-gray-900 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest">
                    Cancel
                </button>
            </div>

            {message && <div className="p-4 bg-emerald-50 border-2 border-emerald-100 text-emerald-600 rounded-2xl font-bold uppercase text-[10px] tracking-widest text-center">{message}</div>}
            {error && <div className="p-4 bg-red-50 border-2 border-red-100 text-red-600 rounded-2xl font-bold uppercase text-[10px] tracking-widest text-center">{error}</div>}

            <form onSubmit={handleSubmit} className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-xl space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Asset Category</label>
                            <select
                                value={form.category}
                                onChange={e => setForm({ ...form, category: e.target.value })}
                                className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-2xl text-sm font-bold outline-none transition-all shadow-inner appearance-none"
                            >
                                <option>Installments</option>
                                <option>Loan </option>
                                <option>Properties</option>
                                <option>Services</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Redirection Link</label>
                            <input
                                type="text"
                                value={form.link}
                                onChange={e => setForm({ ...form, link: e.target.value })}
                                placeholder="/installments/all or external URL"
                                className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-2xl text-sm font-bold outline-none transition-all shadow-inner"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Expiry Date (Optional)</label>
                            <input
                                type="date"
                                value={form.expireDate}
                                onChange={e => setForm({ ...form, expireDate: e.target.value })}
                                className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-2xl text-sm font-bold outline-none transition-all shadow-inner"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Visual Preview</label>
                        <div className="aspect-[21/9] bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center relative overflow-hidden group">
                            {form.image ? (
                                <>
                                    <img src={form.image} className="w-full h-full object-cover" alt="Banner Preview" />
                                    <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-all">
                                        <span className="text-white text-[10px] font-black uppercase tracking-widest">Change Asset</span>
                                        <input type="file" onChange={handleImageUpload} className="hidden" accept="image/*" />
                                    </label>
                                </>
                            ) : (
                                <label className="flex flex-col items-center gap-3 cursor-pointer p-10">
                                    <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 group-hover:scale-110 group-hover:rotate-12 transition-all">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    </div>
                                    <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Upload 1920x800px Source</span>
                                    <input type="file" onChange={handleImageUpload} className="hidden" accept="image/*" />
                                </label>
                            )}
                            {uploading && (
                                <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                                    <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-center pt-10">
                    <button
                        type="submit"
                        disabled={loading || !form.image}
                        className="w-full md:w-auto px-20 py-5 bg-red-600 text-white rounded-2xl font-black uppercase text-xs tracking-[0.3em] shadow-2xl shadow-red-200 hover:bg-black hover:shadow-gray-200 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {loading ? 'Committing Architecture...' : (id ? 'Override Protocol' : 'Add Now ')}
                    </button>
                </div>
            </form>

            {/* Toast Notification */}
            {toast && (
                <Toast 
                    message={toast.message} 
                    type={toast.type} 
                    onClose={() => setToast(null)} 
                />
            )}
        </div>
    );
};

export default BannersAdd;
