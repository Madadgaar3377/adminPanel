import React, { useState, useEffect } from 'react';
import ApiBaseUrl from '../constants/apiUrl';
import { useNavigate, useParams } from 'react-router-dom';

const PropertyAdd = () => {
    const { id } = useParams(); // propertyId
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const initialForm = {
        purpose: "For Sale",
        name: "",
        duration: "",
        typeOfProject: "",
        plotSize: "",
        plotStage: "",
        possessionType: "",
        otherDetails: "",
        specificDetails: "",
        typeOfProperty: "House",
        address: "",
        longitude: "",
        latitude: "",
        areaSize: "",
        price: 0,
        readyForPossession: "Yes",
        advanceAmount: "",
        noOfInstallment: 0,
        monthlyInstallment: 0,
        builtInYear: new Date().getFullYear(),
        flooring: "",
        floors: 1,
        parkingSpace: "",
        electricityBackup: "",
        furnished: "No",
        view: "",
        wasteDisposal: "",
        bedRooms: "",
        bathrooms: "",
        kitchens: "",
        storeRooms: "",
        drawingRooms: "",
        diningRooms: "",
        studyRooms: "",
        prayerRooms: "",
        servantQuarters: "",
        sittingRooms: "",
        communityLawn: "No",
        medicalCentre: "No",
        dayCare: "No",
        communityPool: "No",
        kidsPlayArea: "No",
        mosque: "No",
        communityGym: "No",
        bbqArea: "No",
        communityCentre: "No",
        nearBySchools: "",
        nearByHospitals: "",
        nearByShoppingMalls: "",
        nearByColleges: "",
        nearByRestaurants: "",
        nearByPublicTransport: "",
        nearByUniversity: "",
        adTitle: "",
        adDescription: "",
        images: [],
        fullName: "",
        mobile: "",
        email: "",
        anyMessage: "",
    };

    const [form, setForm] = useState(initialForm);

    useEffect(() => {
        if (id) fetchExistingProperty();
    }, [id]);

    const fetchExistingProperty = async () => {
        setFetching(true);
        try {
            const authData = JSON.parse(localStorage.getItem('adminAuth'));
            const res = await fetch(`${ApiBaseUrl}/getProperty/${id}`, {
                headers: {
                    ...(authData?.token ? { Authorization: `Bearer ${authData.token}` } : {}),
                }
            });
            const data = await res.json();
            if (data.success) {
                setForm({ ...initialForm, ...data.property });
            }
        } catch (err) {
            setError("Critical Failure: Data synthesis interrupted.");
        } finally {
            setFetching(false);
        }
    };

    const handleInput = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        setUploading(true);
        try {
            const authData = JSON.parse(localStorage.getItem('adminAuth'));
            for (let file of files) {
                const fd = new FormData();
                fd.append('image', file);
                const res = await fetch(`${ApiBaseUrl}/upload-image`, {
                    method: 'POST',
                    headers: {
                        ...(authData?.token ? { Authorization: `Bearer ${authData.token}` } : {}),
                    },
                    body: fd
                });
                const data = await res.json();
                const url = data.imageUrl || data.url || data.data?.url || data.data;
                if (url) {
                    setForm(prev => ({ ...prev, images: [...prev.images, url] }));
                }
            }
        } catch (err) {
            setError("Image broadcast failed.");
        } finally {
            setUploading(false);
        }
    };

    const removeImage = (index) => {
        setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);
        try {
            const authData = JSON.parse(localStorage.getItem('adminAuth'));
            const url = id ? `${ApiBaseUrl}/updateProperty` : `${ApiBaseUrl}/createProperty`;
            const method = id ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    ...(authData?.token ? { Authorization: `Bearer ${authData.token}` } : {}),
                },
                body: JSON.stringify({ data: form })
            });

            const result = await res.json();
            if (result.success) {
                setMessage(id ? "PROPERTY OVERRIDE SUCCESSFUL" : "NEW PROPERTY ARCHIVED IN SPECTRE");
                setTimeout(() => navigate('/property/all'), 2000);
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError("System override failed: Network protocol error.");
        } finally {
            setLoading(false);
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div className="space-y-8 animate-in slide-in-from-right duration-500">
                        <SectionTitle theme="red">Core Architecture Specs</SectionTitle>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <Input label="Protocol Type" name="purpose" type="select" options={['For Sale', 'For Rent', 'On Installment']} value={form.purpose} onChange={handleInput} />
                            <Input label="Registry Name" name="name" value={form.name} onChange={handleInput} placeholder="e.g. Madadgaar Heights" />
                            <Input label="Project Duration" name="duration" value={form.duration} onChange={handleInput} placeholder="e.g. 5 Years / Ready" />
                            <Input label="Project Classification" name="typeOfProject" type="select" options={['Residential', 'Commercial', 'Mixed Use']} value={form.typeOfProject} onChange={handleInput} />
                            <Input label="Property Class" name="typeOfProperty" type="select" options={['House', 'Flat', 'Residential Plot', 'Commercial Plot', 'Agricultural Land']} value={form.typeOfProperty} onChange={handleInput} />
                            <Input label="Area Magnitude" name="areaSize" value={form.areaSize} onChange={handleInput} placeholder="e.g. 10 Marla / 500 Sqft" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Input label="Plot Stage" name="plotStage" type="select" options={['Developed', 'Under Construction', 'Open Land']} value={form.plotStage} onChange={handleInput} />
                            <Input label="Possession Status" name="possessionType" type="select" options={['Immediate', 'On Full Payment', 'Under Contract']} value={form.possessionType} onChange={handleInput} />
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-8 animate-in slide-in-from-right duration-500">
                        <SectionTitle theme="red">Valuation & Geo-Tagging</SectionTitle>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Input label="Base Price (RS)" name="price" type="number" value={form.price} onChange={handleInput} />
                            <Input label="Advance Multiplier" name="advanceAmount" value={form.advanceAmount} onChange={handleInput} placeholder="e.g. 25% Upfront" />
                            <Input label="Installment Count" name="noOfInstallment" type="number" value={form.noOfInstallment} onChange={handleInput} />
                            <Input label="Monthly Burden (RS)" name="monthlyInstallment" type="number" value={form.monthlyInstallment} onChange={handleInput} />
                            <Input label="Spatial Address" name="address" value={form.address} onChange={handleInput} className="md:col-span-2" />
                            <Input label="Latitude Protocol" name="latitude" value={form.latitude} onChange={handleInput} />
                            <Input label="Longitude Protocol" name="longitude" value={form.longitude} onChange={handleInput} />
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-8 animate-in slide-in-from-right duration-500">
                        <SectionTitle theme="red">Interior Integrity & Layout</SectionTitle>
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                            <Input label="Bed Units" name="bedRooms" type="number" value={form.bedRooms} onChange={handleInput} />
                            <Input label="Bath Systems" name="bathrooms" type="number" value={form.bathrooms} onChange={handleInput} />
                            <Input label="Kitchen Nodes" name="kitchens" type="number" value={form.kitchens} onChange={handleInput} />
                            <Input label="Floor Elevation" name="floors" type="number" value={form.floors} onChange={handleInput} />
                            <Input label="Flooring Type" name="flooring" type="select" options={['Tile', 'Marble', 'Wood', 'Concrete']} value={form.flooring} onChange={handleInput} />
                            <Input label="Furnished Mode" name="furnished" type="select" options={['No', 'Yes', 'Semi']} value={form.furnished} onChange={handleInput} />
                            <Input label="Store Rooms" name="storeRooms" type="number" value={form.storeRooms} onChange={handleInput} />
                            <Input label="Servant Quarters" name="servantQuarters" type="number" value={form.servantQuarters} onChange={handleInput} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <Input label="Parking Space" name="parkingSpace" value={form.parkingSpace} onChange={handleInput} />
                            <Input label="Backup Protocol" name="electricityBackup" type="select" options={['None', 'Generator', 'UPS', 'Solar']} value={form.electricityBackup} onChange={handleInput} />
                            <Input label="Waste Disposal" name="wasteDisposal" type="select" options={['Treated', 'Municipal', 'Private']} value={form.wasteDisposal} onChange={handleInput} />
                            <Input label="External View" name="view" value={form.view} onChange={handleInput} placeholder="e.g. Park View" />
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="space-y-8 animate-in slide-in-from-right duration-500">
                        <SectionTitle theme="red">Amenities & Surveillance</SectionTitle>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                            <Checkbox label="Lawn" name="communityLawn" checked={form.communityLawn === 'Yes'} onChange={(e) => setForm(f => ({ ...f, communityLawn: e.target.checked ? 'Yes' : 'No' }))} />
                            <Checkbox label="Pool" name="communityPool" checked={form.communityPool === 'Yes'} onChange={(e) => setForm(f => ({ ...f, communityPool: e.target.checked ? 'Yes' : 'No' }))} />
                            <Checkbox label="Gym" name="communityGym" checked={form.communityGym === 'Yes'} onChange={(e) => setForm(f => ({ ...f, communityGym: e.target.checked ? 'Yes' : 'No' }))} />
                            <Checkbox label="Mosque" name="mosque" checked={form.mosque === 'Yes'} onChange={(e) => setForm(f => ({ ...f, mosque: e.target.checked ? 'Yes' : 'No' }))} />
                            <Checkbox label="Play Area" name="kidsPlayArea" checked={form.kidsPlayArea === 'Yes'} onChange={(e) => setForm(f => ({ ...f, kidsPlayArea: e.target.checked ? 'Yes' : 'No' }))} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-gray-50">
                            <Input label="Nearby Schools" name="nearBySchools" value={form.nearBySchools} onChange={handleInput} />
                            <Input label="Nearby Hospitals" name="nearByHospitals" value={form.nearByHospitals} onChange={handleInput} />
                            <Input label="Public Transport" name="nearByPublicTransport" value={form.nearByPublicTransport} onChange={handleInput} />
                            <Input label="Shopping Malls" name="nearByShoppingMalls" value={form.nearByShoppingMalls} onChange={handleInput} />
                        </div>
                    </div>
                );
            case 5:
                return (
                    <div className="space-y-8 animate-in slide-in-from-right duration-500">
                        <SectionTitle theme="red">Marketing Assets & Outreach</SectionTitle>
                        <div className="space-y-6">
                            <Input label="Ad Headline" name="adTitle" value={form.adTitle} onChange={handleInput} placeholder="MAXIMUM IMPACT TITLE..." />
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Asset Description</label>
                                <textarea
                                    name="adDescription"
                                    value={form.adDescription}
                                    onChange={handleInput}
                                    rows={6}
                                    className="w-full px-6 py-5 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-[2rem] text-sm font-bold outline-none transition-all shadow-inner resize-none"
                                    placeholder="DETAILED SPECS AND SELLING POINTS..."
                                />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Visual Evidence (Gallery)</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {form.images.map((img, i) => (
                                    <div key={i} className="aspect-square relative rounded-2xl overflow-hidden group border border-gray-100 shadow-sm">
                                        <img src={img} className="w-full h-full object-cover" alt="" />
                                        <button
                                            onClick={() => removeImage(i)}
                                            className="absolute inset-0 bg-red-600/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"
                                        >
                                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </div>
                                ))}
                                <label className="aspect-square bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-red-600 transition-all group">
                                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-gray-300 group-hover:text-red-600 transition-colors">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                                    </div>
                                    <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest mt-2">{uploading ? 'Transmitting...' : 'Add Source'}</span>
                                    <input type="file" multiple onChange={handleImageUpload} className="hidden" />
                                </label>
                            </div>
                        </div>
                    </div>
                );
            case 6:
                return (
                    <div className="space-y-8 animate-in slide-in-from-right duration-500">
                        <SectionTitle theme="red">Final Authentication & Contact</SectionTitle>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Input label="Primary Full Name" name="fullName" value={form.fullName} onChange={handleInput} />
                            <Input label="Secure Mobile Line" name="mobile" value={form.mobile} onChange={handleInput} />
                            <Input label="Official Email" name="email" value={form.email} onChange={handleInput} />
                            <Input label="Secondary Landline" name="landLine" value={form.landLine} onChange={handleInput} />
                            <Input label="Admin Special Message" name="anyMessage" value={form.anyMessage} onChange={handleInput} className="md:col-span-2" placeholder="OVERRIDE INSTRUCTIONS OR NOTES..." />
                        </div>
                    </div>
                );
            default: return null;
        }
    };

    if (fetching) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="w-12 h-12 border-4 border-gray-100 border-t-red-600 rounded-full animate-spin"></div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Pulling Property Profile...</p>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-10 pb-20 animate-in fade-in duration-700">
            {/* Nav Header */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">{id ? 'Override Protocol' : 'Deploy Protocol'}</h1>
                    <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.3em] mt-1 flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
                        Real Estate Module v5.2 (STEP {step}/6)
                    </p>
                </div>
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className={`h-1.5 w-6 rounded-full transition-all duration-500 ${step >= i ? 'bg-red-600' : 'bg-gray-100'}`}></div>
                    ))}
                </div>
            </div>

            {message && <div className="p-5 bg-emerald-50 border-2 border-emerald-100 text-emerald-600 rounded-3xl font-black uppercase text-[11px] tracking-[0.2em] text-center shadow-lg shadow-emerald-50 animate-bounce">{message}</div>}
            {error && <div className="p-5 bg-red-50 border-2 border-red-100 text-red-600 rounded-3xl font-black uppercase text-[11px] tracking-[0.2em] text-center shadow-lg shadow-red-50">{error}</div>}

            {/* Main Form Area */}
            <div className="bg-white rounded-[3.5rem] p-12 shadow-2xl border border-gray-100">
                {renderStep()}

                <div className="flex justify-between items-center mt-16 pt-10 border-t border-gray-50">
                    <button
                        onClick={() => step > 1 ? setStep(s => s - 1) : navigate('/property/all')}
                        className="px-10 py-4 bg-gray-50 text-gray-400 hover:text-gray-900 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all"
                    >
                        {step === 1 ? 'Abort Deployment' : 'Back Step'}
                    </button>

                    {step < 6 ? (
                        <button
                            onClick={() => setStep(s => s + 1)}
                            className="px-12 py-5 bg-gray-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-600 shadow-xl shadow-gray-200 transition-all active:scale-95"
                        >
                            Next protocol
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className={`px-16 py-5 bg-red-600 text-white rounded-2xl font-black uppercase text-xs tracking-[0.3em] shadow-2xl shadow-red-100 hover:bg-black transition-all active:scale-95 ${loading ? 'opacity-50 blur-sm' : ''}`}
                        >
                            {loading ? 'Committing...' : (id ? 'Override System' : 'Deploy Listing')}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// UI Fragments
const SectionTitle = ({ children, theme = "gray" }) => (
    <h2 className={`text-xl font-black uppercase tracking-tight pl-4 border-l-8 ${theme === 'red' ? 'border-red-600 text-gray-900' : 'border-gray-200 text-gray-900'}`}>
        {children}
    </h2>
);

const Input = ({ label, name, type = "text", value, onChange, placeholder, options, className = "" }) => (
    <div className={`space-y-2 ${className}`}>
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
        {type === 'select' ? (
            <select name={name} value={value} onChange={onChange} className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-2xl text-sm font-bold outline-none transition-all shadow-inner appearance-none">
                {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
        ) : (
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-2xl text-sm font-bold outline-none transition-all shadow-inner"
            />
        )}
    </div>
);

const Checkbox = ({ label, name, checked, onChange }) => (
    <label className="flex items-center gap-3 cursor-pointer group">
        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${checked ? 'bg-red-600 border-red-600 shadow-sm' : 'bg-gray-50 border-gray-100 group-hover:border-red-200'}`}>
            {checked && <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
        </div>
        <span className={`text-[10px] font-black uppercase tracking-widest ${checked ? 'text-gray-900' : 'text-gray-400 group-hover:text-red-600'}`}>
            {label}
        </span>
        <input type="checkbox" name={name} checked={checked} onChange={onChange} className="hidden" />
    </label>
);

export default PropertyAdd;
