import React, { useState, useEffect } from "react";
import ApiBaseUrl from "../constants/apiUrl";

const AgentWithdrawals = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [approveModal, setApproveModal] = useState(null);
  const [adminNote, setAdminNote] = useState("");

  const getToken = () => {
    try {
      const auth = JSON.parse(localStorage.getItem("adminAuth"));
      return auth?.token;
    } catch (e) {
      return null;
    }
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const url = statusFilter
        ? `${ApiBaseUrl}/admin/withdrawal/requests?status=${encodeURIComponent(statusFilter)}`
        : `${ApiBaseUrl}/admin/withdrawal/requests`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data?.success && Array.isArray(data.data)) {
        setRequests(data.data);
      } else {
        setRequests([]);
      }
    } catch (err) {
      console.error(err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const handleApprove = async (req) => {
    setActionLoading(req._id);
    try {
      const token = getToken();
      const res = await fetch(`${ApiBaseUrl}/admin/withdrawal/requests/${req._id}/approve`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ adminNote: approveModal?.id === req._id ? adminNote : undefined }),
      });
      const data = await res.json();
      if (data?.success) {
        setApproveModal(null);
        setAdminNote("");
        fetchRequests();
        alert(data.message || "Approved. Amount deducted from agent wallet.");
      } else {
        alert(data?.message || "Failed to approve.");
      }
    } catch (err) {
      alert(err.message || "Request failed.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (req) => {
    setActionLoading(req._id);
    try {
      const token = getToken();
      const res = await fetch(`${ApiBaseUrl}/admin/withdrawal/requests/${req._id}/reject`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ adminNote: rejectModal?.id === req._id ? adminNote : undefined }),
      });
      const data = await res.json();
      if (data?.success) {
        setRejectModal(null);
        setAdminNote("");
        fetchRequests();
        alert(data.message || "Rejected.");
      } else {
        alert(data?.message || "Failed to reject.");
      }
    } catch (err) {
      alert(err.message || "Request failed.");
    } finally {
      setActionLoading(null);
    }
  };

  const openApproveModal = (r) => {
    setApproveModal({ id: r._id, request: r });
    setAdminNote("");
  };
  const openRejectModal = (r) => {
    setRejectModal({ id: r._id, request: r });
    setAdminNote("");
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Agent Withdrawal Requests</h1>
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <button
            onClick={fetchRequests}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-sm transition"
          >
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-600" />
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
          No withdrawal requests found.
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Agent</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Bank details</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Note</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {requests.map((r) => (
                  <tr key={r._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{r.agentName || r.agentId || "—"}</p>
                      <p className="text-xs text-gray-500">{r.agentEmail || ""}</p>
                      {r.agentWalletBalance != null && (
                        <p className="text-xs text-gray-500">Wallet: PKR {Number(r.agentWalletBalance).toLocaleString()}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-800">
                      PKR {Number(r.amount).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <p>{r.bankName || "—"}</p>
                      <p>{r.bankAccountName || "—"}</p>
                      <p className="text-gray-500">{r.bankAccountNumber ? `****${String(r.bankAccountNumber).slice(-4)}` : "—"}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-[120px] truncate" title={r.note}>
                      {r.note || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          r.status === "pending"
                            ? "bg-amber-100 text-amber-800"
                            : r.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {r.createdAt ? new Date(r.createdAt).toLocaleString() : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {r.status === "pending" && (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openApproveModal(r)}
                            disabled={actionLoading === r._id}
                            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition"
                          >
                            {actionLoading === r._id ? "..." : "Approve"}
                          </button>
                          <button
                            onClick={() => openRejectModal(r)}
                            disabled={actionLoading === r._id}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition"
                          >
                            {actionLoading === r._id ? "..." : "Reject"}
                          </button>
                        </div>
                      )}
                      {r.status !== "pending" && r.adminNote && (
                        <span className="text-xs text-gray-500" title={r.adminNote}>Admin note</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Approve modal */}
      {approveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Approve withdrawal</h3>
            <p className="text-gray-600 text-sm mb-4">
              PKR {Number(approveModal.request?.amount).toLocaleString()} will be deducted from the agent&apos;s wallet and they will be notified.
            </p>
            <label className="block text-sm font-medium text-gray-700 mb-1">Admin note (optional)</label>
            <input
              type="text"
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 focus:ring-2 focus:ring-red-500"
              placeholder="e.g. Processed via bank transfer"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setApproveModal(null); setAdminNote(""); }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleApprove(approveModal.request)}
                disabled={actionLoading === approveModal.request._id}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium disabled:opacity-50"
              >
                {actionLoading === approveModal.request._id ? "..." : "Approve"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Reject withdrawal</h3>
            <p className="text-gray-600 text-sm mb-4">The agent will be notified. Optionally add a reason below.</p>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason (optional)</label>
            <input
              type="text"
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 focus:ring-2 focus:ring-red-500"
              placeholder="e.g. Invalid bank details"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setRejectModal(null); setAdminNote(""); }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(rejectModal.request)}
                disabled={actionLoading === rejectModal.request._id}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium disabled:opacity-50"
              >
                {actionLoading === rejectModal.request._id ? "..." : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentWithdrawals;
