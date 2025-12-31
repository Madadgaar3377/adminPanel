import React, { useState, useEffect } from 'react';
import ApiBaseUrl from '../constants/apiUrl';
import { useNavigate, useParams } from 'react-router-dom';

const LoanEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [activeTab, setActiveTab] = useState('basic');
    const [uploadingImages, setUploadingImages] = useState(false);
    const [uploadError, setUploadError] = useState('');

    const [formData, setFormData] = useState({
        loanType: '',
        employmentType: '',
        loanImages: [],
        name: '',
        email: '',
        phone: '',
        city: '',
        netSalary: '',
        otherSrcOfIncome: '',
        monthlyIncomeFromOtherSrc: '',
        relevantExperience: '',
        lenOfCurrentEmpOrBusiness: '',
        age: '',
        qualification: '',
        residenceInfo: '',
        residenceType: '',
        materialStatus: '',
        noOfDependents: '',
        vehicleOwnershipStatus: '',
        isVerified: false,
    });

    useEffect(() => {
        fetchLoan();
    }, [id]);

    const fetchLoan = async () => {
        try {
            const res = await fetch(`${ApiBaseUrl}/getAllLoans`);
            const data = await res.json();
            if (data.success) {
                const loan = data.data.find(l => l.loanPlanId === id);
                if (loan) {
                    setFormData(loan);
                } else {
                    setError('Loan plan not found');
                }
            }
        } catch (err) {
            setError('Failed to load loan data');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? checked : value 
        }));
    };

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setUploadingImages(true);
        setUploadError('');

        try {
            const uploadedUrls = [];

            for (const file of files) {
                const formDataUpload = new FormData();
                formDataUpload.append('image', file);

                const response = await fetch(`${ApiBaseUrl}/upload-image`, {
                    method: 'POST',
                    body: formDataUpload
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    uploadedUrls.push(data.url);
                } else {
                    throw new Error(data.message || 'Upload failed');
                }
            }

            setFormData(prev => ({ 
                ...prev, 
                loanImages: [...(prev.loanImages || []), ...uploadedUrls] 
            }));

        } catch (err) {
            setUploadError(err.message || 'Failed to upload images. Please try again.');
        } finally {
            setUploadingImages(false);
        }
    };

    const removeImage = (index) => {
        setFormData(prev => ({
            ...prev,
            loanImages: (prev.loanImages || []).filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUpdating(true);
        setError('');
        setSuccess('');

        try {
            const authData = JSON.parse(localStorage.getItem('adminAuth'));
            const response = await fetch(`${ApiBaseUrl}/updateLoan/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authData.token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setSuccess('Loan plan updated successfully!');
                setTimeout(() => navigate('/loan/all'), 2000);
            } else {
                setError(data.message || 'Failed to update loan plan');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setUpdating(false);
        }
    };

    const tabs = [
        { id: 'basic', label: 'Basic Info' },
        { id: 'financial', label: 'Financial' },
        { id: 'personal', label: 'Personal' },
        { id: 'verification', label: 'Verification' }
    ];

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="w-12 h-12 border-4 border-gray-100 border-t-red-600 rounded-full animate-spin"></div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Loading Loan Data...</p>
        </div>
    );

    return (
        <div className="space-y-4 xs:space-y-6 md:space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="bg-white p-4 xs:p-6 md:p-8 rounded-[1.5rem] xs:rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-gray-100">
                <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-3 xs:gap-0">
                    <div>
                        <h1 className="text-xl xs:text-2xl md:text-3xl font-black text-gray-900 tracking-tighter uppercase">Edit Loan Plan</h1>
                        <p className="text-[8px] xs:text-[9px] md:text-[10px] font-black text-red-600 uppercase tracking-[0.2em] xs:tracking-[0.3em] mt-0.5 xs:mt-1">ID: {id}</p>
                    </div>
                    <button
                        onClick={() => navigate('/loan/all')}
                        className="tap-target px-4 xs:px-5 md:px-6 py-2 xs:py-2.5 md:py-3 bg-gray-100 text-gray-600 rounded-xl xs:rounded-2xl font-black uppercase text-[8px] xs:text-[9px] md:text-[10px] tracking-wider xs:tracking-widest hover:bg-gray-200 transition-all active:scale-95"
                    >
                        ← Back to List
                    </button>
                </div>
            </div>

            {/* Messages */}
            {error && (
                <div className="bg-red-50 border-l-4 border-red-600 p-3 xs:p-4 rounded-lg xs:rounded-xl animate-in slide-in-from-top duration-200">
                    <p className="text-xs xs:text-sm text-red-700 font-bold">{error}</p>
                </div>
            )}
            {success && (
                <div className="bg-emerald-50 border-l-4 border-emerald-600 p-3 xs:p-4 rounded-lg xs:rounded-xl animate-in slide-in-from-top duration-200">
                    <p className="text-xs xs:text-sm text-emerald-700 font-bold">{success}</p>
                </div>
            )}

            {/* Tabs */}
            <div className="bg-white rounded-[1.5rem] xs:rounded-[2rem] border border-gray-100 overflow-x-auto scrollbar-hide">
                <div className="flex gap-1 xs:gap-2 p-2 xs:p-3 min-w-max xs:min-w-0">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`tap-target px-4 xs:px-6 py-2 xs:py-2.5 rounded-lg xs:rounded-xl text-[9px] xs:text-[10px] font-black uppercase tracking-wider xs:tracking-widest transition-all whitespace-nowrap ${
                                activeTab === tab.id
                                    ? 'bg-red-600 text-white shadow-lg'
                                    : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white p-4 xs:p-6 md:p-8 rounded-[1.5rem] xs:rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-gray-100">
                {activeTab === 'basic' && (
                    <div className="space-y-4 xs:space-y-6">
                        <h3 className="text-base xs:text-lg font-black text-gray-900 uppercase tracking-tighter pb-3 xs:pb-4 border-b border-gray-100">Basic Information</h3>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 xs:gap-6">
                            <div>
                                <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">Loan Type</label>
                                <input
                                    type="text"
                                    name="loanType"
                                    value={formData.loanType}
                                    onChange={handleChange}
                                    className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">Employment Type</label>
                                <select
                                    name="employmentType"
                                    value={formData.employmentType}
                                    onChange={handleChange}
                                    className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                                >
                                    <option value="">Select Type</option>
                                    <option value="Salaried">Salaried</option>
                                    <option value="Self-Employed">Self-Employed</option>
                                    <option value="Business Owner">Business Owner</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">Phone</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">City</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">Loan Images</label>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageUpload}
                                disabled={uploadingImages}
                                className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-dashed border-gray-200 focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            
                            {uploadingImages && (
                                <div className="mt-3 flex items-center gap-2 text-xs text-gray-600">
                                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span className="font-bold">Uploading images...</span>
                                </div>
                            )}

                            {uploadError && (
                                <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 font-bold">
                                    {uploadError}
                                </div>
                            )}
                            
                            {formData.loanImages && formData.loanImages.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-2 xs:gap-3">
                                    {formData.loanImages.map((img, idx) => (
                                        <div key={idx} className="relative group">
                                            <div className="w-16 h-16 xs:w-20 xs:h-20 rounded-lg overflow-hidden border-2 border-gray-100 shadow-sm">
                                                <img src={img} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeImage(idx)}
                                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-700 active:scale-90"
                                            >
                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            
                            <p className="mt-2 text-[8px] xs:text-[9px] text-gray-400 font-bold">
                                Supported formats: JPG, PNG, GIF. Max size: 5MB per image.
                            </p>
                        </div>
                    </div>
                )}

                {activeTab === 'financial' && (
                    <div className="space-y-4 xs:space-y-6">
                        <h3 className="text-base xs:text-lg font-black text-gray-900 uppercase tracking-tighter pb-3 xs:pb-4 border-b border-gray-100">Financial Information</h3>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 xs:gap-6">
                            <div>
                                <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">Net Salary</label>
                                <input
                                    type="text"
                                    name="netSalary"
                                    value={formData.netSalary}
                                    onChange={handleChange}
                                    className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">Other Source of Income</label>
                                <input
                                    type="text"
                                    name="otherSrcOfIncome"
                                    value={formData.otherSrcOfIncome}
                                    onChange={handleChange}
                                    className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">Monthly Income from Other Source</label>
                                <input
                                    type="text"
                                    name="monthlyIncomeFromOtherSrc"
                                    value={formData.monthlyIncomeFromOtherSrc}
                                    onChange={handleChange}
                                    className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'personal' && (
                    <div className="space-y-4 xs:space-y-6">
                        <h3 className="text-base xs:text-lg font-black text-gray-900 uppercase tracking-tighter pb-3 xs:pb-4 border-b border-gray-100">Personal Information</h3>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 xs:gap-6">
                            <div>
                                <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">Age</label>
                                <input
                                    type="text"
                                    name="age"
                                    value={formData.age}
                                    onChange={handleChange}
                                    className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">Qualification</label>
                                <input
                                    type="text"
                                    name="qualification"
                                    value={formData.qualification}
                                    onChange={handleChange}
                                    className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">Marital Status</label>
                                <select
                                    name="materialStatus"
                                    value={formData.materialStatus}
                                    onChange={handleChange}
                                    className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                                >
                                    <option value="">Select</option>
                                    <option value="Single">Single</option>
                                    <option value="Married">Married</option>
                                    <option value="Divorced">Divorced</option>
                                    <option value="Widowed">Widowed</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">Number of Dependents</label>
                                <input
                                    type="text"
                                    name="noOfDependents"
                                    value={formData.noOfDependents}
                                    onChange={handleChange}
                                    className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">Residence Type</label>
                                <input
                                    type="text"
                                    name="residenceType"
                                    value={formData.residenceType}
                                    onChange={handleChange}
                                    className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">Vehicle Ownership</label>
                                <input
                                    type="text"
                                    name="vehicleOwnershipStatus"
                                    value={formData.vehicleOwnershipStatus}
                                    onChange={handleChange}
                                    className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">Residence Information</label>
                                <textarea
                                    name="residenceInfo"
                                    value={formData.residenceInfo}
                                    onChange={handleChange}
                                    rows="3"
                                    className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none resize-none"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'verification' && (
                    <div className="space-y-4 xs:space-y-6">
                        <h3 className="text-base xs:text-lg font-black text-gray-900 uppercase tracking-tighter pb-3 xs:pb-4 border-b border-gray-100">Verification Status</h3>
                        
                        <div className="flex items-center gap-3 xs:gap-4 p-4 xs:p-6 bg-gray-50 rounded-xl xs:rounded-2xl">
                            <input
                                type="checkbox"
                                name="isVerified"
                                checked={formData.isVerified}
                                onChange={handleChange}
                                className="w-5 h-5 xs:w-6 xs:h-6 text-red-600 bg-white border-gray-300 rounded focus:ring-red-500 focus:ring-2"
                            />
                            <div>
                                <label className="text-sm xs:text-base font-black text-gray-900 uppercase">Verify This Loan Plan</label>
                                <p className="text-[9px] xs:text-[10px] text-gray-500 font-bold mt-0.5">Mark this loan application as verified and approved</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Submit Button */}
                <div className="flex flex-col xs:flex-row gap-3 xs:gap-4 mt-6 xs:mt-8 pt-6 xs:pt-8 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={() => navigate('/loan/all')}
                        className="tap-target flex-1 py-3 xs:py-3.5 px-4 bg-gray-100 text-gray-600 rounded-xl xs:rounded-2xl font-black uppercase text-[10px] xs:text-xs tracking-wider xs:tracking-widest hover:bg-gray-200 transition-all active:scale-95"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={updating}
                        className={`tap-target flex-1 py-3 xs:py-3.5 px-4 bg-red-600 text-white rounded-xl xs:rounded-2xl font-black uppercase text-[10px] xs:text-xs tracking-wider xs:tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-100 ${updating ? 'opacity-70 cursor-not-allowed' : 'active:scale-95'}`}
                    >
                        {updating ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Updating...
                            </span>
                        ) : (
                            'Update Loan Plan'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default LoanEdit;

