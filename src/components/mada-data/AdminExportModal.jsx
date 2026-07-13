import React, { useEffect, useMemo, useState } from 'react';
import ApiBaseUrl from '../../constants/apiUrl';

const PARTNER_RECORD_TYPES = [
  { value: 'installments', label: 'Installment listings', description: 'Products & plans for this partner', categoryType: 'product' },
  { value: 'agents', label: 'Linked agents', description: 'Agents connected to this partner', categoryType: null },
  { value: 'finance', label: 'Finance & commissions', description: 'Commissions for this partner', categoryType: 'case' },
  { value: 'cases', label: 'Cases & track record', description: 'Applications for this partner', categoryType: 'case' },
];

const ALL_PARTNERS_TYPE = {
  value: 'partners',
  label: 'All partners (platform)',
  description: 'Export every partner in the system',
  categoryType: null,
};

const CASE_CATEGORY_OPTIONS = [
  { value: '', label: 'All categories' },
  { value: 'Installment', label: 'Installment' },
  { value: 'Property', label: 'Property' },
  { value: 'Loan', label: 'Loan' },
  { value: 'Insurance', label: 'Insurance' },
];

const PRODUCT_CATEGORY_OPTIONS = [
  { value: '', label: 'All product categories' },
  { value: 'laptops', label: 'Laptops' },
  { value: 'smartphones', label: 'Smartphones' },
  { value: 'air_conditioners', label: 'Air Conditioners' },
  { value: 'cars', label: 'Cars' },
];

const AdminExportModal = ({
  onClose,
  partners = [],
  defaultPartnerId = '',
  partnerOnly = false,
  defaultExportType = 'installments',
}) => {
  const [partnerId, setPartnerId] = useState(defaultPartnerId);
  const [exportType, setExportType] = useState(defaultExportType);
  const [category, setCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  const availableTypes = useMemo(() => {
    if (partnerId) return PARTNER_RECORD_TYPES;
    if (partnerOnly) return PARTNER_RECORD_TYPES;
    return [ALL_PARTNERS_TYPE];
  }, [partnerId, partnerOnly]);

  const selected = availableTypes.find((t) => t.value === exportType) || availableTypes[0];
  const selectedPartner = partners.find((p) => (p.userId || p._id) === partnerId);

  useEffect(() => {
    setPartnerId(defaultPartnerId || '');
  }, [defaultPartnerId]);

  useEffect(() => {
    if (partnerId) {
      if (exportType === 'partners') setExportType('installments');
    } else if (!partnerOnly && exportType !== 'partners') {
      setExportType('partners');
    }
  }, [partnerId, partnerOnly]);

  const getToken = () => {
    const auth = JSON.parse(localStorage.getItem('adminAuth') || '{}');
    return auth.token;
  };

  const downloadJobFile = async (jobId, filename) => {
    const token = getToken();
    const res = await fetch(`${ApiBaseUrl}/mada-data/jobs/${jobId}/download`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Download failed');
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `madadgaar-${jobId}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    if (!startDate || !endDate) {
      setError('Start and end dates are required');
      return;
    }

    const needsPartner = partnerOnly || partnerId || ['installments', 'agents', 'finance', 'cases'].includes(exportType);
    const isPartnerScoped = partnerId && exportType !== 'partners';

    if ((partnerOnly || isPartnerScoped) && !partnerId) {
      setError('Please select a partner first');
      return;
    }

    if (exportType === 'installments' && !partnerId) {
      setError('Installment export requires a partner');
      return;
    }

    setLoading(true);
    setError('');
    setStatus('Starting export…');

    try {
      const token = getToken();
      const params = new URLSearchParams({ startDate, endDate });
      if (partnerId && exportType !== 'partners') params.set('partnerId', partnerId);
      if (category) params.set('category', category);

      const res = await fetch(`${ApiBaseUrl}/mada-data/export/${exportType}?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Export failed');

      setStatus('Generating file…');
      const interval = setInterval(async () => {
        const jobRes = await fetch(`${ApiBaseUrl}/mada-data/jobs/${data.jobId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const jobData = await jobRes.json();
        if (!jobData.success) return;

        const job = jobData.data;
        if (job.status === 'completed') {
          clearInterval(interval);
          setLoading(false);
          setStatus('Downloading…');
          try {
            if (job.hasDownload) {
              const partnerSlug = selectedPartner?.name?.replace(/\s+/g, '-').toLowerCase() || 'partner';
              await downloadJobFile(data.jobId, `madadgaar-${partnerSlug}-${exportType}.xlsx`);
              setStatus('Download complete');
            }
          } catch (dlErr) {
            setError(dlErr.message);
            setStatus('');
          }
        } else if (job.status === 'failed') {
          clearInterval(interval);
          setLoading(false);
          setError(job.errorMessage || 'Export failed');
          setStatus('');
        }
      }, 2000);
    } catch (err) {
      setLoading(false);
      setError(err.message);
      setStatus('');
    }
  };

  const categoryOptions =
    selected.categoryType === 'product' ? PRODUCT_CATEGORY_OPTIONS : CASE_CATEGORY_OPTIONS;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/60" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-5">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {partnerOnly ? 'Download partner records' : 'Download records'}
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">
              {partnerOnly
                ? 'Select record type and date range for this partner'
                : 'Select partner, record type, then export'}
            </p>
          </div>
          <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">✕</button>
        </div>

        <div className="space-y-4">
          {/* Step 1: Partner */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">1. Select partner</p>
            <select
              value={partnerId}
              onChange={(e) => {
                setPartnerId(e.target.value);
                setCategory('');
              }}
              disabled={partnerOnly && !!defaultPartnerId}
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white disabled:bg-gray-100"
            >
              <option value="">Choose a partner…</option>
              {partners.map((p) => (
                <option key={p.userId || p._id} value={p.userId || p._id}>
                  {p.name} — ID {p.userId || p._id}
                </option>
              ))}
            </select>
            {selectedPartner && (
              <p className="text-xs text-gray-600 mt-2">
                Exporting data for <strong>{selectedPartner.name}</strong>
              </p>
            )}
          </div>

          {/* Step 2: Record type */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">2. Record type</p>
            {!partnerId && exportType !== 'partners' && (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2 mb-3">
                Select a partner above to download their installments, agents, finance, or cases.
              </p>
            )}
            <div className="space-y-2">
              {availableTypes.map((type) => (
                <label
                  key={type.value}
                  className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                    !partnerId && type.value !== 'partners'
                      ? 'opacity-50 cursor-not-allowed border-gray-200 bg-gray-100'
                      : exportType === type.value
                        ? 'border-red-500 bg-red-50 cursor-pointer'
                        : 'border-gray-200 bg-white hover:border-gray-300 cursor-pointer'
                  }`}
                >
                  <input
                    type="radio"
                    name="exportType"
                    value={type.value}
                    checked={exportType === type.value}
                    disabled={!partnerId && type.value !== 'partners'}
                    onChange={() => {
                      setExportType(type.value);
                      setCategory('');
                    }}
                    className="mt-1 text-red-600"
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{type.label}</p>
                    <p className="text-xs text-gray-500">{type.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Step 3: Filters */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">3. Filters (optional)</p>

            {selected.categoryType && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white"
                >
                  {categoryOptions.map((c) => (
                    <option key={c.value || 'all'} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">From date *</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">To date *</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm"
                />
              </div>
            </div>
          </div>

          {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
          {status && <p className="text-sm text-gray-600">{status}</p>}

          <button
            type="button"
            disabled={loading}
            onClick={handleExport}
            className="w-full py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Exporting…' : 'Download xlsx'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminExportModal;
