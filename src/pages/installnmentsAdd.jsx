import React, { useState, useEffect } from 'react';
import ApiBaseUrl from '../constants/apiUrl';
import Navbar from '../compontents/Navbar';
import { useNavigate } from 'react-router-dom';
import { PRODUCT_CATEGORIES, CATEGORY_SPECIFICATIONS, getGroupedCategories } from '../constants/productCategories';
import RichTextEditor from '../compontents/RichTextEditor';

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

const defaultPlan = {
    planName: "",
    installmentPrice: 0,
    downPayment: 0,
    monthlyInstallment: 0,
    tenureMonths: 12,
    interestRatePercent: 0,
    interestType: "Flat Rate",
    markup: 0,
    otherChargesNote: "",
};

// Categories are now imported from productCategories.js

const InstallmentsAdd = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const [toast, setToast] = useState(null);
    const [localImages, setLocalImages] = useState([]);
    const [step4Tab, setStep4Tab] = useState('installments'); // 'finance' or 'installments'
    const [userData, setUserData] = useState(null);
    const [loadingUser, setLoadingUser] = useState(false);

    const showToast = (message, type) => {
        setToast({ message, type });
    };

    const [form, setForm] = useState({
        userId: "",
        productName: "",
        city: "",
        price: "",
        downpayment: "",
        installment: "",
        tenure: "",
        customTenure: "",
        postedBy: "Admin",
        videoUrl: "",
        description: "",
        companyName: "",
        companyNameOther: "",
        category: "",
        customCategory: "",
        status: "pending",
        productImages: [],
        paymentPlans: [{ ...defaultPlan }],

        // New dynamic product specifications
        productSpecifications: {
            category: "",
            subCategory: "",
            specifications: []
        },

        // Keep old fields for backward compatibility (can be removed later)
        generalFeatures: { operatingSystem: "", simSupport: "", phoneDimensions: "", phoneWeight: "", colors: "" },
        performance: { processor: "", gpu: "" },
        display: { screenSize: "", screenResolution: "", technology: "", protection: "" },
        battery: { type: "" },
        camera: { frontCamera: "", backCamera: "", features: "" },
        memory: { internalMemory: "", ram: "", cardSlot: "" },
        connectivity: { data: "", nfc: "", bluetooth: "", infrared: "" },

        airConditioner: {
            brand: "", model: "", color: "", capacityInTon: "", type: "", energyEfficient: "",
            display: "", indoorDimension: "", outdoorDimension: "", indoorWeightKg: "",
            outdoorWeightKg: "", powerSupply: "", otherFeatures: "", warranty: "",
        },

        electricalBike: {
            model: "", dimensions: "", weight: "", speed: "", batterySpec: "", chargingTime: "",
            brakes: "", warranty: "", transmission: "", rangeKm: "", groundClearance: "",
            starting: "", motor: "", controllers: "", electricityConsumption: "", recommendedLoadCapacity: "",
            wheelBase: "", shocks: "", tyreFront: "", tyreBack: "", otherFeatures: "", colors: "",
        },

        mechanicalBike: {
            generalFeatures: { model: "", dimensions: "", weight: "", engine: "", colors: "", other: "" },
            performance: { transmission: "", groundClearance: "", starting: "", displacement: "", petrolCapacity: "" },
            assembly: { compressionRatio: "", boreAndStroke: "", tyreAtFront: "", tyreAtBack: "", seatHeight: "" },
        },

        // Finance information
        finance: {
            bankName: "",
            financeInfo: "",
        },
    });

    // Helper to update nested path safely
    const updateForm = (path, value) => {
        if (!path.includes('.')) {
            setForm(prev => ({ ...prev, [path]: value }));
            return;
        }
        const parts = path.split('.');
        setForm(prev => {
            const copy = JSON.parse(JSON.stringify(prev));
            let cur = copy;
            for (let i = 0; i < parts.length - 1; i++) {
                if (cur[parts[i]] === undefined) cur[parts[i]] = {};
                cur = cur[parts[i]];
            }
            cur[parts[parts.length - 1]] = value;
            return copy;
        });
    };

    // Handle category change and initialize specifications
    const handleCategoryChange = (category) => {
        const specs = CATEGORY_SPECIFICATIONS[category] || [];
        const initializedSpecs = specs.map(spec => ({
            field: spec.field,
            value: ''
        }));

        setForm(prev => ({
            ...prev,
            category: category,
            productSpecifications: {
                category: category,
                subCategory: "",
                specifications: initializedSpecs
            }
        }));
    };

    // Update a specific specification value
    const updateSpecification = (fieldName, value) => {
        setForm(prev => {
            const updatedSpecs = prev.productSpecifications.specifications.map(spec =>
                spec.field === fieldName ? { ...spec, value } : spec
            );
            return {
                ...prev,
                productSpecifications: {
                    ...prev.productSpecifications,
                    specifications: updatedSpecs
                }
            };
        });
    };

    // Get specification value
    const getSpecValue = (fieldName) => {
        const spec = form.productSpecifications.specifications.find(s => s.field === fieldName);
        return spec ? spec.value : '';
    };

    // --- Calculation Logic ---
    const amortizedMonthlyPayment = (principal, annualInterestPercent, months) => {
        if (!months || months <= 0) return 0;
        const r = Number(annualInterestPercent) / 100 / 12;
        if (!r) return principal / months;
        const monthly = (principal * r) / (1 - Math.pow(1 + r, -months));
        return monthly;
    };

    const flatRateMonthlyPayment = (principal, annualInterestPercent, months) => {
        if (!months || months <= 0) return 0;
        const years = months / 12;
        const totalInterest = (principal * (Number(annualInterestPercent) / 100) * years);
        const totalPayable = principal + totalInterest;
        return totalPayable / months;
    };

    const recalcPlan = (index) => {
        setForm(f => {
            if (!f.paymentPlans || !f.paymentPlans[index]) return f;
            const pp = [...f.paymentPlans];
            const p = { ...pp[index] };

            const cashPrice = Number(f.price) || 0;
            const downPayment = Number(p.downPayment) || 0;
            const financedAmount = Math.max(0, cashPrice - downPayment);
            const months = parseInt(p.tenureMonths) || 0;
            const isIslamic = p.interestType === "Profit-Based (Islamic/Shariah)";
            const isReducing = p.interestType === "Reducing Balance";

            let monthly = 0;
            let totalPayable = 0;
            let totalMarkup = 0;
            let rate = Number(p.interestRatePercent) || 0;

            if (isIslamic) {
                // Profit-Based (Islamic): Markup is input, Rate is derived
                totalMarkup = Number(p.markup) || 0;
                rate = cashPrice > 0 ? (totalMarkup / cashPrice) * 100 : 0;
                totalPayable = financedAmount + totalMarkup;
                monthly = months > 0 ? totalPayable / months : 0;
            } else if (isReducing) {
                // Reducing Balance: Rate is input, Monthly is amortized
                monthly = amortizedMonthlyPayment(financedAmount, rate, months);
                totalPayable = monthly * months;
                totalMarkup = Math.max(0, totalPayable - financedAmount);
            } else {
                // Flat Rate: Rate is input, Markup is (Financed * Rate * years)
                totalMarkup = financedAmount * (rate / 100) * (months / 12);
                totalPayable = financedAmount + totalMarkup;
                monthly = months > 0 ? totalPayable / months : 0;
            }

            const totalCostToCustomer = cashPrice + totalMarkup;

            pp[index] = {
                ...p,
                interestRatePercent: Number(rate.toFixed(2)),
                markup: Number(totalMarkup.toFixed(2)),
                monthlyInstallment: Number(monthly.toFixed(2)),
                installmentPrice: Number(totalPayable.toFixed(2)),
                totalInterest: Number(totalMarkup.toFixed(2)),
                totalCostToCustomer: Number(totalCostToCustomer.toFixed(2)),
            };

            return { ...f, paymentPlans: pp };
        });
    };

    useEffect(() => {
        if (form.paymentPlans.length) {
            form.paymentPlans.forEach((_, idx) => recalcPlan(idx));
        }
    }, [form.price]);

    // Fetch user data when userId is provided
    const fetchUserData = async (userId) => {
        if (!userId) {
            setUserData(null);
            return;
        }
        
        setLoadingUser(true);
        try {
            const authData = JSON.parse(localStorage.getItem('adminAuth'));
            const res = await fetch(`${ApiBaseUrl}/getAllUsers`, {
                headers: {
                    'Authorization': `Bearer ${authData?.token || ''}`,
                }
            });
            const data = await res.json();
            
            if (data.success && data.users) {
                const user = data.users.find(u => u.userId === userId || u._id === userId);
                if (user) {
                    setUserData(user);
                } else {
                    setUserData(null);
                    showToast('User not found with the provided User ID', 'error');
                }
            } else {
                setUserData(null);
            }
        } catch (err) {
            console.error('Error fetching user:', err);
            setUserData(null);
        } finally {
            setLoadingUser(false);
        }
    };

    // Fetch user data when step changes to 5 or when userId changes
    useEffect(() => {
        if (step === 5 && form.userId) {
            fetchUserData(form.userId);
        }
    }, [step, form.userId]);

    // --- Image Handling ---
    const handleFilesChange = (e) => {
        const files = Array.from(e.target.files || []);
        
        // Validate file types and sizes
        for (const file of files) {
            if (!file.type.startsWith('image/')) {
                showToast('⚠️ Please select only valid image files (JPG, PNG, GIF, etc.)', 'error');
                e.target.value = null;
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                showToast(`⚠️ Image "${file.name}" exceeds 5MB limit`, 'error');
                e.target.value = null;
                return;
            }
        }
        
        setLocalImages(prev => [...prev, ...files]);
        showToast(`${files.length} image(s) selected. Click "Upload Images" to proceed.`, 'success');
    };

    const uploadSingleFile = async (file) => {
        const authData = JSON.parse(localStorage.getItem('adminAuth'));
        const fd = new FormData();
        fd.append("image", file);
        const res = await fetch(`${ApiBaseUrl}/upload-image`, {
            method: "POST",
            headers: authData?.token ? { Authorization: `Bearer ${authData.token}` } : {},
            body: fd,
        });
        const body = await res.json();
        return body.imageUrl || body.url || body.data?.url || body.data;
    };

    const handleUploadAll = async () => {
        if (!localImages.length) {
            showToast('⚠️ Please select images first', 'error');
            return;
        }
        setUploading(true);
        showToast(`Uploading ${localImages.length} image(s)...`, 'success');
        try {
            const urls = [];
            for (const file of localImages) {
                const u = await uploadSingleFile(file);
                urls.push(u);
            }
            setForm(f => ({ ...f, productImages: [...f.productImages, ...urls] }));
            setLocalImages([]);
            setMessage("Images uploaded.");
            showToast(`✓ Successfully uploaded ${urls.length} image(s)!`, 'success');
        } catch (err) {
            const errorMsg = err.message || "Upload failed. Please try again.";
            setError(errorMsg);
            showToast(errorMsg, 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const authData = JSON.parse(localStorage.getItem('adminAuth'));
            const res = await fetch(`${ApiBaseUrl}/createInstallmentPlan`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(authData?.token ? { Authorization: `Bearer ${authData.token}` } : {}),
                },
                body: JSON.stringify({
                    ...form,
                    category: form.category === "other" ? form.customCategory : form.category,
                    price: Number(form.price),
                    downpayment: Number(form.downpayment),
                    status: 'approved'
                }),
            });
            const data = await res.json();
            if (data.success) {
                const successMsg = "✓ Installment plan created successfully!";
                setMessage(successMsg);
                showToast(successMsg, 'success');
                setTimeout(() => navigate('/'), 1500);
            } else {
                const errorMsg = data.message || "Failed to create plan. Please try again.";
                setError(errorMsg);
                showToast(errorMsg, 'error');
            }
        } catch (err) {
            const errorMsg = err.message || "Server error. Please check your connection and try again.";
            setError(errorMsg);
            showToast(errorMsg, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
            <div className="max-w-6xl mx-auto p-6 space-y-8">
                {/* Modern Header - v2.0.5 */}
                <div className="relative overflow-hidden bg-gradient-to-r from-red-600 via-red-500 to-rose-600 rounded-3xl shadow-2xl p-8">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-40 h-40 bg-white opacity-5 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-40 h-40 bg-white opacity-5 rounded-full blur-3xl"></div>
                    
                    <div className="relative">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h1 className="text-3xl font-black text-white tracking-tight mb-2">Create Installment Plan</h1>
                                <p className="text-red-100 text-sm font-medium">Add new product to installment catalog</p>
                            </div>
                            <div className="flex gap-3">
                                {[1, 2, 3, 4, 5].map(s => (
                                    <div key={s} className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black transition-all shadow-lg ${step === s ? 'bg-white text-red-600 scale-110' : (step > s ? 'bg-green-500 text-white' : 'bg-white/10 text-white/50 backdrop-blur-sm')}`}>
                                        {step > s ? '✓' : s}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {message && <div className="p-4 bg-emerald-50 border-2 border-emerald-100 text-emerald-600 rounded-2xl font-bold animate-pulse">{message}</div>}
                {error && <div className="p-4 bg-red-50 border-2 border-red-100 text-red-600 rounded-2xl font-bold">{error}</div>}

                <div className="bg-white rounded-[3rem] shadow-xl border border-gray-50 overflow-hidden min-h-[600px] flex flex-col">
                    <div className="p-10 flex-1">
                        {step === 1 && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight border-l-8 border-red-600 pl-4">Step 1: Basic Details</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <InputField label="Product Name" value={form.productName} onChange={v => updateForm('productName', v)} placeholder="Full product title..." />
                                        <div className="grid grid-cols-2 gap-4">
                                            <InputField label="City" value={form.city} onChange={v => updateForm('city', v)} />
                                            <InputField label="Base Price (PKR)" type="number" value={form.price} onChange={v => updateForm('price', v)} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-2 text-[10px] font-black text-gray-700 uppercase tracking-widest ml-1">
                                                <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                                Product Category *
                                            </label>
                                            <select 
                                                value={form.category} 
                                                onChange={e => handleCategoryChange(e.target.value)} 
                                                className="w-full px-5 py-4 bg-white border-2 border-gray-200 focus:border-red-500 focus:bg-red-50/30 hover:border-gray-300 rounded-2xl text-sm font-semibold outline-none transition-all appearance-none cursor-pointer shadow-sm focus:shadow-md"
                                            >
                                                <option value="">🔍 Select Product Category</option>
                                                {Object.entries(getGroupedCategories()).map(([group, categories]) => (
                                                    <optgroup key={group} label={group}>
                                                        {categories.map(cat => (
                                                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                                                        ))}
                                                    </optgroup>
                                                ))}
                                            </select>
                                            {form.category && (
                                                <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-xl p-3 mt-2">
                                                    <svg className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                    </svg>
                                                    <p className="text-xs text-blue-800 font-medium leading-relaxed">
                                                        Category selected: <strong>{PRODUCT_CATEGORIES.find(c => c.value === form.category)?.label}</strong>. 
                                                        Proceed to Step 2 to fill product specifications.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <InputField label="Company / Brand" value={form.companyName} onChange={v => updateForm('companyName', v)} />
                                        {/* for user id */}
                                        <InputField label="User ID" value={form.userId} onChange={v => updateForm('userId', v)} />
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Description</label>
                                            <textarea value={form.description} onChange={e => updateForm('description', e.target.value)} rows={4} className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-[2rem] text-sm font-bold outline-none transition-all resize-none shadow-inner" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight border-l-8 border-red-600 pl-4">
                                        Step 2: Product Specifications
                                    </h2>
                                    {form.category && (
                                        <div className="bg-gradient-to-r from-red-500 to-rose-600 text-white px-6 py-3 rounded-2xl">
                                            <p className="text-xs font-black uppercase tracking-wider">
                                                {PRODUCT_CATEGORIES.find(c => c.value === form.category)?.label}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {!form.category ? (
                                    <div className="col-span-full py-32 text-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-[3rem] border-2 border-dashed border-gray-200">
                                        <div className="max-w-md mx-auto space-y-4">
                                            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto">
                                                <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                                </svg>
                                            </div>
                                            <p className="text-gray-500 font-black uppercase tracking-widest text-sm">No Category Selected</p>
                                            <p className="text-gray-400 text-xs font-medium">Please go back to Step 1 and select a product category first.</p>
                                            <button 
                                                onClick={() => setStep(1)}
                                                className="mt-4 px-8 py-3 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-all"
                                            >
                                                ← Back to Step 1
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-[2rem] p-6 xs:p-8 border-2 border-blue-200">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 xs:gap-6">
                                            {CATEGORY_SPECIFICATIONS[form.category]?.map((spec, index) => (
                                                <div key={index} className={spec.type === 'textarea' ? 'sm:col-span-2 lg:col-span-3' : ''}>
                                                    {spec.type === 'text' || !spec.type ? (
                                                        <div className="space-y-2">
                                                            <label className="flex items-center gap-1.5 text-[10px] font-black text-gray-700 uppercase tracking-wider">
                                                                {spec.required && <span className="text-red-500">*</span>}
                                                                {spec.field}
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={getSpecValue(spec.field)}
                                                                onChange={e => updateSpecification(spec.field, e.target.value)}
                                                                placeholder={spec.placeholder || `Enter ${spec.field.toLowerCase()}`}
                                                                required={spec.required}
                                                                className="w-full px-4 py-3 bg-white border-2 border-blue-200 focus:border-blue-500 focus:bg-blue-50/30 hover:border-blue-300 rounded-xl text-sm font-semibold text-gray-700 transition-all outline-none shadow-sm focus:shadow-md"
                                                            />
                                                        </div>
                                                    ) : spec.type === 'select' ? (
                                                        <div className="space-y-2">
                                                            <label className="flex items-center gap-1.5 text-[10px] font-black text-gray-700 uppercase tracking-wider">
                                                                {spec.required && <span className="text-red-500">*</span>}
                                                                {spec.field}
                                                            </label>
                                                            <select
                                                                value={getSpecValue(spec.field)}
                                                                onChange={e => updateSpecification(spec.field, e.target.value)}
                                                                required={spec.required}
                                                                className="w-full px-4 py-3 bg-white border-2 border-blue-200 focus:border-blue-500 focus:bg-blue-50/30 hover:border-blue-300 rounded-xl text-sm font-semibold text-gray-700 transition-all outline-none appearance-none cursor-pointer shadow-sm focus:shadow-md"
                                                            >
                                                                <option value="">Select {spec.field}</option>
                                                                {spec.options?.map((option, i) => (
                                                                    <option key={i} value={option}>{option}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    ) : spec.type === 'textarea' ? (
                                                        <div className="space-y-2">
                                                            <label className="flex items-center gap-1.5 text-[10px] font-black text-gray-700 uppercase tracking-wider">
                                                                {spec.required && <span className="text-red-500">*</span>}
                                                                {spec.field}
                                                            </label>
                                                            <textarea
                                                                value={getSpecValue(spec.field)}
                                                                onChange={e => updateSpecification(spec.field, e.target.value)}
                                                                placeholder={spec.placeholder || `Enter ${spec.field.toLowerCase()}`}
                                                                required={spec.required}
                                                                rows={3}
                                                                className="w-full px-4 py-3 bg-white border-2 border-blue-200 focus:border-blue-500 focus:bg-blue-50/30 hover:border-blue-300 rounded-xl text-sm font-semibold text-gray-700 transition-all outline-none resize-none shadow-sm focus:shadow-md"
                                                            />
                                                        </div>
                                                    ) : null}
                                                </div>
                                            ))}
                                        </div>
                                        
                                        {form.category && CATEGORY_SPECIFICATIONS[form.category]?.length > 0 && (
                                            <div className="mt-6 flex items-start gap-3 bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-blue-200/50">
                                                <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                </svg>
                                                <div>
                                                    <p className="text-sm text-blue-900 font-bold">
                                                        Fill in all required fields (* marked)
                                                    </p>
                                                    <p className="text-xs text-blue-700 mt-1">
                                                        Provide accurate specifications to help customers make informed decisions. Fields marked with * are required.
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight border-l-8 border-red-600 pl-4">Step 3: Media Gallery</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    <div className="space-y-6">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block pl-1">Image Pipeline</label>
                                        <div className="grid grid-cols-3 gap-4">
                                            {form.productImages.map((url, i) => (
                                                <div key={i} className="group relative aspect-square rounded-3xl overflow-hidden border-2 border-gray-100 shadow-sm">
                                                    <img src={url} className="w-full h-full object-cover" alt="" />
                                                    <button onClick={() => updateForm('productImages', form.productImages.filter((_, idx) => idx !== i))} className="absolute inset-0 bg-red-600/80 text-white opacity-0 group-hover:opacity-100 transition-all font-black text-[10px]">REMOVE</button>
                                                </div>
                                            ))}
                                            {localImages.map((file, i) => (
                                                <div key={i} className="relative aspect-square rounded-3xl overflow-hidden border-2 border-dashed border-gray-300 opacity-50 bg-gray-50 flex items-center justify-center p-2">
                                                    <img src={URL.createObjectURL(file)} className="w-full h-full object-contain opacity-30" alt="" />
                                                    <div className="absolute inset-0 flex items-center justify-center"><div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-ping"></div></div>
                                                </div>
                                            ))}
                                            <label className="aspect-square rounded-3xl border-4 border-dashed border-gray-100 hover:border-red-200 hover:bg-red-50/30 transition-all flex flex-col items-center justify-center cursor-pointer group">
                                                <input type="file" multiple className="hidden" onChange={handleFilesChange} />
                                                <span className="text-3xl text-gray-200 group-hover:text-red-600 font-light">+</span>
                                                <span className="text-[8px] font-black text-gray-300 group-hover:text-red-600 uppercase mt-2">Add Assets</span>
                                            </label>
                                        </div>
                                    </div>
                                    <div className="bg-gray-900 rounded-[3rem] p-10 flex flex-col justify-center items-center text-center space-y-6 shadow-2xl">
                                        <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center shadow-[0_0_50px_rgba(220,38,38,0.5)]">
                                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                        </div>
                                        <h3 className="text-white font-black uppercase tracking-widest text-sm">Asset Processing Hub</h3>
                                        <p className="text-gray-500 text-xs font-bold leading-relaxed">Ensure all images are high-resolution for the client interface.</p>
                                        <button disabled={!localImages.length || uploading} onClick={handleUploadAll} className="w-full py-5 bg-white text-gray-900 rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] hover:bg-red-600 hover:text-white transition-all disabled:opacity-20">
                                            {uploading ? 'Uploading Images...' : `Upload ${localImages.length} Image${localImages.length !== 1 ? 's' : ''}`}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 4 && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight border-l-8 border-red-600 pl-4">Step 4: Financial</h2>
                                    <div className="flex items-center gap-4 bg-gray-900 px-6 py-3 rounded-2xl shadow-lg border border-gray-800">
                                        <div className="flex flex-col">
                                            <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none">Cash Price</span>
                                            <span className="text-lg font-black text-white tracking-tighter">PKR {Number(form.price || 0).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Tab Buttons */}
                                <div className="flex gap-4 bg-white rounded-2xl p-2 shadow-sm border border-gray-200">
                                    <button
                                        onClick={() => setStep4Tab('finance')}
                                        className={`flex-1 px-6 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all duration-300 ${
                                            step4Tab === 'finance'
                                                ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-200 scale-105'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                    >
                                        💰 Finance
                                    </button>
                                    <button
                                        onClick={() => setStep4Tab('installments')}
                                        className={`flex-1 px-6 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all duration-300 ${
                                            step4Tab === 'installments'
                                                ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-200 scale-105'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                    >
                                        📊 Installments
                                    </button>
                                    <button
                                        onClick={() => setStep4Tab('both')}
                                        className={`flex-1 px-6 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all duration-300 ${
                                            step4Tab === 'both'
                                                ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-200 scale-105'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                    >
                                        🔄 Both
                                    </button>
                                </div>

                                {/* Finance Tab Content */}
                                {step4Tab === 'finance' && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-[2rem] p-8 border-2 border-blue-200">
                                            <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight mb-6 flex items-center gap-2">
                                                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Finance Information
                                            </h3>
                                            
                                            <div className="space-y-6">
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                                        Bank Name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={form.finance?.bankName || ''}
                                                        onChange={(e) => updateForm('finance.bankName', e.target.value)}
                                                        placeholder="Enter bank name (e.g., HBL, UBL, Meezan Bank...)"
                                                        className="w-full px-5 py-3.5 border-2 border-blue-200 rounded-2xl text-sm font-bold transition-all outline-none focus:border-blue-500 focus:bg-white bg-white"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                                        Finance Information
                                                    </label>
                                                    <RichTextEditor
                                                        value={form.finance?.financeInfo || ''}
                                                        onChange={(value) => updateForm('finance.financeInfo', value)}
                                                        placeholder="Enter detailed finance information, terms, conditions, eligibility criteria, etc..."
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Installments Tab Content */}
                                {step4Tab === 'installments' && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <div className="flex justify-end">
                                            <button onClick={() => setForm(f => ({ ...f, paymentPlans: [...f.paymentPlans, { ...defaultPlan }] }))} className="px-5 py-2.5 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-red-900/20 hover:scale-105 active:scale-95 transition-all">+ Add Payment Plan</button>
                                        </div>
                                        <div className="space-y-6">
                                            {form.paymentPlans.map((p, idx) => (
                                                <div key={idx} className="bg-gray-50/50 p-8 rounded-[2.5rem] border border-gray-100 relative group animate-in slide-in-from-right-4 duration-300">
                                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                                        <InputField label="Plan Name" value={p.planName} onChange={v => {
                                                            const pp = [...form.paymentPlans];
                                                            pp[idx].planName = v;
                                                            setForm(f => ({ ...f, paymentPlans: pp }));
                                                        }} placeholder="e.g. Premium 12M" />

                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-200 pb-1">Interest Type</label>
                                                            <select value={p.interestType} onChange={e => {
                                                                const pp = [...form.paymentPlans];
                                                                pp[idx].interestType = e.target.value;
                                                                setForm(f => ({ ...f, paymentPlans: pp }));
                                                                setTimeout(() => recalcPlan(idx), 0);
                                                            }} className="w-full px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-xs font-black uppercase tracking-widest outline-none">
                                                                <option>Flat Rate</option>
                                                                <option>Reducing Balance</option>
                                                                <option>Profit-Based (Islamic/Shariah)</option>
                                                            </select>
                                                        </div>

                                                        <InputField label="Duration (Months)" type="number" value={p.tenureMonths} onChange={v => {
                                                            const pp = [...form.paymentPlans];
                                                            pp[idx].tenureMonths = v;
                                                            setForm(f => ({ ...f, paymentPlans: pp }));
                                                            setTimeout(() => recalcPlan(idx), 0);
                                                        }} />

                                                        <InputField label="Down Payment (PKR)" type="number" value={p.downPayment} onChange={v => {
                                                            const pp = [...form.paymentPlans];
                                                            pp[idx].downPayment = v;
                                                            setForm(f => ({ ...f, paymentPlans: pp }));
                                                            setTimeout(() => recalcPlan(idx), 0);
                                                        }} />
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                                        {p.interestType === "Profit-Based (Islamic/Shariah)" ? (
                                                            <>
                                                                <InputField label="Total Profit (Islamic)" type="number" value={p.markup} onChange={v => {
                                                                    const pp = [...form.paymentPlans];
                                                                    pp[idx].markup = v;
                                                                    setForm(f => ({ ...f, paymentPlans: pp }));
                                                                    setTimeout(() => recalcPlan(idx), 0);
                                                                }} />
                                                                <InputField label="Markup Rate (Annual) % (Auto)" type="number" value={p.interestRatePercent} onChange={() => { }} readOnly={true} />
                                                            </>
                                                        ) : (
                                                            <>
                                                                <InputField label="Interest Rate (Annual) %" type="number" value={p.interestRatePercent} onChange={v => {
                                                                    const pp = [...form.paymentPlans];
                                                                    pp[idx].interestRatePercent = v;
                                                                    setForm(f => ({ ...f, paymentPlans: pp }));
                                                                    setTimeout(() => recalcPlan(idx), 0);
                                                                }} />
                                                                <InputField label="Total Interest (Auto)" type="number" value={p.markup} onChange={() => { }} readOnly={true} />
                                                            </>
                                                        )}
                                                    </div>

                                                    <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-4 bg-white/50 p-6 rounded-3xl border border-white">
                                                        <SummaryItem label="Monthly Payment" value={p.monthlyInstallment} highlight />
                                                        <SummaryItem label="Total Markup Amount" value={p.markup} />
                                                        <SummaryItem label="Total Payable" value={p.installmentPrice} />
                                                        <SummaryItem label="Total Cost" value={p.totalCostToCustomer} highlight />
                                                        <SummaryItem label="Loan Amount" value={Math.max(0, (parseFloat(form.price) || 0) - (p.downPayment || 0))} border={false} />
                                                    </div>
                                                    {form.paymentPlans.length > 1 && <button onClick={() => setForm(f => ({ ...f, paymentPlans: f.paymentPlans.filter((_, i) => i !== idx) }))} className="absolute top-4 right-4 text-gray-300 hover:text-red-600 transition-colors">✕</button>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Both Tab Content - Shows Finance and Installments Together */}
                                {step4Tab === 'both' && (
                                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        {/* Finance Section */}
                                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-[2rem] p-8 border-2 border-blue-200">
                                            <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight mb-6 flex items-center gap-2">
                                                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Finance Information
                                            </h3>
                                            
                                            <div className="space-y-6">
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                                        Bank Name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={form.finance?.bankName || ''}
                                                        onChange={(e) => updateForm('finance.bankName', e.target.value)}
                                                        placeholder="Enter bank name (e.g., HBL, UBL, Meezan Bank...)"
                                                        className="w-full px-5 py-3.5 border-2 border-blue-200 rounded-2xl text-sm font-bold transition-all outline-none focus:border-blue-500 focus:bg-white bg-white"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                                        Finance Information
                                                    </label>
                                                    <RichTextEditor
                                                        value={form.finance?.financeInfo || ''}
                                                        onChange={(value) => updateForm('finance.financeInfo', value)}
                                                        placeholder="Enter detailed finance information, terms, conditions, eligibility criteria, etc..."
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Installments Section */}
                                        <div className="space-y-6">
                                            <div className="flex justify-between items-center">
                                                <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight flex items-center gap-2">
                                                    <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                    </svg>
                                                    Payment Plans
                                                </h3>
                                                <button onClick={() => setForm(f => ({ ...f, paymentPlans: [...f.paymentPlans, { ...defaultPlan }] }))} className="px-5 py-2.5 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-red-900/20 hover:scale-105 active:scale-95 transition-all">+ Add Payment Plan</button>
                                            </div>
                                            <div className="space-y-6">
                                                {form.paymentPlans.map((p, idx) => (
                                                    <div key={idx} className="bg-gray-50/50 p-8 rounded-[2.5rem] border border-gray-100 relative group animate-in slide-in-from-right-4 duration-300">
                                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                                            <InputField label="Plan Name" value={p.planName} onChange={v => {
                                                                const pp = [...form.paymentPlans];
                                                                pp[idx].planName = v;
                                                                setForm(f => ({ ...f, paymentPlans: pp }));
                                                            }} placeholder="e.g. Premium 12M" />

                                                            <div className="space-y-2">
                                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-200 pb-1">Interest Type</label>
                                                                <select value={p.interestType} onChange={e => {
                                                                    const pp = [...form.paymentPlans];
                                                                    pp[idx].interestType = e.target.value;
                                                                    setForm(f => ({ ...f, paymentPlans: pp }));
                                                                    setTimeout(() => recalcPlan(idx), 0);
                                                                }} className="w-full px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-xs font-black uppercase tracking-widest outline-none">
                                                                    <option>Flat Rate</option>
                                                                    <option>Reducing Balance</option>
                                                                    <option>Profit-Based (Islamic/Shariah)</option>
                                                                </select>
                                                            </div>

                                                            <InputField label="Duration (Months)" type="number" value={p.tenureMonths} onChange={v => {
                                                                const pp = [...form.paymentPlans];
                                                                pp[idx].tenureMonths = v;
                                                                setForm(f => ({ ...f, paymentPlans: pp }));
                                                                setTimeout(() => recalcPlan(idx), 0);
                                                            }} />

                                                            <InputField label="Down Payment (PKR)" type="number" value={p.downPayment} onChange={v => {
                                                                const pp = [...form.paymentPlans];
                                                                pp[idx].downPayment = v;
                                                                setForm(f => ({ ...f, paymentPlans: pp }));
                                                                setTimeout(() => recalcPlan(idx), 0);
                                                            }} />
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                                            {p.interestType === "Profit-Based (Islamic/Shariah)" ? (
                                                                <>
                                                                    <InputField label="Total Profit (Islamic)" type="number" value={p.markup} onChange={v => {
                                                                        const pp = [...form.paymentPlans];
                                                                        pp[idx].markup = v;
                                                                        setForm(f => ({ ...f, paymentPlans: pp }));
                                                                        setTimeout(() => recalcPlan(idx), 0);
                                                                    }} />
                                                                    <InputField label="Markup Rate (Annual) % (Auto)" type="number" value={p.interestRatePercent} onChange={() => { }} readOnly={true} />
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <InputField label="Interest Rate (Annual) %" type="number" value={p.interestRatePercent} onChange={v => {
                                                                        const pp = [...form.paymentPlans];
                                                                        pp[idx].interestRatePercent = v;
                                                                        setForm(f => ({ ...f, paymentPlans: pp }));
                                                                        setTimeout(() => recalcPlan(idx), 0);
                                                                    }} />
                                                                    <InputField label="Total Interest (Auto)" type="number" value={p.markup} onChange={() => { }} readOnly={true} />
                                                                </>
                                                            )}
                                                        </div>

                                                        <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-4 bg-white/50 p-6 rounded-3xl border border-white">
                                                            <SummaryItem label="Monthly Payment" value={p.monthlyInstallment} highlight />
                                                            <SummaryItem label="Total Markup Amount" value={p.markup} />
                                                            <SummaryItem label="Total Payable" value={p.installmentPrice} />
                                                            <SummaryItem label="Total Cost" value={p.totalCostToCustomer} highlight />
                                                            <SummaryItem label="Loan Amount" value={Math.max(0, (parseFloat(form.price) || 0) - (p.downPayment || 0))} border={false} />
                                                        </div>
                                                        {form.paymentPlans.length > 1 && <button onClick={() => setForm(f => ({ ...f, paymentPlans: f.paymentPlans.filter((_, i) => i !== idx) }))} className="absolute top-4 right-4 text-gray-300 hover:text-red-600 transition-colors">✕</button>}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {step === 5 && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight border-l-8 border-red-600 pl-4">Step 5: Overview & Confirmation</h2>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Left Column - Form Overview */}
                                    <div className="space-y-6">
                                        {/* Basic Details */}
                                        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                                            <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                                                <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                Basic Details
                                            </h3>
                                            <div className="space-y-3">
                                                <OverviewItem label="Product Name" value={form.productName} />
                                                <OverviewItem label="Category" value={form.category || form.customCategory} />
                                                <OverviewItem label="Company/Brand" value={form.companyName || form.companyNameOther} />
                                                <OverviewItem label="City" value={form.city} />
                                                <OverviewItem label="Base Price" value={`PKR ${Number(form.price || 0).toLocaleString()}`} highlight />
                                                {form.description && (
                                                    <div>
                                                        <label className="text-xs font-bold text-gray-500 mb-1 block">Description</label>
                                                        <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg" dangerouslySetInnerHTML={{ __html: form.description }} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Payment Plans Summary */}
                                        {form.paymentPlans && form.paymentPlans.length > 0 && (
                                            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                                                <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                                                    <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                    </svg>
                                                    Payment Plans ({form.paymentPlans.length})
                                                </h3>
                                                <div className="space-y-3">
                                                    {form.paymentPlans.map((plan, idx) => (
                                                        <div key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                                            <div className="font-bold text-gray-900 mb-2">{plan.planName || `Plan ${idx + 1}`}</div>
                                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                                <div><span className="text-gray-600">Duration:</span> <span className="font-semibold">{plan.tenureMonths} months</span></div>
                                                                <div><span className="text-gray-600">Down Payment:</span> <span className="font-semibold">PKR {Number(plan.downPayment || 0).toLocaleString()}</span></div>
                                                                <div><span className="text-gray-600">Monthly EMI:</span> <span className="font-semibold text-red-600">PKR {Number(plan.monthlyInstallment || 0).toLocaleString()}</span></div>
                                                                <div><span className="text-gray-600">Interest Rate:</span> <span className="font-semibold">{plan.interestRatePercent || 0}%</span></div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Finance Information */}
                                        {form.finance && (form.finance.bankName || form.finance.financeInfo) && (
                                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-sm p-6 border-2 border-blue-200">
                                                <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                                                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    Finance Information
                                                </h3>
                                                <div className="space-y-3">
                                                    {form.finance.bankName && <OverviewItem label="Bank Name" value={form.finance.bankName} />}
                                                    {form.finance.financeInfo && (
                                                        <div>
                                                            <label className="text-xs font-bold text-gray-500 mb-1 block">Finance Details</label>
                                                            <div className="text-sm text-gray-700 bg-white p-3 rounded-lg" dangerouslySetInnerHTML={{ __html: form.finance.financeInfo }} />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Right Column - User Information */}
                                    <div className="space-y-6">
                                        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                                            <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                                                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                User Information
                                            </h3>
                                            
                                            {loadingUser ? (
                                                <div className="flex items-center justify-center py-8">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                                                    <span className="ml-3 text-gray-600">Loading user data...</span>
                                                </div>
                                            ) : userData ? (
                                                <div className="space-y-4">
                                                    {userData.profilePic && (
                                                        <div className="flex justify-center mb-4">
                                                            <img src={userData.profilePic} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-gray-200" />
                                                        </div>
                                                    )}
                                                    <OverviewItem label="User ID" value={userData.userId} />
                                                    <OverviewItem label="Name" value={userData.name} highlight />
                                                    <OverviewItem label="Email" value={userData.email} />
                                                    <OverviewItem label="Phone Number" value={userData.phoneNumber} />
                                                    <OverviewItem label="WhatsApp Number" value={userData.WhatsappNumber} />
                                                    <OverviewItem label="Address" value={userData.Address} />
                                                    <OverviewItem label="User Type" value={userData.UserType} />
                                                    {userData.isVerified !== undefined && (
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-bold text-gray-500">Verification Status:</span>
                                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${userData.isVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                                {userData.isVerified ? '✓ Verified' : '⚠ Unverified'}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : form.userId ? (
                                                <div className="text-center py-8 text-gray-500">
                                                    <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <p className="font-semibold">User not found</p>
                                                    <p className="text-sm mt-1">User ID: {form.userId}</p>
                                                </div>
                                            ) : (
                                                <div className="text-center py-8 text-gray-500">
                                                    <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                    <p className="font-semibold">No User ID provided</p>
                                                    <p className="text-sm mt-1">Please enter User ID in Step 1</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Images Summary */}
                                        {form.productImages && form.productImages.length > 0 && (
                                            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                                                <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                                                    <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    Product Images ({form.productImages.length})
                                                </h3>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {form.productImages.slice(0, 6).map((img, idx) => (
                                                        <img key={idx} src={img} alt={`Product ${idx + 1}`} className="w-full h-24 object-cover rounded-lg border border-gray-200" />
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Navigation Footer */}
                    <div className="p-8 bg-gray-50/50 border-t border-gray-100 flex justify-between items-center">
                        <button onClick={() => setStep(s => Math.max(1, s - 1))} className={`px-10 py-4 font-black uppercase text-[10px] tracking-widest transition-all ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-gray-400 hover:text-gray-900'}`}>Previous</button>
                        <div className="flex gap-4">
                            {step < 5 ?
                                <button onClick={() => setStep(s => s + 1)} className="px-12 py-4 bg-gray-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] hover:bg-red-600 shadow-xl shadow-gray-200 transition-all">Next Phase Matrix</button>
                                :
                                <button onClick={handleSubmit} disabled={loading} className="px-12 py-4 bg-red-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] hover:bg-red-700 shadow-xl shadow-red-100 transition-all active:scale-95">
                                    {loading ? 'Creating Plan...' : 'Create Plan'}
                                </button>
                            }
                        </div>
                    </div>
                </div>
            </div>

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

// Internal Atomic Components
const InputField = ({ label, value, onChange, type = "text", placeholder = "", readOnly = false }) => (
    <div className="space-y-2 group">
        {label && <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-focus-within:text-red-600 transition-colors pl-1">{label}</label>}
        <input
            type={type}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            readOnly={readOnly}
            className={`w-full px-5 py-3.5 border-2 border-transparent rounded-2xl text-sm font-bold transition-all outline-none shadow-sm placeholder:text-gray-300 ${readOnly ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-gray-50 focus:border-red-600 focus:bg-white'}`}
        />
    </div>
);

const SummaryItem = ({ label, value, highlight = false, border = true }) => (
    <div className={`flex flex-col gap-1 ${border ? 'border-r border-gray-100' : ''} px-4`}>
        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
        <span className={`text-sm font-black tracking-tighter ${highlight ? 'text-red-600' : 'text-gray-800'}`}>
            PKR {Number(value || 0).toLocaleString()}
        </span>
    </div>
);

const OverviewItem = ({ label, value, highlight = false }) => (
    <div className="flex justify-between items-start py-2 border-b border-gray-100 last:border-0">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">{label}:</span>
        <span className={`text-sm font-semibold text-right ${highlight ? 'text-red-600' : 'text-gray-900'}`}>
            {value || 'N/A'}
        </span>
    </div>
);

export default InstallmentsAdd;
