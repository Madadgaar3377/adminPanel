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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-4 xs:py-6 sm:py-8 space-y-4 sm:space-y-6">
        {/* Modern Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-red-600 via-red-500 to-rose-600 rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-40 h-40 bg-white opacity-5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-40 h-40 bg-white opacity-5 rounded-full blur-3xl"></div>
          
          <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight truncate">Commission Rules Management</h1>
                  <p className="text-red-100 text-xs sm:text-sm font-medium mt-0.5">Manage commission rules for partners</p>
                </div>
              </div>
            </div>
            <button
              onClick={fetchCommissionRules}
              disabled={loading}
              className="p-2 sm:p-3 bg-white/10 backdrop-blur-sm text-white rounded-lg sm:rounded-xl hover:bg-white/20 transition-all duration-300 disabled:opacity-50 active:scale-95 flex-shrink-0"
            >
              <svg className={`w-4 h-4 sm:w-5 sm:h-5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
              Search Partner
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Name, Company, Email..."
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm sm:text-base"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
              Partner Type
            </label>
            <select
              value={filters.partnerType}
              onChange={(e) =>
                setFilters({ ...filters, partnerType: e.target.value, page: 1 })
              }
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm sm:text-base"
            >
              <option value="">All Types</option>
              <option value="Property">Property</option>
              <option value="Installment">Installment</option>
              <option value="Loan">Loan</option>
              <option value="Insurance">Insurance</option>
            </select>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
              Status
            </label>
            <select
              value={filters.isActive}
              onChange={(e) =>
                setFilters({ ...filters, isActive: e.target.value, page: 1 })
              }
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm sm:text-base"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
              Items Per Page
            </label>
            <select
              value={filters.limit}
              onChange={(e) =>
                setFilters({ ...filters, limit: parseInt(e.target.value), page: 1 })
              }
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm sm:text-base"
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
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto -mx-3 xs:-mx-4 sm:mx-0">
            <table className="min-w-full divide-y divide-gray-200 min-w-[800px]">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                <tr>
                  <th className="px-3 xs:px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">Partner Info</th>
                  <th className="px-3 xs:px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">Type</th>
                  <th className="px-3 xs:px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider hidden lg:table-cell">Active Commission Types</th>
                  <th className="px-3 xs:px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-3 xs:px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider hidden md:table-cell">Created</th>
                  <th className="px-3 xs:px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredRules.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <p className="text-sm font-bold text-gray-500">No commission rules found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredRules.map((rule) => (
                    <tr key={rule._id} className="hover:bg-gradient-to-r hover:from-red-50/50 hover:to-rose-50/50 transition-all duration-300">
                      <td className="px-3 xs:px-4 sm:px-6 py-3 sm:py-4">
                        <div className="text-sm font-bold text-gray-900 truncate">
                          {rule.partnerInfo?.companyName || rule.partnerInfo?.name || "N/A"}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {rule.partnerInfo?.email || "N/A"}
                        </div>
                      </td>
                      <td className="px-3 xs:px-4 sm:px-6 py-3 sm:py-4">
                        <span className="px-2 sm:px-3 py-1 sm:py-1.5 inline-flex text-xs font-bold rounded-lg sm:rounded-xl bg-blue-100 text-blue-800 whitespace-nowrap">
                          {rule.partnerType}
                        </span>
                      </td>
                      <td className="px-3 xs:px-4 sm:px-6 py-3 sm:py-4 hidden lg:table-cell">
                        <div className="text-xs sm:text-sm text-gray-900 line-clamp-2">{getActiveCommissionTypes(rule)}</div>
                      </td>
                      <td className="px-3 xs:px-4 sm:px-6 py-3 sm:py-4">
                        <span className={`px-2 sm:px-3 py-1 sm:py-1.5 inline-flex text-xs font-bold rounded-lg sm:rounded-xl whitespace-nowrap ${
                          rule.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                          {rule.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-3 xs:px-4 sm:px-6 py-3 sm:py-4 hidden md:table-cell">
                        <div className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">
                          {new Date(rule.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-3 xs:px-4 sm:px-6 py-3 sm:py-4">
                        <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                          <Link
                            to={`/commission/view/${rule.partnerId}`}
                            className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm text-blue-600 hover:text-blue-900 font-bold bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-center"
                          >
                            View
                          </Link>
                          <button
                            onClick={() => handleDeleteRule(rule.partnerId)}
                            className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm text-red-600 hover:text-red-900 font-bold bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
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

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="bg-white px-3 xs:px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 gap-3 sm:gap-0">
              <div className="flex-1 flex justify-between sm:hidden w-full">
                <button
                  onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                  disabled={filters.page === 1}
                  className="px-4 py-2 border-2 border-gray-300 text-sm font-bold rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                  disabled={filters.page === pagination.totalPages}
                  className="px-4 py-2 border-2 border-gray-300 text-sm font-bold rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between w-full">
                <div>
                  <p className="text-sm font-bold text-gray-700">
                    Showing page <span className="font-black">{pagination.currentPage}</span> of{" "}
                    <span className="font-black">{pagination.totalPages}</span> ({pagination.totalItems} total)
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px">
                    <button
                      onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                      disabled={filters.page === 1}
                      className="relative inline-flex items-center px-3 sm:px-4 py-2 rounded-l-lg border-2 border-gray-300 bg-white text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                      disabled={filters.page === pagination.totalPages}
                      className="relative inline-flex items-center px-3 sm:px-4 py-2 rounded-r-lg border-2 border-gray-300 bg-white text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
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
    </div>
  );
};

export default CommissionRulesList;
