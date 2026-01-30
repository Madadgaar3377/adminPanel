import React, { useState, useEffect } from "react";
import ApiBaseUrl from "../constants/apiUrl";
import { Link } from "react-router-dom";

const CommissionRulesList = () => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    partnerType: "",
    isActive: "",
    page: 1,
    limit: 20,
  });
  const [pagination, setPagination] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchCommissionRules();
  }, [filters]);

  const fetchCommissionRules = async () => {
    try {
      setLoading(true);
      const authData = JSON.parse(localStorage.getItem("adminAuth"));
      const token = authData?.token;

      const params = new URLSearchParams();
      if (filters.partnerType) params.append("partnerType", filters.partnerType);
      if (filters.isActive !== "") params.append("isActive", filters.isActive);
      params.append("page", filters.page);
      params.append("limit", filters.limit);

      const response = await fetch(
        `${ApiBaseUrl}/getAllCommissionRules?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();
      if (data.success) {
        setRules(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Error fetching commission rules:", error);
      alert("Failed to fetch commission rules");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRule = async (partnerId) => {
    if (!window.confirm("Are you sure you want to delete this commission rule?")) {
      return;
    }

    try {
      const authData = JSON.parse(localStorage.getItem("adminAuth"));
      const token = authData?.token;

      const response = await fetch(
        `${ApiBaseUrl}/deleteCommissionRules/${partnerId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();
      if (data.success) {
        alert("Commission rules deleted successfully");
        fetchCommissionRules();
      }
    } catch (error) {
      console.error("Error deleting commission rules:", error);
      alert("Failed to delete commission rules");
    }
  };

  const getActiveCommissionTypes = (rule) => {
    const types = [];
    
    if (rule.partnerType === "Property") {
      if (rule.propertyCommission?.saleCommission?.enabled) types.push("Sale");
      if (rule.propertyCommission?.rentCommission?.enabled) types.push("Rent");
      if (rule.propertyCommission?.installmentCommission?.enabled) types.push("Installment");
    } else if (rule.partnerType === "Installment") {
      if (rule.installmentProductCommission?.installmentSaleCommission?.enabled) types.push("Installment Sale");
      if (rule.installmentProductCommission?.cashSaleCommission?.enabled) types.push("Cash Sale");
    } else if (rule.partnerType === "Loan") {
      if (rule.loanCommission?.homeLoanCommission?.enabled) types.push("Home");
      if (rule.loanCommission?.personalLoanCommission?.enabled) types.push("Personal");
      if (rule.loanCommission?.businessLoanCommission?.enabled) types.push("Business");
      if (rule.loanCommission?.autoLoanCommission?.enabled) types.push("Auto");
    } else if (rule.partnerType === "Insurance") {
      if (rule.insuranceCommission?.policyIssuanceCommission?.enabled) types.push("Issuance");
      if (rule.insuranceCommission?.claimSettlementCommission?.enabled) types.push("Claim");
      if (rule.insuranceCommission?.policyRenewalCommission?.enabled) types.push("Renewal");
    }
    
    return types.length > 0 ? types.join(", ") : "None";
  };

  const filteredRules = rules.filter((rule) =>
    rule.partnerInfo?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rule.partnerInfo?.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rule.partnerInfo?.email?.toLowerCase().includes(searchTerm.toLowerCase())
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
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          Commission Rules Management
        </h1>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Partner
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Name, Company, Email..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Partner Type
            </label>
            <select
              value={filters.partnerType}
              onChange={(e) =>
                setFilters({ ...filters, partnerType: e.target.value, page: 1 })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Types</option>
              <option value="Property">Property</option>
              <option value="Installment">Installment</option>
              <option value="Loan">Loan</option>
              <option value="Insurance">Insurance</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filters.isActive}
              onChange={(e) =>
                setFilters({ ...filters, isActive: e.target.value, page: 1 })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
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

      {/* Rules List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Partner Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Active Commission Types
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRules.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No commission rules found
                  </td>
                </tr>
              ) : (
                filteredRules.map((rule) => (
                  <tr key={rule._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {rule.partnerInfo?.companyName || rule.partnerInfo?.name || "N/A"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {rule.partnerInfo?.email || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {rule.partnerType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {getActiveCommissionTypes(rule)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          rule.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {rule.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(rule.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Link
                        to={`/commission/view/${rule.partnerId}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleDeleteRule(rule.partnerId)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
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
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
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
                  Showing page <span className="font-medium">{pagination.currentPage}</span> of{" "}
                  <span className="font-medium">{pagination.totalPages}</span> ({pagination.totalItems} total)
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                    disabled={filters.page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                    disabled={filters.page === pagination.totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommissionRulesList;
