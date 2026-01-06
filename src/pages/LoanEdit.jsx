import React, { useState, useEffect } from 'react';
import ApiBaseUrl from '../constants/apiUrl';
import { useNavigate, useParams } from 'react-router-dom';

const LoanEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [uploadingImage, setUploadingImage] = useState(false);
    const [uploadingDocument, setUploadingDocument] = useState(false);
    const [uploadError, setUploadError] = useState('');

    const [formData, setFormData] = useState({
        productName: '',
        bankName: '',
        planImage: '',
        majorCategory: '',
        subCategory: '',
        financingType: '',
        minFinancingAmount: '',
        maxFinancingAmount: '',
        minTenure: '',
        maxTenure: '',
        tenureUnit: 'Months',
        indicativeRate: '',
        rateType: '',
        eligibility: {
            minAge: '',
            maxAge: '',
            minIncome: '',
            employmentType: [],
            requiredDocuments: []
        },
        targetAudience: [],
        description: '',
        planDocument: ''
    });

    const totalSteps = 6;

    useEffect(() => {
        fetchLoan();
    }, [id]);

    const fetchLoan = async () => {
        try {
            const res = await fetch(`${ApiBaseUrl}/getAllLoans`);
            const data = await res.json();
            if (data.success) {
                const loan = data.data.find(l => l.planId === id);
                if (loan) {
                    setFormData({
                        productName: loan.productName || '',
                        bankName: loan.bankName || '',
                        planImage: loan.planImage || '',
                        majorCategory: loan.majorCategory || '',
                        subCategory: loan.subCategory || '',
                        financingType: loan.financingType || '',
                        minFinancingAmount: loan.minFinancingAmount || '',
                        maxFinancingAmount: loan.maxFinancingAmount || '',
                        minTenure: loan.minTenure || '',
                        maxTenure: loan.maxTenure || '',
                        tenureUnit: loan.tenureUnit || 'Months',
                        indicativeRate: loan.indicativeRate || '',
                        rateType: loan.rateType || '',
                        eligibility: {
                            minAge: loan.eligibility?.minAge || '',
                            maxAge: loan.eligibility?.maxAge || '',
                            minIncome: loan.eligibility?.minIncome || '',
                            employmentType: loan.eligibility?.employmentType || [],
                            requiredDocuments: loan.eligibility?.requiredDocuments || []
                        },
                        targetAudience: loan.targetAudience || [],
                        description: loan.description || '',
                        planDocument: loan.planDocument || ''
                    });
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
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleEligibilityChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            eligibility: { ...prev.eligibility, [name]: value }
        }));
    };

    const handleCheckboxChange = (field, value) => {
        setFormData(prev => {
            const currentArray = prev[field] || [];
            const newArray = currentArray.includes(value)
                ? currentArray.filter(item => item !== value)
                : [...currentArray, value];
            return { ...prev, [field]: newArray };
        });
    };

    const handleEligibilityCheckboxChange = (field, value) => {
        setFormData(prev => {
            const currentArray = prev.eligibility[field] || [];
            const newArray = currentArray.includes(value)
                ? currentArray.filter(item => item !== value)
                : [...currentArray, value];
            return {
                ...prev,
                eligibility: { ...prev.eligibility, [field]: newArray }
            };
        });
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingImage(true);
        setUploadError('');

        try {
            const formDataUpload = new FormData();
            formDataUpload.append('image', file);

            const response = await fetch(`${ApiBaseUrl}/upload-image`, {
                method: 'POST',
                body: formDataUpload
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setFormData(prev => ({ ...prev, planImage: data.url }));
            } else {
                throw new Error(data.message || 'Upload failed');
            }
        } catch (err) {
            setUploadError(err.message || 'Failed to upload image. Please try again.');
        } finally {
            setUploadingImage(false);
        }
    };

    const handleDocumentUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingDocument(true);
        setUploadError('');

        try {
            const formDataUpload = new FormData();
            formDataUpload.append('image', file);

            const response = await fetch(`${ApiBaseUrl}/upload-image`, {
                method: 'POST',
                body: formDataUpload
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setFormData(prev => ({ ...prev, planDocument: data.url }));
            } else {
                throw new Error(data.message || 'Upload failed');
            }
        } catch (err) {
            setUploadError(err.message || 'Failed to upload document. Please try again.');
        } finally {
            setUploadingDocument(false);
        }
    };

    const validateStep = (step) => {
        setError('');
        
        switch (step) {
            case 1:
                if (!formData.productName.trim()) {
                    setError('Product Name is required');
                    return false;
                }
                if (!formData.bankName.trim()) {
                    setError('Bank Name is required');
                    return false;
                }
                break;
            case 2:
                if (!formData.majorCategory) {
                    setError('Major Category is required');
                    return false;
                }
                if (!formData.financingType) {
                    setError('Financing Type is required (Conventional or Islamic)');
                    return false;
                }
                break;
            case 3:
                if (!formData.minFinancingAmount || formData.minFinancingAmount <= 0) {
                    setError('Min Financing Amount is required and must be greater than 0');
                    return false;
                }
                if (!formData.maxFinancingAmount || formData.maxFinancingAmount <= 0) {
                    setError('Max Financing Amount is required and must be greater than 0');
                    return false;
                }
                if (parseFloat(formData.minFinancingAmount) >= parseFloat(formData.maxFinancingAmount)) {
                    setError('Max Financing Amount must be greater than Min Financing Amount');
                    return false;
                }
                if (!formData.minTenure || formData.minTenure <= 0) {
                    setError('Min Tenure is required and must be greater than 0');
                    return false;
                }
                if (!formData.maxTenure || formData.maxTenure <= 0) {
                    setError('Max Tenure is required and must be greater than 0');
                    return false;
                }
                if (parseFloat(formData.minTenure) >= parseFloat(formData.maxTenure)) {
                    setError('Max Tenure must be greater than Min Tenure');
                    return false;
                }
                break;
            case 4:
                if (!formData.indicativeRate.trim()) {
                    setError('Indicative Rate is required');
                    return false;
                }
                if (!formData.rateType) {
                    setError('Rate Type is required (Fixed, Variable, or Floating)');
                    return false;
                }
                break;
            default:
                break;
        }
        return true;
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            if (currentStep < totalSteps) {
                setCurrentStep(currentStep + 1);
                window.scrollTo(0, 0);
            }
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
            window.scrollTo(0, 0);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Final validation before submission
        if (!formData.productName.trim() || !formData.bankName.trim()) {
            setError('Product Name and Bank Name are required');
            return;
        }
        if (!formData.majorCategory) {
            setError('Major Category is required');
            return;
        }
        if (!formData.financingType) {
            setError('Financing Type is required');
            return;
        }
        if (!formData.minFinancingAmount || !formData.maxFinancingAmount) {
            setError('Financing amounts are required');
            return;
        }
        if (!formData.minTenure || !formData.maxTenure) {
            setError('Tenure periods are required');
            return;
        }
        if (!formData.indicativeRate.trim()) {
            setError('Indicative Rate is required');
            return;
        }
        if (!formData.rateType) {
            setError('Rate Type is required');
            return;
        }
        
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

    const steps = [
        { number: 1, title: 'Plan Info', subtitle: 'Basic Details' },
        { number: 2, title: 'Category', subtitle: 'Type & Class' },
        { number: 3, title: 'Financing', subtitle: 'Amount & Tenure' },
        { number: 4, title: 'Rates', subtitle: 'Interest Details' },
        { number: 5, title: 'Eligibility', subtitle: 'Criteria' },
        { number: 6, title: 'Target', subtitle: 'Audience & Docs' }
    ];

    const majorCategories = [
        "Home / Real Estate Financing",
        "Auto Financing",
        "Personal Financing",
        "Business / SME Financing",
        "Other / Specialized Financing",
        "Installment / Buy-Now-Pay-Later Plans",
        "Shariah-Compliant / Islamic Plans"
    ];

    const employmentTypes = ["Salaried", "Business", "Self-Employed"];
    const targetAudienceOptions = [
        "Salaried Individuals",
        "Business Owners",
        "SME / Entrepreneurs",
        "Students",
        "Other"
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
                        <p className="text-[8px] xs:text-[9px] md:text-[10px] font-black text-red-600 uppercase tracking-[0.2em] xs:tracking-[0.3em] mt-0.5 xs:mt-1">Plan ID: {id}</p>
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

            {/* Progress Indicator */}
            <div className="bg-white p-4 xs:p-6 rounded-[1.5rem] xs:rounded-[2rem] shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                    {steps.map((step, index) => (
                        <React.Fragment key={step.number}>
                            <div className="flex flex-col items-center">
                                <div className={`w-8 h-8 xs:w-10 xs:h-10 rounded-full flex items-center justify-center text-xs xs:text-sm font-black transition-all ${
                                    currentStep === step.number
                                        ? 'bg-red-600 text-white scale-110'
                                        : currentStep > step.number
                                        ? 'bg-emerald-500 text-white'
                                        : 'bg-gray-100 text-gray-400'
                                }`}>
                                    {currentStep > step.number ? '✓' : step.number}
                                </div>
                                <div className="mt-2 text-center hidden sm:block">
                                    <p className="text-[9px] xs:text-[10px] font-black text-gray-900 uppercase tracking-wider">{step.title}</p>
                                    <p className="text-[8px] xs:text-[9px] text-gray-400 font-bold">{step.subtitle}</p>
                                </div>
                            </div>
                            {index < steps.length - 1 && (
                                <div className={`flex-1 h-1 mx-1 xs:mx-2 rounded-full transition-all ${
                                    currentStep > step.number ? 'bg-emerald-500' : 'bg-gray-100'
                                }`} />
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white p-4 xs:p-6 md:p-8 rounded-[1.5rem] xs:rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-gray-100">
                
                {/* Step 1: Plan Identification */}
                {currentStep === 1 && (
                    <div className="space-y-4 xs:space-y-6 animate-in fade-in duration-300">
                        <div>
                            <h3 className="text-base xs:text-lg font-black text-gray-900 uppercase tracking-tighter">Plan Identification</h3>
                            <p className="text-[9px] xs:text-[10px] text-gray-400 font-bold mt-1">Update basic loan plan information</p>
                        </div>
                        
                        <div className="space-y-4 xs:space-y-6">
                            <div>
                                <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">Product Name *</label>
                                <input
                                    type="text"
                                    name="productName"
                                    value={formData.productName}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                                    placeholder="e.g., Home Ijarah, Auto Loan, Business Financing"
                                />
                            </div>

                            <div>
                                <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">Bank Name *</label>
                                <input
                                    type="text"
                                    name="bankName"
                                    value={formData.bankName}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                                    placeholder="e.g., Meezan Bank, Bank Alfalah"
                                />
                            </div>

                            <div>
                                <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">Plan Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    disabled={uploadingImage}
                                    className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-dashed border-gray-200 focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                                
                                {uploadingImage && (
                                    <div className="mt-3 flex items-center gap-2 text-xs text-gray-600">
                                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span className="font-bold">Uploading...</span>
                                    </div>
                                )}

                                {uploadError && (
                                    <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 font-bold">
                                        {uploadError}
                                    </div>
                                )}
                                
                                {formData.planImage && (
                                    <div className="mt-3 relative inline-block">
                                        <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-gray-100 shadow-sm">
                                            <img src={formData.planImage} alt="" className="w-full h-full object-cover" />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, planImage: '' }))}
                                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-700 active:scale-90"
                                        >
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                )}
                                
                                <p className="mt-2 text-[8px] xs:text-[9px] text-gray-400 font-bold">
                                    JPG, PNG format. Max 5MB.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Category & Type */}
                {currentStep === 2 && (
                    <div className="space-y-4 xs:space-y-6 animate-in fade-in duration-300">
                        <div>
                            <h3 className="text-base xs:text-lg font-black text-gray-900 uppercase tracking-tighter">Category & Type</h3>
                            <p className="text-[9px] xs:text-[10px] text-gray-400 font-bold mt-1">Update loan classification</p>
                        </div>
                        
                        <div className="space-y-4 xs:space-y-6">
                            <div>
                                <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">Major Category *</label>
                                <select
                                    name="majorCategory"
                                    value={formData.majorCategory}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                                >
                                    <option value="">Select Category</option>
                                    {majorCategories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">Sub Category</label>
                                <input
                                    type="text"
                                    name="subCategory"
                                    value={formData.subCategory}
                                    onChange={handleChange}
                                    className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                                    placeholder="e.g., Home Purchase, Construction Loan"
                                />
                            </div>

                            <div>
                                <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">Financing Type *</label>
                                <select
                                    name="financingType"
                                    value={formData.financingType}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                                >
                                    <option value="">Select Type</option>
                                    <option value="Conventional">Conventional</option>
                                    <option value="Islamic">Islamic</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Financing Details */}
                {currentStep === 3 && (
                    <div className="space-y-4 xs:space-y-6 animate-in fade-in duration-300">
                        <div>
                            <h3 className="text-base xs:text-lg font-black text-gray-900 uppercase tracking-tighter">Financing Details</h3>
                            <p className="text-[9px] xs:text-[10px] text-gray-400 font-bold mt-1">Update amount and tenure ranges</p>
                        </div>
                        
                        <div className="space-y-4 xs:space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 xs:gap-6">
                                <div>
                                    <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">Min Financing Amount (PKR) *</label>
                                    <input
                                        type="number"
                                        name="minFinancingAmount"
                                        value={formData.minFinancingAmount}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                                        placeholder="e.g., 100000"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">Max Financing Amount (PKR) *</label>
                                    <input
                                        type="number"
                                        name="maxFinancingAmount"
                                        value={formData.maxFinancingAmount}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                                        placeholder="e.g., 10000000"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 xs:gap-6">
                                <div>
                                    <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">Min Tenure *</label>
                                    <input
                                        type="number"
                                        name="minTenure"
                                        value={formData.minTenure}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                                        placeholder="e.g., 12"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">Max Tenure *</label>
                                    <input
                                        type="number"
                                        name="maxTenure"
                                        value={formData.maxTenure}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                                        placeholder="e.g., 240"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">Tenure Unit *</label>
                                    <select
                                        name="tenureUnit"
                                        value={formData.tenureUnit}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                                    >
                                        <option value="Months">Months</option>
                                        <option value="Years">Years</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 4: Rate Information */}
                {currentStep === 4 && (
                    <div className="space-y-4 xs:space-y-6 animate-in fade-in duration-300">
                        <div>
                            <h3 className="text-base xs:text-lg font-black text-gray-900 uppercase tracking-tighter">Rate Information</h3>
                            <p className="text-[9px] xs:text-[10px] text-gray-400 font-bold mt-1">Update interest/profit rates</p>
                        </div>
                        
                        <div className="space-y-4 xs:space-y-6">
                            <div>
                                <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">Indicative Rate *</label>
                                <input
                                    type="text"
                                    name="indicativeRate"
                                    value={formData.indicativeRate}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                                    placeholder="e.g., 8% - 12% or 10.5% per annum"
                                />
                            </div>

                            <div>
                                <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">Rate Type *</label>
                                <select
                                    name="rateType"
                                    value={formData.rateType}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                                >
                                    <option value="">Select Rate Type</option>
                                    <option value="Fixed">Fixed</option>
                                    <option value="Variable">Variable</option>
                                    <option value="Floating">Floating</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 5: Eligibility Criteria */}
                {currentStep === 5 && (
                    <div className="space-y-4 xs:space-y-6 animate-in fade-in duration-300">
                        <div>
                            <h3 className="text-base xs:text-lg font-black text-gray-900 uppercase tracking-tighter">Eligibility Criteria</h3>
                            <p className="text-[9px] xs:text-[10px] text-gray-400 font-bold mt-1">Update eligibility requirements</p>
                        </div>
                        
                        <div className="space-y-4 xs:space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 xs:gap-6">
                                <div>
                                    <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">Min Age</label>
                                    <input
                                        type="number"
                                        name="minAge"
                                        value={formData.eligibility.minAge}
                                        onChange={handleEligibilityChange}
                                        className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                                        placeholder="e.g., 21"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">Max Age</label>
                                    <input
                                        type="number"
                                        name="maxAge"
                                        value={formData.eligibility.maxAge}
                                        onChange={handleEligibilityChange}
                                        className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                                        placeholder="e.g., 60"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">Min Income (PKR)</label>
                                    <input
                                        type="number"
                                        name="minIncome"
                                        value={formData.eligibility.minIncome}
                                        onChange={handleEligibilityChange}
                                        className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                                        placeholder="e.g., 50000"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-3">Employment Type</label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {employmentTypes.map(type => (
                                        <label key={type} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={formData.eligibility.employmentType.includes(type)}
                                                onChange={() => handleEligibilityCheckboxChange('employmentType', type)}
                                                className="w-4 h-4 text-red-600 bg-white border-gray-300 rounded focus:ring-red-500"
                                            />
                                            <span className="text-xs font-bold text-gray-700">{type}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">Required Documents (comma-separated)</label>
                                <textarea
                                    value={formData.eligibility.requiredDocuments.join(', ')}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        eligibility: {
                                            ...prev.eligibility,
                                            requiredDocuments: e.target.value.split(',').map(doc => doc.trim()).filter(doc => doc)
                                        }
                                    }))}
                                    rows="3"
                                    className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none resize-none"
                                    placeholder="e.g., CNIC, Salary Slip, Bank Statements, Tax Returns"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 6: Target & Description */}
                {currentStep === 6 && (
                    <div className="space-y-4 xs:space-y-6 animate-in fade-in duration-300">
                        <div>
                            <h3 className="text-base xs:text-lg font-black text-gray-900 uppercase tracking-tighter">Target Audience & Documentation</h3>
                            <p className="text-[9px] xs:text-[10px] text-gray-400 font-bold mt-1">Update target audience and documents</p>
                        </div>
                        
                        <div className="space-y-4 xs:space-y-6">
                            <div>
                                <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-3">Target Audience</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {targetAudienceOptions.map(audience => (
                                        <label key={audience} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={formData.targetAudience.includes(audience)}
                                                onChange={() => handleCheckboxChange('targetAudience', audience)}
                                                className="w-4 h-4 text-red-600 bg-white border-gray-300 rounded focus:ring-red-500"
                                            />
                                            <span className="text-xs font-bold text-gray-700">{audience}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="4"
                                    className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none resize-none"
                                    placeholder="Provide a detailed description of the loan plan, its features, benefits, and any special terms..."
                                />
                            </div>

                            <div>
                                <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">Plan Document (PDF/Word)</label>
                                <input
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    onChange={handleDocumentUpload}
                                    disabled={uploadingDocument}
                                    className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-dashed border-gray-200 focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                                
                                {uploadingDocument && (
                                    <div className="mt-3 flex items-center gap-2 text-xs text-gray-600">
                                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span className="font-bold">Uploading document...</span>
                                    </div>
                                )}
                                
                                {formData.planDocument && (
                                    <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="text-xs font-bold text-emerald-700">Document uploaded successfully</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, planDocument: '' }))}
                                            className="text-emerald-600 hover:text-emerald-800 font-bold text-xs"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                )}
                                
                                <p className="mt-2 text-[8px] xs:text-[9px] text-gray-400 font-bold">
                                    PDF or Word document. Max 10MB.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex flex-col xs:flex-row gap-3 xs:gap-4 mt-6 xs:mt-8 pt-6 xs:pt-8 border-t border-gray-100">
                    {currentStep > 1 && (
                        <button
                            type="button"
                            onClick={handlePrevious}
                            className="tap-target flex-1 py-3 xs:py-3.5 px-4 bg-gray-100 text-gray-600 rounded-xl xs:rounded-2xl font-black uppercase text-[10px] xs:text-xs tracking-wider xs:tracking-widest hover:bg-gray-200 transition-all active:scale-95"
                        >
                            ← Previous Step
                        </button>
                    )}
                    
                    {currentStep < totalSteps ? (
                        <button
                            type="button"
                            onClick={handleNext}
                            className="tap-target flex-1 py-3 xs:py-3.5 px-4 bg-red-600 text-white rounded-xl xs:rounded-2xl font-black uppercase text-[10px] xs:text-xs tracking-wider xs:tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-100 active:scale-95"
                        >
                            Next Step →
                        </button>
                    ) : (
                        <button
                            type="submit"
                            disabled={updating}
                            className={`tap-target flex-1 py-3 xs:py-3.5 px-4 bg-emerald-600 text-white rounded-xl xs:rounded-2xl font-black uppercase text-[10px] xs:text-xs tracking-wider xs:tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 ${updating ? 'opacity-70 cursor-not-allowed' : 'active:scale-95'}`}
                        >
                            {updating ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Updating Loan Plan...
                                </span>
                            ) : (
                                '✓ Update Loan Plan'
                            )}
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default LoanEdit;
