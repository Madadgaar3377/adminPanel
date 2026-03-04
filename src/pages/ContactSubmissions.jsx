import React, { useEffect, useState } from "react";
import ApiBaseUrl from "../constants/apiUrl";
import Pagination from "../compontents/Pagination";

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "new", label: "New" },
  { value: "in_progress", label: "In progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

const ContactSubmissions = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [statusFilter, setStatusFilter] = useState("all");
  const [showAll, setShowAll] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState(null);

  const [selectedContact, setSelectedContact] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const authData = (() => {
    try {
      return JSON.parse(localStorage.getItem("adminAuth")) || null;
    } catch {
      return null;
    }
  })();

  const authHeaders = authData
    ? {
        Authorization: `Bearer ${authData.token}`,
        "Content-Type": "application/json",
      }
    : { "Content-Type": "application/json" };

  const fetchContacts = async (pageToLoad = page) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      params.append("page", pageToLoad.toString());
      params.append("limit", "20");
      params.append("showAll", showAll ? "true" : "false");
      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }

      const res = await fetch(
        `${ApiBaseUrl}/getAllContactSubmissions?${params.toString()}`,
        {
          method: "GET",
          headers: authHeaders,
        }
      );
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to load contact submissions");
      }

      setContacts(data.data || []);
      if (data.pagination) {
        setPage(data.pagination.page || pageToLoad);
        setTotalPages(data.pagination.totalPages || 1);
      } else {
        setTotalPages(1);
      }
    } catch (err) {
      setError(err.message || "Failed to load contact submissions");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${ApiBaseUrl}/getContactStats`, {
        method: "GET",
        headers: authHeaders,
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setStats(data.data || null);
      }
    } catch {
      // Non-critical
    }
  };

  useEffect(() => {
    fetchContacts(1);
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, showAll]);

  const handleMarkSeen = async (contact) => {
    if (!contact?._id || contact.isSeen) return;
    setUpdating(true);
    try {
      const res = await fetch(
        `${ApiBaseUrl}/markContactAsSeen/${contact._id}`,
        {
          method: "PUT",
          headers: authHeaders,
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to mark as seen");
      }

      setContacts((prev) =>
        prev.map((c) =>
          c._id === contact._id ? { ...c, isSeen: true, seenAt: data.data?.seenAt || new Date().toISOString() } : c
        )
      );
      if (selectedContact?._id === contact._id) {
        setSelectedContact((prev) => prev && { ...prev, isSeen: true });
      }
      fetchStats();
    } catch (err) {
      alert(err.message || "Failed to mark as seen");
    } finally {
      setUpdating(false);
    }
  };

  const handleStatusChange = async (contact, newStatus) => {
    if (!contact?._id || !newStatus || newStatus === contact.status) return;
    setUpdating(true);
    try {
      const res = await fetch(
        `${ApiBaseUrl}/updateContactStatus/${contact._id}`,
        {
          method: "PUT",
          headers: authHeaders,
          body: JSON.stringify({ status: newStatus }),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update status");
      }

      setContacts((prev) =>
        prev.map((c) =>
          c._id === contact._id ? { ...c, status: newStatus } : c
        )
      );
      if (selectedContact?._id === contact._id) {
        setSelectedContact((prev) => prev && { ...prev, status: newStatus });
      }
    } catch (err) {
      alert(err.message || "Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (contact) => {
    if (!contact?._id) return;
    if (!window.confirm("Are you sure you want to delete this contact submission?")) {
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch(
        `${ApiBaseUrl}/deleteContactSubmission/${contact._id}`,
        {
          method: "DELETE",
          headers: authHeaders,
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to delete contact submission");
      }

      setContacts((prev) => prev.filter((c) => c._id !== contact._id));
      if (selectedContact?._id === contact._id) {
        setSelectedContact(null);
      }
      fetchStats();
    } catch (err) {
      alert(err.message || "Failed to delete contact submission");
    } finally {
      setDeleting(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchContacts(newPage);
  };

  if (loading && contacts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-red-100 rounded-full mx-auto"></div>
            <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin absolute top-0 left-1/2 -translate-x-1/2"></div>
          </div>
          <p className="mt-4 text-sm font-medium text-gray-600">
            Loading contact submissions...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-4 xs:py-6 sm:py-8 space-y-4 sm:space-y-6">
        {/* Error */}
        {error && (
          <div className="bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-500 rounded-xl p-4 sm:p-5 shadow-sm flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-red-700 font-semibold text-sm sm:text-base">
                {error}
              </p>
            </div>
            <button
              onClick={() => setError("")}
              className="text-red-600 hover:text-red-800 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}

        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-red-600 via-red-500 to-rose-600 rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-40 h-40 bg-white opacity-5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-40 h-40 bg-white opacity-5 rounded-full blur-3xl" />

          <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-6 h-6 sm:w-7 sm:h-7 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div className="min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight truncate">
                    Contact Submissions
                  </h1>
                  <p className="text-red-100 text-xs sm:text-sm font-medium mt-0.5">
                    View and manage “Contact Us” messages sent from the website
                  </p>
                </div>
              </div>
            </div>

            {stats && (
              <div className="grid grid-cols-2 gap-3 text-white text-xs sm:text-sm">
                <div className="bg-white/10 rounded-xl px-3 py-2">
                  <p className="uppercase tracking-wide text-[10px] text-red-100">
                    Unseen
                  </p>
                  <p className="text-lg font-bold">
                    {(stats.unseenCount ?? stats.unseen ?? 0)}
                  </p>
                </div>
                <div className="bg-white/10 rounded-xl px-3 py-2">
                  <p className="uppercase tracking-wide text-[10px] text-red-100">
                    Total
                  </p>
                  <p className="text-lg font-bold">
                    {stats.total ?? 0}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-wrap gap-3">
              <label className="flex items-center gap-2 text-xs sm:text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={showAll}
                  onChange={(e) => setShowAll(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <span>Show all (including seen)</span>
              </label>
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 text-xs sm:text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => fetchContacts(page)}
                disabled={loading}
                className="px-3 py-2 text-xs sm:text-sm rounded-lg border border-gray-300 bg-white hover:bg-gray-50 flex items-center gap-1 disabled:opacity-50"
              >
                <svg
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* List */}
          <div className="lg:col-span-2 bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-100 px-4 sm:px-5 py-3 sm:py-4 flex items-center justify-between">
              <h2 className="text-sm sm:text-base font-semibold text-gray-800">
                Submissions
              </h2>
              <span className="text-xs text-gray-500">
                {contacts.length} item(s)
              </span>
            </div>

            {contacts.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-500">
                No contact submissions found for this filter.
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {contacts.map((contact) => (
                  <button
                    key={contact._id}
                    type="button"
                    onClick={() => {
                      setSelectedContact(contact);
                      if (!contact.isSeen) {
                        handleMarkSeen(contact);
                      }
                    }}
                    className={`w-full text-left px-4 sm:px-5 py-3 sm:py-4 flex items-start gap-3 hover:bg-gray-50 transition ${
                      selectedContact?._id === contact._id
                        ? "bg-red-50/60"
                        : ""
                    }`}
                  >
                    <div className="mt-1">
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold ${
                          contact.isSeen
                            ? "bg-gray-100 text-gray-500"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {contact.name?.charAt(0)?.toUpperCase() || "?"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {contact.subject}
                        </p>
                        <span className="text-[10px] text-gray-400 whitespace-nowrap">
                          {new Date(contact.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 truncate mt-0.5">
                        From {contact.name} · {contact.email}
                      </p>
                      <p className="text-xs text-gray-500 line-clamp-1 mt-1">
                        {contact.body}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {!contact.isSeen && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-semibold">
                            New
                          </span>
                        )}
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[10px] font-medium capitalize">
                          {contact.status || "new"}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="border-t border-gray-100 px-4 sm:px-5 py-3 sm:py-4">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>

          {/* Detail */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-5 lg:p-6">
            {selectedContact ? (
              <>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                      {selectedContact.subject}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(selectedContact.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedContact(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-xs font-semibold text-gray-500">
                      From
                    </p>
                    <p className="text-gray-800">
                      {selectedContact.name}{" "}
                      <span className="text-gray-500">({selectedContact.email})</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500">
                      Message
                    </p>
                    <p className="text-gray-800 whitespace-pre-line">
                      {selectedContact.body}
                    </p>
                  </div>
                  {selectedContact.adminNote && (
                    <div className="border-t border-gray-100 pt-3">
                      <p className="text-xs font-semibold text-gray-500">
                        Admin note
                      </p>
                      <p className="text-gray-700">
                        {selectedContact.adminNote}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={updating || selectedContact.isSeen}
                      onClick={() => handleMarkSeen(selectedContact)}
                      className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs sm:text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Mark as seen
                    </button>
                    <select
                      value={selectedContact.status || "new"}
                      onChange={(e) =>
                        handleStatusChange(selectedContact, e.target.value)
                      }
                      disabled={updating}
                      className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      {STATUS_OPTIONS.filter((s) => s.value !== "all").map(
                        (opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <button
                    type="button"
                    disabled={deleting}
                    onClick={() => handleDelete(selectedContact)}
                    className="text-xs sm:text-sm text-red-600 hover:text-red-800 underline disabled:opacity-50"
                  >
                    Delete submission
                  </button>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-gray-500 text-center">
                <div>
                  <p className="font-semibold mb-1">
                    Select a submission to view details
                  </p>
                  <p className="text-xs text-gray-400">
                    Click on any row in the list to see full message and
                    actions.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactSubmissions;

