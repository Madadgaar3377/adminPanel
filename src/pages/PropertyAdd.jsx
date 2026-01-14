import React, { useState, useEffect, useCallback } from 'react';
import ApiBaseUrl from '../constants/apiUrl';
import { useNavigate, useParams } from 'react-router-dom';
import cities from '../constants/cities';
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

const PropertyAdd = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetchingProperty, setFetchingProperty] = useState(false);
    const [uploadingImages, setUploadingImages] = useState(false);
    const [uploadingDocument, setUploadingDocument] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [toast, setToast] = useState(null);
    const [currentStep, setCurrentStep] = useState(1);
    const [documentForm, setDocumentForm] = useState({
        title: '',
        type: '',
        file: null
    });

    const showToast = (message, type) => {
        setToast({ message, type });
    };
    const [isEditMode, setIsEditMode] = useState(false);

    // Main property type selection
    const [propertyType, setPropertyType] = useState('Project'); // 'Project' or 'Individual'

    // Project form data
    const [projectData, setProjectData] = useState({
        projectName: '',
        city: '',
        district: '',
        tehsil: '',
        area: '',
        street: '',
        address: '',
        latitude: '',
        longitude: '',
        projectType: 'Residential',
        projectSubType: '',
        developmentType: '',
        infrastructureStatus: '',
        projectStage: '',
        expectedCompletionDate: '',
        possessionDate: '',
        utilities: {
            electricity: false,
            water: false,
            gas: false,
            internet: false,
            sewage: false,
            telephoneLine: false,
        },
        amenities: {
            // Infrastructure & Utilities
            undergroundElectricity: false,
            waterSupply: false,
            sewerageSystem: false,
            drainageSystem: false,
            backupPower: false,
            // Religious & Community Facilities
            mosque: false,
            communityCenter: false,
            // Education, Health & Commercial
            school: false,
            medicalFacility: false,
            commercialZone: false,
            // Recreational & Outdoor
            parks: false,
            playground: false,
            garden: false,
            swimmingPool: false,
            clubhouse: false,
            joggingTrack: false,
            sportsCourts: false,
            waterFeatures: false,
            petPark: false,
            // Residential Interior Spaces
            servantQuarters: false,
            drawingRoom: false,
            diningRoom: false,
            studyRoom: false,
            prayerRoom: false,
            lounge: false,
            storeRoom: false,
            laundryRoom: false,
            gym: false,
            steamRoom: false,
            // Building & Property Features
            parking: false,
            balcony: false,
            terrace: false,
            elevator: false,
            receptionArea: false,
            meetingRoom: false,
            publicTransportAccess: false,
            commonAreaWifi: false,
            // Security & Building Systems
            security: false,
            cctv: false,
            fireSafety: false,
            airConditioning: false,
            // Commercial / Miscellaneous
            brandingSpace: false,
            retailShops: false,
            loadingUnloadingArea: false,
            cafeteria: false,
            laundryService: false,
            // Utilities (Existing + Extended)
            evCharging: false,
            wasteManagement: false,
        },
        description: '',
        highlights: ['', '', ''],
        totalLandArea: '',
        landAreaUnit: 'sqft',
        propertyTypesAvailable: [],
        totalUnits: '',
        typicalUnitSizes: '',
        nearbyLandmarks: '',
        remarks: '',
        developerBuilder: '',
        units: [],
        transaction: {
            type: 'Sale',
            price: '',
            priceRange: '',
            advanceAmount: '',
            monthlyRent: '',
            contractDuration: '',
            bookingAmount: '',
            downPayment: '',
            monthlyInstallment: '',
            tenure: '',
            totalPayable: '',
            interestRate: '',
            additionalCharges: '',
            discountsOffers: '',
            additionalInfo: '',
        },
        images: [],
        video: '',
        documents: [],
        contact: {
            name: '',
            email: '',
            number: '',
            whatsapp: '',
            cnic: '',
            city: '',
            area: '',
            companyName: '',
            designation: '',
        },
        declarationAccepted: false,
    });

    // Individual property form data
    const [individualData, setIndividualData] = useState({
        title: '',
        description: '',
        propertyType: 'Apartment / Flat',
        areaUnit: 'sq. ft',
        areaSize: '',
        city: '',
        location: '',
        bedrooms: '',
        bathrooms: '',
        kitchenType: '',
        furnishingStatus: '',
        floor: '',
        totalFloors: '',
        possessionStatus: '',
        zoningType: 'Residential',
        utilities: {
            electricity: false,
            water: false,
            gas: false,
            internet: false,
        },
        amenities: {
            // Infrastructure & Utilities
            undergroundElectricity: false,
            waterSupply: false,
            sewerageDrainage: false,
            backupPower: false,
            // Religious & Community
            grandMosque: false,
            communityCenter: false,
            // Education, Health & Commercial
            schools: false,
            healthFacility: false,
            commercialZone: false,
            // Recreational & Outdoor
            parksGreenAreas: false,
            playground: false,
            gardenLawn: false,
            swimmingPool: false,
            clubhouse: false,
            // Residential Interior
            servantQuarters: false,
            drawingRoom: false,
            diningRoom: false,
            studyRoom: false,
            prayerRoom: false,
            loungeSittingRoom: false,
            storeRoom: false,
            laundryRoom: false,
            gym: false,
            steamRoom: false,
            // Building & Property Features
            parkingSpace: false,
            balcony: false,
            terrace: false,
            elevator: false,
            receptionArea: false,
            meetingRoom: false,
            // Security & Building Systems
            security: false,
            cctv: false,
            airConditioning: false,
            // Commercial / Miscellaneous
            brandingSpace: false,
            retailShops: false,
            loadingArea: false,
        },
        nearbyLandmarks: '',
        transaction: {
            type: 'Sale',
            price: '',
            advanceAmount: '',
            monthlyRent: '',
            contractDuration: '',
            bookingAmount: '',
            downPayment: '',
            monthlyInstallment: '',
            tenure: '',
            totalPayable: '',
            additionalInfo: '',
        },
        images: [],
        documents: [],
        contact: {
            name: '',
            email: '',
            number: '',
            whatsapp: '',
            cnic: '',
            city: '',
            area: '',
        },
    });

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

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

        setUploadingImages(true);
        setUploadError('');
        showToast(`Uploading ${files.length} image(s)...`, 'success');

        try {
            const uploadedUrls = [];

            for (const file of files) {
                const formData = new FormData();
                formData.append('image', file);

                const response = await fetch(`${ApiBaseUrl}/upload-image`, {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();

                if (response.ok && data.success && (data.url || data.imageUrl)) {
                    uploadedUrls.push(data.url || data.imageUrl);
                } else {
                    throw new Error(data.message || 'Upload failed');
                }
            }

            if (propertyType === 'Project') {
                setProjectData(prev => ({ 
                    ...prev, 
                    images: [...prev.images, ...uploadedUrls] 
                }));
            } else {
                setIndividualData(prev => ({ 
                    ...prev, 
                    images: [...prev.images, ...uploadedUrls] 
                }));
            }

            showToast(`✓ Successfully uploaded ${files.length} image(s)!`, 'success');

        } catch (err) {
            const errorMsg = err.message || 'Failed to upload images. Please try again.';
            setUploadError(errorMsg);
            showToast(errorMsg, 'error');
            e.target.value = null;
        } finally {
            setUploadingImages(false);
        }
    };

    const removeImage = (index) => {
        if (propertyType === 'Project') {
            setProjectData(prev => ({
                ...prev,
                images: prev.images.filter((_, i) => i !== index)
            }));
        } else {
            setIndividualData(prev => ({
                ...prev,
                images: prev.images.filter((_, i) => i !== index)
            }));
        }
    };

    // Handle document upload
    const handleDocumentUpload = async (e) => {
        e.preventDefault();
        
        if (!documentForm.title || !documentForm.type || !documentForm.file) {
            showToast('⚠️ Please fill in all document fields and select a file', 'error');
            return;
        }

        // Validate file size (5MB limit for documents)
        if (documentForm.file.size > 5 * 1024 * 1024) {
            showToast('⚠️ Document file size exceeds 5MB limit', 'error');
            return;
        }

        setUploadingDocument(true);
        setUploadError('');

        try {
            const formData = new FormData();
            formData.append('document', documentForm.file);

            const response = await fetch(`${ApiBaseUrl}/upload-document`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (response.ok && data.success && (data.url || data.documentUrl || data.fileUrl)) {
                const documentData = {
                    title: documentForm.title,
                    type: documentForm.type,
                    fileUrl: data.url || data.documentUrl || data.fileUrl
                };

                if (propertyType === 'Project') {
                    setProjectData(prev => ({
                        ...prev,
                        documents: [...prev.documents, documentData]
                    }));
                } else {
                    setIndividualData(prev => ({
                        ...prev,
                        documents: [...prev.documents, documentData]
                    }));
                }

                // Reset form
                setDocumentForm({ title: '', type: '', file: null });
                document.getElementById('documentFileInput').value = '';
                
                showToast('✓ Document uploaded successfully!', 'success');
            } else {
                throw new Error(data.message || 'Upload failed');
            }
        } catch (err) {
            const errorMsg = err.message || 'Failed to upload document. Please try again.';
            setUploadError(errorMsg);
            showToast(errorMsg, 'error');
        } finally {
            setUploadingDocument(false);
        }
    };

    // Remove document
    const removeDocument = (index) => {
        if (propertyType === 'Project') {
            setProjectData(prev => ({
                ...prev,
                documents: prev.documents.filter((_, i) => i !== index)
            }));
        } else {
            setIndividualData(prev => ({
                ...prev,
                documents: prev.documents.filter((_, i) => i !== index)
            }));
        }
        showToast('Document removed', 'success');
    };

    const fetchProperty = useCallback(async () => {
        setFetchingProperty(true);
        setError('');
        try {
            const authData = JSON.parse(localStorage.getItem('adminAuth'));
            const response = await fetch(`${ApiBaseUrl}/getProperty/${id}`, {
                    headers: {
                    'Authorization': `Bearer ${authData.token}`
                }
            });

            const data = await response.json();

            if (response.ok && data.success) {
                const property = data.data;
                setIsEditMode(true);
                
                // Determine property type and load data
                if (property.commonForm) {
                    // Project type
                    setPropertyType('Project');
                    setProjectData({
                        projectName: property.commonForm.projectName || '',
                        city: property.commonForm.city || '',
                        district: property.commonForm.district || '',
                        tehsil: property.commonForm.tehsil || '',
                        area: property.commonForm.area || '',
                        street: property.commonForm.street || '',
                        address: property.commonForm.address || '',
                        latitude: property.commonForm.latitude || '',
                        longitude: property.commonForm.longitude || '',
                        projectType: property.commonForm.projectType || 'Residential',
                        projectSubType: property.commonForm.projectSubType || '',
                        developmentType: property.commonForm.developmentType || '',
                        infrastructureStatus: property.commonForm.infrastructureStatus || '',
                        projectStage: property.commonForm.projectStage || '',
                        expectedCompletionDate: property.commonForm.expectedCompletionDate || '',
                        possessionDate: property.commonForm.possessionDate || '',
                        utilities: property.commonForm.utilities || {
                            electricity: false,
                            water: false,
                            gas: false,
                            internet: false,
                            sewage: false,
                            telephoneLine: false,
                        },
                        amenities: property.commonForm.amenities || projectData.amenities,
                        description: property.commonForm.description || '',
                        highlights: property.commonForm.highlights || ['', '', ''],
                        totalLandArea: property.commonForm.totalLandArea || '',
                        landAreaUnit: property.commonForm.landAreaUnit || 'sqft',
                        propertyTypesAvailable: property.commonForm.propertyTypesAvailable || [],
                        totalUnits: property.commonForm.totalUnits || '',
                        typicalUnitSizes: property.commonForm.typicalUnitSizes || '',
                        nearbyLandmarks: property.commonForm.nearbyLandmarks || '',
                        remarks: property.commonForm.remarks || '',
                        developerBuilder: property.commonForm.developerBuilder || '',
                        units: property.commonForm.units || [],
                        transaction: {
                            type: property.commonForm.transaction?.type || 'Sale',
                            price: property.commonForm.transaction?.price || '',
                            priceRange: property.commonForm.transaction?.priceRange || '',
                            advanceAmount: property.commonForm.transaction?.advanceAmount || '',
                            monthlyRent: property.commonForm.transaction?.monthlyRent || '',
                            contractDuration: property.commonForm.transaction?.contractDuration || '',
                            bookingAmount: property.commonForm.transaction?.bookingAmount || '',
                            downPayment: property.commonForm.transaction?.downPayment || '',
                            monthlyInstallment: property.commonForm.transaction?.monthlyInstallment || '',
                            tenure: property.commonForm.transaction?.tenure || '',
                            totalPayable: property.commonForm.transaction?.totalPayable || '',
                            interestRate: property.commonForm.transaction?.interestRate || '',
                            additionalCharges: property.commonForm.transaction?.additionalCharges || '',
                            discountsOffers: property.commonForm.transaction?.discountsOffers || '',
                            additionalInfo: property.commonForm.transaction?.additionalInfo || '',
                        },
                        images: property.commonForm.images || [],
                        video: property.commonForm.video || '',
                        documents: property.commonForm.documents || [],
                        contact: {
                            name: property.commonForm.contact?.name || '',
                            email: property.commonForm.contact?.email || '',
                            number: property.commonForm.contact?.number || '',
                            whatsapp: property.commonForm.contact?.whatsapp || '',
                            cnic: property.commonForm.contact?.cnic || '',
                            city: property.commonForm.contact?.city || '',
                            area: property.commonForm.contact?.area || '',
                            companyName: property.commonForm.contact?.companyName || '',
                            designation: property.commonForm.contact?.designation || '',
                        },
                        declarationAccepted: property.commonForm.declarationAccepted || false,
                    });
                } else if (property.individualProperty) {
                    // Individual property type
                    setPropertyType('Individual');
                    setIndividualData({
                        title: property.individualProperty.title || '',
                        description: property.individualProperty.description || '',
                        propertyType: property.individualProperty.propertyType || 'Apartment / Flat',
                        areaUnit: property.individualProperty.areaUnit || 'sq. ft',
                        areaSize: property.individualProperty.areaSize || '',
                        city: property.individualProperty.city || '',
                        location: property.individualProperty.location || '',
                        bedrooms: property.individualProperty.bedrooms || '',
                        bathrooms: property.individualProperty.bathrooms || '',
                        kitchenType: property.individualProperty.kitchenType || '',
                        furnishingStatus: property.individualProperty.furnishingStatus || '',
                        floor: property.individualProperty.floor || '',
                        totalFloors: property.individualProperty.totalFloors || '',
                        possessionStatus: property.individualProperty.possessionStatus || '',
                        zoningType: property.individualProperty.zoningType || 'Residential',
                        utilities: property.individualProperty.utilities || {
                            electricity: false,
                            water: false,
                            gas: false,
                            internet: false,
                        },
                        amenities: property.individualProperty.amenities || individualData.amenities,
                        nearbyLandmarks: property.individualProperty.nearbyLandmarks || '',
                        transaction: property.individualProperty.transaction || {
                            type: 'Sale',
                            price: '',
                            advanceAmount: '',
                            monthlyRent: '',
                            contractDuration: '',
                            bookingAmount: '',
                            downPayment: '',
                            monthlyInstallment: '',
                            tenure: '',
                            totalPayable: '',
                            additionalInfo: '',
                        },
                        images: property.individualProperty.images || [],
                        documents: property.individualProperty.documents || [],
                        contact: property.individualProperty.contact || {
                            name: '',
                            email: '',
                            number: '',
                            whatsapp: '',
                            cnic: '',
                            city: '',
                            area: '',
                        },
                    });
                }
            } else {
                setError(data.message || 'Failed to load property');
            }
        } catch (err) {
            const errorMsg = 'Network error. Failed to load property.';
            setError(errorMsg);
            showToast(errorMsg, 'error');
        } finally {
            setFetchingProperty(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    // Fetch property data for edit mode
    useEffect(() => {
        if (id) {
            fetchProperty();
        }
    }, [id, fetchProperty]);

    const handleProjectChange = (field, value, nested = null) => {
        if (nested) {
            setProjectData(prev => ({
                ...prev,
                [field]: {
                    ...prev[field],
                    [nested]: value
                }
            }));
        } else {
            setProjectData(prev => ({ ...prev, [field]: value }));
        }
    };

    const handleIndividualChange = (field, value, nested = null) => {
        if (nested) {
            setIndividualData(prev => ({
                ...prev,
                [field]: {
                    ...prev[field],
                    [nested]: value
                }
            }));
        } else {
            setIndividualData(prev => ({ ...prev, [field]: value }));
        }
    };

    const handleHighlightChange = (index, value) => {
        const newHighlights = [...projectData.highlights];
        newHighlights[index] = value;
        setProjectData(prev => ({ ...prev, highlights: newHighlights }));
    };

    // Handle adding a new unit
    const handleAddUnit = () => {
        const newUnit = {
            offeringType: '',
            numberOfUnits: '',
            unitSize: '',
            unitSizeUnit: 'sqft',
            transaction: {
                type: 'Sale',
                price: '',
                priceRange: '',
                advanceAmount: '',
                monthlyRent: '',
                contractDuration: '',
                bookingAmount: '',
                downPayment: '',
                monthlyInstallment: '',
                tenure: '',
                totalPayable: '',
                interestRate: '',
                additionalCharges: '',
                discountsOffers: '',
                additionalInfo: '',
            }
        };
        setProjectData(prev => ({
            ...prev,
            units: [...prev.units, newUnit]
        }));
    };

    // Handle removing a unit
    const handleRemoveUnit = (index) => {
        setProjectData(prev => ({
            ...prev,
            units: prev.units.filter((_, i) => i !== index)
        }));
    };

    // Handle unit field change
    const handleUnitChange = (index, field, value, nested = null) => {
        const newUnits = [...projectData.units];
        if (nested) {
            newUnits[index] = {
                ...newUnits[index],
                transaction: {
                    ...newUnits[index].transaction,
                    [nested]: value
                }
            };
        } else {
            newUnits[index] = {
                ...newUnits[index],
                [field]: value
            };
        }
        setProjectData(prev => ({ ...prev, units: newUnits }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const authData = JSON.parse(localStorage.getItem('adminAuth'));
            
             // Prepare the data object to match backend expectations
            const propertyData = {
                type: propertyType,
                project: propertyType === 'Project' ? projectData : undefined,
                individualProperty: propertyType === 'Individual' ? individualData : undefined,
            };

            // Wrap in 'data' property as backend expects req.body.data
            const payload = {
                data: propertyData
            };

            const url = id ? `${ApiBaseUrl}/updateProperty/${id}` : `${ApiBaseUrl}/createProperty`;
            const method = id ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authData.token}`
                },
                body: JSON.stringify(payload)
            });

            const responseData = await response.json();

            if (response.ok && responseData.success) {
                const successMsg = `✓ Property ${id ? 'updated' : 'created'} successfully!`;
                setSuccess(successMsg);
                showToast(successMsg, 'success');
                setTimeout(() => navigate('/property/all'), 2000);
            } else {
                const errorMsg = responseData.message || 'Failed to save property. Please try again.';
                setError(errorMsg);
                showToast(errorMsg, 'error');
            }
        } catch (err) {
            const errorMsg = err.message || 'Network error. Please try again.';
            setError(errorMsg);
            showToast(errorMsg, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleNextOrSubmit = () => {
        if (isLastStep) {
            handleSubmit();
        } else {
            handleNext();
        }
    };

    const currentImages = propertyType === 'Project' ? projectData.images : individualData.images;

    const steps = propertyType === 'Project' 
        ? [
            { step: 1, id: 'basic', label: 'Project Info', description: 'Location & Details' },
            { step: 2, id: 'overview', label: 'Overview', description: 'Description & Highlights' },
            { step: 3, id: 'units', label: 'Units & Pricing', description: 'Property Types & Rates' },
            { step: 4, id: 'amenities', label: 'Amenities', description: 'Facilities' },
            { step: 5, id: 'contact', label: 'Contact', description: 'Contact Information' },
        ]
        : [
            { step: 1, id: 'basic', label: 'Basic Info', description: 'Property Details' },
            { step: 2, id: 'details', label: 'Details', description: 'Rooms & Utilities' },
            { step: 3, id: 'amenities', label: 'Amenities', description: 'Facilities' },
            { step: 4, id: 'transaction', label: 'Transaction', description: 'Pricing Details' },
            { step: 5, id: 'contact', label: 'Contact', description: 'Contact Information' },
        ];

    const totalSteps = steps.length;
    const currentStepData = steps.find(s => s.step === currentStep);
    const activeTab = currentStepData?.id || 'basic';

    const handleNext = () => {
        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const isLastStep = currentStep === totalSteps;
    const isFirstStep = currentStep === 1;

    // Show loading when fetching property
    if (fetchingProperty) {
                return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
                <div className="max-w-7xl mx-auto px-3 xs:px-4 md:px-6 py-4 xs:py-6 md:py-8">
                    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
                        <div className="w-16 h-16 border-4 border-gray-100 border-t-red-600 rounded-full animate-spin"></div>
                        <div className="text-center">
                            <p className="text-lg font-black text-gray-900 uppercase tracking-wider">Loading Property Data</p>
                            <p className="text-sm text-gray-500 font-medium mt-2">Please wait...</p>
                        </div>
                    </div>
                        </div>
                    </div>
                );
    }

                return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
            <div className="max-w-7xl mx-auto px-3 xs:px-4 md:px-6 py-4 xs:py-6 md:py-8 space-y-4 xs:space-y-6 md:space-y-8 animate-in fade-in duration-700">
                {/* Header */}
                <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 xs:p-8 md:p-10 rounded-2xl xs:rounded-3xl shadow-2xl shadow-red-200/50 border border-red-500/20 relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
                        </div>
                    
                    <div className="relative flex flex-col xs:flex-row justify-between items-start xs:items-center gap-4 xs:gap-0">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 xs:w-12 xs:h-12 bg-white/20 backdrop-blur-sm rounded-xl xs:rounded-2xl flex items-center justify-center">
                                    <svg className="w-5 h-5 xs:w-6 xs:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                    </div>
                                <div>
                                    <h1 className="text-2xl xs:text-3xl md:text-4xl font-black text-white tracking-tighter">
                                        {id ? 'Edit' : 'Add New'} Property
                                    </h1>
                                    {isEditMode && (
                                        <p className="text-[10px] xs:text-xs font-bold text-white/70 uppercase tracking-wider mt-1">
                                            Type: {propertyType}
                                        </p>
                                    )}
                        </div>
                        </div>
                            <p className="text-[10px] xs:text-xs md:text-sm font-bold text-white/80 uppercase tracking-wider xs:tracking-widest ml-0 xs:ml-14">
                                Real Estate Management System
                            </p>
                    </div>
                        <div className="flex gap-2 xs:gap-3">
                            {id && (
                                <button
                                    onClick={() => navigate(`/property/view/${id}`)}
                                    className="tap-target group px-4 xs:px-5 py-2.5 xs:py-3 bg-white/10 backdrop-blur-sm text-white border-2 border-white/20 rounded-xl xs:rounded-2xl font-bold uppercase text-[9px] xs:text-[10px] tracking-widest hover:bg-white/20 hover:border-white/40 transition-all active:scale-95 flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    View
                                </button>
                            )}
                            <button
                                onClick={() => navigate('/property/all')}
                                className="tap-target group px-4 xs:px-5 py-2.5 xs:py-3 bg-white/10 backdrop-blur-sm text-white border-2 border-white/20 rounded-xl xs:rounded-2xl font-bold uppercase text-[9px] xs:text-[10px] tracking-widest hover:bg-white/20 hover:border-white/40 transition-all active:scale-95 flex items-center gap-2"
                            >
                                <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                                </svg>
                                Back to List
                            </button>
                        </div>
                        </div>
                    </div>

                {/* Messages */}
                {error && (
                    <div className="bg-gradient-to-r from-red-50 to-red-100/50 border-l-4 border-red-500 p-4 xs:p-5 rounded-2xl shadow-lg shadow-red-100 animate-in slide-in-from-top duration-300 backdrop-blur-sm">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-5 h-5 xs:w-6 xs:h-6 bg-red-500 rounded-full flex items-center justify-center">
                                <svg className="w-3 h-3 xs:w-4 xs:h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            <p className="text-xs xs:text-sm text-red-700 font-bold flex-1">{error}</p>
                        </div>
                    </div>
                )}
                {success && (
                    <div className="bg-gradient-to-r from-emerald-50 to-emerald-100/50 border-l-4 border-emerald-500 p-4 xs:p-5 rounded-2xl shadow-lg shadow-emerald-100 animate-in slide-in-from-top duration-300 backdrop-blur-sm">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-5 h-5 xs:w-6 xs:h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                                <svg className="w-3 h-3 xs:w-4 xs:h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <p className="text-xs xs:text-sm text-emerald-700 font-bold flex-1">{success}</p>
                        </div>
                    </div>
                )}

                {/* Property Type Selector */}
                {!id && (
                    <div className="bg-white p-5 xs:p-7 md:p-8 rounded-2xl xs:rounded-3xl shadow-xl border border-gray-100/50 backdrop-blur-sm">
                        <div className="flex items-center gap-3 mb-5 xs:mb-6">
                            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <div>
                                <label className="block text-xs xs:text-sm font-black text-gray-900 uppercase tracking-wider">
                                    Select Property Type *
                                </label>
                                <p className="text-[10px] xs:text-xs text-gray-500 font-medium mt-0.5">
                                    Choose between project or individual property
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 xs:gap-5">
                                        <button
                                type="button"
                                onClick={() => setPropertyType('Project')}
                                className={`tap-target group relative py-6 xs:py-8 px-5 xs:px-6 rounded-2xl font-bold uppercase text-xs xs:text-sm tracking-wider transition-all duration-300 ${
                                    propertyType === 'Project'
                                        ? 'bg-gradient-to-br from-red-600 to-red-700 text-white shadow-2xl shadow-red-200 scale-105'
                                        : 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-400 hover:from-gray-100 hover:to-gray-200 hover:scale-105 shadow-lg hover:shadow-xl'
                                }`}
                            >
                                {propertyType === 'Project' && (
                                    <div className="absolute top-3 right-3 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                )}
                                <div className="flex flex-col items-center gap-3 xs:gap-4">
                                    <div className={`w-14 h-14 xs:w-16 xs:h-16 rounded-2xl flex items-center justify-center transition-all ${
                                        propertyType === 'Project' 
                                            ? 'bg-white/20' 
                                            : 'bg-white group-hover:scale-110'
                                    }`}>
                                        <svg className={`w-7 h-7 xs:w-8 xs:h-8 ${propertyType === 'Project' ? 'text-white' : 'text-red-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="font-black text-sm xs:text-base mb-1">Project</div>
                                        <div className={`text-[10px] xs:text-xs font-medium ${propertyType === 'Project' ? 'text-white/80' : 'text-gray-500'}`}>
                                            Large Developments
                                        </div>
                                    </div>
                                </div>
                                        </button>
                            <button
                                type="button"
                                onClick={() => setPropertyType('Individual')}
                                className={`tap-target group relative py-6 xs:py-8 px-5 xs:px-6 rounded-2xl font-bold uppercase text-xs xs:text-sm tracking-wider transition-all duration-300 ${
                                    propertyType === 'Individual'
                                        ? 'bg-gradient-to-br from-red-600 to-red-700 text-white shadow-2xl shadow-red-200 scale-105'
                                        : 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-400 hover:from-gray-100 hover:to-gray-200 hover:scale-105 shadow-lg hover:shadow-xl'
                                }`}
                            >
                                {propertyType === 'Individual' && (
                                    <div className="absolute top-3 right-3 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                )}
                                <div className="flex flex-col items-center gap-3 xs:gap-4">
                                    <div className={`w-14 h-14 xs:w-16 xs:h-16 rounded-2xl flex items-center justify-center transition-all ${
                                        propertyType === 'Individual' 
                                            ? 'bg-white/20' 
                                            : 'bg-white group-hover:scale-110'
                                    }`}>
                                        <svg className={`w-7 h-7 xs:w-8 xs:h-8 ${propertyType === 'Individual' ? 'text-white' : 'text-red-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="font-black text-sm xs:text-base mb-1">Individual Property</div>
                                        <div className={`text-[10px] xs:text-xs font-medium ${propertyType === 'Individual' ? 'text-white/80' : 'text-gray-500'}`}>
                                            Single Units
                                        </div>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>
                )}

                {/* Step Progress Indicator */}
                <div className="bg-white p-5 xs:p-7 md:p-9 rounded-2xl xs:rounded-3xl shadow-xl border border-gray-100/50 backdrop-blur-sm relative overflow-hidden">
                    {/* Background Decoration */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-red-50 to-transparent rounded-full blur-3xl opacity-50 -mr-32 -mt-32"></div>
                    
                    <div className="relative">
                        <div className="flex items-center justify-between mb-5 xs:mb-6">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-6 h-6 xs:w-7 xs:h-7 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                                        <span className="text-[10px] xs:text-xs font-black text-white">{currentStep}</span>
                                    </div>
                                    <p className="text-[10px] xs:text-xs font-black text-gray-500 uppercase tracking-wider">
                                        Step {currentStep} of {totalSteps}
                                    </p>
                                </div>
                                <h3 className="text-lg xs:text-xl md:text-2xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent uppercase tracking-tight">
                                    {currentStepData?.label}
                                </h3>
                                <p className="text-xs xs:text-sm text-gray-600 font-semibold mt-1 flex items-center gap-2">
                                    <svg className="w-3 h-3 xs:w-4 xs:h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {currentStepData?.description}
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="relative">
                                    <svg className="w-16 h-16 xs:w-20 xs:h-20 md:w-24 md:h-24 transform -rotate-90">
                                        <circle
                                            cx="50%"
                                            cy="50%"
                                            r="35%"
                                            stroke="currentColor"
                                            strokeWidth="8"
                                            fill="none"
                                            className="text-gray-100"
                                        />
                                        <circle
                                            cx="50%"
                                            cy="50%"
                                            r="35%"
                                            stroke="currentColor"
                                            strokeWidth="8"
                                            fill="none"
                                            strokeDasharray="220"
                                            strokeDashoffset={220 - (220 * currentStep) / totalSteps}
                                            className="text-red-600 transition-all duration-500"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-base xs:text-lg md:text-xl font-black text-gray-900">
                                            {Math.round((currentStep / totalSteps) * 100)}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="relative h-3 bg-gradient-to-r from-gray-100 to-gray-50 rounded-full overflow-hidden shadow-inner mb-6 xs:mb-8">
                            <div 
                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-500 via-red-600 to-red-700 rounded-full transition-all duration-500 ease-out shadow-lg"
                                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                            >
                                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                            </div>
                        </div>

                        {/* Step Indicators */}
                        <div className="hidden sm:flex justify-between items-start gap-2">
                            {steps.map((step, index) => (
                                <div key={step.step} className="flex flex-col items-center flex-1 min-w-0">
                                    <div className={`relative w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center text-sm font-black transition-all duration-300 ${
                                        step.step < currentStep 
                                            ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-200' 
                                            : step.step === currentStep 
                                            ? 'bg-gradient-to-br from-red-600 to-red-700 text-white shadow-2xl shadow-red-200 scale-110 ring-4 ring-red-100' 
                                            : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-400'
                                    }`}>
                                        {step.step < currentStep ? (
                                            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        ) : (
                                            <span>{step.step}</span>
                                        )}
                                        {step.step === currentStep && (
                                            <div className="absolute -inset-1 bg-red-600/20 rounded-2xl animate-ping"></div>
                                        )}
                                    </div>
                                    {index < steps.length - 1 && (
                                        <div className={`absolute h-0.5 transition-all duration-300 ${
                                            step.step < currentStep ? 'bg-emerald-500' : 'bg-gray-200'
                                        }`} style={{ 
                                            width: `calc(${100 / totalSteps}% - 2.5rem)`,
                                            left: `calc(${(100 / totalSteps) * (index + 0.5)}% + 1.25rem)`,
                                            top: '1.25rem'
                                        }}></div>
                                    )}
                                    <p className={`text-[8px] md:text-[9px] font-black uppercase tracking-wider mt-2 text-center transition-colors truncate w-full ${
                                        step.step === currentStep ? 'text-red-600' : step.step < currentStep ? 'text-emerald-600' : 'text-gray-400'
                                    }`}>
                                        {step.label}
                                    </p>
                                    </div>
                                ))}
                                    </div>
                    </div>
                </div>

                {/* Form */}
                <div className="bg-white p-5 xs:p-7 md:p-9 rounded-2xl xs:rounded-3xl shadow-xl border border-gray-100/50 backdrop-blur-sm">
                
                {/* PROJECT FORM */}
                {propertyType === 'Project' && (
                    <>
                        {/* Basic/Project Info Tab */}
                        {activeTab === 'basic' && (
                            <div className="space-y-4 xs:space-y-6">
                                <h3 className="text-base xs:text-lg font-black text-gray-900 uppercase tracking-tighter pb-3 xs:pb-4 border-b border-gray-100">
                                    Project Information
                                </h3>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 xs:gap-6">
                                    <div className="sm:col-span-2">
                                        <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">
                                            Project Name *
                                </label>
                                        <input
                                            type="text"
                                            value={projectData.projectName}
                                            onChange={(e) => handleProjectChange('projectName', e.target.value)}
                                            required
                                            className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                                        />
                            </div>

                                    <div>
                                        <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">
                                            City *
                                        </label>
                                        <select
                                            value={projectData.city}
                                            onChange={(e) => handleProjectChange('city', e.target.value)}
                                            required
                                            className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                                        >
                                            <option value="">Select City</option>
                                            {cities.map((city) => (
                                                <option key={city.value} value={city.value}>
                                                    {city.title}
                                                </option>
                                            ))}
                                        </select>
                        </div>

                                    <div>
                                        <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">
                                            District
                                        </label>
                                        <input
                                            type="text"
                                            value={projectData.district}
                                            onChange={(e) => handleProjectChange('district', e.target.value)}
                                            className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                                        />
                    </div>

                                    <div>
                                        <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">
                                            Tehsil / Town
                                        </label>
                                        <input
                                            type="text"
                                            value={projectData.tehsil}
                                            onChange={(e) => handleProjectChange('tehsil', e.target.value)}
                                            className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                                        />
                        </div>

                                    <div>
                                        <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">
                                            Area / Neighborhood / Sector
                                        </label>
                                        <input
                                            type="text"
                                            value={projectData.area}
                                            onChange={(e) => handleProjectChange('area', e.target.value)}
                                            className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                                        />
                    </div>

                                    <div>
                                        <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">
                                            Street / Block / Locality
                                        </label>
                                        <input
                                            type="text"
                                            value={projectData.street}
                                            onChange={(e) => handleProjectChange('street', e.target.value)}
                                            className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                                        />
        </div>

                                    <div className="sm:col-span-2">
                                        <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">
                                            Full Address
                                        </label>
                                        <input
                                            type="text"
                                            value={projectData.address}
                                            onChange={(e) => handleProjectChange('address', e.target.value)}
                                            placeholder="Complete address"
                                            className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                                        />
        </div>

                <div>
                                        <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">
                                            Latitude (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            value={projectData.latitude}
                                            onChange={(e) => handleProjectChange('latitude', e.target.value)}
                                            placeholder="e.g., 24.8607"
                                            className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">
                                            Longitude (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            value={projectData.longitude}
                                            onChange={(e) => handleProjectChange('longitude', e.target.value)}
                                            placeholder="e.g., 67.0011"
                                            className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                                        />
                </div>

                                    <div>
                                        <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">
                                            Project Type *
                                        </label>
                                        <select
                                            value={projectData.projectType}
                                            onChange={(e) => handleProjectChange('projectType', e.target.value)}
                                            required
                                            className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                                        >
                                            <option value="Residential">Residential</option>
                                            <option value="Commercial">Commercial</option>
                                            <option value="Industrial">Industrial</option>
                                            <option value="Retail">Retail</option>
                                            <option value="Mixed-Use">Mixed-Use</option>
                                            <option value="Hospitality">Hospitality</option>
                                            <option value="Healthcare">Healthcare</option>
                                            <option value="Educational">Educational</option>
                                            <option value="Special Purpose">Special Purpose</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">
                                            Project Sub-Type
                                        </label>
                                        <input
                                            type="text"
                                            value={projectData.projectSubType}
                                            onChange={(e) => handleProjectChange('projectSubType', e.target.value)}
                                            placeholder="e.g., Luxury Apartments, Gated Community"
                                            className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">
                                            Type of Development
                                        </label>
                                        <input
                                            type="text"
                                            value={projectData.developmentType}
                                            onChange={(e) => handleProjectChange('developmentType', e.target.value)}
                                            placeholder="e.g., Gated Community, Mixed Use"
                                            className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">
                                            Infrastructure Status
                                        </label>
                                        <select
                                            value={projectData.infrastructureStatus}
                                            onChange={(e) => handleProjectChange('infrastructureStatus', e.target.value)}
                                            className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                                        >
                                            <option value="">Select Status</option>
                                            <option value="Developed">Developed</option>
                                            <option value="Under Development">Under Development</option>
                                            <option value="New Project">New Project</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">
                                            Project Stage
                                        </label>
                                        <select
                                            value={projectData.projectStage}
                                            onChange={(e) => handleProjectChange('projectStage', e.target.value)}
                                            className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                                        >
                                            <option value="">Select Stage</option>
                                            <option value="Planning Stage">Planning Stage</option>
                                            <option value="Pre-Launch">Pre-Launch</option>
                                            <option value="Launch Stage">Launch Stage</option>
                                            <option value="Construction Stage">Construction Stage</option>
                                            <option value="Near Completion">Near Completion</option>
                                            <option value="Completed">Completed</option>
                                            <option value="Handover / Operational">Handover / Operational</option>
                                            <option value="On Hold / Delayed">On Hold / Delayed</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">
                                            Expected Completion Date
                                        </label>
                                        <input
                                            type="text"
                                            value={projectData.expectedCompletionDate}
                                            onChange={(e) => handleProjectChange('expectedCompletionDate', e.target.value)}
                                            placeholder="e.g., Dec 2025"
                                            className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">
                                            Possession Date
                                        </label>
                                        <input
                                            type="text"
                                            value={projectData.possessionDate}
                                            onChange={(e) => handleProjectChange('possessionDate', e.target.value)}
                                            placeholder="e.g., Mar 2026"
                                            className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Utilities Checkboxes */}
                                <div>
                                    <label className="block text-[9px] xs:text-[10px] font-black text-gray-900 uppercase tracking-wider xs:tracking-widest mb-3">
                                        Utility Connections Provided
                                    </label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                                        {['electricity', 'water', 'gas', 'internet', 'sewage', 'telephoneLine'].map(utility => (
                                            <label key={utility} className="flex items-center gap-2 cursor-pointer group">
                                                <input
                                                    type="checkbox"
                                                    checked={projectData.utilities[utility]}
                                                    onChange={(e) => handleProjectChange('utilities', e.target.checked, utility)}
                                                    className="w-4 h-4 text-red-600 bg-white border-gray-300 rounded focus:ring-red-500"
                                                />
                                                <span className="text-xs font-bold text-gray-600 group-hover:text-gray-900 capitalize">
                                                    {utility === 'telephoneLine' ? 'Telephone Line' : utility}
                                                </span>
                                            </label>
                    ))}
                </div>
            </div>

                                {/* Video URL */}
                                <div>
                                    <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">
                                        Video URL (YouTube, Vimeo, etc.)
                                    </label>
                                    <input
                                        type="url"
                                        value={projectData.video}
                                        onChange={(e) => handleProjectChange('video', e.target.value)}
                                        placeholder="https://youtube.com/watch?v=..."
                                        className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                                    />
            </div>

                                {/* Images */}
                                <div>
                                    <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">
                                        Project Images
                                    </label>
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
                                    
                                    {currentImages.length > 0 && (
                                        <div className="mt-3 flex flex-wrap gap-2 xs:gap-3">
                                            {currentImages.map((img, idx) => (
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
                                </div>
                            </div>
                        )}

                        {/* Overview Tab */}
                        {activeTab === 'overview' && (
                            <div className="space-y-4 xs:space-y-6">
                                <h3 className="text-base xs:text-lg font-black text-gray-900 uppercase tracking-tighter pb-3 xs:pb-4 border-b border-gray-100">
                                    Project Overview
                                </h3>
                                
                                <div>
                                    <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">
                                        Brief Description *
                                    </label>
                                    <div className="bg-gray-50 rounded-lg xs:rounded-xl border-2 border-transparent focus-within:border-red-600 transition-all overflow-hidden">
                                        <RichTextEditor
                                        value={projectData.description}
                                            onChange={(value) => handleProjectChange('description', value)}
                                            placeholder="Enter detailed project description..."
                                    />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">
                                        Key Features / Highlights
                                    </label>
                                    {[0, 1, 2].map(i => (
                                        <input
                                            key={i}
                                            type="text"
                                            value={projectData.highlights[i]}
                                            onChange={(e) => handleHighlightChange(i, e.target.value)}
                                            placeholder={`Feature ${i + 1}`}
                                            className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none mb-2"
                                        />
                                    ))}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 xs:gap-6">
                                <div>
                                    <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">
                                        Total Land / Built-up Area
                                    </label>
                                    <input
                                        type="text"
                                        value={projectData.totalLandArea}
                                        onChange={(e) => handleProjectChange('totalLandArea', e.target.value)}
                                            placeholder="e.g., 50, 100"
                                        className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">
                                            Land Area Unit
                                    </label>
                                        <select
                                            value={projectData.landAreaUnit}
                                            onChange={(e) => handleProjectChange('landAreaUnit', e.target.value)}
                                            className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                                        >
                                            <option value="sqft">Square Feet (sqft)</option>
                                            <option value="sqm">Square Meters (sqm)</option>
                                            <option value="sqyd">Square Yards (sqyd)</option>
                                            <option value="marla">Marla</option>
                                            <option value="kanal">Kanal</option>
                                            <option value="acre">Acre</option>
                                            <option value="hectare">Hectare</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">
                                        Developer / Builder Name
                                    </label>
                                    <input
                                        type="text"
                                        value={projectData.developerBuilder}
                                        onChange={(e) => handleProjectChange('developerBuilder', e.target.value)}
                                        placeholder="Name of developer or builder"
                                        className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">
                                        Nearby Landmarks
                                    </label>
                                    <textarea
                                        value={projectData.nearbyLandmarks}
                                        onChange={(e) => handleProjectChange('nearbyLandmarks', e.target.value)}
                                        rows="3"
                                        className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none resize-none"
                                    />
                                </div>

                                {/* Project Documents */}
                                <div className="pt-6 border-t-2 border-gray-200">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
                                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                <div>
                                            <h4 className="text-sm font-black text-gray-900 uppercase tracking-wider">
                                                Project Documents
                                            </h4>
                                            <p className="text-[10px] text-gray-500 font-medium">
                                                Upload brochures, plans, NOCs, etc.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Document Upload Form */}
                                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-gray-200 p-5 mb-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                                                    Document Title *
                                    </label>
                                                <input
                                                    type="text"
                                                    value={documentForm.title}
                                                    onChange={(e) => setDocumentForm(prev => ({ ...prev, title: e.target.value }))}
                                                    placeholder="e.g., Project Brochure 2024"
                                                    className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-white border-2 border-gray-200 focus:border-indigo-600 rounded-lg text-xs font-bold transition-all outline-none"
                                    />
                                </div>
                                            <div>
                                                <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                                                    Document Type *
                                                </label>
                                                <select
                                                    value={documentForm.type}
                                                    onChange={(e) => setDocumentForm(prev => ({ ...prev, type: e.target.value }))}
                                                    className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-white border-2 border-gray-200 focus:border-indigo-600 rounded-lg text-xs font-bold transition-all outline-none"
                                                >
                                                    <option value="">Select Type</option>
                                                    <option value="Brochures / Project Booklets">Brochures / Project Booklets</option>
                                                    <option value="Pricing & Availability List">Pricing & Availability List</option>
                                                    <option value="No Objection Certificates (NOCs)">No Objection Certificates (NOCs)</option>
                                                    <option value="Development / Building Plan Approval">Development / Building Plan Approval</option>
                                                    <option value="Installment Plan / Payment Schedule">Installment Plan / Payment Schedule</option>
                                                    <option value="Master Layout Plan">Master Layout Plan</option>
                                                    <option value="Floor Plans / Unit Plans">Floor Plans / Unit Plans</option>
                                                    <option value="Agreement Drafts (Sample Sale or Booking)">Agreement Drafts (Sample Sale or Booking)</option>
                                                    <option value="Terms & Conditions for Booking / Sale">Terms & Conditions for Booking / Sale</option>
                                                    <option value="Other">Other</option>
                                                </select>
                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="flex-1">
                                                <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                                                    Select File * (PDF, DOC, DOCX - Max 5MB)
                                                </label>
                                                <input
                                                    id="documentFileInput"
                                                    type="file"
                                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                                    onChange={(e) => setDocumentForm(prev => ({ ...prev, file: e.target.files[0] }))}
                                                    disabled={uploadingDocument}
                                                    className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-white border-2 border-dashed border-gray-300 focus:border-indigo-600 rounded-lg text-xs font-bold transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                                                />
                                            </div>
                                            <div className="flex items-end">
                                                <button
                                                    type="button"
                                                    onClick={handleDocumentUpload}
                                                    disabled={uploadingDocument || !documentForm.title || !documentForm.type || !documentForm.file}
                                                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:from-indigo-700 hover:to-indigo-800 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200 flex items-center gap-2 whitespace-nowrap"
                                                >
                                                    {uploadingDocument ? (
                                                        <>
                                                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                            </svg>
                                                            Uploading...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                            </svg>
                                                            Upload
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Uploaded Documents List */}
                                    {projectData.documents.length > 0 && (
                                        <div className="space-y-2">
                                            <p className="text-xs font-black text-gray-700 uppercase tracking-wider mb-3">
                                                Uploaded Documents ({projectData.documents.length})
                                            </p>
                                            {projectData.documents.map((doc, idx) => (
                                                <div key={idx} className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-indigo-300 transition-all group">
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                            <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                            </svg>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h5 className="text-sm font-black text-gray-900 truncate">{doc.title}</h5>
                                                            <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mt-1">
                                                                {doc.type}
                                                            </p>
                                                            <a 
                                                                href={doc.fileUrl} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer"
                                                                className="text-[10px] text-gray-500 hover:text-indigo-600 font-medium truncate block mt-1"
                                                            >
                                                                View Document →
                                                            </a>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeDocument(idx)}
                                                            className="w-8 h-8 bg-red-100 hover:bg-red-600 text-red-600 hover:text-white rounded-lg flex items-center justify-center transition-all active:scale-95 flex-shrink-0"
                                                            title="Remove Document"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {projectData.documents.length === 0 && (
                                        <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                                                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </div>
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                No Documents Uploaded Yet
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Units Tab */}
                        {activeTab === 'units' && (
                            <div className="space-y-4 xs:space-y-6">
                                <div className="flex items-center justify-between pb-3 xs:pb-4 border-b border-gray-100">
                                    <h3 className="text-base xs:text-lg font-black text-gray-900 uppercase tracking-tighter">
                                        Units / Property Types & Pricing
                                </h3>
                                    <button
                                        type="button"
                                        onClick={handleAddUnit}
                                        className="tap-target flex items-center gap-2 px-4 xs:px-5 py-2 xs:py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl font-bold text-[10px] xs:text-xs uppercase tracking-wider hover:from-emerald-700 hover:to-emerald-800 transition-all active:scale-95 shadow-lg shadow-emerald-200"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Add Unit
                                    </button>
                                </div>

                                {/* Units List */}
                                {projectData.units.length === 0 ? (
                                    <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                        </div>
                                        <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">No Units Added Yet</p>
                                        <p className="text-xs text-gray-400 mt-2">Click "Add Unit" to add property units with pricing</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {projectData.units.map((unit, index) => (
                                            <div key={index} className="relative bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-gray-200 p-5 xs:p-6 shadow-md hover:shadow-lg transition-all">
                                                {/* Remove Button */}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveUnit(index)}
                                                    className="absolute top-4 right-4 w-8 h-8 bg-red-100 hover:bg-red-600 text-red-600 hover:text-white rounded-lg flex items-center justify-center transition-all active:scale-95 group"
                                                    title="Remove Unit"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>

                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-2 mb-4">
                                                        <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                                                            <span className="text-sm font-black text-white">{index + 1}</span>
                                                        </div>
                                                        <h4 className="text-sm font-black text-gray-900 uppercase tracking-wider">Unit #{index + 1}</h4>
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                                            <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                                                                Offering Type *
                                    </label>
                                                            <select
                                                                value={unit.offeringType}
                                                                onChange={(e) => handleUnitChange(index, 'offeringType', e.target.value)}
                                                                className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-white border-2 border-gray-200 focus:border-red-600 rounded-lg text-xs font-bold transition-all outline-none"
                                                            >
                                                                <option value="">Select Type</option>
                                                                <option value="Apartment / Flat">Apartment / Flat</option>
                                                                <option value="Villa / House">Villa / House</option>
                                                                <option value="Penthouse">Penthouse</option>
                                                                <option value="Studio Apartment">Studio Apartment</option>
                                                                <option value="Duplex / Triplex">Duplex / Triplex</option>
                                                                <option value="Townhouse / Row House">Townhouse / Row House</option>
                                                                <option value="Serviced Apartment">Serviced Apartment</option>
                                                                <option value="Residential Plot / Land">Residential Plot / Land</option>
                                                                <option value="Commercial Plot / Land">Commercial Plot / Land</option>
                                                                <option value="Office / Office Space">Office / Office Space</option>
                                                                <option value="Retail / Shop / Showroom">Retail / Shop / Showroom</option>
                                                                <option value="Warehouse / Industrial Unit">Warehouse / Industrial Unit</option>
                                                            </select>
                                </div>

                                    <div>
                                                            <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                                                                Number of Units
                                        </label>
                                        <input
                                            type="number"
                                                                value={unit.numberOfUnits}
                                                                onChange={(e) => handleUnitChange(index, 'numberOfUnits', e.target.value)}
                                                                placeholder="e.g., 50"
                                                                className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-white border-2 border-gray-200 focus:border-red-600 rounded-lg text-xs font-bold transition-all outline-none"
                                        />
                                    </div>

                                    <div>
                                                            <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                                                                Unit Size
                                        </label>
                                        <input
                                            type="text"
                                                                value={unit.unitSize}
                                                                onChange={(e) => handleUnitChange(index, 'unitSize', e.target.value)}
                                                                placeholder="e.g., 1200"
                                                                className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-white border-2 border-gray-200 focus:border-red-600 rounded-lg text-xs font-bold transition-all outline-none"
                                        />
                                    </div>

                                                        <div>
                                                            <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                                                                Unit Size Unit
                                        </label>
                                                            <select
                                                                value={unit.unitSizeUnit}
                                                                onChange={(e) => handleUnitChange(index, 'unitSizeUnit', e.target.value)}
                                                                className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-white border-2 border-gray-200 focus:border-red-600 rounded-lg text-xs font-bold transition-all outline-none"
                                                            >
                                                                <option value="sqft">Square Feet (sqft)</option>
                                                                <option value="sqm">Square Meters (sqm)</option>
                                                                <option value="sqyd">Square Yards (sqyd)</option>
                                                                <option value="marla">Marla</option>
                                                                <option value="kanal">Kanal</option>
                                                            </select>
                                </div>
                            </div>

                                                    {/* Transaction Details */}
                                                    <div className="mt-6 pt-6 border-t-2 border-gray-100">
                                                        <h5 className="text-xs font-black text-red-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            Pricing Details
                                                        </h5>
                                                        
                                                        <div className="space-y-4">
                                <div>
                                                                <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                                                                    Transaction Type
                                    </label>
                                    <select
                                                                    value={unit.transaction.type}
                                                                    onChange={(e) => handleUnitChange(index, 'transaction', e.target.value, 'type')}
                                                                    className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-white border-2 border-gray-200 focus:border-red-600 rounded-lg text-xs font-bold transition-all outline-none"
                                    >
                                        <option value="Sale">For Sale</option>
                                        <option value="Rent">For Rent</option>
                                        <option value="Installment">For Installment</option>
                                    </select>
                                </div>

                                                            {unit.transaction.type === 'Sale' && (
                                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                                                        <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                                                                            Price (PKR) *
                                        </label>
                                        <input
                                            type="number"
                                                                            value={unit.transaction.price}
                                                                            onChange={(e) => handleUnitChange(index, 'transaction', e.target.value, 'price')}
                                                                            placeholder="e.g., 15000000"
                                                                            className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-white border-2 border-gray-200 focus:border-red-600 rounded-lg text-xs font-bold transition-all outline-none"
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                                                                            Price Range
                                                                        </label>
                                                                        <input
                                                                            type="text"
                                                                            value={unit.transaction.priceRange}
                                                                            onChange={(e) => handleUnitChange(index, 'transaction', e.target.value, 'priceRange')}
                                                                            placeholder="e.g., 1.5 Cr - 2 Cr"
                                                                            className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-white border-2 border-gray-200 focus:border-red-600 rounded-lg text-xs font-bold transition-all outline-none"
                                                                        />
                                                                    </div>
                                    </div>
                                )}

                                                            {unit.transaction.type === 'Rent' && (
                                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div>
                                                                        <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                                                Advance Amount
                                            </label>
                                            <input
                                                type="number"
                                                                            value={unit.transaction.advanceAmount}
                                                                            onChange={(e) => handleUnitChange(index, 'transaction', e.target.value, 'advanceAmount')}
                                                                            className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-white border-2 border-gray-200 focus:border-red-600 rounded-lg text-xs font-bold transition-all outline-none"
                                            />
                                        </div>
                                        <div>
                                                                        <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                                                Monthly Rent
                                            </label>
                                            <input
                                                type="number"
                                                                            value={unit.transaction.monthlyRent}
                                                                            onChange={(e) => handleUnitChange(index, 'transaction', e.target.value, 'monthlyRent')}
                                                                            className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-white border-2 border-gray-200 focus:border-red-600 rounded-lg text-xs font-bold transition-all outline-none"
                                            />
                                        </div>
                                        <div>
                                                                        <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                                                Contract Duration
                                            </label>
                                            <input
                                                type="text"
                                                                            value={unit.transaction.contractDuration}
                                                                            onChange={(e) => handleUnitChange(index, 'transaction', e.target.value, 'contractDuration')}
                                                placeholder="e.g., 1 year"
                                                                            className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-white border-2 border-gray-200 focus:border-red-600 rounded-lg text-xs font-bold transition-all outline-none"
                                            />
                                        </div>
                                    </div>
                                )}

                                                            {unit.transaction.type === 'Installment' && (
                                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                                        <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                                                    Booking Amount
                                                </label>
                                                <input
                                                    type="number"
                                                                            value={unit.transaction.bookingAmount}
                                                                            onChange={(e) => handleUnitChange(index, 'transaction', e.target.value, 'bookingAmount')}
                                                                            className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-white border-2 border-gray-200 focus:border-red-600 rounded-lg text-xs font-bold transition-all outline-none"
                                                />
                                            </div>
                                            <div>
                                                                        <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                                                    Down Payment
                                                </label>
                                                <input
                                                    type="number"
                                                                            value={unit.transaction.downPayment}
                                                                            onChange={(e) => handleUnitChange(index, 'transaction', e.target.value, 'downPayment')}
                                                                            className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-white border-2 border-gray-200 focus:border-red-600 rounded-lg text-xs font-bold transition-all outline-none"
                                                />
                                            </div>
                                            <div>
                                                                        <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                                                    Monthly Installment
                                                </label>
                                                <input
                                                    type="number"
                                                                            value={unit.transaction.monthlyInstallment}
                                                                            onChange={(e) => handleUnitChange(index, 'transaction', e.target.value, 'monthlyInstallment')}
                                                                            className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-white border-2 border-gray-200 focus:border-red-600 rounded-lg text-xs font-bold transition-all outline-none"
                                                />
                                            </div>
                                            <div>
                                                                        <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                                                    Tenure
                                                </label>
                                                <input
                                                    type="text"
                                                                            value={unit.transaction.tenure}
                                                                            onChange={(e) => handleUnitChange(index, 'transaction', e.target.value, 'tenure')}
                                                    placeholder="e.g., 3 years"
                                                                            className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-white border-2 border-gray-200 focus:border-red-600 rounded-lg text-xs font-bold transition-all outline-none"
                                                />
                                            </div>
                                                                    <div className="sm:col-span-2">
                                                                        <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                                                                            Total Payable
                                                                        </label>
                                                                        <input
                                                                            type="number"
                                                                            value={unit.transaction.totalPayable}
                                                                            onChange={(e) => handleUnitChange(index, 'transaction', e.target.value, 'totalPayable')}
                                                                            className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-white border-2 border-gray-200 focus:border-red-600 rounded-lg text-xs font-bold transition-all outline-none"
                                                                        />
                                        </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* General Info */}
                                <div className="mt-8 pt-6 border-t-2 border-gray-200">
                                    <h4 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-4">
                                        General Information
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                                                Total Approx. Units
                                            </label>
                                            <input
                                                type="number"
                                            value={projectData.totalUnits}
                                            onChange={(e) => handleProjectChange('totalUnits', e.target.value)}
                                                placeholder="e.g., 200"
                                                className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg text-xs font-bold transition-all outline-none"
                                        />
                                    </div>
                                    <div>
                                            <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                                            Typical Unit Sizes
                                        </label>
                                        <input
                                            type="text"
                                            value={projectData.typicalUnitSizes}
                                            onChange={(e) => handleProjectChange('typicalUnitSizes', e.target.value)}
                                            placeholder="e.g., 1200-2000 sq. ft"
                                                className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg text-xs font-bold transition-all outline-none"
                                        />
                                        </div>
                                    </div>
                                        </div>
                                    </div>
                                )}

                        {/* Amenities Tab for Project */}
                        {activeTab === 'amenities' && (
                            <div className="space-y-5 xs:space-y-6">
                                <h3 className="text-base xs:text-lg font-black text-gray-900 uppercase tracking-tighter pb-3 xs:pb-4 border-b border-gray-100">
                                    Amenities & Facilities
                                </h3>
                                
                                {/* Security & Safety */}
                                <div className="bg-gradient-to-br from-red-50 to-white rounded-2xl border-2 border-red-100 p-5">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
                                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        </div>
                                        <h4 className="text-sm font-black text-red-600 uppercase tracking-wider">Security & Safety</h4>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {[
                                            { key: 'security', label: 'Security / Gated Entry' },
                                            { key: 'cctv', label: 'CCTV Surveillance / 24/7 Monitoring' },
                                            { key: 'fireSafety', label: 'Fire Safety Systems / Fire Alarms' }
                                        ].map(amenity => (
                                            <label key={amenity.key} className="flex items-start gap-2 cursor-pointer group p-3 bg-white rounded-lg hover:bg-red-50 transition-colors border border-transparent hover:border-red-200">
                                            <input
                                                type="checkbox"
                                                    checked={projectData.amenities[amenity.key]}
                                                    onChange={(e) => handleProjectChange('amenities', e.target.checked, amenity.key)}
                                                    className="w-4 h-4 mt-0.5 text-red-600 bg-white border-gray-300 rounded focus:ring-red-500"
                                                />
                                                <span className="text-xs font-bold text-gray-700 group-hover:text-red-600 transition-colors">
                                                    {amenity.label}
                                            </span>
                                    </label>
                                    ))}
                                    </div>
                                </div>

                                {/* Outdoor & Recreational */}
                                <div className="bg-gradient-to-br from-green-50 to-white rounded-2xl border-2 border-green-100 p-5">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
                                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <h4 className="text-sm font-black text-green-600 uppercase tracking-wider">Outdoor & Recreational</h4>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {[
                                            { key: 'parks', label: 'Parks / Green Spaces' },
                                            { key: 'playground', label: 'Playground / Children\'s Play Area' },
                                            { key: 'garden', label: 'Garden / Lawn' },
                                            { key: 'swimmingPool', label: 'Swimming Pool' },
                                            { key: 'joggingTrack', label: 'Jogging Track' },
                                            { key: 'sportsCourts', label: 'Outdoor Sports Fields / Courts (Football, Cricket, etc.)' },
                                            { key: 'waterFeatures', label: 'Water Features / Fountains / Artificial Lakes' },
                                            { key: 'petPark', label: 'Pet Park / Pet-Friendly Zones' }
                                        ].map(amenity => (
                                            <label key={amenity.key} className="flex items-start gap-2 cursor-pointer group p-3 bg-white rounded-lg hover:bg-green-50 transition-colors border border-transparent hover:border-green-200">
                                                <input
                                                    type="checkbox"
                                                    checked={projectData.amenities[amenity.key]}
                                                    onChange={(e) => handleProjectChange('amenities', e.target.checked, amenity.key)}
                                                    className="w-4 h-4 mt-0.5 text-green-600 bg-white border-gray-300 rounded focus:ring-green-500"
                                                />
                                                <span className="text-xs font-bold text-gray-700 group-hover:text-green-600 transition-colors">
                                                    {amenity.label}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Community & Social Spaces */}
                                <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl border-2 border-blue-100 p-5">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                        </div>
                                        <h4 className="text-sm font-black text-blue-600 uppercase tracking-wider">Community & Social Spaces</h4>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {[
                                            { key: 'clubhouse', label: 'Clubhouse / Community / Multipurpose Hall' },
                                            { key: 'communityCenter', label: 'Club / Lounge for Residents' },
                                            { key: 'lounge', label: 'Community Library / Reading Room' }
                                        ].map(amenity => (
                                            <label key={amenity.key} className="flex items-start gap-2 cursor-pointer group p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-200">
                                                <input
                                                    type="checkbox"
                                                    checked={projectData.amenities[amenity.key]}
                                                    onChange={(e) => handleProjectChange('amenities', e.target.checked, amenity.key)}
                                                    className="w-4 h-4 mt-0.5 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500"
                                                />
                                                <span className="text-xs font-bold text-gray-700 group-hover:text-blue-600 transition-colors">
                                                    {amenity.label}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Fitness & Sports */}
                                <div className="bg-gradient-to-br from-orange-50 to-white rounded-2xl border-2 border-orange-100 p-5">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center">
                                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                                            </svg>
                                        </div>
                                        <h4 className="text-sm font-black text-orange-600 uppercase tracking-wider">Fitness & Sports</h4>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {[
                                            { key: 'gym', label: 'Gym / Fitness Center / Facilities' },
                                            { key: 'steamRoom', label: 'Steam Room / Sauna / Spa' }
                                        ].map(amenity => (
                                            <label key={amenity.key} className="flex items-start gap-2 cursor-pointer group p-3 bg-white rounded-lg hover:bg-orange-50 transition-colors border border-transparent hover:border-orange-200">
                                                <input
                                                    type="checkbox"
                                                    checked={projectData.amenities[amenity.key]}
                                                    onChange={(e) => handleProjectChange('amenities', e.target.checked, amenity.key)}
                                                    className="w-4 h-4 mt-0.5 text-orange-600 bg-white border-gray-300 rounded focus:ring-orange-500"
                                                />
                                                <span className="text-xs font-bold text-gray-700 group-hover:text-orange-600 transition-colors">
                                                    {amenity.label}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Religious & Cultural */}
                                <div className="bg-gradient-to-br from-purple-50 to-white rounded-2xl border-2 border-purple-100 p-5">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
                                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                        </div>
                                        <h4 className="text-sm font-black text-purple-600 uppercase tracking-wider">Religious & Cultural</h4>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {[
                                            { key: 'mosque', label: 'Mosque / Prayer Area' }
                                        ].map(amenity => (
                                            <label key={amenity.key} className="flex items-start gap-2 cursor-pointer group p-3 bg-white rounded-lg hover:bg-purple-50 transition-colors border border-transparent hover:border-purple-200">
                                                <input
                                                    type="checkbox"
                                                    checked={projectData.amenities[amenity.key]}
                                                    onChange={(e) => handleProjectChange('amenities', e.target.checked, amenity.key)}
                                                    className="w-4 h-4 mt-0.5 text-purple-600 bg-white border-gray-300 rounded focus:ring-purple-500"
                                                />
                                                <span className="text-xs font-bold text-gray-700 group-hover:text-purple-600 transition-colors">
                                                    {amenity.label}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Educational & Medical */}
                                <div className="bg-gradient-to-br from-teal-50 to-white rounded-2xl border-2 border-teal-100 p-5">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center">
                                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                            </svg>
                                        </div>
                                        <h4 className="text-sm font-black text-teal-600 uppercase tracking-wider">Educational & Medical</h4>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {[
                                            { key: 'school', label: 'Schools' },
                                            { key: 'medicalFacility', label: 'Medical Facilities / Clinic / Pharmacy' }
                                        ].map(amenity => (
                                            <label key={amenity.key} className="flex items-start gap-2 cursor-pointer group p-3 bg-white rounded-lg hover:bg-teal-50 transition-colors border border-transparent hover:border-teal-200">
                                                <input
                                                    type="checkbox"
                                                    checked={projectData.amenities[amenity.key]}
                                                    onChange={(e) => handleProjectChange('amenities', e.target.checked, amenity.key)}
                                                    className="w-4 h-4 mt-0.5 text-teal-600 bg-white border-gray-300 rounded focus:ring-teal-500"
                                                />
                                                <span className="text-xs font-bold text-gray-700 group-hover:text-teal-600 transition-colors">
                                                    {amenity.label}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Commercial & Services */}
                                <div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl border-2 border-indigo-100 p-5">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                            </svg>
                                        </div>
                                        <h4 className="text-sm font-black text-indigo-600 uppercase tracking-wider">Commercial & Services</h4>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {[
                                            { key: 'commercialZone', label: 'Commercial Area / Retail Shops / Convenience Stores' },
                                            { key: 'retailShops', label: 'Shops / Commercial Area / Retail Kiosks / Convenience' },
                                            { key: 'cafeteria', label: 'Cafeteria / Coffee / Food Court' },
                                            { key: 'laundryService', label: 'Laundry / Dry Cleaning Services' }
                                        ].map(amenity => (
                                            <label key={amenity.key} className="flex items-start gap-2 cursor-pointer group p-3 bg-white rounded-lg hover:bg-indigo-50 transition-colors border border-transparent hover:border-indigo-200">
                                                <input
                                                    type="checkbox"
                                                    checked={projectData.amenities[amenity.key]}
                                                    onChange={(e) => handleProjectChange('amenities', e.target.checked, amenity.key)}
                                                    className="w-4 h-4 mt-0.5 text-indigo-600 bg-white border-gray-300 rounded focus:ring-indigo-500"
                                                />
                                                <span className="text-xs font-bold text-gray-700 group-hover:text-indigo-600 transition-colors">
                                                    {amenity.label}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Transport & Connectivity */}
                                <div className="bg-gradient-to-br from-cyan-50 to-white rounded-2xl border-2 border-cyan-100 p-5">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 bg-cyan-600 rounded-xl flex items-center justify-center">
                                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                            </svg>
                                        </div>
                                        <h4 className="text-sm font-black text-cyan-600 uppercase tracking-wider">Transport & Connectivity</h4>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {[
                                            { key: 'parking', label: 'Parking Lots / Visitor Parking' },
                                            { key: 'publicTransportAccess', label: 'Public Transport Access / Shuttle Services' },
                                            { key: 'evCharging', label: 'Electric Vehicle (EV) Charging Stations' },
                                            { key: 'commonAreaWifi', label: 'Broadband / Wi-Fi in Common Areas' }
                                        ].map(amenity => (
                                            <label key={amenity.key} className="flex items-start gap-2 cursor-pointer group p-3 bg-white rounded-lg hover:bg-cyan-50 transition-colors border border-transparent hover:border-cyan-200">
                                                <input
                                                    type="checkbox"
                                                    checked={projectData.amenities[amenity.key]}
                                                    onChange={(e) => handleProjectChange('amenities', e.target.checked, amenity.key)}
                                                    className="w-4 h-4 mt-0.5 text-cyan-600 bg-white border-gray-300 rounded focus:ring-cyan-500"
                                                />
                                                <span className="text-xs font-bold text-gray-700 group-hover:text-cyan-600 transition-colors">
                                                    {amenity.label}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Waste Management & Infrastructure */}
                                <div className="bg-gradient-to-br from-emerald-50 to-white rounded-2xl border-2 border-emerald-100 p-5">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
                                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </div>
                                        <h4 className="text-sm font-black text-emerald-600 uppercase tracking-wider">Waste Management & Infrastructure</h4>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {[
                                            { key: 'wasteManagement', label: 'Waste Management / Garbage Collection' },
                                            { key: 'undergroundElectricity', label: 'Underground Electricity' },
                                            { key: 'waterSupply', label: 'Water Supply' },
                                            { key: 'sewerageSystem', label: 'Sewerage System' },
                                            { key: 'drainageSystem', label: 'Drainage System' },
                                            { key: 'backupPower', label: 'Backup Power / Generator' }
                                        ].map(amenity => (
                                            <label key={amenity.key} className="flex items-start gap-2 cursor-pointer group p-3 bg-white rounded-lg hover:bg-emerald-50 transition-colors border border-transparent hover:border-emerald-200">
                                                <input
                                                    type="checkbox"
                                                    checked={projectData.amenities[amenity.key]}
                                                    onChange={(e) => handleProjectChange('amenities', e.target.checked, amenity.key)}
                                                    className="w-4 h-4 mt-0.5 text-emerald-600 bg-white border-gray-300 rounded focus:ring-emerald-500"
                                                />
                                                <span className="text-xs font-bold text-gray-700 group-hover:text-emerald-600 transition-colors">
                                                    {amenity.label}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Building & Property Features */}
                                <div className="bg-gradient-to-br from-pink-50 to-white rounded-2xl border-2 border-pink-100 p-5">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 bg-pink-600 rounded-xl flex items-center justify-center">
                                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                            </svg>
                                        </div>
                                        <h4 className="text-sm font-black text-pink-600 uppercase tracking-wider">Building & Property Features</h4>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {[
                                            { key: 'elevator', label: 'Elevator / Lift' },
                                            { key: 'balcony', label: 'Balcony' },
                                            { key: 'terrace', label: 'Terrace' },
                                            { key: 'receptionArea', label: 'Reception Area' },
                                            { key: 'meetingRoom', label: 'Meeting / Conference Room' },
                                            { key: 'airConditioning', label: 'Air Conditioning / HVAC' },
                                            { key: 'servantQuarters', label: 'Servant Quarters' },
                                            { key: 'drawingRoom', label: 'Drawing Room' },
                                            { key: 'diningRoom', label: 'Dining Room' },
                                            { key: 'studyRoom', label: 'Study Room' },
                                            { key: 'prayerRoom', label: 'Prayer Room' },
                                            { key: 'storeRoom', label: 'Store Room' },
                                            { key: 'laundryRoom', label: 'Laundry Room' },
                                            { key: 'brandingSpace', label: 'Branding / Signage Space' },
                                            { key: 'loadingUnloadingArea', label: 'Loading & Unloading Area' }
                                        ].map(amenity => (
                                            <label key={amenity.key} className="flex items-start gap-2 cursor-pointer group p-3 bg-white rounded-lg hover:bg-pink-50 transition-colors border border-transparent hover:border-pink-200">
                                                <input
                                                    type="checkbox"
                                                    checked={projectData.amenities[amenity.key]}
                                                    onChange={(e) => handleProjectChange('amenities', e.target.checked, amenity.key)}
                                                    className="w-4 h-4 mt-0.5 text-pink-600 bg-white border-gray-300 rounded focus:ring-pink-500"
                                                />
                                                <span className="text-xs font-bold text-gray-700 group-hover:text-pink-600 transition-colors">
                                                    {amenity.label}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}


                        {/* Contact Tab for Project */}
                        {activeTab === 'contact' && (
                            <div className="space-y-4 xs:space-y-6">
                                <h3 className="text-base xs:text-lg font-black text-gray-900 uppercase tracking-tighter pb-3 xs:pb-4 border-b border-gray-100">
                                    Contact Information
                                </h3>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 xs:gap-6">
                                    <div>
                                        <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">
                                            Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={projectData.contact.name}
                                            onChange={(e) => handleProjectChange('contact', e.target.value, 'name')}
                                            required
                                            className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            value={projectData.contact.email}
                                            onChange={(e) => handleProjectChange('contact', e.target.value, 'email')}
                                            className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">
                                            Contact Number *
                                        </label>
                                        <input
                                            type="tel"
                                            value={projectData.contact.number}
                                            onChange={(e) => handleProjectChange('contact', e.target.value, 'number')}
                                            required
                                            className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">
                                            WhatsApp
                                        </label>
                                        <input
                                            type="tel"
                                            value={projectData.contact.whatsapp}
                                            onChange={(e) => handleProjectChange('contact', e.target.value, 'whatsapp')}
                                            className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">
                                            CNIC
                                        </label>
                                        <input
                                            type="text"
                                            value={projectData.contact.cnic}
                                            onChange={(e) => handleProjectChange('contact', e.target.value, 'cnic')}
                                            className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">
                                            City
                                        </label>
                                        <input
                                            type="text"
                                            value={projectData.contact.city}
                                            onChange={(e) => handleProjectChange('contact', e.target.value, 'city')}
                                            className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">
                                            Area
                                        </label>
                                        <input
                                            type="text"
                                            value={projectData.contact.area}
                                            onChange={(e) => handleProjectChange('contact', e.target.value, 'area')}
                                            className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">
                                            Company Name
                                        </label>
                                        <input
                                            type="text"
                                            value={projectData.contact.companyName}
                                            onChange={(e) => handleProjectChange('contact', e.target.value, 'companyName')}
                                            className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">
                                            Designation
                                        </label>
                                        <input
                                            type="text"
                                            value={projectData.contact.designation}
                                            onChange={(e) => handleProjectChange('contact', e.target.value, 'designation')}
                                            className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* INDIVIDUAL PROPERTY FORM */}
                {propertyType === 'Individual' && (
                    <>
                        {/* Basic Info Tab */}
                        {activeTab === 'basic' && (
                            <div className="space-y-4 xs:space-y-6">
                                <h3 className="text-base xs:text-lg font-black text-gray-900 uppercase tracking-tighter pb-3 xs:pb-4 border-b border-gray-100">
                                    Basic Information
                                </h3>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 xs:gap-6">
                                    <div className="sm:col-span-2">
                                        <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">
                                            Property Title *
                                        </label>
                                        <input
                                            type="text"
                                            value={individualData.title}
                                            onChange={(e) => handleIndividualChange('title', e.target.value)}
                                            required
                                            className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                                            placeholder="e.g., Luxury 3 Bedroom Apartment"
                                        />
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">
                                            Description
                                        </label>
                                        <textarea
                                            value={individualData.description}
                                            onChange={(e) => handleIndividualChange('description', e.target.value)}
                                            rows="4"
                                            className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none resize-none"
                                            placeholder="Detailed description of the property..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">
                                            Property Type *
                                        </label>
                                        <select
                                            value={individualData.propertyType}
                                            onChange={(e) => handleIndividualChange('propertyType', e.target.value)}
                                            required
                                            className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                                        >
                                            <option value="Apartment / Flat">Apartment / Flat</option>
                                            <option value="Villa / House">Villa / House</option>
                                            <option value="Penthouse">Penthouse</option>
                                            <option value="Studio Apartment">Studio Apartment</option>
                                            <option value="Duplex / Triplex">Duplex / Triplex</option>
                                            <option value="Townhouse / Row House">Townhouse / Row House</option>
                                            <option value="Serviced Apartment">Serviced Apartment</option>
                                            <option value="Residential Plot / Land">Residential Plot / Land</option>
                                            <option value="Commercial Plot / Land">Commercial Plot / Land</option>
                                            <option value="Office / Office Space">Office / Office Space</option>
                                            <option value="Retail / Shop / Showroom">Retail / Shop / Showroom</option>
                                            <option value="Warehouse / Industrial Unit">Warehouse / Industrial Unit</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">
                                            Area Unit *
                                        </label>
                                        <select
                                            value={individualData.areaUnit}
                                            onChange={(e) => handleIndividualChange('areaUnit', e.target.value)}
                                            required
                                            className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                                        >
                                            <option value="sq. ft">Square Feet (sq. ft)</option>
                                            <option value="sq. m">Square Meters (sq. m)</option>
                                            <option value="kanal">Kanal</option>
                                            <option value="marla">Marla</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">
                                            Area Size *
                                        </label>
                                        <input
                                            type="text"
                                            value={individualData.areaSize}
                                            onChange={(e) => handleIndividualChange('areaSize', e.target.value)}
                                            required
                                            placeholder="e.g., 1200"
                                            className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">
                                            City *
                                        </label>
                                        <select
                                            value={individualData.city}
                                            onChange={(e) => handleIndividualChange('city', e.target.value)}
                                            required
                                            className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                                        >
                                            <option value="">Select City</option>
                                            {cities.map((city) => (
                                                <option key={city.value} value={city.value}>
                                                    {city.title}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">
                                            Location / Area *
                                        </label>
                                        <input
                                            type="text"
                                            value={individualData.location}
                                            onChange={(e) => handleIndividualChange('location', e.target.value)}
                                            required
                                            placeholder="e.g., DHA Phase 5, Bahria Town"
                                            className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Images */}
                                <div>
                                    <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">
                                        Property Images/Videos
                                    </label>
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
                                    
                                    {currentImages.length > 0 && (
                                        <div className="mt-3 flex flex-wrap gap-2 xs:gap-3">
                                            {currentImages.map((img, idx) => (
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
                </div>
            </div>
                        )}

                        {/* Details Tab (merged with Utilities) */}
                        {activeTab === 'details' && (
                            <div className="space-y-4 xs:space-y-6">
                                <h3 className="text-base xs:text-lg font-black text-gray-900 uppercase tracking-tighter pb-3 xs:pb-4 border-b border-gray-100">
                                    Property Details & Utilities
                                </h3>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 xs:gap-6">
                                    <div>
                                        <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">
                                            Bedrooms
                                        </label>
                                        <input
                                            type="number"
                                            value={individualData.bedrooms}
                                            onChange={(e) => handleIndividualChange('bedrooms', e.target.value)}
                                            min="0"
                                            className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                                        />
        </div>

                                    <div>
                                        <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">
                                            Bathrooms
                                        </label>
                                        <input
                                            type="number"
                                            value={individualData.bathrooms}
                                            onChange={(e) => handleIndividualChange('bathrooms', e.target.value)}
                                            min="0"
                                            className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">
                                            Kitchen Type
                                        </label>
                                        <select
                                            value={individualData.kitchenType}
                                            onChange={(e) => handleIndividualChange('kitchenType', e.target.value)}
                                            className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                                        >
                                            <option value="">Select Type</option>
                                            <option value="Modular">Modular</option>
                                            <option value="Open">Open</option>
                                            <option value="Closed">Closed</option>
                                            <option value="Semi-Open">Semi-Open</option>
                                            <option value="Island">Island</option>
            </select>
                                    </div>

                                    <div>
                                        <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">
                                            Furnishing Status
                                        </label>
                                        <select
                                            value={individualData.furnishingStatus}
                                            onChange={(e) => handleIndividualChange('furnishingStatus', e.target.value)}
                                            className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                                        >
                                            <option value="">Select Status</option>
                                            <option value="Unfurnished">Unfurnished</option>
                                            <option value="Semi-Furnished">Semi-Furnished</option>
                                            <option value="Fully Furnished">Fully Furnished</option>
                                            <option value="Gray Structure">Gray Structure</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">
                                            Floor
                                        </label>
            <input
                                            type="number"
                                            value={individualData.floor}
                                            onChange={(e) => handleIndividualChange('floor', e.target.value)}
                                            min="0"
                                            placeholder="e.g., 5"
                                            className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">
                                            Total Floors
                                        </label>
                                        <input
                                            type="number"
                                            value={individualData.totalFloors}
                                            onChange={(e) => handleIndividualChange('totalFloors', e.target.value)}
                                            min="0"
                                            placeholder="e.g., 10"
                                            className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">
                                            Possession Status
                                        </label>
                                        <select
                                            value={individualData.possessionStatus}
                                            onChange={(e) => handleIndividualChange('possessionStatus', e.target.value)}
                                            className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                                        >
                                            <option value="">Select Status</option>
                                            <option value="Ready">Ready</option>
                                            <option value="Under Construction">Under Construction</option>
                                            <option value="New Project">New Project</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">
                                            Zoning Type
                                        </label>
                                        <select
                                            value={individualData.zoningType}
                                            onChange={(e) => handleIndividualChange('zoningType', e.target.value)}
                                            className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                                        >
                                            <option value="Residential">Residential</option>
                                            <option value="Commercial">Commercial</option>
                                            <option value="Industrial">Industrial</option>
                                            <option value="Semi Commercial">Semi Commercial</option>
                                            <option value="Semi Industrial">Semi Industrial</option>
                                        </select>
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">
                                            Nearby Landmarks / Area Features
                                        </label>
                                        <textarea
                                            value={individualData.nearbyLandmarks}
                                            onChange={(e) => handleIndividualChange('nearbyLandmarks', e.target.value)}
                                            rows="3"
                                            placeholder="e.g., Near shopping mall, close to school..."
                                            className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none resize-none"
                                        />
                                    </div>
                                </div>

                                {/* Utility Supplies (Merged from Step 3) */}
                                <div className="pt-4 xs:pt-6">
                                    <h4 className="text-sm xs:text-base font-black text-gray-900 uppercase tracking-tighter mb-4">
                                        Utility Supplies
                                    </h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        {['electricity', 'water', 'gas', 'internet'].map(utility => (
                                            <label key={utility} className="flex items-center gap-2 cursor-pointer group p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                                <input
                                                    type="checkbox"
                                                    checked={individualData.utilities[utility]}
                                                    onChange={(e) => handleIndividualChange('utilities', e.target.checked, utility)}
                                                    className="w-5 h-5 text-red-600 bg-white border-gray-300 rounded focus:ring-red-500"
                                                />
                                                <span className="text-xs font-bold text-gray-600 group-hover:text-gray-900 capitalize">
                                                    {utility === 'electricity' ? 'Electricity / Power Supply' : 
                                                     utility === 'water' ? 'Water Supply' :
                                                     utility === 'gas' ? 'Gas Connection' :
                                                     'Internet / Broadband'}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Amenities Tab for Individual - Comprehensive */}
                        {activeTab === 'amenities' && (
                            <div className="space-y-4 xs:space-y-6">
                                <h3 className="text-base xs:text-lg font-black text-gray-900 uppercase tracking-tighter pb-3 xs:pb-4 border-b border-gray-100">
                                    Amenities & Facilities
                                </h3>
                                
                                {/* Infrastructure & Utilities */}
                                <div className="space-y-3">
                                    <h4 className="text-xs xs:text-sm font-black text-red-600 uppercase tracking-wider">
                                        Infrastructure & Utilities
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {[
                                            { key: 'undergroundElectricity', label: 'Underground Electricity' },
                                            { key: 'waterSupply', label: 'Water Supply' },
                                            { key: 'sewerageDrainage', label: 'Sewerage & Drainage System' },
                                            { key: 'backupPower', label: 'Backup Power / Generator' },
                                        ].map(amenity => (
                                            <label key={amenity.key} className="flex items-center gap-2 cursor-pointer group p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                                <input
                                                    type="checkbox"
                                                    checked={individualData.amenities[amenity.key]}
                                                    onChange={(e) => handleIndividualChange('amenities', e.target.checked, amenity.key)}
                                                    className="w-4 h-4 text-red-600 bg-white border-gray-300 rounded focus:ring-red-500"
                                                />
                                                <span className="text-xs font-bold text-gray-700 group-hover:text-gray-900">
                                                    {amenity.label}
                                                </span>
                                            </label>
                                        ))}
    </div>
                                </div>

                                {/* Religious & Community Facilities */}
                                <div className="space-y-3">
                                    <h4 className="text-xs xs:text-sm font-black text-red-600 uppercase tracking-wider">
                                        Religious & Community Facilities
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {[
                                            { key: 'grandMosque', label: 'Grand Mosque' },
                                            { key: 'communityCenter', label: 'Community Center / Community Hall' },
                                        ].map(amenity => (
                                            <label key={amenity.key} className="flex items-center gap-2 cursor-pointer group p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                                <input
                                                    type="checkbox"
                                                    checked={individualData.amenities[amenity.key]}
                                                    onChange={(e) => handleIndividualChange('amenities', e.target.checked, amenity.key)}
                                                    className="w-4 h-4 text-red-600 bg-white border-gray-300 rounded focus:ring-red-500"
                                                />
                                                <span className="text-xs font-bold text-gray-700 group-hover:text-gray-900">
                                                    {amenity.label}
                                                </span>
                                            </label>
                                        ))}
        </div>
                                </div>

                                {/* Education, Health & Commercial */}
                                <div className="space-y-3">
                                    <h4 className="text-xs xs:text-sm font-black text-red-600 uppercase tracking-wider">
                                        Education, Health & Commercial
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {[
                                            { key: 'schools', label: 'Schools' },
                                            { key: 'healthFacility', label: 'Health Facility / Clinic' },
                                            { key: 'commercialZone', label: 'Commercial Zone / Market' },
                                        ].map(amenity => (
                                            <label key={amenity.key} className="flex items-center gap-2 cursor-pointer group p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                                <input
                                                    type="checkbox"
                                                    checked={individualData.amenities[amenity.key]}
                                                    onChange={(e) => handleIndividualChange('amenities', e.target.checked, amenity.key)}
                                                    className="w-4 h-4 text-red-600 bg-white border-gray-300 rounded focus:ring-red-500"
                                                />
                                                <span className="text-xs font-bold text-gray-700 group-hover:text-gray-900">
                                                    {amenity.label}
        </span>
    </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Recreational & Outdoor */}
                                <div className="space-y-3">
                                    <h4 className="text-xs xs:text-sm font-black text-red-600 uppercase tracking-wider">
                                        Recreational & Outdoor
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {[
                                            { key: 'parksGreenAreas', label: 'Parks & Green Areas' },
                                            { key: 'playground', label: 'Playground / Children\'s Play Area' },
                                            { key: 'gardenLawn', label: 'Garden / Lawn' },
                                            { key: 'swimmingPool', label: 'Swimming Pool' },
                                            { key: 'clubhouse', label: 'Clubhouse' },
                                        ].map(amenity => (
                                            <label key={amenity.key} className="flex items-center gap-2 cursor-pointer group p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                                <input
                                                    type="checkbox"
                                                    checked={individualData.amenities[amenity.key]}
                                                    onChange={(e) => handleIndividualChange('amenities', e.target.checked, amenity.key)}
                                                    className="w-4 h-4 text-red-600 bg-white border-gray-300 rounded focus:ring-red-500"
                                                />
                                                <span className="text-xs font-bold text-gray-700 group-hover:text-gray-900">
                                                    {amenity.label}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Residential Interior Spaces */}
                                <div className="space-y-3">
                                    <h4 className="text-xs xs:text-sm font-black text-red-600 uppercase tracking-wider">
                                        Residential Interior Spaces
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {[
                                            { key: 'servantQuarters', label: 'Servant Quarters' },
                                            { key: 'drawingRoom', label: 'Drawing Room' },
                                            { key: 'diningRoom', label: 'Dining Room' },
                                            { key: 'studyRoom', label: 'Study Room' },
                                            { key: 'prayerRoom', label: 'Prayer Room' },
                                            { key: 'loungeSittingRoom', label: 'Lounge / Sitting Room' },
                                            { key: 'storeRoom', label: 'Store Room' },
                                            { key: 'laundryRoom', label: 'Laundry Room' },
                                            { key: 'gym', label: 'Gym' },
                                            { key: 'steamRoom', label: 'Steam Room' },
                                        ].map(amenity => (
                                            <label key={amenity.key} className="flex items-center gap-2 cursor-pointer group p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                                <input
                                                    type="checkbox"
                                                    checked={individualData.amenities[amenity.key]}
                                                    onChange={(e) => handleIndividualChange('amenities', e.target.checked, amenity.key)}
                                                    className="w-4 h-4 text-red-600 bg-white border-gray-300 rounded focus:ring-red-500"
                                                />
                                                <span className="text-xs font-bold text-gray-700 group-hover:text-gray-900">
                                                    {amenity.label}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Building & Property Features */}
                                <div className="space-y-3">
                                    <h4 className="text-xs xs:text-sm font-black text-red-600 uppercase tracking-wider">
                                        Building & Property Features
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {[
                                            { key: 'parkingSpace', label: 'Parking Space' },
                                            { key: 'balcony', label: 'Balcony' },
                                            { key: 'terrace', label: 'Terrace' },
                                            { key: 'elevator', label: 'Elevator / Lift' },
                                            { key: 'receptionArea', label: 'Reception Area' },
                                            { key: 'meetingRoom', label: 'Meeting / Conference Room' },
                                        ].map(amenity => (
                                            <label key={amenity.key} className="flex items-center gap-2 cursor-pointer group p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                                <input
                                                    type="checkbox"
                                                    checked={individualData.amenities[amenity.key]}
                                                    onChange={(e) => handleIndividualChange('amenities', e.target.checked, amenity.key)}
                                                    className="w-4 h-4 text-red-600 bg-white border-gray-300 rounded focus:ring-red-500"
                                                />
                                                <span className="text-xs font-bold text-gray-700 group-hover:text-gray-900">
                                                    {amenity.label}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Security & Building Systems */}
                                <div className="space-y-3">
                                    <h4 className="text-xs xs:text-sm font-black text-red-600 uppercase tracking-wider">
                                        Security & Building Systems
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {[
                                            { key: 'security', label: 'Security Services' },
                                            { key: 'cctv', label: 'CCTV Surveillance' },
                                            { key: 'airConditioning', label: 'Air Conditioning / HVAC' },
                                        ].map(amenity => (
                                            <label key={amenity.key} className="flex items-center gap-2 cursor-pointer group p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                                <input
                                                    type="checkbox"
                                                    checked={individualData.amenities[amenity.key]}
                                                    onChange={(e) => handleIndividualChange('amenities', e.target.checked, amenity.key)}
                                                    className="w-4 h-4 text-red-600 bg-white border-gray-300 rounded focus:ring-red-500"
                                                />
                                                <span className="text-xs font-bold text-gray-700 group-hover:text-gray-900">
                                                    {amenity.label}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Commercial / Miscellaneous */}
                                <div className="space-y-3">
                                    <h4 className="text-xs xs:text-sm font-black text-red-600 uppercase tracking-wider">
                                        Commercial / Miscellaneous
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {[
                                            { key: 'brandingSpace', label: 'Branding / Signage Space' },
                                            { key: 'retailShops', label: 'Retail Shops / Commercial Outlets' },
                                            { key: 'loadingArea', label: 'Loading & Unloading Area' },
                                        ].map(amenity => (
                                            <label key={amenity.key} className="flex items-center gap-2 cursor-pointer group p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                                <input
                                                    type="checkbox"
                                                    checked={individualData.amenities[amenity.key]}
                                                    onChange={(e) => handleIndividualChange('amenities', e.target.checked, amenity.key)}
                                                    className="w-4 h-4 text-red-600 bg-white border-gray-300 rounded focus:ring-red-500"
                                                />
                                                <span className="text-xs font-bold text-gray-700 group-hover:text-gray-900">
                                                    {amenity.label}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Transaction Tab for Individual */}
                        {activeTab === 'transaction' && (
                            <div className="space-y-4 xs:space-y-6">
                                <h3 className="text-base xs:text-lg font-black text-gray-900 uppercase tracking-tighter pb-3 xs:pb-4 border-b border-gray-100">
                                    Transaction Details
                                </h3>
                                
                                <div>
                                    <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">
                                        Transaction Type *
                                    </label>
                                    <select
                                        value={individualData.transaction.type}
                                        onChange={(e) => handleIndividualChange('transaction', e.target.value, 'type')}
                                        required
                                        className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                                    >
                                        <option value="Sale">For Sale</option>
                                        <option value="Rent">For Rent</option>
                                        <option value="Installment">For Installment</option>
                                    </select>
                                </div>

                                {individualData.transaction.type === 'Sale' && (
                                    <div>
                                        <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">
                                            Price (PKR) *
                                        </label>
                                        <input
                                            type="number"
                                            value={individualData.transaction.price}
                                            onChange={(e) => handleIndividualChange('transaction', e.target.value, 'price')}
                                            required
                                            className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                                            placeholder="e.g., 15000000"
                                        />
                                    </div>
                                )}

                                {individualData.transaction.type === 'Rent' && (
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 xs:gap-6">
                                        <div>
                                            <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">
                                                Advance Amount *
                                            </label>
                                            <input
                                                type="number"
                                                value={individualData.transaction.advanceAmount}
                                                onChange={(e) => handleIndividualChange('transaction', e.target.value, 'advanceAmount')}
                                                required
                                                className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">
                                                Monthly Rent *
                                            </label>
                                            <input
                                                type="number"
                                                value={individualData.transaction.monthlyRent}
                                                onChange={(e) => handleIndividualChange('transaction', e.target.value, 'monthlyRent')}
                                                required
                                                className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">
                                                Contract Duration
                                            </label>
                                            <input
                                                type="text"
                                                value={individualData.transaction.contractDuration}
                                                onChange={(e) => handleIndividualChange('transaction', e.target.value, 'contractDuration')}
                                                placeholder="e.g., 1 year, 6 months"
                                                className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                                            />
                                        </div>
                                    </div>
                                )}

                                {individualData.transaction.type === 'Installment' && (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 xs:gap-6">
                                            <div>
                                                <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">
                                                    Booking / Confirmation Amount *
                                                </label>
                                                <input
                                                    type="number"
                                                    value={individualData.transaction.bookingAmount}
                                                    onChange={(e) => handleIndividualChange('transaction', e.target.value, 'bookingAmount')}
                                                    required
                                                    className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">
                                                    Down Payment *
                                                </label>
                                                <input
                                                    type="number"
                                                    value={individualData.transaction.downPayment}
                                                    onChange={(e) => handleIndividualChange('transaction', e.target.value, 'downPayment')}
                                                    required
                                                    className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">
                                                    Monthly Installment *
                                                </label>
                                                <input
                                                    type="number"
                                                    value={individualData.transaction.monthlyInstallment}
                                                    onChange={(e) => handleIndividualChange('transaction', e.target.value, 'monthlyInstallment')}
                                                    required
                                                    className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">
                                                    Tenure / Duration
                                                </label>
                                                <input
                                                    type="text"
                                                    value={individualData.transaction.tenure}
                                                    onChange={(e) => handleIndividualChange('transaction', e.target.value, 'tenure')}
                                                    placeholder="e.g., 3 years, 36 months"
                                                    className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">
                                                Total Amount Payable by Buyer / Consumer
                                            </label>
                                            <input
                                                type="number"
                                                value={individualData.transaction.totalPayable}
                                                onChange={(e) => handleIndividualChange('transaction', e.target.value, 'totalPayable')}
                                                className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">
                                        Additional Information
                                    </label>
                                    <textarea
                                        value={individualData.transaction.additionalInfo}
                                        onChange={(e) => handleIndividualChange('transaction', e.target.value, 'additionalInfo')}
                                        rows="3"
                                        className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none resize-none"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Contact Tab for Individual */}
                        {activeTab === 'contact' && (
                            <div className="space-y-4 xs:space-y-6">
                                <h3 className="text-base xs:text-lg font-black text-gray-900 uppercase tracking-tighter pb-3 xs:pb-4 border-b border-gray-100">
                                    Contact Information & Documents
                                </h3>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 xs:gap-6">
                                    <div>
                                        <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">
                                            Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={individualData.contact.name}
                                            onChange={(e) => handleIndividualChange('contact', e.target.value, 'name')}
                                            required
                                            className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">
                                            Contact Number *
                                        </label>
                                        <input
                                            type="tel"
                                            value={individualData.contact.number}
                                            onChange={(e) => handleIndividualChange('contact', e.target.value, 'number')}
                                            required
                                            className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            value={individualData.contact.email}
                                            onChange={(e) => handleIndividualChange('contact', e.target.value, 'email')}
                                            className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">
                                            WhatsApp
                                        </label>
                                        <input
                                            type="tel"
                                            value={individualData.contact.whatsapp}
                                            onChange={(e) => handleIndividualChange('contact', e.target.value, 'whatsapp')}
                                            className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">
                                            CNIC
                                        </label>
                                        <input
                                            type="text"
                                            value={individualData.contact.cnic}
                                            onChange={(e) => handleIndividualChange('contact', e.target.value, 'cnic')}
                                            placeholder="e.g., 42101-1234567-8"
                                            className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-wider xs:tracking-widest mb-2">
                                            Preferred Mode of Contact
                                        </label>
                                        <select
                                            className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-lg xs:rounded-xl text-xs xs:text-sm font-bold transition-all outline-none"
                                        >
                                            <option value="">Select</option>
                                            <option value="Call">Call</option>
                                            <option value="WhatsApp">WhatsApp</option>
                                            <option value="Email">Email</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Property Documents */}
                                <div className="pt-6 border-t-2 border-gray-200">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
                                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black text-gray-900 uppercase tracking-wider">
                                                Property Documents
                                            </h4>
                                            <p className="text-[10px] text-gray-500 font-medium">
                                                Upload relevant documents
                                            </p>
                                        </div>
                                    </div>

                                    {/* Document Upload Form */}
                                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-gray-200 p-5 mb-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                                                    Document Title *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={documentForm.title}
                                                    onChange={(e) => setDocumentForm(prev => ({ ...prev, title: e.target.value }))}
                                                    placeholder="e.g., Ownership Documents"
                                                    className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-white border-2 border-gray-200 focus:border-indigo-600 rounded-lg text-xs font-bold transition-all outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                                                    Document Type *
                                                </label>
                                                <select
                                                    value={documentForm.type}
                                                    onChange={(e) => setDocumentForm(prev => ({ ...prev, type: e.target.value }))}
                                                    className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-white border-2 border-gray-200 focus:border-indigo-600 rounded-lg text-xs font-bold transition-all outline-none"
                                                >
                                                    <option value="">Select Type</option>
                                                    <option value="Brochures / Project Booklets">Brochures / Project Booklets</option>
                                                    <option value="Pricing & Availability List">Pricing & Availability List</option>
                                                    <option value="No Objection Certificates (NOCs)">No Objection Certificates (NOCs)</option>
                                                    <option value="Development / Building Plan Approval">Development / Building Plan Approval</option>
                                                    <option value="Installment Plan / Payment Schedule">Installment Plan / Payment Schedule</option>
                                                    <option value="Master Layout Plan">Master Layout Plan</option>
                                                    <option value="Floor Plans / Unit Plans">Floor Plans / Unit Plans</option>
                                                    <option value="Agreement Drafts (Sample Sale or Booking)">Agreement Drafts (Sample Sale or Booking)</option>
                                                    <option value="Terms & Conditions for Booking / Sale">Terms & Conditions for Booking / Sale</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="flex-1">
                                                <label className="block text-[9px] xs:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                                                    Select File * (PDF, DOC, DOCX - Max 5MB)
                                                </label>
                                                <input
                                                    id="documentFileInput"
                                                    type="file"
                                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                                    onChange={(e) => setDocumentForm(prev => ({ ...prev, file: e.target.files[0] }))}
                                                    disabled={uploadingDocument}
                                                    className="w-full px-3 xs:px-4 py-2.5 xs:py-3 bg-white border-2 border-dashed border-gray-300 focus:border-indigo-600 rounded-lg text-xs font-bold transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                                                />
                                            </div>
                                            <div className="flex items-end">
                                                <button
                                                    type="button"
                                                    onClick={handleDocumentUpload}
                                                    disabled={uploadingDocument || !documentForm.title || !documentForm.type || !documentForm.file}
                                                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:from-indigo-700 hover:to-indigo-800 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200 flex items-center gap-2 whitespace-nowrap"
                                                >
                                                    {uploadingDocument ? (
                                                        <>
                                                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                            </svg>
                                                            Uploading...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                            </svg>
                                                            Upload
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Uploaded Documents List */}
                                    {individualData.documents.length > 0 && (
                                        <div className="space-y-2">
                                            <p className="text-xs font-black text-gray-700 uppercase tracking-wider mb-3">
                                                Uploaded Documents ({individualData.documents.length})
                                            </p>
                                            {individualData.documents.map((doc, idx) => (
                                                <div key={idx} className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-indigo-300 transition-all group">
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                            <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                            </svg>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h5 className="text-sm font-black text-gray-900 truncate">{doc.title}</h5>
                                                            <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mt-1">
                                                                {doc.type}
                                                            </p>
                                                            <a 
                                                                href={doc.fileUrl} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer"
                                                                className="text-[10px] text-gray-500 hover:text-indigo-600 font-medium truncate block mt-1"
                                                            >
                                                                View Document →
                                                            </a>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeDocument(idx)}
                                                            className="w-8 h-8 bg-red-100 hover:bg-red-600 text-red-600 hover:text-white rounded-lg flex items-center justify-center transition-all active:scale-95 flex-shrink-0"
                                                            title="Remove Document"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {individualData.documents.length === 0 && (
                                        <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                                                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </div>
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                No Documents Uploaded Yet
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}

                    {/* Navigation Buttons */}
                    <div className="flex flex-col-reverse xs:flex-row gap-3 xs:gap-4 mt-8 xs:mt-10 pt-6 xs:pt-8 border-t-2 border-gray-100">
                        {/* Cancel Button (Mobile bottom, Desktop left) */}
                        <button
                            type="button"
                            onClick={() => navigate('/property/all')}
                            className="tap-target group flex items-center justify-center gap-2 px-5 xs:px-6 py-3 xs:py-3.5 bg-gradient-to-br from-gray-50 to-gray-100 text-gray-600 border-2 border-gray-200 rounded-xl xs:rounded-2xl font-bold uppercase text-[10px] xs:text-xs tracking-wider hover:from-gray-100 hover:to-gray-200 hover:border-gray-300 transition-all active:scale-95 shadow-md hover:shadow-lg"
                        >
                            <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Cancel
                        </button>

                        {/* Spacer */}
                        <div className="flex-1" />

                        {/* Previous Button */}
                        {!isFirstStep && (
                            <button
                                type="button"
                                onClick={handlePrevious}
                                disabled={loading}
                                className="tap-target group flex items-center justify-center gap-2 px-5 xs:px-7 py-3 xs:py-3.5 bg-white border-2 border-gray-300 text-gray-700 rounded-xl xs:rounded-2xl font-bold uppercase text-[10px] xs:text-xs tracking-wider hover:border-gray-400 hover:bg-gray-50 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                            >
                                <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                                </svg>
                                <span className="hidden xs:inline">Previous</span>
                                <span className="xs:hidden">Back</span>
                            </button>
                        )}

                        {/* Next/Submit Button */}
                        <button
                            type="button"
                            onClick={handleNextOrSubmit}
                            disabled={loading}
                            className={`tap-target group flex items-center justify-center gap-2 px-7 xs:px-10 py-3 xs:py-4 rounded-xl xs:rounded-2xl font-black uppercase text-[10px] xs:text-xs tracking-widest transition-all shadow-2xl ${
                                isLastStep 
                                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-emerald-200 text-white' 
                                    : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-red-200 text-white'
                            } ${loading ? 'opacity-70 cursor-not-allowed' : 'active:scale-95 hover:shadow-3xl'}`}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    {id ? 'Updating...' : 'Creating...'}
                                </span>
                            ) : isLastStep ? (
                                <>
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>{id ? 'Update Property' : 'Create Property'}</span>
                                </>
                            ) : (
                                <>
                                    <span>Next Step</span>
                                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                                    </svg>
                                </>
                            )}
                        </button>
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

export default PropertyAdd;
