import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { medicineCatalogAPI } from '../utils/api.js';
import { SearchBar, StatusBadge, Pagination, PageSpinner, EmptyState, Modal, Spinner } from '../components/common/index.js';
import toast from 'react-hot-toast';

const CATEGORIES = ['tablet', 'capsule', 'syrup', 'injection', 'drops', 'cream', 'inhaler', 'powder', 'other'];
const CATEGORY_ICONS = { tablet: '💊', capsule: '💊', syrup: '🍯', injection: '💉', drops: '💧', cream: '🧴', inhaler: '🌬', powder: '⚗', other: '📦' };

const emptyForm = { name: '', genericName: '', manufacturer: '', category: 'tablet', price: '', mrp: '', discount: 0, unit: 'strip', strength: '', description: '', requiresPrescription: false, inStock: true, stockQuantity: '', isActive: true };

const MedicineCatalogForm = ({ initial = emptyForm, onSave, onCancel, saving }) => {
  const [form, setForm] = useState(initial);
  const set = (field, val) => setForm(f => ({ ...f, [field]: val }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div className="form-group">
          <label className="form-label">Medicine Name *</label>
          <input className="form-input" placeholder="e.g. Dolo 650" value={form.name} onChange={e => set('name', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Generic Name</label>
          <input className="form-input" placeholder="e.g. Paracetamol" value={form.genericName} onChange={e => set('genericName', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Manufacturer / Company *</label>
          <input className="form-input" placeholder="e.g. Micro Labs Ltd" value={form.manufacturer} onChange={e => set('manufacturer', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Category</label>
          <select className="form-select" value={form.category} onChange={e => set('category', e.target.value)}>
            {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_ICONS[c]} {c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Selling Price (₹) *</label>
          <input className="form-input" type="number" placeholder="e.g. 30" value={form.price} onChange={e => set('price', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">MRP (₹)</label>
          <input className="form-input" type="number" placeholder="e.g. 35" value={form.mrp} onChange={e => set('mrp', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Discount (%)</label>
          <input className="form-input" type="number" min={0} max={100} placeholder="0" value={form.discount} onChange={e => set('discount', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Unit</label>
          <select className="form-select" value={form.unit} onChange={e => set('unit', e.target.value)}>
            {['strip', 'bottle', 'tube', 'vial', 'sachet', 'box', 'piece'].map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Strength / Dosage</label>
          <input className="form-input" placeholder="e.g. 500mg, 250ml" value={form.strength} onChange={e => set('strength', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Stock Quantity</label>
          <input className="form-input" type="number" placeholder="Available units" value={form.stockQuantity} onChange={e => set('stockQuantity', e.target.value)} />
        </div>
        <div className="form-group" style={{ gridColumn: '1/-1' }}>
          <label className="form-label">Description</label>
          <textarea className="form-input" rows={2} placeholder="Brief description of usage..." value={form.description} onChange={e => set('description', e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center', gridColumn: '1/-1' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
            <input type="checkbox" checked={form.requiresPrescription} onChange={e => set('requiresPrescription', e.target.checked)} />
            Requires Prescription
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
            <input type="checkbox" checked={form.inStock} onChange={e => set('inStock', e.target.checked)} />
            In Stock
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
            <input type="checkbox" checked={form.isActive} onChange={e => set('isActive', e.target.checked)} />
            Active (visible to customers)
          </label>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        <button className="btn btn-primary" disabled={!form.name || !form.manufacturer || !form.price || saving}
          onClick={() => onSave(form)}>
          {saving ? <Spinner size={16} color="white" /> : '💊 Save Medicine'}
        </button>
      </div>
    </div>
  );
};

const MedicineCatalog = () => {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['medicine-catalog', page, search, category],
    queryFn: () => medicineCatalogAPI.getAll({ page, limit: 12, search, category }).then(r => r.data.data),
    keepPreviousData: true,
  });

  const createMutation = useMutation({
    mutationFn: (d) => medicineCatalogAPI.create(d),
    onSuccess: () => { toast.success('Medicine added to catalog! 💊'); qc.invalidateQueries(['medicine-catalog']); setShowAdd(false); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to add'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => medicineCatalogAPI.update(id, data),
    onSuccess: () => { toast.success('Medicine updated!'); qc.invalidateQueries(['medicine-catalog']); setEditItem(null); },
    onError: (e) => toast.error(e.response?.data?.message || 'Update failed'),
  });

  const toggleMutation = useMutation({
    mutationFn: (id) => medicineCatalogAPI.toggle(id),
    onSuccess: () => { toast.success('Status updated'); qc.invalidateQueries(['medicine-catalog']); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => medicineCatalogAPI.delete(id),
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries(['medicine-catalog']); setDeleteConfirm(null); },
  });

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, fontFamily: 'var(--font-display)' }}>💊 Medicine Catalog</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 4, fontSize: 14 }}>
            Manage medicines available for customer ordering. Customers order from this catalog at the fixed price you set.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add Medicine</button>
      </div>

      {/* Info Banner */}
      <div style={{ background: 'linear-gradient(135deg,#EDE9FE,#DBEAFE)', border: '1px solid #C4B5FD', borderRadius: 'var(--radius)', padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 20 }}>ℹ️</span>
        <span style={{ fontSize: 13, color: '#4C1D95' }}>
          <strong>How it works:</strong> Medicines you add here appear in the customer portal. Customers can browse and order them at the exact price you set — they cannot modify prices.
        </span>
      </div>

      <div className="card">
        {/* Filters */}
        <div className="card-header">
          <h3 className="card-title">All Medicines ({data?.total || 0})</h3>
          <div style={{ display: 'flex', gap: 10 }}>
            <SearchBar value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search medicines..." />
            <select className="form-select" style={{ width: 160 }} value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}>
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_ICONS[c]} {c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
          </div>
        </div>

        {isLoading ? <PageSpinner /> : !data?.data?.length ? (
          <EmptyState icon="💊" title="No medicines in catalog" description="Add your first medicine to allow customers to order it" />
        ) : (
          <>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Medicine</th>
                    <th>Manufacturer</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>MRP</th>
                    <th>Stock</th>
                    <th>Rx</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map(med => (
                    <tr key={med._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: 10, background: med.isActive ? '#EDE9FE' : 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                            {CATEGORY_ICONS[med.category]}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 14 }}>{med.name}</div>
                            {med.genericName && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{med.genericName} {med.strength && `· ${med.strength}`}</div>}
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{med.manufacturer}</td>
                      <td>
                        <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, background: '#EDE9FE', color: '#5b21b6', fontWeight: 600 }}>
                          {CATEGORY_ICONS[med.category]} {med.category}
                        </span>
                      </td>
                      <td style={{ fontWeight: 800, color: 'var(--success)', fontSize: 15 }}>₹{med.price} <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400 }}>/{med.unit}</span></td>
                      <td style={{ fontSize: 13, color: med.mrp ? 'var(--text-muted)' : 'var(--text-muted)', textDecoration: med.mrp ? 'line-through' : 'none' }}>
                        {med.mrp ? `₹${med.mrp}` : '—'}
                      </td>
                      <td>
                        {med.inStock ? (
                          <span style={{ color: 'var(--success)', fontWeight: 700, fontSize: 13 }}>✓ {med.stockQuantity || 'In Stock'}</span>
                        ) : (
                          <span style={{ color: 'var(--danger)', fontWeight: 600, fontSize: 13 }}>Out of Stock</span>
                        )}
                      </td>
                      <td>
                        {med.requiresPrescription ? <span style={{ fontSize: 12, background: '#FEF3C7', color: '#92400E', padding: '2px 8px', borderRadius: 6, fontWeight: 600 }}>Rx</span> : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                      </td>
                      <td>
                        <button onClick={() => toggleMutation.mutate(med._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                          <StatusBadge status={med.isActive ? 'active' : 'inactive'} />
                        </button>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-ghost btn-sm" title="Edit" onClick={() => setEditItem(med)}>✏️</button>
                          <button className="btn btn-ghost btn-sm" title="Delete" style={{ color: 'var(--danger)' }} onClick={() => setDeleteConfirm(med)}>🗑</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination currentPage={page} totalPages={data.totalPages} onPageChange={setPage} />
          </>
        )}
      </div>

      {/* Add Modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add Medicine to Catalog" size={640}>
        <MedicineCatalogForm onSave={(d) => createMutation.mutate(d)} onCancel={() => setShowAdd(false)} saving={createMutation.isPending} />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editItem} onClose={() => setEditItem(null)} title="Edit Medicine" size={640}>
        {editItem && (
          <MedicineCatalogForm
            initial={{ ...emptyForm, ...editItem }}
            onSave={(d) => updateMutation.mutate({ id: editItem._id, data: d })}
            onCancel={() => setEditItem(null)}
            saving={updateMutation.isPending}
          />
        )}
      </Modal>

      {/* Delete confirm */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Medicine" size={400}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
          Are you sure you want to delete <strong>{deleteConfirm?.name}</strong> from the catalog? Existing orders will not be affected.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
          <button className="btn btn-danger" onClick={() => deleteMutation.mutate(deleteConfirm._id)} disabled={deleteMutation.isPending}>
            {deleteMutation.isPending ? <Spinner size={16} color="white" /> : 'Yes, Delete'}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default MedicineCatalog;
