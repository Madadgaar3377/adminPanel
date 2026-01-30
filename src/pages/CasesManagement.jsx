import React, { useState, useEffect } from "react";
import ApiBaseUrl from "../constants/apiUrl";
import { Link } from "react-router-dom";

const CasesManagement = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "",
    category: "",
    agentId: "",
    partnerId: "",
    page: 1,
    limit: 20,
  });
  const [pagination, setPagination] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCase, setSelectedCase] = useState(null);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideForm, setOverrideForm] = useState({
    action: "",
    reason: "",
    notes: "",
  });

  useEffect(() => {
    fetchCases();
  }, [filters]);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const authData = JSON.parse(localStorage.getItem("adminAuth"));
      const token = authData?.token;

      const params = new URLSearchParams();
      if (filters.status) params.append("status", filters.status);
      if (filters.category) params.append("category", filters.category);
      if (filters.agentId) params.append("agentId", filters.agentId);
      if (filters.partnerId) params.append("partnerId", filters.partnerId);
      params.append("page", filters.page);
      params.append("limit", filters.limit);

      const response = await fetch(
        `${ApiBaseUrl}/getAllCases?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();
      if (data.success) {
        setCases(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Error fetching cases:", error);
      alert("Failed to fetch cases");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkCommissionPaid = async (caseId) => {
    const paymentReference = prompt("Enter payment reference:");
    if (!paymentReference) return;

    const payoutMethod = prompt("Enter payout method (Bank Transfer/Wallet):");
    if (!payoutMethod) return;

    try {
      const authData = JSON.parse(localStorage.getItem("adminAuth"));
      const token = authData?.token;

      const response = await fetch(
        `${ApiBaseUrl}/markCommissionPaid/${caseId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ paymentReference, payoutMethod }),
        }
      );

      const data = await response.json();
      if (data.success) {
        alert("Commission marked as paid successfully");
        fetchCases();
      }
    } catch (error) {
      console.error("Error marking commission as paid:", error);
      alert("Failed to mark commission as paid");
    }
  };

  const handleReverseCommission = async (caseId) => {
    const reversalReason = prompt("Enter reversal reason:");
    if (!reversalReason) return;

    try {
      const authData = JSON.parse(localStorage.getItem("adminAuth"));
      const token = authData?.token;

      const response = await fetch(
        `${ApiBaseUrl}/reverseCommission/${caseId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reversalReason }),
        }
      );

      const data = await response.json();
      if (data.success) {
        alert("Commission reversed successfully");
        fetchCases();
      }
    } catch (error) {
      console.error("Error reversing commission:", error);
      alert("Failed to reverse commission");
    }
  };

  const handleOverrideCase = async () => {
    if (!overrideForm.action || !overrideForm.reason) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const authData = JSON.parse(localStorage.getItem("adminAuth"));
      const token = authData?.token;

      const response = await fetch(
        `${ApiBaseUrl}/adminOverrideCase/${selectedCase.caseId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(overrideForm),
        }
      );

      const data = await response.json();
      if (data.success) {
        alert("Case override applied successfully");
        setShowOverrideModal(false);
        setOverrideForm({ action: "", reason: "", notes: "" });
        fetchCases();
      }
    } catch (error) {
      console.error("Error overriding case:", error);
      alert("Failed to override case");
    }
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      Received: "bg-blue-100 text-blue-800",
      "In Progress": "bg-yellow-100 text-yellow-800",
      Verified: "bg-purple-100 text-purple-800",
      Closed: "bg-green-100 text-green-800",
      Rejected: "bg-red-100 text-red-800",
      Transferred: "bg-orange-100 text-orange-800",
      Shared: "bg-indigo-100 text-indigo-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getCommissionStatusColor = (status) => {
    const colors = {
      Pending: "text-yellow-600",
      Paid: "text-green-600",
      Reversed: "text-red-600",
      "Not Applicable": "text-gray-600",
    };
    return colors[status] || "text-gray-600";
  };

  const filteredCases = cases.filter(
    (caseItem) =>
      caseItem.caseId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caseItem.agentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caseItem.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caseItem.productName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          Cases Management & Oversight
        </h1>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Case ID, Agent, Client..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value, page: 1 })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Statuses</option>
              <option value="Received">Received</option>
              <option value="In Progress">In Progress</option>
              <option value="Verified">Verified</option>
              <option value="Closed">Closed</option>
              <option value="Rejected">Rejected</option>
              <option value="Transferred">Transferred</option>
              <option value="Shared">Shared</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) =>
                setFilters({ ...filters, category: e.target.value, page: 1 })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Categories</option>
              <option value="Property">Property</option>
              <option value="Installment">Installment</option>
              <option value="Loan">Loan</option>
              <option value="Insurance">Insurance</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Items Per Page
            </label>
            <select
              value={filters.limit}
              onChange={(e) =>
                setFilters({ ...filters, limit: parseInt(e.target.value), page: 1 })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cases Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Case ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Agent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Commission
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCases.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No cases found
                  </td>
                </tr>
              ) : (
                filteredCases.map((caseItem) => (
                  <tr key={caseItem._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {caseItem.caseId}
                      </div>
                      <div className="text-sm text-gray-500">
                        {caseItem.productName}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{caseItem.agentName}</div>
                      <div className="text-sm text-gray-500">{caseItem.agentEmail}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{caseItem.clientName}</div>
                      <div className="text-sm text-gray-500">{caseItem.clientEmail}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {caseItem.caseCategory}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(
                          caseItem.caseStatus
                        )}`}
                      >
                        {caseItem.caseStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div
                        className={`text-sm font-medium ${getCommissionStatusColor(
                          caseItem.commissionInfo?.commissionPayable
                        )}`}
                      >
                        PKR {caseItem.commissionInfo?.eligibleCommission?.toLocaleString() || 0}
                      </div>
                      <div className="text-xs text-gray-500">
                        {caseItem.commissionInfo?.commissionPayable || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-y-1">
                      <Link
                        to={`/cases/view/${caseItem.caseId}`}
                        className="block text-blue-600 hover:text-blue-900"
                      >
                        View
                      </Link>
                      {caseItem.commissionInfo?.commissionPayable === "Pending" && (
                        <button
                          onClick={() => handleMarkCommissionPaid(caseItem.caseId)}
                          className="block text-green-600 hover:text-green-900"
                        >
                          Mark Paid
                        </button>
                      )}
                      {caseItem.commissionInfo?.commissionPayable === "Paid" && (
                        <button
                          onClick={() => handleReverseCommission(caseItem.caseId)}
                          className="block text-red-600 hover:text-red-900"
                        >
                          Reverse
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedCase(caseItem);
                          setShowOverrideModal(true);
                        }}
                        className="block text-purple-600 hover:text-purple-900"
                      >
                        Override
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                disabled={filters.page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                disabled={filters.page === pagination.totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalItems} total)
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Override Modal */}
      {showOverrideModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Admin Override Case</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Action *
                </label>
                <input
                  type="text"
                  value={overrideForm.action}
                  onChange={(e) =>
                    setOverrideForm({ ...overrideForm, action: e.target.value })
                  }
                  placeholder="e.g., Override Commission, Force Close"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason *
                </label>
                <textarea
                  value={overrideForm.reason}
                  onChange={(e) =>
                    setOverrideForm({ ...overrideForm, reason: e.target.value })
                  }
                  placeholder="Reason for override..."
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={overrideForm.notes}
                  onChange={(e) =>
                    setOverrideForm({ ...overrideForm, notes: e.target.value })
                  }
                  placeholder="Additional notes..."
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                ></textarea>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowOverrideModal(false);
                  setOverrideForm({ action: "", reason: "", notes: "" });
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleOverrideCase}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Apply Override
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CasesManagement;
