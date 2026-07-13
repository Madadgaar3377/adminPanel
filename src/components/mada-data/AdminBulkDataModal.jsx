import React, { useState, useEffect, useCallback } from 'react';
import { X, Download, Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader2, History } from 'lucide-react';
import ApiBaseUrl from '../../constants/apiUrl';
import { getGroupedCategories } from '../../constants/productCategories';

const UPLOAD_MODES = [
  { value: 'cash', label: 'Cash only' },
  { value: 'cash_installments', label: 'Cash + Installments' },
  { value: 'installments_only', label: 'Installments only' },
];

const authToken = () => {
  const auth = JSON.parse(localStorage.getItem('adminAuth') || '{}');
  return auth.token;
};

const AdminBulkDataModal = ({ partner, onClose }) => {
  const [tab, setTab] = useState('upload');
  const [step, setStep] = useState(1);
  const [action, setAction] = useState('download');
  const [category, setCategory] = useState('');
  const [uploadMode, setUploadMode] = useState('cash_installments');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [job, setJob] = useState(null);
  const [history, setHistory] = useState([]);

  const token = authToken();
  const grouped = getGroupedCategories();
  const partnerId = partner?.userId || partner?._id;

  const downloadJobFile = async (jobId, filename) => {
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

  const loadHistory = useCallback(async () => {
    if (!token || !partnerId) return;
    try {
      const res = await fetch(`${ApiBaseUrl}/mada-data/jobs?partnerId=${encodeURIComponent(partnerId)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setHistory(data.data || []);
    } catch (_) {
      /* ignore */
    }
  }, [token, partnerId]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const pollJob = useCallback(async (jobId) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${ApiBaseUrl}/mada-data/jobs/${jobId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setJob(data.data);
          if (data.data.status === 'completed' || data.data.status === 'failed') {
            clearInterval(interval);
            loadHistory();
          }
        }
      } catch (err) {
        clearInterval(interval);
        setError(err.message);
      }
    }, 2000);
  }, [token, loadHistory]);

  useEffect(() => {
    if (job?.jobId && (job.status === 'queued' || job.status === 'processing')) {
      pollJob(job.jobId);
    }
  }, [job?.jobId, job?.status, pollJob]);

  const handleDownload = async () => {
    if (!category) return setError('Select a category');
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ category, uploadMode });
      const res = await fetch(`${ApiBaseUrl}/mada-data/installments/template?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `madadgaar-${category}-${uploadMode}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!category || !file) return setError('Category and file required');
    setLoading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('category', category);
      fd.append('uploadMode', uploadMode);
      fd.append('partnerId', partnerId);
      const res = await fetch(`${ApiBaseUrl}/mada-data/installments/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setJob({ jobId: data.jobId, status: data.status, progress: 0 });
      setStep(3);
      setTab('upload');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/60" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b flex justify-between items-center">
          <div>
            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Bulk Data</h3>
            <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest">{partner?.name}</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b">
          {['upload', 'history'].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => { setTab(t); setStep(t === 'upload' ? 1 : 1); }}
              className={`flex-1 py-3 text-xs font-black uppercase tracking-widest ${tab === t ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-400'}`}
            >
              {t === 'upload' ? 'Upload' : 'History'}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {tab === 'history' ? (
            <div className="space-y-3">
              {history.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">No import jobs yet</p>
              ) : (
                history.map((h) => (
                  <div key={h._id} className="p-4 border rounded-2xl flex justify-between items-center gap-4">
                    <div>
                      <p className="font-bold text-sm text-gray-900 capitalize">{h.status}</p>
                      <p className="text-xs text-gray-500">{h.category} · {h.uploadMode}</p>
                      <p className="text-xs text-gray-400">{new Date(h.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="text-right text-xs">
                      <p className="text-emerald-600 font-bold">{h.successCount || 0} ok</p>
                      <p className="text-red-600 font-bold">{h.failCount || 0} fail</p>
                      {(h.resultFileUrl || h.resultFileKey) && !h.resultFileDeleted && (
                        <button
                          type="button"
                          onClick={() => downloadJobFile(h._id, `madadgaar-import-${h._id}.xlsx`).catch((e) => setError(e.message))}
                          className="text-red-600 underline"
                        >
                          Report
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : step === 1 ? (
            <div className="grid grid-cols-2 gap-4">
              <button type="button" onClick={() => { setAction('download'); setStep(2); }} className="p-6 border-2 rounded-2xl hover:border-red-600 text-left">
                <Download className="w-8 h-8 text-red-600 mb-2" />
                <p className="font-bold">Download template</p>
              </button>
              <button type="button" onClick={() => { setAction('upload'); setStep(2); }} className="p-6 border-2 rounded-2xl hover:border-red-600 text-left">
                <Upload className="w-8 h-8 text-red-600 mb-2" />
                <p className="font-bold">Upload for partner</p>
              </button>
            </div>
          ) : step === 2 ? (
            <div className="space-y-4">
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border rounded-xl p-3">
                <option value="">Category</option>
                {Object.entries(grouped).map(([group, cats]) => (
                  <optgroup key={group} label={group}>
                    {cats.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </optgroup>
                ))}
              </select>
              <select value={uploadMode} onChange={(e) => setUploadMode(e.target.value)} className="w-full border rounded-xl p-3">
                {UPLOAD_MODES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
              {action === 'upload' && (
                <input type="file" accept=".xlsx" onChange={(e) => setFile(e.target.files?.[0] || null)} className="w-full text-sm" />
              )}
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex gap-2">
                <button type="button" onClick={() => setStep(1)} className="flex-1 py-3 border rounded-xl font-bold">Back</button>
                <button type="button" disabled={loading} onClick={action === 'download' ? handleDownload : handleUpload} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold">
                  {loading ? '…' : action === 'download' ? 'Download' : 'Upload'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-center py-4">
              {job?.status === 'processing' || job?.status === 'queued' ? (
                <Loader2 className="w-10 h-10 animate-spin text-red-600 mx-auto" />
              ) : job?.status === 'completed' ? (
                <CheckCircle className="w-10 h-10 text-red-600 mx-auto" />
              ) : (
                <AlertCircle className="w-10 h-10 text-red-600 mx-auto" />
              )}
              <p className="font-bold capitalize">{job?.status}</p>
              <p className="text-sm text-gray-600">{job?.successCount || 0} succeeded · {job?.failCount || 0} failed</p>
              {job?.hasDownload && (
                <button
                  type="button"
                  onClick={() => downloadJobFile(job.jobId || job._id, 'madadgaar-import-result.xlsx').catch((e) => setError(e.message))}
                  className="text-red-600 text-sm font-bold underline"
                >
                  Download report
                </button>
              )}
              <button type="button" onClick={onClose} className="w-full py-3 bg-red-600 text-white rounded-xl font-bold">Done</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminBulkDataModal;
