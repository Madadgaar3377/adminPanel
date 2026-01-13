import React, { useState, useEffect, useCallback } from 'react';
import ApiBaseUrl from '../constants/apiUrl';
import { useNavigate, useParams } from 'react-router-dom';
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

const LoanEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [toast, setToast] = useState(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [uploadingDocument, setUploadingDocument] = useState(false);
    const [uploadError, setUploadError] = useState('');

    const [formData, setFormData] = useState({
        productName: '',
        bankName: '',
        userId: '',
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

    const showToast = useCallback((message, type = 'success') => {
        setToast({ message, type });
    }, []);

    const fetchLoan = useCallback(async () => {
        try {
            const res = await fetch(`${ApiBaseUrl}/getAllLoans`);
            const data = await res.json();
            if (data.success) {
                const loan = data.data.find(l => l.planId === id);
                if (loan) {
                    setFormData({
                        productName: loan.productName || '',
                        bankName: loan.bankName || '',
                        userId: loan.userId || '',
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
                    showToast('Loan plan not found', 'error');
                }
            }
        } catch (err) {
            showToast('Failed to load loan data', 'error');
        } finally {
            setLoading(false);
        }
    }, [id, showToast]);

    useEffect(() => {
        fetchLoan();
    }, [fetchLoan]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Validate tenure values when Days is selected
        if ((name === 'minTenure' || name === 'maxTenure') && formData.tenureUnit === 'Days') {
            const numValue = parseInt(value);
            if (numValue && (numValue < 1 || numValue > 365)) {
                showToast('⚠️ For Days tenure, value must be between 1-365', 'error');
                return;
            }
        }
        
        // Validate when changing tenure unit to Days
        if (name === 'tenureUnit' && value === 'Days') {
            const minTenure = parseInt(formData.minTenure);
            const maxTenure = parseInt(formData.maxTenure);
            if ((minTenure && (minTenure < 1 || minTenure > 365)) || 
                (maxTenure && (maxTenure < 1 || maxTenure > 365))) {
                showToast('⚠️ For Days tenure, values must be between 1-365. Please adjust tenure values.', 'error');
            }
        }
        
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

        // Validate file type
        if (!file.type.startsWith('image/')) {
            showToast('⚠️ Please select a valid image file (JPG, PNG, GIF, etc.)', 'error');
            e.target.value = null; // Clear the file input
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            showToast('⚠️ Image size should not exceed 5MB', 'error');
            e.target.value = null; // Clear the file input
            return;
        }

        setUploadingImage(true);
        setUploadError('');
        showToast('Uploading image...', 'success');

        try {
            const formDataUpload = new FormData();
            formDataUpload.append('image', file);

            const response = await fetch(`${ApiBaseUrl}/upload-image`, {
                method: 'POST',
                body: formDataUpload
            });

            const data = await response.json();

            if (response.ok && data.success && (data.url || data.imageUrl)) {
                const imageUrl = data.url || data.imageUrl;
                setFormData(prev => ({ ...prev, planImage: imageUrl }));
                showToast('✓ Image uploaded successfully!', 'success');
            } else {
                throw new Error(data.message || 'Upload failed. Please try again.');
            }
        } catch (err) {
            const errorMsg = err.message || 'Failed to upload image. Please check your connection and try again.';
            setUploadError(errorMsg);
            showToast(errorMsg, 'error');
            e.target.value = null; // Clear the file input on error
        } finally {
            setUploadingImage(false);
        }
    };

    const handleDocumentUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(file.type)) {
            showToast('Please select a valid document file (PDF, DOC, or DOCX)', 'error');
            e.target.value = null; // Clear the file input
            return;
        }

        // Validate file size (5MB as per backend)
        if (file.size > 5 * 1024 * 1024) {
            showToast('File size is too large. Please upload a file less than 5MB', 'error');
            e.target.value = null; // Clear the file input
            return;
        }

        setUploadingDocument(true);
        setUploadError('');
        showToast('Uploading document...', 'success');

        try {
            const formDataUpload = new FormData();
            formDataUpload.append('document', file);

            const response = await fetch(`${ApiBaseUrl}/upload-document`, {
                method: 'POST',
                body: formDataUpload
            });

            const data = await response.json();

            if (response.ok && data.success && data.url) {
                setFormData(prev => ({ ...prev, planDocument: data.url }));
                showToast('✓ Document uploaded successfully!', 'success');
            } else {
                throw new Error(data.message || 'Upload failed. Please try again.');
            }
        } catch (err) {
            const errorMsg = err.message || 'Failed to upload document. Please check your connection and try again.';
            setUploadError(errorMsg);
            showToast(errorMsg, 'error');
            e.target.value = null; // Clear the file input on error
        } finally {
            setUploadingDocument(false);
        }
    };

    const validateStep = (step) => {
        switch (step) {
            case 1:
                if (!formData.productName.trim()) {
                    showToast('Product Name is required', 'error');
                    return false;
                }
                if (!formData.bankName.trim()) {
                    showToast('Bank Name is required', 'error');
                    return false;
                }
                break;
            case 2:
                if (!formData.majorCategory) {
                    showToast('Major Category is required', 'error');
                    return false;
                }
                if (!formData.financingType) {
                    showToast('Financing Type is required (Conventional or Islamic)', 'error');
                    return false;
                }
                break;
            case 3:
                if (!formData.minFinancingAmount || formData.minFinancingAmount <= 0) {
                    showToast('Min Financing Amount is required and must be greater than 0', 'error');
                    return false;
                }
                if (!formData.maxFinancingAmount || formData.maxFinancingAmount <= 0) {
                    showToast('Max Financing Amount is required and must be greater than 0', 'error');
                    return false;
                }
                if (parseFloat(formData.minFinancingAmount) >= parseFloat(formData.maxFinancingAmount)) {
                    showToast('Max Financing Amount must be greater than Min Financing Amount', 'error');
                    return false;
                }
                if (!formData.minTenure || formData.minTenure <= 0) {
                    showToast('Min Tenure is required and must be greater than 0', 'error');
                    return false;
                }
                if (!formData.maxTenure || formData.maxTenure <= 0) {
                    showToast('Max Tenure is required and must be greater than 0', 'error');
                    return false;
                }
                if (parseFloat(formData.minTenure) >= parseFloat(formData.maxTenure)) {
                    showToast('Max Tenure must be greater than Min Tenure', 'error');
                    return false;
                }
                // Validate Days tenure range (1-365)
                if (formData.tenureUnit === 'Days') {
                    if (formData.minTenure < 1 || formData.minTenure > 365) {
                        showToast('⚠️ For Days tenure, Min Tenure must be between 1-365', 'error');
                        return false;
                    }
                    if (formData.maxTenure < 1 || formData.maxTenure > 365) {
                        showToast('⚠️ For Days tenure, Max Tenure must be between 1-365', 'error');
                        return false;
                    }
                }
                break;
            case 4:
                if (!formData.indicativeRate.trim()) {
                    showToast('Indicative Rate is required', 'error');
                    return false;
                }
                if (!formData.rateType) {
                    showToast('Rate Type is required (Fixed, Variable, or Floating)', 'error');
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
        if (e) {
        e.preventDefault();
            e.stopPropagation();
        }
        
        // Prevent submission if not on the last step
        if (currentStep !== totalSteps) {
            showToast('Please complete all steps before submitting', 'error');
            return;
        }
        
        // Prevent double submission
        if (updating) {
            return;
        }
        
        // Final validation before submission
        if (!formData.productName.trim()) {
            showToast('Product Name is required', 'error');
            setCurrentStep(1);
            return;
        }
        if (!formData.bankName.trim()) {
            showToast('Bank Name is required', 'error');
            setCurrentStep(1);
            return;
        }
        if (!formData.majorCategory) {
            showToast('Major Category is required', 'error');
            setCurrentStep(2);
            return;
        }
        if (!formData.financingType) {
            showToast('Financing Type is required', 'error');
            setCurrentStep(2);
            return;
        }
        if (!formData.minFinancingAmount || !formData.maxFinancingAmount) {
            showToast('Financing amounts are required', 'error');
            setCurrentStep(3);
            return;
        }
        if (!formData.minTenure || !formData.maxTenure) {
            showToast('Tenure periods are required', 'error');
            setCurrentStep(3);
            return;
        }
        if (!formData.indicativeRate.trim()) {
            showToast('Indicative Rate is required', 'error');
            setCurrentStep(4);
            return;
        }
        if (!formData.rateType) {
            showToast('Rate Type is required', 'error');
            setCurrentStep(4);
            return;
        }
        
        setUpdating(true);

        try {
            const authData = JSON.parse(localStorage.getItem('adminAuth'));
            
            // Format data properly for backend - convert empty strings to proper types
            const payload = {
                productName: formData.productName.trim(),
                bankName: formData.bankName.trim(),
                createdBy: formData.userId.trim() || undefined,
                planImage: formData.planImage || undefined,
                majorCategory: formData.majorCategory,
                subCategory: formData.subCategory || undefined,
                minFinancingAmount: Number(formData.minFinancingAmount),
                maxFinancingAmount: Number(formData.maxFinancingAmount),
                minTenure: Number(formData.minTenure),
                maxTenure: Number(formData.maxTenure),
                tenureUnit: formData.tenureUnit,
                financingType: formData.financingType,
                indicativeRate: formData.indicativeRate.trim(),
                rateType: formData.rateType,
                eligibility: {
                    minAge: formData.eligibility.minAge ? Number(formData.eligibility.minAge) : undefined,
                    maxAge: formData.eligibility.maxAge ? Number(formData.eligibility.maxAge) : undefined,
                    minIncome: formData.eligibility.minIncome ? Number(formData.eligibility.minIncome) : undefined,
                    employmentType: formData.eligibility.employmentType.length > 0 ? formData.eligibility.employmentType : undefined,
                    requiredDocuments: formData.eligibility.requiredDocuments.length > 0 ? formData.eligibility.requiredDocuments : undefined,
                },
                targetAudience: formData.targetAudience.length > 0 ? formData.targetAudience : undefined,
                description: formData.description.trim() || undefined,
                planDocument: formData.planDocument || undefined,
            };

            // Remove undefined values to keep payload clean
            Object.keys(payload).forEach(key => {
                if (payload[key] === undefined) {
                    delete payload[key];
                }
            });

            // Clean eligibility object
            if (payload.eligibility) {
                Object.keys(payload.eligibility).forEach(key => {
                    if (payload.eligibility[key] === undefined) {
                        delete payload.eligibility[key];
                    }
                });
                // Remove eligibility if empty
                if (Object.keys(payload.eligibility).length === 0) {
                    delete payload.eligibility;
                }
            }

            // Backend expects { data: payload } format
            const response = await fetch(`${ApiBaseUrl}/updateLoan/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authData.token}`
                },
                body: JSON.stringify({ data: payload })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                showToast('✓ Loan plan updated successfully!', 'success');
                setTimeout(() => navigate('/loan/all'), 2000);
            } else {
                // Parse backend validation errors
                let errorMessage = data.message || 'Failed to update loan plan';
                
                // Check for MongoDB validation errors
                if (errorMessage.includes('validation failed')) {
                    // Extract specific field errors
                    if (errorMessage.includes('tenureUnit')) {
                        if (errorMessage.includes('Days')) {
                            errorMessage = '⚠️ Backend Error: "Days" is not enabled in the backend schema. Please restart the backend server or use "Months" or "Years" instead.';
                            setCurrentStep(3); // Go back to financing step
                        } else {
                            errorMessage = '⚠️ Tenure Unit validation failed. Please select a valid option (Months or Years).';
                            setCurrentStep(3);
                        }
                    } else if (errorMessage.includes('minTenure') || errorMessage.includes('maxTenure')) {
                        errorMessage = '⚠️ Tenure values are invalid. Please check the min/max tenure fields.';
                        setCurrentStep(3);
                    } else if (errorMessage.includes('minFinancingAmount') || errorMessage.includes('maxFinancingAmount')) {
                        errorMessage = '⚠️ Financing amount validation failed. Please check the values.';
                        setCurrentStep(3);
                    } else {
                        // Generic validation error with details
                        errorMessage = `⚠️ Validation Error: ${errorMessage}`;
                    }
                }
                
                showToast(errorMessage, 'error');
            }
        } catch (err) {
            const errorMsg = err.message || 'Network error. Please check your connection and try again.';
            showToast(errorMsg, 'error');
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
            {/* Toast Notification */}
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            
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
            <form 
                onSubmit={handleSubmit}
                onKeyDown={(e) => {
                    // Prevent form submission on Enter key press
                    if (e.key === 'Enter' && e.target.type !== 'textarea') {
                        e.preventDefault();
                    }
                }}
                className="bg-white p-4 xs:p-6 md:p-8 rounded-[1.5rem] xs:rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-gray-100"
            >
                
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
                                <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">User ID (Optional)</label>
                                <input
                                    type="text"
                                    name="userId"
                                    value={formData.userId}
                                    onChange={handleChange}
                                    className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                                    placeholder="e.g., USER123 or user@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">Plan Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    disabled={uploadingImage}
                                    className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-dashed border-gray-200 focus:border-red-600 hover:border-red-400 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 file:cursor-pointer"
                                />
                                
                                {uploadingImage && (
                                    <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl flex items-center gap-3">
                                        <svg className="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <div className="flex-1">
                                            <p className="text-sm font-black text-blue-900 uppercase tracking-wide">Uploading Image...</p>
                                            <p className="text-xs text-blue-600 mt-0.5">Please wait while we upload your image</p>
                                        </div>
                                    </div>
                                )}

                                {uploadError && (
                                    <div className="mt-3 p-3 bg-red-50 border-2 border-red-200 rounded-xl text-xs text-red-600 font-bold flex items-center gap-2">
                                        <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {uploadError}
                                    </div>
                                )}
                                
                                {formData.planImage && !uploadingImage && (
                                    <div className="mt-4 p-3 bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl shadow-sm">
                                        <div className="relative group">
                                            <img 
                                                src={formData.planImage} 
                                                alt="Plan preview" 
                                                className="w-full h-56 object-cover rounded-lg border-2 border-gray-300 shadow-md"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect fill="%23f3f4f6" width="400" height="300"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="18" fill="%23d1d5db">Image Error</text></svg>';
                                                }}
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-lg transition-all"></div>
                                        </div>
                                        <div className="mt-3 flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                                                    <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                                <span className="text-xs font-black text-emerald-900 uppercase tracking-wide">Image Uploaded</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, planImage: '' }))}
                                                className="px-3 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg font-bold text-xs uppercase tracking-wide transition-all active:scale-95"
                                        >
                                            Remove
                                        </button>
                                        </div>
                                    </div>
                                )}
                                
                                <div className="mt-3 flex items-start gap-2">
                                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-[8px] xs:text-[9px] text-gray-500 font-bold leading-relaxed">
                                        <span className="text-gray-700">Accepted formats:</span> JPG, PNG, GIF, WebP • 
                                        <span className="text-gray-700"> Max size:</span> 5MB • 
                                        <span className="text-gray-700"> Optimal:</span> 1200x800px
                                </p>
                                </div>
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
                                        <option value="Days">Days</option>
                                        <option value="Months">Months</option>
                                        <option value="Years">Years</option>
                                    </select>
                                </div>
                            </div>
                            
                            {formData.tenureUnit === 'Days' && (
                                <div className="mt-3 p-3 bg-blue-50 border-2 border-blue-200 rounded-xl flex items-start gap-2">
                                    <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-xs text-blue-800 font-bold">
                                        <span className="font-black">Note:</span> When using Days as tenure unit, values must be between <span className="font-black">1-365 days</span> only.
                                    </p>
                                </div>
                            )}
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
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    Description
                                    <span className="text-xs font-normal text-gray-500 ml-2">(Format your text with the toolbar below)</span>
                                </label>
                                <RichTextEditor
                                    value={formData.description}
                                    onChange={(content) => setFormData(prev => ({ ...prev, description: content }))}
                                    placeholder="Provide a detailed description of the loan plan. Use the toolbar above to format your text with headings, bold, italic, lists, links, and more..."
                                />
                                <p className="mt-2 text-xs text-gray-500">
                                    💡 <span className="font-semibold">Tip:</span> Use the formatting toolbar to create professional, well-structured descriptions with headings, bullet points, and emphasis.
                                </p>
                            </div>

                            <div>
                                <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">Plan Document (PDF/Word)</label>
                                <input
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    onChange={handleDocumentUpload}
                                    disabled={uploadingDocument}
                                    className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-dashed border-gray-200 focus:border-red-600 hover:border-red-400 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 file:cursor-pointer"
                                />
                                
                                {uploadingDocument && (
                                    <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl flex items-center gap-3">
                                        <svg className="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <div className="flex-1">
                                            <p className="text-sm font-black text-blue-900 uppercase tracking-wide">Uploading Document...</p>
                                            <p className="text-xs text-blue-600 mt-0.5">Please wait while we upload your file</p>
                                        </div>
                                    </div>
                                )}
                                
                                {formData.planDocument && !uploadingDocument && (
                                    <div className="mt-4 p-4 bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-xl shadow-sm">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-start gap-3 flex-1">
                                                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                                    <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        <span className="text-sm font-black text-emerald-900 uppercase tracking-wide">Document Uploaded</span>
                                                    </div>
                                                    <p className="text-xs text-emerald-700 font-semibold">File ready for submission</p>
                                                    <a 
                                                        href={formData.planDocument} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="text-xs text-emerald-600 hover:text-emerald-800 font-bold underline mt-1 inline-block"
                                                    >
                                                        View Document →
                                                    </a>
                                                </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, planDocument: '' }))}
                                                className="px-3 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg font-bold text-xs uppercase tracking-wide transition-all active:scale-95 flex-shrink-0"
                                        >
                                            Remove
                                        </button>
                                        </div>
                                    </div>
                                )}
                                
                                {uploadError && (
                                    <div className="mt-3 p-3 bg-red-50 border-2 border-red-200 rounded-xl text-xs text-red-600 font-bold flex items-center gap-2">
                                        <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {uploadError}
                                    </div>
                                )}
                                
                                <div className="mt-3 flex items-start gap-2">
                                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-[8px] xs:text-[9px] text-gray-500 font-bold leading-relaxed">
                                        <span className="text-gray-700">Accepted formats:</span> PDF, DOC, DOCX • 
                                        <span className="text-gray-700"> Max size:</span> 5MB
                                </p>
                                </div>
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
                            type="button"
                            onClick={handleSubmit}
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
