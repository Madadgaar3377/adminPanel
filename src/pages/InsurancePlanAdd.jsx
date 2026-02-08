import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import ApiBaseUrl from '../constants/apiUrl';
import { ArrowLeft, ArrowRight, Check, X, Shield, FileText, Image as ImageIcon, Building2, User, Trash2 } from 'lucide-react';
import RichTextEditor from '../compontents/RichTextEditor';

// Toast Notification Component
const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';

    return (
        <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-3`}>
            <span className="font-medium">{message}</span>
            <button onClick={onClose} className="ml-2 hover:opacity-80 text-xl leading-none">&times;</button>
        </div>
    );
};

const InsurancePlanAdd = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();
    const isEdit = !!id;
    const isView = location.pathname.includes('/view/');
    
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const [toast, setToast] = useState(null);
    const [insuranceCompanies, setInsuranceCompanies] = useState([]);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [creationMethod, setCreationMethod] = useState('company'); // 'company' or 'userId'
    const [userIdInput, setUserIdInput] = useState('');
    const [fetchedUser, setFetchedUser] = useState(null);
    const [fetchingUser, setFetchingUser] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({});
    const [uploadingDocuments, setUploadingDocuments] = useState({});

    const totalSteps = 5;

    const [formData, setFormData] = useState({
        insuranceCompanyId: '',
        planName: '',
        description: '',
        policyType: '',
        planStatus: 'Active',
        isVisible: true,
        planImage: '',
        // Step 2: Common fields for all policy types
        policyTerm: '', // e.g., "5 years", "10 years"
        eligibleAge: {
            min: '',
            max: '',
        },
        estimatedMaturity: '', // PKR amount
        
        // Life Insurance
        lifeInsurancePlan: {
            planSubType: '',
            sumAssured: '',
            policyTermYearsMin: '',
            policyTermYearsMax: '',
            premiumPaymentTerm: '',
            maturityBenefit: false,
            bonusApplicable: false,
            deathBenefitDescription: '',
            ridersAvailable: [],
            minEntryAge: '',
            maxEntryAge: '',
            medicalRequirement: '',
            premiumAmount: '',
            paymentFrequency: 'Monthly',
            claimType: '',
            maturityProcessingTimeDays: '',
            requiredDocuments: [],
        },
        
        // Health Insurance
        healthInsurancePlan: {
            coverageType: '',
            annualCoverageLimit: '',
            roomRentLimit: '',
            icuCoverage: false,
            opdCoverage: false,
            preExistingCoverage: false,
            waitingPeriodDays: '',
            panelHospitalsAvailable: false,
            panelHospitalList: '',
            cashlessFacility: false,
            annualPremium: '',
            paymentFrequency: 'Monthly',
            claimType: '',
            claimTATDays: '',
            requiredClaimDocuments: [],
        },
        
        // Motor Insurance
        motorInsurancePlan: {
            motorType: '',
            coverageType: '',
            vehicleValueRangeMin: '',
            vehicleValueRangeMax: '',
            theftCoverage: false,
            floodCoverage: false,
            naturalCalamities: false,
            annualPremium: '',
            deductibleExcess: '',
            claimProcessType: '',
            averageClaimTATDays: '',
            requiredDocuments: [],
        },
        
        // Travel Insurance
        travelInsurancePlan: {
            travelType: '',
            geographicCoverage: '',
            tripDurationDays: '',
            medicalCoverageLimit: '',
            baggageLoss: false,
            flightDelay: false,
            premiumAmount: '',
            coveragePeriod: '',
            claimType: '',
            claimTATDays: '',
            requiredDocuments: [],
        },
        
        // Property Insurance
        propertyInsurancePlan: {
            propertyType: '',
            coverageAmount: '',
            fireCoverage: false,
            theftCoverage: false,
            naturalDisasterCoverage: false,
            premiumAmount: '',
            claimType: '',
            claimTATDays: '',
            requiredDocuments: [],
        },
        
        // Takaful
        takafulPlan: {
            takafulType: '',
            contributionAmount: '',
            contributionFrequency: 'Monthly',
            sumCovered: '',
            surplusDistribution: false,
            shariahComplianceCertificate: '',
            claimType: '',
            maturityBenefit: false,
            profitSharingDetails: '',
            requiredDocuments: [],
        },
        
        // Documents
        planDocuments: {
        productBrochure: '',
        policyWording: '',
        rateCard: '', // Optional
        policyRiders: '', // Optional - 2nd attachment
        claimProcedure: '',
        secpApproval: '',
        otherDocuments: [],
    },
        
        // Authorization
        authorization: {
            authorizationToList: false,
            confirmationOfAccuracy: false,
            consentForLeadSharing: false,
        },
        
        tags: [],
    });

    useEffect(() => {
        if (!isEdit) {
            fetchInsuranceCompanies();
        } else {
            fetchPlanDetails();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, isEdit]);

    const fetchUserByUserId = async () => {
        if (!userIdInput.trim()) {
            showToast('Please enter a User ID', 'error');
            return;
        }

        setFetchingUser(true);
        try {
            const authData = JSON.parse(localStorage.getItem('adminAuth'));
            const res = await fetch(`${ApiBaseUrl}/getUserByUserId/${userIdInput}`, {
                headers: {
                    'Authorization': `Bearer ${authData.token}`,
                }
            });
            const data = await res.json();
            if (data.success && data.user) {
                setFetchedUser(data.user);
                setFormData(prev => ({
                    ...prev,
                    insuranceCompanyId: data.user.userId,
                }));
                showToast('User found! Company name will be auto-filled.', 'success');
            } else {
                showToast(data.message || 'User not found', 'error');
                setFetchedUser(null);
            }
        } catch (err) {
            console.error('Error fetching user:', err);
            showToast('Failed to fetch user', 'error');
            setFetchedUser(null);
        } finally {
            setFetchingUser(false);
        }
    };

    const fetchInsuranceCompanies = async () => {
        try {
            const authData = JSON.parse(localStorage.getItem('adminAuth'));
            // Fetch all companies by setting a high limit (1000 should be enough for all companies)
            const res = await fetch(`${ApiBaseUrl}/getAllInsuranceCompanies?status=approved&limit=1000`, {
                headers: {
                    'Authorization': `Bearer ${authData.token}`,
                }
            });
            const data = await res.json();
            if (data.success) {
                // Backend already filters by userAccess containing "Insurance"
                setInsuranceCompanies(data.data || []);
            }
        } catch (err) {
            console.error('Error fetching insurance companies:', err);
        }
    };

    const fetchPlanDetails = async () => {
        try {
            setLoading(true);
            const authData = JSON.parse(localStorage.getItem('adminAuth'));
            const res = await fetch(`${ApiBaseUrl}/getInsurancePlanAdmin/${id}`, {
                headers: {
                    'Authorization': `Bearer ${authData.token}`,
                }
            });
            const data = await res.json();
            if (data.success) {
                // Ensure eligibleAge is initialized if missing
                const formDataFromApi = {
                    ...data.data,
                    eligibleAge: data.data.eligibleAge || { min: '', max: '' }
                };
                setFormData(formDataFromApi);
                if (data.data.planImage) {
                    setImagePreview(data.data.planImage);
                }
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Failed to load plan details');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    const handleInput = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handlePolicyTypeInput = (e) => {
        const { name, value, type, checked } = e.target;
        const policyType = formData.policyType;
        const policyKey = `${policyType.charAt(0).toLowerCase() + policyType.slice(1)}${policyType === 'Takaful' ? '' : 'Insurance'}Plan`;
        
        setFormData(prev => ({
            ...prev,
            [policyKey]: {
                ...prev[policyKey],
                [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value),
            }
        }));
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            showToast('Please select a valid image file', 'error');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            showToast('Image size should not exceed 5MB', 'error');
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);

        setUploadingImage(true);
        try {
            const formDataUpload = new FormData();
            formDataUpload.append('image', file);
            
            const authData = JSON.parse(localStorage.getItem('adminAuth'));
            const response = await fetch(`${ApiBaseUrl}/upload-image`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authData.token}`,
                },
                body: formDataUpload,
            });
            
            const data = await response.json();
            if (data.success && (data.url || data.imageUrl)) {
                setFormData(prev => ({ ...prev, planImage: data.url || data.imageUrl }));
                showToast('Image uploaded successfully!', 'success');
            } else {
                throw new Error(data.message || 'Upload failed');
            }
        } catch (err) {
            console.error('Upload error:', err);
            showToast('Failed to upload image', 'error');
            setImagePreview(null);
        } finally {
            setUploadingImage(false);
        }
    };

    const handleDocumentUpload = async (file, documentType) => {
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showToast(`File size exceeds 5MB limit. Selected file: ${(file.size / (1024 * 1024)).toFixed(2)}MB`, 'error');
            return null;
        }

        // Validate file type
        const allowedTypes = ['.pdf', '.doc', '.docx', '.xls', '.xlsx'];
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        if (!allowedTypes.includes(fileExtension)) {
            showToast(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`, 'error');
            return null;
        }

        setUploadingDocuments(prev => ({ ...prev, [documentType]: true }));
        setUploadProgress(prev => ({ ...prev, [documentType]: 0 }));

        try {
            const formDataUpload = new FormData();
            formDataUpload.append('document', file);
            
            const authData = JSON.parse(localStorage.getItem('adminAuth'));
            const xhr = new XMLHttpRequest();

            // Track upload progress
            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                    const percentComplete = (e.loaded / e.total) * 100;
                    setUploadProgress(prev => ({ ...prev, [documentType]: percentComplete }));
                }
            });

            const uploadPromise = new Promise((resolve, reject) => {
                xhr.onload = () => {
                    if (xhr.status === 200) {
                        try {
                            const data = JSON.parse(xhr.responseText);
                            if (data.success && data.url) {
                                resolve(data.url);
                            } else {
                                reject(new Error(data.message || 'Upload failed'));
                            }
                        } catch (err) {
                            reject(new Error('Invalid response from server'));
                        }
                    } else {
                        reject(new Error(`Upload failed with status ${xhr.status}`));
                    }
                };
                xhr.onerror = () => reject(new Error('Network error during upload'));
            });

            xhr.open('POST', `${ApiBaseUrl}/upload-document`);
            xhr.setRequestHeader('Authorization', `Bearer ${authData.token}`);
            xhr.send(formDataUpload);

            const url = await uploadPromise;
            
            setFormData(prev => ({
                ...prev,
                planDocuments: {
                    ...prev.planDocuments,
                    [documentType]: url,
                },
            }));
            
            setUploadProgress(prev => ({ ...prev, [documentType]: 100 }));
            setTimeout(() => {
                setUploadProgress(prev => {
                    const newProgress = { ...prev };
                    delete newProgress[documentType];
                    return newProgress;
                });
            }, 1000);

            showToast('Document uploaded successfully!', 'success');
            return url;
        } catch (err) {
            console.error('Upload error:', err);
            showToast(err.message || 'Failed to upload document', 'error');
            setUploadProgress(prev => {
                const newProgress = { ...prev };
                delete newProgress[documentType];
                return newProgress;
            });
            return null;
        } finally {
            setUploadingDocuments(prev => ({ ...prev, [documentType]: false }));
        }
    };

    const handleDeleteDocument = async (documentType) => {
        const fileUrl = formData.planDocuments[documentType];
        
        if (!fileUrl) {
            return;
        }

        // Confirm deletion
        if (!window.confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
            return;
        }

        try {
            const authData = JSON.parse(localStorage.getItem('adminAuth'));
            const response = await fetch(`${ApiBaseUrl}/delete-document`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authData.token}`,
                },
                body: JSON.stringify({ fileUrl }),
            });

            const data = await response.json();
            
            if (data.success) {
                // Remove from state only after successful deletion
                setFormData(prev => ({
                    ...prev,
                    planDocuments: {
                        ...prev.planDocuments,
                        [documentType]: '',
                    },
                }));
                showToast('Document deleted successfully from R2', 'success');
            } else {
                showToast(data.message || 'Failed to delete document', 'error');
            }
        } catch (err) {
            console.error('Error deleting document:', err);
            showToast('Failed to delete document. Please try again.', 'error');
        }
    };

    const validateStep = (step) => {
        switch (step) {
            case 1:
                if (!formData.planName.trim()) {
                    showToast('Plan Name is required', 'error');
                    return false;
                }
                if (!formData.policyType) {
                    showToast('Policy Type is required', 'error');
                    return false;
                }
            if (!isEdit) {
                if (creationMethod === 'company' && !formData.insuranceCompanyId) {
                    showToast('Please select an insurance company', 'error');
                    return false;
                }
                if (creationMethod === 'userId' && (!fetchedUser || !formData.insuranceCompanyId)) {
                    showToast('Please fetch user by User ID first', 'error');
                    return false;
                }
            }
                break;
            case 2:
                // Check common fields first
                if (!formData.policyTerm || !formData.eligibleAge?.min || !formData.eligibleAge?.max || !formData.estimatedMaturity) {
                    showToast('Please fill in Policy Term, Eligible Age Range, and Estimated Maturity', 'error');
                    return false;
                }
                
                // For Life Insurance, check static fields (minEntryAge and maxEntryAge removed)
                if (formData.policyType === 'Life') {
                    if (!formData.lifeInsurancePlan?.sumAssured || !formData.lifeInsurancePlan?.premiumAmount || !formData.lifeInsurancePlan?.paymentFrequency) {
                        showToast('Please fill in Sum Assured, Premium Amount, and Payment Frequency', 'error');
                        return false;
                    }
                }

                // If Custom is selected, validate Min/Max Policy Term
                if (formData.policyTerm === 'Custom') {
                    const policyType = formData.policyType;
                    if (!policyType) {
                        showToast('Please select a Policy Type first', 'error');
                        return false;
                    }
                    const policyKey = `${policyType.charAt(0).toLowerCase() + policyType.slice(1)}${policyType === 'Takaful' ? '' : 'Insurance'}Plan`;
                    const policyData = formData[policyKey];
                    if (!policyData?.policyTermYearsMin || !policyData?.policyTermYearsMax) {
                        showToast('Please fill in Min and Max Policy Term (Years) for Custom policy term', 'error');
                        return false;
                    }
                }

                const policyType = formData.policyType;
                const policyKey = `${policyType.charAt(0).toLowerCase() + policyType.slice(1)}${policyType === 'Takaful' ? '' : 'Insurance'}Plan`;
                const policyData = formData[policyKey];
                
                if (policyType === 'Life') {
                    if (!policyData.planSubType || !policyData.sumAssured || !policyData.premiumAmount) {
                        showToast('Please fill in all required Life Insurance fields', 'error');
                        return false;
                    }
                } else if (policyType === 'Health') {
                    if (!policyData.coverageType || !policyData.annualCoverageLimit || !policyData.annualPremium) {
                        showToast('Please fill in all required Health Insurance fields', 'error');
                        return false;
                    }
                }
                // Add validation for other policy types
                break;
            case 3:
                // Only productBrochure is required (policyWording removed)
                if (!formData.planDocuments.productBrochure) {
                    showToast('Please upload Product Brochure', 'error');
                    return false;
                }
                break;
            case 5:
                if (!formData.authorization.authorizationToList || !formData.authorization.confirmationOfAccuracy || !formData.authorization.consentForLeadSharing) {
                    showToast('Please accept all authorization terms', 'error');
                    return false;
                }
                break;
            default:
                return true;
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
        if (!validateStep(currentStep)) return;
        
        setLoading(true);
        setError(null);
        setMessage(null);
        
        try {
            const policyType = formData.policyType;
            const policyKey = `${policyType.charAt(0).toLowerCase() + policyType.slice(1)}${policyType === 'Takaful' ? '' : 'Insurance'}Plan`;
            const policyData = formData[policyKey];
            
            const payload = {
                planName: formData.planName,
                description: formData.description || undefined,
                policyType: formData.policyType,
                planStatus: formData.planStatus,
                planImage: formData.planImage,
                planDocuments: formData.planDocuments,
                authorization: formData.authorization,
                tags: formData.tags,
                // Add new common fields (Step 2)
                policyTerm: formData.policyTerm,
                eligibleAge: formData.eligibleAge,
                estimatedMaturity: formData.estimatedMaturity,
                [policyKey]: policyData,
            };
            
            // planId will be auto-generated by the backend if not provided

            if (!isEdit) {
                payload.insuranceCompanyId = formData.insuranceCompanyId;
                payload.approvalStatus = 'approved'; // Auto-approve all plans
                payload.isVisible = formData.isVisible;
            }

            const authData = JSON.parse(localStorage.getItem('adminAuth'));
            const url = isEdit 
                ? `${ApiBaseUrl}/updateInsurancePlanAdmin/${id}`
                : `${ApiBaseUrl}/createInsurancePlanAdmin`;
            
            const method = isEdit ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authData.token}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            if (data.success) {
                showToast(isEdit ? 'Plan updated successfully!' : 'Plan created successfully!', 'success');
                setTimeout(() => navigate('/insurance/all'), 2000);
            } else {
                showToast(data.message || `Failed to ${isEdit ? 'update' : 'create'} plan`, 'error');
            }
        } catch (err) {
            console.error('Error:', err);
            showToast('Server error. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const renderPolicyTypeFields = () => {
        const policyType = formData.policyType;
        if (!policyType) return null;

        const policyKey = `${policyType.charAt(0).toLowerCase() + policyType.slice(1)}${policyType === 'Takaful' ? '' : 'Insurance'}Plan`;
        const policyData = formData[policyKey];

        if (policyType === 'Life') {
            return (
                <div className="space-y-6">
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                        <h3 className="text-lg font-semibold text-blue-900 mb-2">Life Insurance Plan Details</h3>
                        <p className="text-sm text-blue-700">Fill in all required fields for your life insurance plan</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Plan Sub-Type <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="planSubType"
                                value={policyData.planSubType}
                                onChange={handlePolicyTypeInput}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                required
                            >
                                <option value="">Select Sub-Type</option>
                                <option value="Term">Term</option>
                                <option value="Endowment">Endowment</option>
                                <option value="Whole Life">Whole Life</option>
                                <option value="ULIP">ULIP</option>
                            </select>
                        </div>


                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Medical Requirement <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="medicalRequirement"
                                value={policyData.medicalRequirement}
                                onChange={handlePolicyTypeInput}
                                rows="3"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                placeholder="Medical examination requirements"
                                required
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Death Benefit Description <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="deathBenefitDescription"
                                value={policyData.deathBenefitDescription}
                                onChange={handlePolicyTypeInput}
                                rows="4"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                placeholder="Describe death benefit coverage in detail"
                                required
                            />
                        </div>

                        <div className="md:col-span-2 flex gap-6">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="maturityBenefit"
                                    checked={policyData.maturityBenefit}
                                    onChange={handlePolicyTypeInput}
                                    className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
                                />
                                <span className="text-sm font-medium text-gray-700">Maturity Benefit Offered</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="bonusApplicable"
                                    checked={policyData.bonusApplicable}
                                    onChange={handlePolicyTypeInput}
                                    className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
                                />
                                <span className="text-sm font-medium text-gray-700">Bonus Applicable</span>
                            </label>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Claim Type <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="claimType"
                                value={policyData.claimType}
                                onChange={handlePolicyTypeInput}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                placeholder="e.g., Death Claim, Maturity Claim"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Maturity Processing Time (Days) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                name="maturityProcessingTimeDays"
                                value={policyData.maturityProcessingTimeDays}
                                onChange={handlePolicyTypeInput}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                required
                            />
                        </div>
                    </div>
                </div>
            );
        }

        if (policyType === 'Health') {
            return (
                <div className="space-y-6">
                    <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                        <h3 className="text-lg font-semibold text-green-900 mb-2">Health Insurance Plan Details</h3>
                        <p className="text-sm text-green-700">Fill in all required fields for your health insurance plan</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Coverage Type <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="coverageType"
                                value={policyData.coverageType}
                                onChange={handlePolicyTypeInput}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                required
                            >
                                <option value="">Select Coverage Type</option>
                                <option value="Individual">Individual</option>
                                <option value="Family">Family</option>
                                <option value="Corporate">Corporate</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Annual Coverage Limit <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                name="annualCoverageLimit"
                                value={policyData.annualCoverageLimit}
                                onChange={handlePolicyTypeInput}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Annual Premium <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                name="annualPremium"
                                value={policyData.annualPremium}
                                onChange={handlePolicyTypeInput}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Payment Frequency <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="paymentFrequency"
                                value={policyData.paymentFrequency}
                                onChange={handlePolicyTypeInput}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                required
                            >
                                <option value="Monthly">Monthly</option>
                                <option value="Quarterly">Quarterly</option>
                                <option value="Semi-Annually">Semi-Annually</option>
                                <option value="Annually">Annually</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Claim Type <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="claimType"
                                value={policyData.claimType}
                                onChange={handlePolicyTypeInput}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                required
                            >
                                <option value="">Select Claim Type</option>
                                <option value="Cashless">Cashless</option>
                                <option value="Reimbursement">Reimbursement</option>
                                <option value="Both">Both</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Claim TAT (Days) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                name="claimTATDays"
                                value={policyData.claimTATDays}
                                onChange={handlePolicyTypeInput}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                required
                            />
                        </div>

                        <div className="md:col-span-2 flex gap-6 flex-wrap">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="icuCoverage"
                                    checked={policyData.icuCoverage}
                                    onChange={handlePolicyTypeInput}
                                    className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
                                />
                                <span className="text-sm font-medium text-gray-700">ICU Coverage</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="cashlessFacility"
                                    checked={policyData.cashlessFacility}
                                    onChange={handlePolicyTypeInput}
                                    className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
                                />
                                <span className="text-sm font-medium text-gray-700">Cashless Facility</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="preExistingCoverage"
                                    checked={policyData.preExistingCoverage}
                                    onChange={handlePolicyTypeInput}
                                    className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
                                />
                                <span className="text-sm font-medium text-gray-700">Pre-existing Coverage</span>
                            </label>
                        </div>
                    </div>
                </div>
            );
        }

        if (policyType === 'Motor') {
            return (
                <div className="space-y-6">
                    <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
                        <h3 className="text-lg font-semibold text-purple-900 mb-2">Motor Insurance Plan Details</h3>
                        <p className="text-sm text-purple-700">Fill in all required fields for your motor insurance plan</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Motor Type <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="motorType"
                                value={policyData.motorType}
                                onChange={handlePolicyTypeInput}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                required
                            >
                                <option value="">Select Motor Type</option>
                                <option value="Car">Car</option>
                                <option value="Bike">Bike</option>
                                <option value="Commercial">Commercial</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Coverage Type <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="coverageType"
                                value={policyData.coverageType}
                                onChange={handlePolicyTypeInput}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                required
                            >
                                <option value="">Select Coverage Type</option>
                                <option value="Comprehensive">Comprehensive</option>
                                <option value="Third Party">Third Party</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Annual Premium <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                name="annualPremium"
                                value={policyData.annualPremium}
                                onChange={handlePolicyTypeInput}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Deductible / Excess <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                name="deductibleExcess"
                                value={policyData.deductibleExcess}
                                onChange={handlePolicyTypeInput}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Average Claim TAT (Days) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                name="averageClaimTATDays"
                                value={policyData.averageClaimTATDays}
                                onChange={handlePolicyTypeInput}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                required
                            />
                        </div>

                        <div className="md:col-span-2 flex gap-6 flex-wrap">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="theftCoverage"
                                    checked={policyData.theftCoverage}
                                    onChange={handlePolicyTypeInput}
                                    className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
                                />
                                <span className="text-sm font-medium text-gray-700">Theft Coverage</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="floodCoverage"
                                    checked={policyData.floodCoverage}
                                    onChange={handlePolicyTypeInput}
                                    className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
                                />
                                <span className="text-sm font-medium text-gray-700">Flood Coverage</span>
                            </label>
                        </div>
                    </div>
                </div>
            );
        }

        if (policyType === 'Travel') {
            return (
                <div className="space-y-6">
                    <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded">
                        <h3 className="text-lg font-semibold text-indigo-900 mb-2">Travel Insurance Plan Details</h3>
                        <p className="text-sm text-indigo-700">Fill in all required fields for your travel insurance plan</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Travel Type <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="travelType"
                                value={policyData.travelType}
                                onChange={handlePolicyTypeInput}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                required
                            >
                                <option value="">Select Travel Type</option>
                                <option value="Single">Single</option>
                                <option value="Multiple">Multiple</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Geographic Coverage <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="geographicCoverage"
                                value={policyData.geographicCoverage}
                                onChange={handlePolicyTypeInput}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                required
                            >
                                <option value="">Select Coverage</option>
                                <option value="Domestic">Domestic</option>
                                <option value="International">International</option>
                                <option value="Both">Both</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Premium Amount <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                name="premiumAmount"
                                value={policyData.premiumAmount}
                                onChange={handlePolicyTypeInput}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Claim TAT (Days) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                name="claimTATDays"
                                value={policyData.claimTATDays}
                                onChange={handlePolicyTypeInput}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                required
                            />
                        </div>
                    </div>
                </div>
            );
        }

        if (policyType === 'Property') {
            return (
                <div className="space-y-6">
                    <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded">
                        <h3 className="text-lg font-semibold text-amber-900 mb-2">Property Insurance Plan Details</h3>
                        <p className="text-sm text-amber-700">Fill in all required fields for your property insurance plan</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Property Type <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="propertyType"
                                value={policyData.propertyType}
                                onChange={handlePolicyTypeInput}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                required
                            >
                                <option value="">Select Property Type</option>
                                <option value="Residential">Residential</option>
                                <option value="Commercial">Commercial</option>
                                <option value="Industrial">Industrial</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Coverage Amount <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                name="coverageAmount"
                                value={policyData.coverageAmount}
                                onChange={handlePolicyTypeInput}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Premium Amount <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                name="premiumAmount"
                                value={policyData.premiumAmount}
                                onChange={handlePolicyTypeInput}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Claim TAT (Days) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                name="claimTATDays"
                                value={policyData.claimTATDays}
                                onChange={handlePolicyTypeInput}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                required
                            />
                        </div>

                        <div className="md:col-span-2 flex gap-6 flex-wrap">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="fireCoverage"
                                    checked={policyData.fireCoverage}
                                    onChange={handlePolicyTypeInput}
                                    className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
                                />
                                <span className="text-sm font-medium text-gray-700">Fire Coverage</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="theftCoverage"
                                    checked={policyData.theftCoverage}
                                    onChange={handlePolicyTypeInput}
                                    className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
                                />
                                <span className="text-sm font-medium text-gray-700">Theft Coverage</span>
                            </label>
                        </div>
                    </div>
                </div>
            );
        }

        if (policyType === 'Takaful') {
            return (
                <div className="space-y-6">
                    <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded">
                        <h3 className="text-lg font-semibold text-emerald-900 mb-2">Takaful Plan Details</h3>
                        <p className="text-sm text-emerald-700">Fill in all required fields for your Takaful plan</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Takaful Type <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="takafulType"
                                value={policyData.takafulType}
                                onChange={handlePolicyTypeInput}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                required
                            >
                                <option value="">Select Takaful Type</option>
                                <option value="Family">Family</option>
                                <option value="General">General</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Contribution Amount <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                name="contributionAmount"
                                value={policyData.contributionAmount}
                                onChange={handlePolicyTypeInput}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Sum Covered <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                name="sumCovered"
                                value={policyData.sumCovered}
                                onChange={handlePolicyTypeInput}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Contribution Frequency <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="contributionFrequency"
                                value={policyData.contributionFrequency}
                                onChange={handlePolicyTypeInput}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                required
                            >
                                <option value="Monthly">Monthly</option>
                                <option value="Quarterly">Quarterly</option>
                                <option value="Semi-Annually">Semi-Annually</option>
                                <option value="Annually">Annually</option>
                            </select>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="space-y-6">
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">{policyType} Insurance Plan Details</h3>
                    <p className="text-sm text-blue-700">Please fill in all required fields for {policyType} insurance plan.</p>
                </div>
            </div>
        );
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-6 animate-in slide-in-from-right duration-500">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-red-100">
                            <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl">
                                <Shield className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Step 1: Basic Information</h2>
                        </div>

                        {!isEdit && (
                            <div className="space-y-6">
                                {/* Creation Method Selection */}
                                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                                    <label className="block text-sm font-semibold text-gray-700 mb-4">
                                        Select Creation Method <span className="text-red-500">*</span>
                                    </label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setCreationMethod('company');
                                                setFetchedUser(null);
                                                setUserIdInput('');
                                                setFormData(prev => ({ ...prev, insuranceCompanyId: '' }));
                                            }}
                                            className={`p-4 border-2 rounded-xl transition-all ${
                                                creationMethod === 'company'
                                                    ? 'border-red-500 bg-red-50'
                                                    : 'border-gray-300 hover:border-gray-400'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <Building2 className={`w-5 h-5 ${creationMethod === 'company' ? 'text-red-600' : 'text-gray-500'}`} />
                                                <span className={`font-semibold ${creationMethod === 'company' ? 'text-red-600' : 'text-gray-700'}`}>
                                                    Select from Companies
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-600">Choose from existing insurance companies</p>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setCreationMethod('userId');
                                                setFormData(prev => ({ ...prev, insuranceCompanyId: '' }));
                                            }}
                                            className={`p-4 border-2 rounded-xl transition-all ${
                                                creationMethod === 'userId'
                                                    ? 'border-red-500 bg-red-50'
                                                    : 'border-gray-300 hover:border-gray-400'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <User className={`w-5 h-5 ${creationMethod === 'userId' ? 'text-red-600' : 'text-gray-500'}`} />
                                                <span className={`font-semibold ${creationMethod === 'userId' ? 'text-red-600' : 'text-gray-700'}`}>
                                                    Enter User ID
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-600">Fetch user data by User ID</p>
                                        </button>
                                    </div>
                                </div>

                                {/* Company Selection Method */}
                                {creationMethod === 'company' && (
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Insurance Company <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            name="insuranceCompanyId"
                                            value={formData.insuranceCompanyId}
                                            onChange={handleInput}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                            required
                                        >
                                            <option value="">Select Insurance Company</option>
                                            {insuranceCompanies.map((company) => (
                                                <option key={company._id || company.insuranceCompanyId} value={company.insuranceCompanyId || company.userId}>
                                                    {company.insuranceCompanyName || company.name || company.companyDetails?.RegisteredCompanyName}
                                                </option>
                                            ))}
                                        </select>
                                        <p className="text-xs text-gray-500 mt-1">Only insurance companies are shown (Insurance/Takaful partners)</p>
                                    </div>
                                )}

                                {/* User ID Input Method */}
                                {creationMethod === 'userId' && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                User ID <span className="text-red-500">*</span>
                                            </label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={userIdInput}
                                                    onChange={(e) => setUserIdInput(e.target.value)}
                                                    placeholder="Enter User ID"
                                                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={fetchUserByUserId}
                                                    disabled={fetchingUser || !userIdInput.trim()}
                                                    className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                                >
                                                    {fetchingUser ? 'Fetching...' : 'Fetch User'}
                                                </button>
                                            </div>
                                        </div>

                                        {fetchedUser && (
                                            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
                                                <p className="text-sm text-gray-600 mb-1">Company Name</p>
                                                <p className="font-semibold text-gray-800 text-lg">
                                                    {fetchedUser.companyDetails?.RegisteredCompanyName || fetchedUser.name}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Email: {fetchedUser.email} | User ID: {fetchedUser.userId}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Plan Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="planName"
                                    value={formData.planName}
                                    onChange={handleInput}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                    placeholder="e.g., Comprehensive Life Insurance Plan"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Policy Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="policyType"
                                    value={formData.policyType}
                                    onChange={handleInput}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                    required
                                >
                                    <option value="">Select Policy Type</option>
                                    <option value="Life">Life</option>
                                    <option value="Health">Health</option>
                                    <option value="Motor">Motor</option>
                                    <option value="Travel">Travel</option>
                                    <option value="Property">Property</option>
                                    <option value="Takaful">Takaful</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Description
                            </label>
                            {isView ? (
                                <div 
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl min-h-[200px] prose prose-sm max-w-none"
                                    dangerouslySetInnerHTML={{ __html: formData.description || '' }}
                                />
                            ) : (
                                <>
                                    <RichTextEditor
                                        value={formData.description}
                                        onChange={(html) => setFormData(prev => ({ ...prev, description: html }))}
                                        placeholder="Enter a detailed description of the insurance plan..."
                                    />
                                    <p className="text-xs text-gray-500 mt-2">Provide a comprehensive description of the plan features, benefits, and coverage details.</p>
                                </>
                            )}
                        </div>

                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Plan Status <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="planStatus"
                                    value={formData.planStatus}
                                    onChange={handleInput}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                    required
                                >
                                    <option value="Active">Active</option>
                                    <option value="Limited">Limited</option>
                                    <option value="Closed">Closed</option>
                                </select>
                            </div>
                        </div>

                        {!isEdit && (
                            <div>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="isVisible"
                                        checked={formData.isVisible}
                                        onChange={handleInput}
                                        className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
                                    />
                                    <span className="text-sm font-semibold text-gray-700">Make plan visible to users</span>
                                </label>
                                <p className="text-xs text-gray-500 mt-2">Note: Plans are automatically approved when created</p>
                            </div>
                        )}
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-6 animate-in slide-in-from-right duration-500">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-purple-100">
                            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                                <FileText className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Step 2: Plan Details</h2>
                        </div>

                        {/* Merged Form - Common Fields + Life Insurance Static Fields */}
                        <div className="bg-gradient-to-br from-blue-50 via-red-50 to-purple-50 border-l-4 border-red-500 p-6 rounded-lg mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Plan Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Policy Term - Common for all */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Policy Term <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="policyTerm"
                                        value={formData.policyTerm}
                                        onChange={handleInput}
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                        required
                                    >
                                        <option value="">Select Policy Term</option>
                                        <option value="1 year">1 year</option>
                                        <option value="2 years">2 years</option>
                                        <option value="3 years">3 years</option>
                                        <option value="4 years">4 years</option>
                                        <option value="5 years">5 years</option>
                                        <option value="6 years">6 years</option>
                                        <option value="7 years">7 years</option>
                                        <option value="8 years">8 years</option>
                                        <option value="9 years">9 years</option>
                                        <option value="10 years">10 years</option>
                                        <option value="15 years">15 years</option>
                                        <option value="20 years">20 years</option>
                                        <option value="25 years">25 years</option>
                                        <option value="30 years">30 years</option>
                                        <option value="Whole Life">Whole Life</option>
                                        <option value="Custom">Custom</option>
                                    </select>
                                </div>

                                {/* For Life Insurance - Static Fields */}
                                {formData.policyType === 'Life' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Sum Assured <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                name="sumAssured"
                                                value={formData.lifeInsurancePlan?.sumAssured || ''}
                                                onChange={handlePolicyTypeInput}
                                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                                placeholder="500000"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Premium Amount <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                name="premiumAmount"
                                                value={formData.lifeInsurancePlan?.premiumAmount || ''}
                                                onChange={handlePolicyTypeInput}
                                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                                placeholder="Enter premium amount"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Payment Frequency <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                name="paymentFrequency"
                                                value={formData.lifeInsurancePlan?.paymentFrequency || 'Monthly'}
                                                onChange={handlePolicyTypeInput}
                                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                                required
                                            >
                                                <option value="Monthly">Monthly</option>
                                                <option value="Quarterly">Quarterly</option>
                                                <option value="Semi-Annually">Semi-Annually</option>
                                                <option value="Annually">Annually</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Estimated Maturity <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">PKR</span>
                                                <input
                                                    type="number"
                                                    name="estimatedMaturity"
                                                    value={formData.estimatedMaturity || ''}
                                                    onChange={handleInput}
                                                    className="w-full pl-16 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                                    placeholder="0.00"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Estimated Maturity - For non-Life insurance types */}
                                {formData.policyType !== 'Life' && (
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Estimated Maturity <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">PKR</span>
                                            <input
                                                type="number"
                                                name="estimatedMaturity"
                                                value={formData.estimatedMaturity || ''}
                                                onChange={handleInput}
                                                className="w-full pl-16 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                                placeholder="0.00"
                                                required
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Show Min/Max Policy Term inputs only when "Custom" is selected */}
                                {formData.policyTerm === 'Custom' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Min Policy Term (Years) <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                name="policyTermYearsMin"
                                                value={(() => {
                                                    if (!formData.policyType) return '';
                                                    const policyKey = `${formData.policyType.charAt(0).toLowerCase() + formData.policyType.slice(1)}${formData.policyType === 'Takaful' ? '' : 'Insurance'}Plan`;
                                                    return formData[policyKey]?.policyTermYearsMin || '';
                                                })()}
                                                onChange={(e) => {
                                                    if (!formData.policyType) return;
                                                    const policyKey = `${formData.policyType.charAt(0).toLowerCase() + formData.policyType.slice(1)}${formData.policyType === 'Takaful' ? '' : 'Insurance'}Plan`;
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        [policyKey]: {
                                                            ...prev[policyKey],
                                                            policyTermYearsMin: e.target.value
                                                        }
                                                    }));
                                                }}
                                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                                placeholder="e.g., 1"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Max Policy Term (Years) <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                name="policyTermYearsMax"
                                                value={(() => {
                                                    if (!formData.policyType) return '';
                                                    const policyKey = `${formData.policyType.charAt(0).toLowerCase() + formData.policyType.slice(1)}${formData.policyType === 'Takaful' ? '' : 'Insurance'}Plan`;
                                                    return formData[policyKey]?.policyTermYearsMax || '';
                                                })()}
                                                onChange={(e) => {
                                                    if (!formData.policyType) return;
                                                    const policyKey = `${formData.policyType.charAt(0).toLowerCase() + formData.policyType.slice(1)}${formData.policyType === 'Takaful' ? '' : 'Insurance'}Plan`;
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        [policyKey]: {
                                                            ...prev[policyKey],
                                                            policyTermYearsMax: e.target.value
                                                        }
                                                    }));
                                                }}
                                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                                placeholder="e.g., 30"
                                                required
                                            />
                                        </div>
                                    </>
                                )}

                                {/* Eligible Age Range - Common for all */}
                                <div className={formData.policyType === 'Life' ? 'md:col-span-2' : ''}>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Eligible Age Range <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            name="eligibleAgeMin"
                                            value={formData.eligibleAge?.min || ''}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                eligibleAge: { ...(prev.eligibleAge || {}), min: e.target.value }
                                            }))}
                                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                            placeholder="Min"
                                            required
                                        />
                                        <span className="text-gray-500">-</span>
                                        <input
                                            type="number"
                                            name="eligibleAgeMax"
                                            value={formData.eligibleAge?.max || ''}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                eligibleAge: { ...(prev.eligibleAge || {}), max: e.target.value }
                                            }))}
                                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                            placeholder="Max"
                                            required
                                        />
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">e.g., 30-60 years</p>
                                </div>
                            </div>
                        </div>

                        {/* Display Cards for Life Insurance Static Fields */}
                        {formData.policyType === 'Life' && (
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                                <div className="bg-white border-2 border-red-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                                    <p className="text-xs text-gray-500 mb-1">Premium Amount</p>
                                    <p className="text-lg font-bold text-gray-900">
                                        PKR {formData.lifeInsurancePlan?.premiumAmount ? Number(formData.lifeInsurancePlan.premiumAmount).toLocaleString() : '0'}
                                    </p>
                                </div>
                                <div className="bg-white border-2 border-red-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                                    <p className="text-xs text-gray-500 mb-1">Payment Frequency</p>
                                    <p className="text-lg font-bold text-gray-900">
                                        {formData.lifeInsurancePlan?.paymentFrequency || 'Monthly'}
                                    </p>
                                </div>
                                <div className="bg-white border-2 border-red-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                                    <p className="text-xs text-gray-500 mb-1">Sum Assured</p>
                                    <p className="text-lg font-bold text-gray-900">
                                        PKR {formData.lifeInsurancePlan?.sumAssured ? Number(formData.lifeInsurancePlan.sumAssured).toLocaleString() : '0'}
                                    </p>
                                </div>
                                <div className="bg-white border-2 border-red-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                                    <p className="text-xs text-gray-500 mb-1">Policy Term</p>
                                    <p className="text-lg font-bold text-gray-900">
                                        {formData.policyTerm || 'N/A'}
                                    </p>
                                </div>
                                <div className="bg-white border-2 border-red-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                                    <p className="text-xs text-gray-500 mb-1">Estimated Maturity</p>
                                    <p className="text-lg font-bold text-gray-900">
                                        PKR {formData.estimatedMaturity ? Number(formData.estimatedMaturity).toLocaleString() : '0'}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Policy-Specific Fields (excluding Life Insurance static fields) */}
                        {renderPolicyTypeFields()}
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-6 animate-in slide-in-from-right duration-500">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-green-100">
                            <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                                <FileText className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Step 3: Required Documents</h2>
                        </div>
                        
                        <div className="space-y-6">
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-green-400 transition-all">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Product Brochure <span className="text-red-500">*</span>
                                </label>
                                <p className="text-xs text-gray-500 mb-2">File types: PDF, DOC, DOCX | Max size: 5MB</p>
                                {!formData.planDocuments.productBrochure ? (
                                    <>
                                        <input
                                            type="file"
                                            accept=".pdf,.doc,.docx"
                                            onChange={(e) => {
                                                if (e.target.files[0]) {
                                                    handleDocumentUpload(e.target.files[0], 'productBrochure');
                                                }
                                            }}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                            required
                                            disabled={uploadingDocuments.productBrochure}
                                        />
                                        {uploadingDocuments.productBrochure && (
                                            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm font-medium text-blue-700">Uploading...</span>
                                                    <span className="text-sm font-semibold text-blue-900">{Math.round(uploadProgress.productBrochure || 0)}%</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                                    <div 
                                                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300 flex items-center justify-end pr-2"
                                                        style={{ width: `${uploadProgress.productBrochure || 0}%` }}
                                                    >
                                                        {uploadProgress.productBrochure > 10 && (
                                                            <span className="text-xs text-white font-medium">{Math.round(uploadProgress.productBrochure || 0)}%</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="mt-3 flex items-center gap-2 text-green-600">
                                        <Check className="w-5 h-5" />
                                        <span className="text-sm font-medium">Document uploaded successfully</span>
                                        <a href={formData.planDocuments.productBrochure} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                                            View
                                        </a>
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteDocument('productBrochure')}
                                            className="ml-auto px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-800 rounded-lg flex items-center gap-1.5 transition-colors border border-red-200"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            <span className="text-sm font-medium">Delete</span>
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-green-400 transition-all">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Policy Riders <span className="text-gray-500">(Optional)</span>
                                </label>
                                <p className="text-xs text-gray-500 mb-2">File types: PDF, DOC, DOCX | Max size: 5MB</p>
                                {!formData.planDocuments.policyRiders ? (
                                    <>
                                        <input
                                            type="file"
                                            accept=".pdf,.doc,.docx"
                                            onChange={(e) => {
                                                if (e.target.files[0]) {
                                                    handleDocumentUpload(e.target.files[0], 'policyRiders');
                                                }
                                            }}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                            disabled={uploadingDocuments.policyRiders}
                                        />
                                        {uploadingDocuments.policyRiders && (
                                            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm font-medium text-blue-700">Uploading...</span>
                                                    <span className="text-sm font-semibold text-blue-900">{Math.round(uploadProgress.policyRiders || 0)}%</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                                    <div 
                                                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300 flex items-center justify-end pr-2"
                                                        style={{ width: `${uploadProgress.policyRiders || 0}%` }}
                                                    >
                                                        {uploadProgress.policyRiders > 10 && (
                                                            <span className="text-xs text-white font-medium">{Math.round(uploadProgress.policyRiders || 0)}%</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="mt-3 flex items-center gap-2 text-green-600">
                                        <Check className="w-5 h-5" />
                                        <span className="text-sm font-medium">Document uploaded successfully</span>
                                        <a href={formData.planDocuments.policyRiders} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                                            View
                                        </a>
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteDocument('policyRiders')}
                                            className="ml-auto px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-800 rounded-lg flex items-center gap-1.5 transition-colors border border-red-200"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            <span className="text-sm font-medium">Delete</span>
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-green-400 transition-all">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Rate Card <span className="text-gray-500">(Optional)</span>
                                </label>
                                <p className="text-xs text-gray-500 mb-2">File types: PDF, DOC, DOCX, XLS, XLSX | Max size: 5MB</p>
                                {!formData.planDocuments.rateCard ? (
                                    <>
                                        <input
                                            type="file"
                                            accept=".pdf,.doc,.docx,.xls,.xlsx"
                                            onChange={(e) => {
                                                if (e.target.files[0]) {
                                                    handleDocumentUpload(e.target.files[0], 'rateCard');
                                                }
                                            }}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                            disabled={uploadingDocuments.rateCard}
                                        />
                                        {uploadingDocuments.rateCard && (
                                            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm font-medium text-blue-700">Uploading...</span>
                                                    <span className="text-sm font-semibold text-blue-900">{Math.round(uploadProgress.rateCard || 0)}%</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                                    <div 
                                                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300 flex items-center justify-end pr-2"
                                                        style={{ width: `${uploadProgress.rateCard || 0}%` }}
                                                    >
                                                        {uploadProgress.rateCard > 10 && (
                                                            <span className="text-xs text-white font-medium">{Math.round(uploadProgress.rateCard || 0)}%</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="mt-3 flex items-center gap-2 text-green-600">
                                        <Check className="w-5 h-5" />
                                        <span className="text-sm font-medium">Document uploaded successfully</span>
                                        <a href={formData.planDocuments.rateCard} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                                            View
                                        </a>
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteDocument('rateCard')}
                                            className="ml-auto px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-800 rounded-lg flex items-center gap-1.5 transition-colors border border-red-200"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            <span className="text-sm font-medium">Delete</span>
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-green-400 transition-all">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Claim Procedure (Optional)
                                </label>
                                <p className="text-xs text-gray-500 mb-2">File types: PDF, DOC, DOCX | Max size: 5MB</p>
                                {!formData.planDocuments.claimProcedure ? (
                                    <>
                                        <input
                                            type="file"
                                            accept=".pdf,.doc,.docx"
                                            onChange={(e) => {
                                                if (e.target.files[0]) {
                                                    handleDocumentUpload(e.target.files[0], 'claimProcedure');
                                                }
                                            }}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                            disabled={uploadingDocuments.claimProcedure}
                                        />
                                        {uploadingDocuments.claimProcedure && (
                                            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm font-medium text-blue-700">Uploading...</span>
                                                    <span className="text-sm font-semibold text-blue-900">{Math.round(uploadProgress.claimProcedure || 0)}%</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                                    <div 
                                                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300 flex items-center justify-end pr-2"
                                                        style={{ width: `${uploadProgress.claimProcedure || 0}%` }}
                                                    >
                                                        {uploadProgress.claimProcedure > 10 && (
                                                            <span className="text-xs text-white font-medium">{Math.round(uploadProgress.claimProcedure || 0)}%</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="mt-3 flex items-center gap-2 text-green-600">
                                        <Check className="w-5 h-5" />
                                        <span className="text-sm font-medium">Document uploaded successfully</span>
                                        <a href={formData.planDocuments.claimProcedure} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                                            View
                                        </a>
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteDocument('claimProcedure')}
                                            className="ml-auto px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-800 rounded-lg flex items-center gap-1.5 transition-colors border border-red-200"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            <span className="text-sm font-medium">Delete</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );

            case 4:
                return (
                    <div className="space-y-6 animate-in slide-in-from-right duration-500">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-blue-100">
                            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                                <ImageIcon className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Step 4: Plan Image</h2>
                        </div>

                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-all">
                            {imagePreview || formData.planImage ? (
                                <div className="space-y-4">
                                    <div className="relative inline-block">
                                        <img
                                            src={imagePreview || formData.planImage}
                                            alt="Plan preview"
                                            className="max-w-full h-64 object-cover rounded-lg shadow-lg"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setImagePreview(null);
                                                setFormData(prev => ({ ...prev, planImage: '' }));
                                            }}
                                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <p className="text-sm text-gray-600">Image uploaded successfully</p>
                                </div>
                            ) : (
                                <div>
                                    <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <label className="cursor-pointer">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                            disabled={uploadingImage}
                                        />
                                        <div className="mt-4">
                                            <span className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors inline-block">
                                                {uploadingImage ? 'Uploading...' : 'Upload Image'}
                                            </span>
                                        </div>
                                        <p className="mt-2 text-sm text-gray-500">JPG, PNG or GIF (Max 5MB)</p>
                                    </label>
                                </div>
                            )}
                        </div>
                    </div>
                );

            case 5:
                return (
                    <div className="space-y-6 animate-in slide-in-from-right duration-500">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-orange-100">
                            <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl">
                                <Check className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Step 5: Authorization & Declaration</h2>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.authorization.authorizationToList}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            authorization: { ...prev.authorization, authorizationToList: e.target.checked }
                                        }))}
                                        className="mt-1 w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
                                        required
                                    />
                                    <div>
                                        <span className="font-semibold text-gray-800">Authorization to List Plan on Madadgaar <span className="text-red-500">*</span></span>
                                        <p className="text-sm text-gray-600 mt-1">
                                            I authorize Madadgaar Expert Partner to display, compare, and promote this insurance/takaful plan on its platform.
                                        </p>
                                    </div>
                                </label>
                            </div>

                            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.authorization.confirmationOfAccuracy}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            authorization: { ...prev.authorization, confirmationOfAccuracy: e.target.checked }
                                        }))}
                                        className="mt-1 w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
                                        required
                                    />
                                    <div>
                                        <span className="font-semibold text-gray-800">Confirmation of Accuracy <span className="text-red-500">*</span></span>
                                        <p className="text-sm text-gray-600 mt-1">
                                            I confirm that all information provided is accurate and true.
                                        </p>
                                    </div>
                                </label>
                            </div>

                            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.authorization.consentForLeadSharing}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            authorization: { ...prev.authorization, consentForLeadSharing: e.target.checked }
                                        }))}
                                        className="mt-1 w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
                                        required
                                    />
                                    <div>
                                        <span className="font-semibold text-gray-800">Consent for Lead Sharing <span className="text-red-500">*</span></span>
                                        <p className="text-sm text-gray-600 mt-1">
                                            I consent for Madadgaar to share client leads for services requested.
                                        </p>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    if (loading && isEdit) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    {isEdit ? 'Edit Insurance Plan' : 'Create Insurance Plan'}
                </h1>
                <p className="text-gray-600">{isEdit ? 'Update insurance plan details' : 'Add a new insurance plan'}</p>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                    {[...Array(totalSteps)].map((_, i) => (
                        <div key={i} className="flex-1 flex items-center">
                            <div className="flex-1 h-2 rounded-full mx-1 relative overflow-hidden">
                                <div className={`absolute inset-0 transition-all duration-300 ${
                                    i + 1 < currentStep ? 'bg-red-600' : i + 1 === currentStep ? 'bg-red-400' : 'bg-gray-200'
                                }`} style={{ width: i + 1 <= currentStep ? '100%' : '0%' }} />
                            </div>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                                i + 1 < currentStep ? 'bg-red-600 text-white' : 
                                i + 1 === currentStep ? 'bg-red-500 text-white ring-4 ring-red-200' : 
                                'bg-gray-200 text-gray-500'
                            }`}>
                                {i + 1 < currentStep ? <Check className="w-4 h-4" /> : i + 1}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>Basic Info</span>
                    <span>Plan Details</span>
                    <span>Documents</span>
                    <span>Image</span>
                    <span>Authorization</span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 md:p-8">
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                {message && (
                    <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg">
                        <p className="text-green-700">{message}</p>
                    </div>
                )}

                {renderStepContent()}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8 pt-6 border-t">
                    <button
                        type="button"
                        onClick={handlePrevious}
                        disabled={currentStep === 1}
                        className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Previous
                    </button>

                    {currentStep < totalSteps ? (
                        <button
                            type="button"
                            onClick={handleNext}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all shadow-lg"
                        >
                            Next
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            type="submit"
                            disabled={loading || Object.values(uploadingDocuments).some(u => u) || uploadingImage}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    {isEdit ? 'Updating...' : 'Creating...'}
                                </>
                            ) : (
                                <>
                                    {isEdit ? 'Update Plan' : 'Create Plan'}
                                    <Check className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default InsurancePlanAdd;
