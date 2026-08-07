import React, { useState, useEffect } from "react";
import ApiBaseUrl from "../constants/apiUrl";

const DEFAULT_PLAY_URL =
  "https://play.google.com/store/apps/details?id=com.madadgaarexpert.app";

const AppVersionSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({
    requiredVersion: "1.0.0",
    latestVersion: "1.0.14",
    forceUpdate: false,
    androidUpdateUrl: DEFAULT_PLAY_URL,
    iosUpdateUrl: "",
    updateMessage: "A new version of Madadgaar is available. Please update the app.",
    forceUpdateMessage:
      "Update app now. This version is no longer supported. Please update from the Play Store to continue.",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const authData = JSON.parse(localStorage.getItem("adminAuth"));
      const token = authData?.token;
      const res = await fetch(`${ApiBaseUrl}/admin/appVersionSettings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.data) {
        setForm({
          requiredVersion: data.data.requiredVersion || "1.0.0",
          latestVersion: data.data.latestVersion || "1.0.14",
          forceUpdate: Boolean(data.data.forceUpdate),
          androidUpdateUrl: data.data.androidUpdateUrl || DEFAULT_PLAY_URL,
          iosUpdateUrl: data.data.iosUpdateUrl || "",
          updateMessage: data.data.updateMessage || "",
          forceUpdateMessage: data.data.forceUpdateMessage || "",
        });
      }
    } catch (err) {
      setToast({ type: "error", message: "Failed to load app version settings" });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!String(form.requiredVersion).trim()) {
      setToast({ type: "error", message: "Required (minimum) version is required" });
      return;
    }
    try {
      setSaving(true);
      const authData = JSON.parse(localStorage.getItem("adminAuth"));
      const token = authData?.token;
      const res = await fetch(`${ApiBaseUrl}/admin/appVersionSettings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          requiredVersion: String(form.requiredVersion).trim(),
          latestVersion: String(form.latestVersion).trim(),
          forceUpdate: Boolean(form.forceUpdate),
          androidUpdateUrl: String(form.androidUpdateUrl).trim() || DEFAULT_PLAY_URL,
          iosUpdateUrl: String(form.iosUpdateUrl).trim(),
          updateMessage: form.updateMessage,
          forceUpdateMessage: form.forceUpdateMessage,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setToast({ type: "success", message: "App version settings saved" });
        if (data.data) {
          setForm((prev) => ({
            ...prev,
            requiredVersion: data.data.requiredVersion,
            latestVersion: data.data.latestVersion,
            forceUpdate: Boolean(data.data.forceUpdate),
            androidUpdateUrl: data.data.androidUpdateUrl,
            iosUpdateUrl: data.data.iosUpdateUrl,
            updateMessage: data.data.updateMessage,
            forceUpdateMessage: data.data.forceUpdateMessage,
          }));
        }
      } else {
        setToast({ type: "error", message: data.message || "Failed to save" });
      }
    } catch (err) {
      setToast({ type: "error", message: "Network error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
            toast.type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="relative overflow-hidden bg-gradient-to-r from-red-600 via-red-500 to-rose-600 rounded-3xl shadow-2xl p-8">
        <div className="relative flex items-center gap-3">
          <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">App Version</h1>
            <p className="text-red-100 text-sm font-medium mt-0.5">
              Force update when mobile app version is below the minimum you set
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
        <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-3 text-sm text-amber-900 leading-relaxed">
          If a user&apos;s installed app version is <strong>lower</strong> than{" "}
          <strong>Required version</strong>, the app shows &quot;Update app now&quot; and opens the Play Store.
          Play Store link:{" "}
          <a
            href={DEFAULT_PLAY_URL}
            target="_blank"
            rel="noreferrer"
            className="underline font-medium text-red-700"
          >
            Madadgaar on Google Play
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Required version (minimum) *
            </label>
            <input
              name="requiredVersion"
              value={form.requiredVersion}
              onChange={handleChange}
              placeholder="e.g. 1.0.14"
              className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500"
              required
            />
            <p className="mt-1 text-xs text-gray-500">Users below this version must update.</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Latest version</label>
            <input
              name="latestVersion"
              value={form.latestVersion}
              onChange={handleChange}
              placeholder="e.g. 1.0.15"
              className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500"
            />
            <p className="mt-1 text-xs text-gray-500">Newest store build (optional soft update).</p>
          </div>
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="forceUpdate"
            checked={form.forceUpdate}
            onChange={handleChange}
            className="size-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
          />
          <span className="text-sm text-gray-700">
            Always force update when an update is available (even if above required)
          </span>
        </label>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Android / Play Store URL</label>
          <input
            name="androidUpdateUrl"
            value={form.androidUpdateUrl}
            onChange={handleChange}
            className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">iOS App Store URL (optional)</label>
          <input
            name="iosUpdateUrl"
            value={form.iosUpdateUrl}
            onChange={handleChange}
            className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Soft update message</label>
          <textarea
            name="updateMessage"
            value={form.updateMessage}
            onChange={handleChange}
            rows={2}
            className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Force update message</label>
          <textarea
            name="forceUpdateMessage"
            value={form.forceUpdateMessage}
            onChange={handleChange}
            rows={2}
            className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-semibold text-sm px-6 py-2.5 transition-colors"
        >
          {saving ? "Saving..." : "Save App Version Settings"}
        </button>
      </form>
    </div>
  );
};

export default AppVersionSettings;
