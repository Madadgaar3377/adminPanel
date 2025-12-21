import React, { useState, useEffect } from 'react';
import ApiBaseUrl from '../constants/apiUrl';
import { useNavigate, useParams } from 'react-router-dom';

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

const CATEGORY_OPTIONS = [
    { value: "", label: "Select category" },
    { value: "phones", label: "Phones / Mobile" },
    { value: "bikes_mechanical", label: "Bikes — Mechanical" },
    { value: "bikes_electric", label: "Bikes — Electric" },
    { value: "air_conditioner", label: "Air Conditioner" },
    { value: "appliances", label: "Home Appliances / Other" },
    { value: "other", label: "Other (custom)" },
];

const InstallmentsEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const [localImages, setLocalImages] = useState([]);

    const [form, setForm] = useState({
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
        category: "",
        status: "pending",
        productImages: [],
        paymentPlans: [{ ...defaultPlan }],

        generalFeatures: { operatingSystem: "", simSupport: "", phoneDimensions: "", phoneWeight: "", colors: "" },
        performance: { processor: "", gpu: "" },
        display: { screenSize: "", screenResolution: "", technology: "", protection: "" },
        battery: { type: "" },
        camera: { frontCamera: "", backCamera: "", features: "" },
        memory: { internalMemory: "", ram: "", cardSlot: "" },
        connectivity: { data: "", nfc: "", bluetooth: "", infrared: "" },

        airConditioner: {
            brand: "", capacityInTon: "", type: "", energyEfficient: ""
        },

        electricalBike: {
            model: "", batterySpec: "", rangeKm: "", motor: "", chargingTime: "", speed: "",
        },

        mechanicalBike: {
            generalFeatures: { model: "", engine: "" },
            performance: { transmission: "", displacement: "", petrolCapacity: "" },
        },
    });

    useEffect(() => {
        if (id) fetchExistingPlan();
    }, [id]);

    const fetchExistingPlan = async () => {
        setFetching(true);
        try {
            const authData = JSON.parse(localStorage.getItem('adminAuth'));
            const res = await fetch(`${ApiBaseUrl}/getAllInstallments`, {
                headers: {
                    ...(authData?.token ? { Authorization: `Bearer ${authData.token}` } : {}),
                }
            });
            const data = await res.json();
            if (data.success) {
                const plan = data.data.find(d => d._id === id);
                if (plan) {
                    setForm(prev => ({
                        ...prev,
                        ...plan,
                        // Ensure specs objects exist to avoid crashes
                        generalFeatures: plan.generalFeatures || prev.generalFeatures,
                        performance: plan.performance || prev.performance,
                        display: plan.display || prev.display,
                        battery: plan.battery || prev.battery,
                        camera: plan.camera || prev.camera,
                        memory: plan.memory || prev.memory,
                        connectivity: plan.connectivity || prev.connectivity,
                        airConditioner: plan.airConditioner || prev.airConditioner,
                        electricalBike: plan.electricalBike || prev.electricalBike,
                        mechanicalBike: plan.mechanicalBike || prev.mechanicalBike,
                    }));
                } else {
                    setError("Plan not found.");
                }
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError("Failed to fetch plan data.");
        } finally {
            setFetching(false);
        }
    };

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
            const pp = [...f.paymentPlans];
            const p = pp[index];
            const rawPrice = parseFloat(f.price) || 0;
            const productDown = parseFloat(p.downPayment) || 0;
            const markupAmount = parseFloat(p.markup) || 0;
            const principal = Math.max(0, rawPrice - productDown + markupAmount);
            const months = parseInt(p.tenureMonths) || 0;
            const rate = parseFloat(p.interestRatePercent) || 0;

            let monthly = 0;
            if (months > 0) {
                if (p.interestType === "Flat Rate") {
                    monthly = flatRateMonthlyPayment(principal, rate, months);
                } else {
                    monthly = amortizedMonthlyPayment(principal, rate, months);
                }
            }

            const installmentPrice = Number((monthly * months).toFixed(2));
            const totalInterest = Number((installmentPrice - principal).toFixed(2));

            pp[index] = {
                ...pp[index],
                monthlyInstallment: Number(monthly.toFixed(2)),
                installmentPrice,
                principal: Number(principal.toFixed(2)),
                totalInterest,
                downPayment: Number(productDown || 0),
            };

            return { ...f, paymentPlans: pp };
        });
    };

    useEffect(() => {
        if (form.paymentPlans.length) {
            form.paymentPlans.forEach((_, idx) => recalcPlan(idx));
        }
    }, [form.price]);

    const handleFilesChange = (e) => {
        const files = Array.from(e.target.files || []);
        setLocalImages(prev => [...prev, ...files]);
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
        if (!localImages.length) return;
        setUploading(true);
        try {
            const urls = [];
            for (const file of localImages) {
                const u = await uploadSingleFile(file);
                urls.push(u);
            }
            setForm(f => ({ ...f, productImages: [...f.productImages, ...urls] }));
            setLocalImages([]);
            setMessage("Images uploaded.");
        } catch (err) {
            setError("Upload failed.");
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
            const res = await fetch(`${ApiBaseUrl}/updateInstallment/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    ...(authData?.token ? { Authorization: `Bearer ${authData.token}` } : {}),
                },
                body: JSON.stringify({
                    ...form,
                    price: Number(form.price),
                }),
            });
            const data = await res.json();
            if (data.success) {
                setMessage("Plan updated successfully!");
                setTimeout(() => navigate('/installments/update'), 1500);
            } else {
                setError(data.message || "Update failed.");
            }
        } catch (err) {
            setError("Server error.");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="w-12 h-12 border-4 border-gray-100 border-t-red-600 rounded-full animate-spin"></div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Synching Dataset...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20">
            <div className="max-w-6xl mx-auto p-6 space-y-8">
                {/* Header Card */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">Modify Protocol</h1>
                        <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.3em] mt-1">Live Update Override Mode</p>
                    </div>
                    <div className="flex gap-3">
                        {[1, 2, 3, 4].map(s => (
                            <div key={s} className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black transition-all ${step === s ? 'bg-red-600 text-white shadow-lg shadow-red-200 scale-110' : (step > s ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400')}`}>
                                {step > s ? '✓' : s}
                            </div>
                        ))}
                    </div>
                </div>

                {message && <div className="p-4 bg-emerald-50 border-2 border-emerald-100 text-emerald-600 rounded-2xl font-bold animate-pulse">{message}</div>}
                {error && <div className="p-4 bg-red-50 border-2 border-red-100 text-red-600 rounded-2xl font-bold">{error}</div>}

                <div className="bg-white rounded-[3rem] shadow-xl border border-gray-50 overflow-hidden min-h-[600px] flex flex-col">
                    <div className="p-10 flex-1">
                        {step === 1 && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight border-l-8 border-red-600 pl-4">Step 1: Primary Discovery</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <InputField label="Product Name" value={form.productName} onChange={v => updateForm('productName', v)} placeholder="Full product title..." />
                                        <div className="grid grid-cols-2 gap-4">
                                            <InputField label="City" value={form.city} onChange={v => updateForm('city', v)} />
                                            <InputField label="Base Price (PKR)" type="number" value={form.price} onChange={v => updateForm('price', v)} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Category Assignment</label>
                                            <select value={form.category} onChange={e => updateForm('category', e.target.value)} className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-2xl text-sm font-bold outline-none transition-all">
                                                {CATEGORY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <InputField label="Company / Brand" value={form.companyName} onChange={v => updateForm('companyName', v)} />
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
                                <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight border-l-8 border-red-600 pl-4">Step 2: Technical Specifications</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {(form.category === "phones") && <>
                                        {/* General Features */}
                                        <div className="col-span-full border-b border-gray-100 pb-2 mb-2"><span className="text-[10px] font-black text-red-600 uppercase tracking-widest">General Features</span></div>
                                        <InputField label="OS" value={form.generalFeatures.operatingSystem} onChange={v => updateForm('generalFeatures.operatingSystem', v)} />
                                        <InputField label="SIM Support" value={form.generalFeatures.simSupport} onChange={v => updateForm('generalFeatures.simSupport', v)} />
                                        <InputField label="Dimensions" value={form.generalFeatures.phoneDimensions} onChange={v => updateForm('generalFeatures.phoneDimensions', v)} />
                                        <InputField label="Weight" value={form.generalFeatures.phoneWeight} onChange={v => updateForm('generalFeatures.phoneWeight', v)} />
                                        <InputField label="Colors" value={form.generalFeatures.colors} onChange={v => updateForm('generalFeatures.colors', v)} />

                                        {/* Performance */}
                                        <div className="col-span-full border-b border-gray-100 pb-2 mb-2 mt-4"><span className="text-[10px] font-black text-red-600 uppercase tracking-widest">Performance</span></div>
                                        <InputField label="Processor" value={form.performance.processor} onChange={v => updateForm('performance.processor', v)} />
                                        <InputField label="GPU" value={form.performance.gpu} onChange={v => updateForm('performance.gpu', v)} />

                                        {/* Display */}
                                        <div className="col-span-full border-b border-gray-100 pb-2 mb-2 mt-4"><span className="text-[10px] font-black text-red-600 uppercase tracking-widest">Display</span></div>
                                        <InputField label="Screen Size" value={form.display.screenSize} onChange={v => updateForm('display.screenSize', v)} />
                                        <InputField label="Resolution" value={form.display.screenResolution} onChange={v => updateForm('display.screenResolution', v)} />
                                        <InputField label="Technology" value={form.display.technology} onChange={v => updateForm('display.technology', v)} />
                                        <InputField label="Protection" value={form.display.protection} onChange={v => updateForm('display.protection', v)} />

                                        {/* Battery */}
                                        <div className="col-span-full border-b border-gray-100 pb-2 mb-2 mt-4"><span className="text-[10px] font-black text-red-600 uppercase tracking-widest">Battery</span></div>
                                        <InputField label="Battery Type/Spec" value={form.battery.type} onChange={v => updateForm('battery.type', v)} />

                                        {/* Camera */}
                                        <div className="col-span-full border-b border-gray-100 pb-2 mb-2 mt-4"><span className="text-[10px] font-black text-red-600 uppercase tracking-widest">Camera</span></div>
                                        <InputField label="Front Camera" value={form.camera.frontCamera} onChange={v => updateForm('camera.frontCamera', v)} />
                                        <InputField label="Back Camera" value={form.camera.backCamera} onChange={v => updateForm('camera.backCamera', v)} />
                                        <InputField label="Features" value={form.camera.features} onChange={v => updateForm('camera.features', v)} />

                                        {/* Memory */}
                                        <div className="col-span-full border-b border-gray-100 pb-2 mb-2 mt-4"><span className="text-[10px] font-black text-red-600 uppercase tracking-widest">Memory</span></div>
                                        <InputField label="Internal Memory" value={form.memory.internalMemory} onChange={v => updateForm('memory.internalMemory', v)} />
                                        <InputField label="RAM" value={form.memory.ram} onChange={v => updateForm('memory.ram', v)} />
                                        <InputField label="Card Slot" value={form.memory.cardSlot} onChange={v => updateForm('memory.cardSlot', v)} />

                                        {/* Connectivity */}
                                        <div className="col-span-full border-b border-gray-100 pb-2 mb-2 mt-4"><span className="text-[10px] font-black text-red-600 uppercase tracking-widest">Connectivity</span></div>
                                        <InputField label="Data Transfer" value={form.connectivity.data} onChange={v => updateForm('connectivity.data', v)} />
                                        <InputField label="NFC" value={form.connectivity.nfc} onChange={v => updateForm('connectivity.nfc', v)} />
                                        <InputField label="Bluetooth" value={form.connectivity.bluetooth} onChange={v => updateForm('connectivity.bluetooth', v)} />
                                        <InputField label="Infrared" value={form.connectivity.infrared} onChange={v => updateForm('connectivity.infrared', v)} />
                                    </>}
                                    {form.category === "bikes_mechanical" && <>
                                        <InputField label="Engine" value={form.mechanicalBike.generalFeatures.engine} onChange={v => updateForm('mechanicalBike.generalFeatures.engine', v)} />
                                        <InputField label="Model Year" value={form.mechanicalBike.generalFeatures.model} onChange={v => updateForm('mechanicalBike.generalFeatures.model', v)} />
                                        <InputField label="Displacement" value={form.mechanicalBike.performance.displacement} onChange={v => updateForm('mechanicalBike.performance.displacement', v)} />
                                        <InputField label="Transmission" value={form.mechanicalBike.performance.transmission} onChange={v => updateForm('mechanicalBike.performance.transmission', v)} />
                                        <InputField label="Fuel Capacity" value={form.mechanicalBike.performance.petrolCapacity} onChange={v => updateForm('mechanicalBike.performance.petrolCapacity', v)} />
                                    </>}
                                    {form.category === "bikes_electric" && <>
                                        <InputField label="Model Year" value={form.electricalBike.model} onChange={v => updateForm('electricalBike.model', v)} />
                                        <InputField label="Battery Spec" value={form.electricalBike.batterySpec} onChange={v => updateForm('electricalBike.batterySpec', v)} />
                                        <InputField label="Range (KM)" value={form.electricalBike.rangeKm} onChange={v => updateForm('electricalBike.rangeKm', v)} />
                                        <InputField label="Motor" value={form.electricalBike.motor} onChange={v => updateForm('electricalBike.motor', v)} />
                                        <InputField label="Charging Time" value={form.electricalBike.chargingTime} onChange={v => updateForm('electricalBike.chargingTime', v)} />
                                        <InputField label="Speed" value={form.electricalBike.speed} onChange={v => updateForm('electricalBike.speed', v)} />
                                    </>}
                                    {form.category === "air_conditioner" && <>
                                        <InputField label="Brand" value={form.airConditioner.brand} onChange={v => updateForm('airConditioner.brand', v)} />
                                        <InputField label="Capacity (Ton)" value={form.airConditioner.capacityInTon} onChange={v => updateForm('airConditioner.capacityInTon', v)} />
                                        <InputField label="Energy Star" value={form.airConditioner.energyEfficient} onChange={v => updateForm('airConditioner.energyEfficient', v)} />
                                        <InputField label="Type (Inverter/Non)" value={form.airConditioner.type} onChange={v => updateForm('airConditioner.type', v)} />
                                    </>}
                                </div>
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
                                                </div>
                                            ))}
                                            <label className="aspect-square rounded-3xl border-4 border-dashed border-gray-100 hover:border-red-200 hover:bg-red-50/30 transition-all flex flex-col items-center justify-center cursor-pointer group">
                                                <input type="file" multiple className="hidden" onChange={handleFilesChange} />
                                                <span className="text-3xl text-gray-200 group-hover:text-red-600 font-light">+</span>
                                            </label>
                                        </div>
                                    </div>
                                    <div className="bg-gray-900 rounded-[3rem] p-10 flex flex-col justify-center items-center text-center space-y-6 shadow-2xl">
                                        <button disabled={!localImages.length || uploading} onClick={handleUploadAll} className="w-full py-5 bg-white text-gray-900 rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] hover:bg-red-600 hover:text-white transition-all disabled:opacity-20">
                                            {uploading ? 'Synching Assets...' : `Upload ${localImages.length} New Assets`}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 4 && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight border-l-8 border-red-600 pl-4">Step 4: Financial Logic</h2>
                                    <button onClick={() => setForm(f => ({ ...f, paymentPlans: [...f.paymentPlans, { ...defaultPlan }] }))} className="px-6 py-3 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-red-100 transition-all">+ Add Logic Tier</button>
                                </div>
                                <div className="space-y-6">
                                    {form.paymentPlans.map((p, idx) => (
                                        <div key={idx} className="bg-gray-50/50 p-8 rounded-[2.5rem] border border-gray-100 relative group">
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                                <InputField label="Tier ID" value={p.planName} onChange={v => {
                                                    const pp = [...form.paymentPlans];
                                                    pp[idx].planName = v;
                                                    setForm(f => ({ ...f, paymentPlans: pp }));
                                                }} />
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Method</label>
                                                    <select value={p.interestType} onChange={e => {
                                                        const pp = [...form.paymentPlans];
                                                        pp[idx].interestType = e.target.value;
                                                        setForm(f => ({ ...f, paymentPlans: pp }));
                                                        setTimeout(() => recalcPlan(idx), 0);
                                                    }} className="w-full px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-xs font-black outline-none transition-all">
                                                        <option>Flat Rate</option>
                                                        <option>Reducing Balance</option>
                                                        <option>Compound Interest</option>
                                                        <option>Profit-Based (Islamic/Shariah)</option>
                                                    </select>
                                                </div>
                                                <InputField label="Months" type="number" value={p.tenureMonths} onChange={v => {
                                                    const pp = [...form.paymentPlans];
                                                    pp[idx].tenureMonths = v;
                                                    setForm(f => ({ ...f, paymentPlans: pp }));
                                                    setTimeout(() => recalcPlan(idx), 0);
                                                }} />
                                                <InputField label="Rate %" type="number" value={p.interestRatePercent} onChange={v => {
                                                    const pp = [...form.paymentPlans];
                                                    pp[idx].interestRatePercent = v;
                                                    setForm(f => ({ ...f, paymentPlans: pp }));
                                                    setTimeout(() => recalcPlan(idx), 0);
                                                }} />
                                                <InputField label="Downpayment" type="number" value={p.downPayment} onChange={v => {
                                                    const pp = [...form.paymentPlans];
                                                    pp[idx].downPayment = v;
                                                    setForm(f => ({ ...f, paymentPlans: pp }));
                                                    setTimeout(() => recalcPlan(idx), 0);
                                                }} />
                                            </div>
                                            <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-4 bg-white/50 p-6 rounded-3xl border border-white">
                                                <SummaryItem label="Installment" value={p.monthlyInstallment} highlight />
                                                <SummaryItem label="Total Interest" value={p.totalInterest} />
                                                <SummaryItem label="Full Payable" value={p.installmentPrice} border={false} />
                                            </div>
                                            {form.paymentPlans.length > 1 && <button onClick={() => setForm(f => ({ ...f, paymentPlans: f.paymentPlans.filter((_, i) => i !== idx) }))} className="absolute top-4 right-4 text-gray-300 hover:text-red-600 transition-colors">✕</button>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-8 bg-gray-50/50 border-t border-gray-100 flex justify-between items-center">
                        <button onClick={() => setStep(s => Math.max(1, s - 1))} className={`px-10 py-4 font-black uppercase text-[10px] tracking-widest transition-all ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-gray-400 hover:text-gray-900'}`}>Previous Vector</button>
                        <div className="flex gap-4">
                            {step < 4 ?
                                <button onClick={() => setStep(s => s + 1)} className="px-12 py-4 bg-gray-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] hover:bg-red-600 shadow-xl shadow-gray-200 transition-all">Next Phase Matrix</button>
                                :
                                <button onClick={handleSubmit} disabled={loading} className="px-12 py-4 bg-red-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] hover:bg-red-700 shadow-xl shadow-red-100 transition-all active:scale-95">
                                    {loading ? 'Committing Override...' : 'Publish Update'}
                                </button>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const InputField = ({ label, value, onChange, type = "text", placeholder = "" }) => (
    <div className="space-y-2 group">
        {label && <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-focus-within:text-red-600 transition-colors pl-1">{label}</label>}
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent focus:border-red-600 focus:bg-white rounded-2xl text-sm font-bold transition-all outline-none shadow-sm" />
    </div>
);

const SummaryItem = ({ label, value, highlight = false, border = true }) => (
    <div className={`flex flex-col gap-1 ${border ? 'border-r border-gray-100' : ''} px-4`}>
        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
        <span className={`text-sm font-black tracking-tighter ${highlight ? 'text-red-600' : 'text-gray-800'}`}>
            RS. {Number(value || 0).toLocaleString()}
        </span>
    </div>
);

export default InstallmentsEdit;
