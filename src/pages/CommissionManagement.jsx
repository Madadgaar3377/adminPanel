import React, { useState, useEffect } from "react";
import ApiBaseUrl from "../constants/apiUrl";

const CommissionManagement = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "",
    category: "",
    commissionStatus: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(""); // "earned", "payable", "paid"
  const [formData, setFormData] = useState({
    dealValue: "",
    paymentReference: "",
    payoutMethod: "Bank Transfer",
    note: "",
  });

  useEffect(() => {
    fetchAssignments();
  }, [filters]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const authData = JSON.parse(localStorage.getItem("adminAuth"));
      const token = authData?.token;

      const response = await fetch(`${ApiBaseUrl}/getAllRequests`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (Array.isArray(data)) {
        setAssignments(data);
      } else if (data.success || data.data) {
        setAssignments(Array.isArray(data.data) ? data.data : []);
      }
    } catch (error) {
      console.error("Error fetching assignments:", error);
      alert("Failed to fetch assignments");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkCommissionEarned = (assignment) => {
    setSelectedAssignment(assignment);
    setModalType("earned");
    setFormData({ dealValue: "", note: "" });
    setShowModal(true);
  };

  const handleMarkCommissionPayable = (assignment) => {
    setSelectedAssignment(assignment);
    setModalType("payable");
    setFormData({ note: "" });
    setShowModal(true);
  };

  const handleMarkCommissionPaid = (assignment) => {
    setSelectedAssignment(assignment);
    setModalType("paid");
    setFormData({ paymentReference: "", payoutMethod: "Bank Transfer", note: "" });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    try {
      const authData = JSON.parse(localStorage.getItem("adminAuth"));
      const token = authData?.token;

      if (modalType === "earned" || modalType === "payable") {
        const action = modalType === "earned" ? "commissionEarned" : "commissionPayable";
        const response = await fetch(`${ApiBaseUrl}/markAsDoneAndCalculateCommission`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            applicationId: selectedAssignment.applicationId,
            action: action,
            dealValue: modalType === "earned" ? parseFloat(formData.dealValue) : undefined,
            note: formData.note,
          }),
        });

        const data = await response.json();
        if (data.success) {
          alert(data.message);
          setShowModal(false);
          fetchAssignments();
        } else {
          alert(data.message || "Failed to update commission");
        }
      } else if (modalType === "paid") {
        const response = await fetch(`${ApiBaseUrl}/markCommissionAsPaid`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            applicationId: selectedAssignment.applicationId,
            paymentReference: formData.paymentReference,
            payoutMethod: formData.payoutMethod,
          }),
        });

        const data = await response.json();
        if (data.success) {
          alert(data.message);
          setShowModal(false);
          fetchAssignments();
        } else {
          alert(data.message || "Failed to mark commission as paid");
        }
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred");
    }
  };

  const getCommissionStatusColor = (status) => {
    const colors = {
      "Not Earned": "bg-gray-100 text-gray-800",
      "Earned": "bg-blue-100 text-blue-800",
      "Pending": "bg-yellow-100 text-yellow-800",
      "Paid": "bg-green-100 text-green-800",
      "Reversed": "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const filteredAssignments = assignments.filter((item) => {
    const matchesSearch =
      item.applicationId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.agentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filters.status || item.status === filters.status;
    const matchesCategory = !filters.category || item.category === filters.category;
    const matchesCommissionStatus =
      !filters.commissionStatus ||
      item.commissionInfo?.commissionStatus === filters.commissionStatus;
    return matchesSearch && matchesStatus && matchesCategory && matchesCommissionStatus;
  });

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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight truncate">Commission Management</h1>
                  <p className="text-red-100 text-xs sm:text-sm font-medium mt-0.5">Manage agent commissions and payments</p>
                </div>
              </div>
            </div>
            <button
              onClick={fetchAssignments}
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
            <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Application ID, Agent, Category..."
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm sm:text-base"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm sm:text-base"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm sm:text-base"
            >
              <option value="">All Categories</option>
              <option value="Property">Property</option>
              <option value="Installment">Installment</option>
              <option value="Loan">Loan</option>
              <option value="Insurance">Insurance</option>
            </select>
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
              Commission Status
            </label>
            <select
              value={filters.commissionStatus}
              onChange={(e) =>
                setFilters({ ...filters, commissionStatus: e.target.value })
              }
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm sm:text-base"
            >
              <option value="">All Commission Statuses</option>
              <option value="Not Earned">Not Earned</option>
              <option value="Earned">Earned</option>
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
            </select>
          </div>
        </div>
      </div>

        {/* Assignments Table */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto -mx-3 xs:-mx-4 sm:mx-0">
            <table className="min-w-full divide-y divide-gray-200 min-w-[640px]">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                <tr>
                  <th className="px-3 xs:px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">Application</th>
                  <th className="px-3 xs:px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider hidden md:table-cell">Agent</th>
                  <th className="px-3 xs:px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">Category</th>
                  <th className="px-3 xs:px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">Commission</th>
                  <th className="px-3 xs:px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-3 xs:px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredAssignments.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-sm font-bold text-gray-500">No assignments found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAssignments.map((item) => (
                    <tr key={item._id} className="hover:bg-gradient-to-r hover:from-red-50/50 hover:to-rose-50/50 transition-all duration-300">
                      <td className="px-3 xs:px-4 sm:px-6 py-3 sm:py-4">
                        <div className="text-sm font-bold text-gray-900 truncate">{item.applicationId || "N/A"}</div>
                      </td>
                      <td className="px-3 xs:px-4 sm:px-6 py-3 sm:py-4 hidden md:table-cell">
                        <div className="text-sm text-gray-900 truncate">{item.agentId || "N/A"}</div>
                      </td>
                      <td className="px-3 xs:px-4 sm:px-6 py-3 sm:py-4">
                        <span className="px-2 sm:px-3 py-1 sm:py-1.5 inline-flex text-xs font-bold rounded-lg sm:rounded-xl bg-blue-100 text-blue-800 whitespace-nowrap">
                          {item.category || "N/A"}
                        </span>
                      </td>
                      <td className="px-3 xs:px-4 sm:px-6 py-3 sm:py-4">
                        <div className="text-sm font-bold text-gray-900">
                          PKR {item.commissionInfo?.eligibleCommission?.toLocaleString() || "0"}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {item.commissionInfo?.commissionStatus || "Not Earned"}
                        </div>
                      </td>
                      <td className="px-3 xs:px-4 sm:px-6 py-3 sm:py-4">
                        <span className={`px-2 sm:px-3 py-1 sm:py-1.5 inline-flex text-xs font-bold rounded-lg sm:rounded-xl whitespace-nowrap ${getCommissionStatusColor(
                          item.commissionInfo?.commissionStatus || "Not Earned"
                        )}`}>
                          {item.commissionInfo?.commissionStatus || "Not Earned"}
                        </span>
                      </td>
                      <td className="px-3 xs:px-4 sm:px-6 py-3 sm:py-4">
                        <div className="flex flex-col gap-1 sm:gap-2">
                          {!item.commissionInfo?.commissionEarned && (
                            <button
                              onClick={() => handleMarkCommissionEarned(item)}
                              className="text-left px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm text-blue-600 hover:text-blue-900 font-bold bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                            >
                              Mark Earned
                            </button>
                          )}
                          {item.commissionInfo?.commissionEarned &&
                            !item.commissionInfo?.commissionPayable && (
                              <button
                                onClick={() => handleMarkCommissionPayable(item)}
                                className="text-left px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm text-yellow-600 hover:text-yellow-900 font-bold bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors"
                              >
                                Mark Payable
                              </button>
                            )}
                          {item.commissionInfo?.commissionPayable &&
                            item.commissionInfo?.commissionStatus === "Pending" && (
                              <button
                                onClick={() => handleMarkCommissionPaid(item)}
                                className="text-left px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm text-green-600 hover:text-green-900 font-bold bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                              >
                                Mark Paid
                              </button>
                            )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 xs:p-4">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-4 sm:p-6 lg:p-8">
                <h3 className="text-lg sm:text-xl font-black text-gray-900 mb-4 sm:mb-6">
                  {modalType === "earned"
                    ? "Mark Commission as Earned"
                    : modalType === "payable"
                    ? "Mark Commission as Payable"
                    : "Mark Commission as Paid"}
                </h3>
                <div className="space-y-4 sm:space-y-5">
                  {modalType === "earned" && (
                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                        Deal Value (PKR) *
                      </label>
                      <input
                        type="number"
                        value={formData.dealValue}
                        onChange={(e) =>
                          setFormData({ ...formData, dealValue: e.target.value })
                        }
                        placeholder="Enter deal value"
                        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm sm:text-base"
                        required
                      />
                    </div>
                  )}
                  {modalType === "paid" && (
                    <>
                      <div>
                        <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                          Payment Reference *
                        </label>
                        <input
                          type="text"
                          value={formData.paymentReference}
                          onChange={(e) =>
                            setFormData({ ...formData, paymentReference: e.target.value })
                          }
                          placeholder="Enter payment reference"
                          className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm sm:text-base"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                          Payout Method *
                        </label>
                        <select
                          value={formData.payoutMethod}
                          onChange={(e) =>
                            setFormData({ ...formData, payoutMethod: e.target.value })
                          }
                          className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm sm:text-base"
                        >
                          <option value="Bank Transfer">Bank Transfer</option>
                          <option value="Wallet">Wallet</option>
                          <option value="Cash">Cash</option>
                        </select>
                      </div>
                    </>
                  )}
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Note</label>
                    <textarea
                      value={formData.note}
                      onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                      placeholder="Additional notes..."
                      rows="3"
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm sm:text-base resize-none"
                    ></textarea>
                  </div>
                </div>
                <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 sm:px-6 py-2 sm:py-2.5 border-2 border-gray-300 rounded-lg sm:rounded-xl text-gray-700 hover:bg-gray-50 font-bold text-sm sm:text-base transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg sm:rounded-xl hover:from-red-700 hover:to-rose-700 font-bold text-sm sm:text-base transition-all shadow-lg hover:shadow-xl active:scale-95"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommissionManagement;
