import React, { useState, useEffect } from 'react';
import ApiBaseUrl from '../constants/apiUrl';
import { useNavigate } from 'react-router-dom';

const OfferItems = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState({ installments: [], loans: [], properties: [], insurance: [] });
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    productType: 'installment',
    productId: '',
    productTitle: '',
    saleEndAt: '',
    displayOrder: 0,
    isActive: true,
  });

  const getAuth = () => JSON.parse(localStorage.getItem('adminAuth') || '{}');
  const headers = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getAuth().token}`,
  });

  const fetchItems = async () => {
    try {
      const res = await fetch(`${ApiBaseUrl}/admin/offer-items`, { headers: headers() });
      const data = await res.json();
      if (data.success) setItems(data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async (type) => {
    try {
      const res = await fetch(`${ApiBaseUrl}/admin/offer-items/products${type ? `?type=${type}` : ''}`, { headers: headers() });
      const data = await res.json();
      if (data.success && data.data) setProducts(data.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    if (modalOpen) fetchProducts(form.productType);
  }, [modalOpen, form.productType]);

  const openAdd = () => {
    setEditingId(null);
    setForm({
      productType: 'installment',
      productId: '',
      productTitle: '',
      saleEndAt: '',
      displayOrder: 0,
      isActive: true,
    });
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditingId(item._id);
    setForm({
      productType: item.productType,
      productId: item.productId,
      productTitle: item.productTitle || '',
      saleEndAt: item.saleEndAt ? new Date(item.saleEndAt).toISOString().slice(0, 16) : '',
      displayOrder: item.displayOrder || 0,
      isActive: item.isActive !== false,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.productId || !form.saleEndAt) {
      alert('Product and Sale end date are required.');
      return;
    }
    try {
      const url = editingId
        ? `${ApiBaseUrl}/admin/offer-items/${editingId}`
        : `${ApiBaseUrl}/admin/offer-items`;
      const method = editingId ? 'PUT' : 'POST';
      const body = {
        productType: form.productType,
        productId: form.productId,
        productTitle: form.productTitle,
        saleEndAt: new Date(form.saleEndAt).toISOString(),
        displayOrder: Number(form.displayOrder) || 0,
        isActive: form.isActive,
      };
      if (!editingId) body.saleEndAt = new Date(form.saleEndAt).toISOString();
      const res = await fetch(url, { method, headers: headers(), body: JSON.stringify(body) });
      const data = await res.json();
      if (data.success) {
        setModalOpen(false);
        fetchItems();
      } else {
        alert(data.message || 'Failed');
      }
    } catch (err) {
      alert('Request failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this offer item?')) return;
    try {
      const res = await fetch(`${ApiBaseUrl}/admin/offer-items/${id}`, { method: 'DELETE', headers: headers() });
      const data = await res.json();
      if (data.success) fetchItems();
      else alert(data.message || 'Delete failed');
    } catch (err) {
      alert('Delete failed');
    }
  };

  const productList = products[form.productType] || [];
  const selectedProduct = productList.find((p) => p.id === form.productId);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Offer Items</h1>
          <p className="text-sm text-gray-500">Mark existing products as on offer and set sale end time (used for &quot;Sale Ending in&quot; countdown).</p>
        </div>
        <button
          onClick={openAdd}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
        >
          Add Offer Item
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : items.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-500">
          <p>No offer items yet. Add a product to show it as on offer with a sale end time.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left p-3 font-semibold text-gray-700">Type</th>
                <th className="text-left p-3 font-semibold text-gray-700">Product</th>
                <th className="text-left p-3 font-semibold text-gray-700">Sale ends</th>
                <th className="text-left p-3 font-semibold text-gray-700">Status</th>
                <th className="text-right p-3 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-3 capitalize">{item.productType}</td>
                  <td className="p-3">{item.productTitle || item.productId}</td>
                  <td className="p-3">{item.saleEndAt ? new Date(item.saleEndAt).toLocaleString() : '—'}</td>
                  <td className="p-3">
                    <span className={item.isActive ? 'text-green-600 font-medium' : 'text-gray-400'}>
                      {item.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button onClick={() => openEdit(item)} className="text-blue-600 hover:underline mr-3">Edit</button>
                    <button onClick={() => handleDelete(item._id)} className="text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">{editingId ? 'Edit Offer Item' : 'Add Offer Item'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Product type</label>
                <select
                  value={form.productType}
                  onChange={(e) => setForm({ ...form, productType: e.target.value, productId: '' })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                >
                  <option value="installment">Installment</option>
                  <option value="loan">Loan</option>
                  <option value="property">Property</option>
                  <option value="insurance">Insurance</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Product</label>
                <select
                  value={form.productId}
                  onChange={(e) => {
                    const p = productList.find((x) => x.id === e.target.value);
                    setForm({ ...form, productId: e.target.value, productTitle: p?.title || '' });
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                >
                  <option value="">Select product</option>
                  {productList.map((p) => (
                    <option key={p.id} value={p.id}>{p.title || p.id}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Product title (optional)</label>
                <input
                  type="text"
                  value={form.productTitle}
                  onChange={(e) => setForm({ ...form, productTitle: e.target.value })}
                  placeholder={selectedProduct?.title}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Sale ends at</label>
                <input
                  type="datetime-local"
                  value={form.saleEndAt}
                  onChange={(e) => setForm({ ...form, saleEndAt: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Display order</label>
                <input
                  type="number"
                  value={form.displayOrder}
                  onChange={(e) => setForm({ ...form, displayOrder: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              {editingId && (
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  />
                  <span className="text-sm">Active</span>
                </label>
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-2 border border-gray-300 rounded-lg font-medium">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700">
                  {editingId ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfferItems;
