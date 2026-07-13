import React, { useState } from 'react';
import ApiBaseUrl from '../../constants/apiUrl';

const ADMIN_EXPORT_TYPES = [
  { value: 'installments', label: 'Partner installment listings', needsPartner: true, needsCategory: true },
  { value: 'partners', label: 'All partners', needsPartner: false, needsCategory: false },
  { value: 'agents', label: 'All agents', needsPartner: false, needsCategory: false },
  { value: 'finance', label: 'Finance & commissions', needsPartner: false, needsCategory: true },
  { value: 'cases', label: 'Cases & track record', needsPartner: false, needsCategory: true },
];

const CATEGORY_OPTIONS = [
  { value: '', label: 'All categories' },
  { value: 'Installment', label: 'Installment' },
  { value: 'Property', label: 'Property' },
  { value: 'Loan', label: 'Loan' },
  { value: 'Insurance', label: 'Insurance' },
];

const INSTALLMENT_CATEGORIES = [
  { value: '', label: 'All product categories' },
  { value: 'laptops', label: 'Laptops' },
  { value: 'smartphones', label: 'Smartphones' },
  { value: 'air_conditioners', label: 'Air Conditioners' },
  { value: 'cars', label: 'Cars' },
];

const AdminExportModal = ({ onClose, partners = [], defaultPartnerId = '' }) => {
  const [exportType, setExportType] = useState('installments');
  const [partnerId, setPartnerId] = useState(defaultPartnerId);
  const [category, setCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  const selected = ADMIN_EXPORT_TYPES.find((t) => t.value === exportType) || ADMIN_EXPORT_TYPES[0];

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
    if (selected.needsPartner && !partnerId) {
      setError('Select a partner for this export');
      return;
    }

    setLoading(true);
    setError('');
    setStatus('Starting export…');

    try {
      const token = getToken();
      const params = new URLSearchParams({ startDate, endDate });
      if (partnerId) params.set('partnerId', partnerId);
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
              await downloadJobFile(data.jobId, `madadgaar-${exportType}-export.xlsx`);
              setStatus('Download complete (removed from server storage)');
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

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/60" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Download Records</h3>
            <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest">Mada Data Export</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl text-gray-500">✕</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Export type</label>
            <select
              value={exportType}
              onChange={(e) => { setExportType(e.target.value); setCategory(''); }}
              className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm font-semibold"
            >
              {ADMIN_EXPORT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {selected.needsPartner && (
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Partner *</label>
              <select
                value={partnerId}
                onChange={(e) => setPartnerId(e.target.value)}
                className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm"
              >
                <option value="">Select partner</option>
                {partners.map((p) => (
                  <option key={p.userId || p._id} value={p.userId || p._id}>
                    {p.name} ({p.userId || p._id})
                  </option>
                ))}
              </select>
            </div>
          )}

          {selected.needsCategory && exportType === 'installments' && (
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Product category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm">
                {INSTALLMENT_CATEGORIES.map((c) => (
                  <option key={c.value || 'all'} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          )}

          {selected.needsCategory && exportType !== 'installments' && (
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Case category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm">
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c.value || 'all'} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">From</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">To</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm" />
            </div>
          </div>

          {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
          {status && <p className="text-sm text-gray-600">{status}</p>}

          <button
            type="button"
            disabled={loading}
            onClick={handleExport}
            className="w-full py-4 bg-red-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-black transition-colors disabled:opacity-50"
          >
            {loading ? 'Exporting…' : 'Export xlsx'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminExportModal;
