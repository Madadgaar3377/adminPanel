import React, { useState, useEffect } from "react";
import ApiBaseUrl from "../constants/apiUrl";

const TaxSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({
    gstPercent: 0,
    saleTaxPercent: 0,
    currencyCode: "PKR",
    additionalTaxes: [],
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const authData = JSON.parse(localStorage.getItem("adminAuth"));
      const token = authData?.token;
      const res = await fetch(`${ApiBaseUrl}/admin/taxSettings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.data) {
        setForm({
          gstPercent: data.data.gstPercent ?? 0,
          saleTaxPercent: data.data.saleTaxPercent ?? 0,
          currencyCode: data.data.currencyCode || "PKR",
          additionalTaxes: Array.isArray(data.data.additionalTaxes) ? data.data.additionalTaxes : [],
        });
      }
    } catch (err) {
      setToast({ type: "error", message: "Failed to load tax settings" });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const num = name === "gstPercent" || name === "saleTaxPercent" ? parseFloat(value) || 0 : value;
    setForm((prev) => ({ ...prev, [name]: num }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const authData = JSON.parse(localStorage.getItem("adminAuth"));
      const token = authData?.token;
      const res = await fetch(`${ApiBaseUrl}/admin/taxSettings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          gstPercent: Number(form.gstPercent),
          saleTaxPercent: Number(form.saleTaxPercent),
          currencyCode: form.currencyCode,
          additionalTaxes: form.additionalTaxes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setToast({ type: "success", message: "Tax settings saved successfully" });
      } else {
        setToast({ type: "error", message: data.message || "Failed to save" });
      }
    } catch (err) {
      setToast({ type: "error", message: "Network error" });
    } finally {
      setSaving(false);
    }
  };

  const addAdditionalTax = () => {
    setForm((prev) => ({
      ...prev,
      additionalTaxes: [...prev.additionalTaxes, { name: "", percent: 0, description: "" }],
    }));
  };

  const updateAdditionalTax = (index, field, value) => {
    setForm((prev) => {
      const next = [...prev.additionalTaxes];
      next[index] = { ...next[index], [field]: field === "percent" ? parseFloat(value) || 0 : value };
      return { ...prev, additionalTaxes: next };
    });
  };

  const removeAdditionalTax = (index) => {
    setForm((prev) => ({
      ...prev,
      additionalTaxes: prev.additionalTaxes.filter((_, i) => i !== index),
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-red-600 via-red-500 to-rose-600 rounded-3xl shadow-2xl p-8">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-40 h-40 bg-white opacity-5 rounded-full blur-3xl"></div>
        <div className="relative flex items-center gap-3">
          <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Tax Settings</h1>
            <p className="text-red-100 text-sm font-medium mt-0.5">GST %, Sale tax % and other tax configuration</p>
          </div>
        </div>
      </div>

      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-xl shadow-lg ${
            toast.type === "success" ? "bg-green-500" : "bg-red-500"
          } text-white`}
        >
          {toast.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 mb-2">GST %</label>
            <input
              type="number"
              name="gstPercent"
              min={0}
              max={100}
              step={0.01}
              value={form.gstPercent}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-0 bg-gray-50 focus:bg-white transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 mb-2">Sale Tax %</label>
            <input
              type="number"
              name="saleTaxPercent"
              min={0}
              max={100}
              step={0.01}
              value={form.saleTaxPercent}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-0 bg-gray-50 focus:bg-white transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 mb-2">Currency Code</label>
          <input
            type="text"
            name="currencyCode"
            value={form.currencyCode}
            onChange={handleChange}
            className="w-full max-w-xs px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-0 bg-gray-50 focus:bg-white transition-all"
            placeholder="e.g. PKR"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold uppercase tracking-wide text-gray-700">Additional Taxes</label>
            <button
              type="button"
              onClick={addAdditionalTax}
              className="text-sm font-semibold text-red-600 hover:text-red-700"
            >
              + Add
            </button>
          </div>
          {form.additionalTaxes.length === 0 ? (
            <p className="text-gray-500 text-sm">No additional taxes. Click &quot;Add&quot; to add one.</p>
          ) : (
            <div className="space-y-3">
              {form.additionalTaxes.map((tax, index) => (
                <div key={index} className="flex flex-wrap items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <input
                    type="text"
                    placeholder="Name"
                    value={tax.name}
                    onChange={(e) => updateAdditionalTax(index, "name", e.target.value)}
                    className="flex-1 min-w-[120px] px-3 py-2 border border-gray-200 rounded-lg"
                  />
                  <input
                    type="number"
                    placeholder="%"
                    min={0}
                    max={100}
                    step={0.01}
                    value={tax.percent}
                    onChange={(e) => updateAdditionalTax(index, "percent", e.target.value)}
                    className="w-20 px-3 py-2 border border-gray-200 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Description"
                    value={tax.description || ""}
                    onChange={(e) => updateAdditionalTax(index, "description", e.target.value)}
                    className="flex-1 min-w-[140px] px-3 py-2 border border-gray-200 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeAdditionalTax(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl hover:from-red-700 hover:to-rose-700 font-bold shadow-lg shadow-red-200 active:scale-95 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Tax Settings"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaxSettings;
