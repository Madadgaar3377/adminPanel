import React, { useState, useEffect } from 'react';
import ApiBaseUrl from '../constants/apiUrl';
import { useNavigate } from 'react-router-dom';
import Pagination from '../compontents/Pagination';

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

const InsurancePlansList = () => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All'); // Keep for planStatus (Active/Limited/Closed), not approvalStatus
    const [filterPolicyType, setFilterPolicyType] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [toast, setToast] = useState(null);
    const itemsPerPage = 10;
    const navigate = useNavigate();

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        setLoading(true);
        try {
            const authData = JSON.parse(localStorage.getItem('adminAuth'));
            const res = await fetch(`${ApiBaseUrl}/getAllInsurancePlans`, {
                headers: {
                    'Authorization': `Bearer ${authData.token}`,
                }
            });
            const data = await res.json();
            if (data.success) {
                setPlans(data.data || []);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError("Failed to connect to server");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (planId) => {
        if (!window.confirm("Are you sure you want to approve this insurance plan?")) return;
        
        try {
            const authData = JSON.parse(localStorage.getItem('adminAuth'));
            const res = await fetch(`${ApiBaseUrl}/approveInsurancePlan/${planId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${authData.token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ approvalNote: 'Approved by admin' })
            });
            
            const data = await res.json();
            
            if (res.ok && data.success) {
                fetchPlans();
                showToast('Insurance plan approved successfully!');
            } else {
                showToast(data.message || 'Failed to approve plan', 'error');
            }
        } catch (err) {
            showToast('Network error. Please try again.', 'error');
        }
    };

    const handleReject = async (planId) => {
        const rejectionReason = window.prompt("Please provide rejection reason:");
        if (!rejectionReason) return;
        
        try {
            const authData = JSON.parse(localStorage.getItem('adminAuth'));
            const res = await fetch(`${ApiBaseUrl}/rejectInsurancePlan/${planId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${authData.token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ rejectionReason })
            });
            
            const data = await res.json();
            
            if (res.ok && data.success) {
                fetchPlans();
                showToast('Insurance plan rejected');
            } else {
                showToast(data.message || 'Failed to reject plan', 'error');
            }
        } catch (err) {
            showToast('Network error. Please try again.', 'error');
        }
    };

    const handleDelete = async (planId) => {
        if (!window.confirm("Are you sure you want to delete this insurance plan? This action cannot be undone.")) return;
        
        try {
            const authData = JSON.parse(localStorage.getItem('adminAuth'));
            const res = await fetch(`${ApiBaseUrl}/deleteInsurancePlanAdmin/${planId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authData.token}`,
                }
            });
            
            const data = await res.json();
            
            if (res.ok && data.success) {
                setPlans(plans.filter(plan => plan._id !== planId));
                showToast('Insurance plan deleted successfully!');
            } else {
                showToast(data.message || 'Failed to delete plan', 'error');
            }
        } catch (err) {
            showToast('Network error. Please try again.', 'error');
        }
    };

    const handleToggleVisibility = async (planId, currentVisibility) => {
        try {
            const authData = JSON.parse(localStorage.getItem('adminAuth'));
            const res = await fetch(`${ApiBaseUrl}/updatePlanVisibility/${planId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${authData.token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ isVisible: !currentVisibility })
            });
            
            const data = await res.json();
            
            if (res.ok && data.success) {
                fetchPlans();
                showToast(`Plan ${!currentVisibility ? 'made visible' : 'hidden'} successfully!`);
            } else {
                showToast(data.message || 'Failed to update visibility', 'error');
            }
        } catch (err) {
            showToast('Network error. Please try again.', 'error');
        }
    };

    const filtered = plans.filter(plan => {
        const matchesSearch = 
            plan.planName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            plan.planId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            plan.registeredCompanyName?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'All' || plan.planStatus === filterStatus;
        const matchesPolicyType = filterPolicyType === 'All' || plan.policyType === filterPolicyType;
        return matchesSearch && matchesStatus && matchesPolicyType;
    });

    const paginatedPlans = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const getStatusBadge = (status) => {
        const badges = {
            Active: 'bg-green-100 text-green-800',
            Limited: 'bg-yellow-100 text-yellow-800',
            Closed: 'bg-red-100 text-red-800',
        };
        return badges[status] || 'bg-gray-100 text-gray-800';
    };

    if (loading) {
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
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Insurance Plans</h1>
                <p className="text-gray-600">Manage all insurance plans from partners</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                        type="text"
                        placeholder="Search plans..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                        <option value="All">All Status</option>
                        <option value="Active">Active</option>
                        <option value="Limited">Limited</option>
                        <option value="Closed">Closed</option>
                    </select>
                    <select
                        value={filterPolicyType}
                        onChange={(e) => setFilterPolicyType(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                        <option value="All">All Policy Types</option>
                        <option value="Life">Life</option>
                        <option value="Health">Health</option>
                        <option value="Motor">Motor</option>
                        <option value="Travel">Travel</option>
                        <option value="Property">Property</option>
                        <option value="Takaful">Takaful</option>
                    </select>
                </div>
            </div>

            {/* Plans Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan Details</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Policy Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visibility</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {paginatedPlans.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                                        No insurance plans found
                                    </td>
                                </tr>
                            ) : (
                                paginatedPlans.map((plan) => (
                                    <tr key={plan._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{plan.planName || 'N/A'}</div>
                                                <div className="text-sm text-gray-500">ID: {plan.planId || plan._id}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{plan.registeredCompanyName || 'N/A'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                                {plan.policyType || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(plan.planStatus)}`}>
                                                {plan.planStatus || 'Active'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${plan.isVisible ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {plan.isVisible ? 'Visible' : 'Hidden'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => navigate(`/insurance/add`)}
                                                    className="text-green-600 hover:text-green-900 mr-2"
                                                >
                                                    + Create
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/insurance/view/${plan._id}`)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    View
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/insurance/edit/${plan._id}`)}
                                                    className="text-purple-600 hover:text-purple-900"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleToggleVisibility(plan._id, plan.isVisible)}
                                                    className="text-purple-600 hover:text-purple-900"
                                                >
                                                    {plan.isVisible ? 'Hide' : 'Show'}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(plan._id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {filtered.length > itemsPerPage && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(filtered.length / itemsPerPage)}
                    onPageChange={setCurrentPage}
                />
            )}
        </div>
    );
};

export default InsurancePlansList;
