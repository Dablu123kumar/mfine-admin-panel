// ─── Lab Tests Page ───────────────────────────────────────────────────────────
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { labTestsAPI, medicinesAPI, prescriptionsAPI, specialitiesAPI, usersAPI, reportsAPI, notificationsAPI } from '../utils/api.js';
import { SearchBar, StatusBadge, Pagination, SelectFilter, AvatarName, PageSpinner, EmptyState, Modal, Spinner, ConfirmDialog } from '../components/common/index.js';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.js';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

// Shared table page builder
const ResourcePage = ({ queryKey, fetcher, columns, title, icon, statusOptions = [] }) => {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: [queryKey, page, search, status],
    queryFn: () => fetcher({ page, limit: 10, search, status }).then(r => r.data),
    keepPreviousData: true,
  });

  return (
    <div className="fade-in">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">{title} ({data?.total || 0})</h3>
          <div style={{ display: 'flex', gap: 10 }}>
            <SearchBar value={search} onChange={v => { setSearch(v); setPage(1); }} />
            {statusOptions.length > 0 && <SelectFilter value={status} onChange={v => { setStatus(v); setPage(1); }} options={statusOptions} />}
          </div>
        </div>
        {isLoading ? <PageSpinner /> : !data?.data?.length ? <EmptyState icon={icon} title={`No ${title.toLowerCase()} found`} /> : (
          <>
            <div className="table-container">
              <table className="table">
                <thead><tr>{columns.map(c => <th key={c.key}>{c.label}</th>)}</tr></thead>
                <tbody>
                  {data.data.map(item => (
                    <tr key={item._id}>
                      {columns.map(c => (
                        <td key={c.key}>{c.render ? c.render(item) : item[c.key]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination currentPage={page} totalPages={data.totalPages} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
};

// ─── Lab Tests ────────────────────────────────────────────────────────────────
export const LabTests = () => ResourcePage({
  queryKey: 'labtests', fetcher: labTestsAPI.getAll,
  title: 'Lab Test Orders', icon: '🧪',
  statusOptions: [
    { value: 'ordered', label: 'Ordered' }, { value: 'sample-collected', label: 'Sample Collected' },
    { value: 'processing', label: 'Processing' }, { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ],
  columns: [
    { key: 'orderId', label: 'Order ID', render: i => <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-muted)' }}>{i.orderId}</span> },
    { key: 'patient', label: 'Patient', render: i => <AvatarName name={i.patient?.name} subtitle={i.patient?.email} size={30} /> },
    { key: 'tests', label: 'Tests', render: i => <span style={{ fontSize: 12 }}>{i.tests?.map(t => t.name).join(', ')}</span> },
    { key: 'totalAmount', label: 'Amount', render: i => <strong>₹{i.totalAmount}</strong> },
    { key: 'status', label: 'Status', render: i => <StatusBadge status={i.status} /> },
    { key: 'paymentStatus', label: 'Payment', render: i => <StatusBadge status={i.paymentStatus} /> },
    { key: 'createdAt', label: 'Date', render: i => <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(i.createdAt).toLocaleDateString('en-IN')}</span> },
  ],
});

// ─── Medicines ────────────────────────────────────────────────────────────────
export const Medicines = () => ResourcePage({
  queryKey: 'medicines', fetcher: medicinesAPI.getAll,
  title: 'Medicine Orders', icon: '💊',
  statusOptions: [
    { value: 'placed', label: 'Placed' }, { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' }, { value: 'cancelled', label: 'Cancelled' },
  ],
  columns: [
    { key: 'orderId', label: 'Order ID', render: i => <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-muted)' }}>{i.orderId}</span> },
    { key: 'patient', label: 'Patient', render: i => <AvatarName name={i.patient?.name} size={30} /> },
    { key: 'items', label: 'Items', render: i => <span style={{ fontSize: 12 }}>{i.items?.length} item(s)</span> },
    { key: 'totalAmount', label: 'Amount', render: i => <strong>₹{i.totalAmount}</strong> },
    { key: 'status', label: 'Status', render: i => <StatusBadge status={i.status} /> },
    { key: 'expectedDelivery', label: 'Expected', render: i => <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{i.expectedDelivery ? new Date(i.expectedDelivery).toLocaleDateString('en-IN') : '—'}</span> },
  ],
});

// ─── Prescriptions ─────────────────────────────────────────────────────────────
export const Prescriptions = () => ResourcePage({
  queryKey: 'prescriptions', fetcher: prescriptionsAPI.getAll,
  title: 'Prescriptions', icon: '📋',
  columns: [
    { key: 'prescriptionId', label: 'Rx ID', render: i => <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{i.prescriptionId}</span> },
    { key: 'patient', label: 'Patient', render: i => <AvatarName name={i.patient?.name} size={30} /> },
    { key: 'doctor', label: 'Doctor', render: i => <span style={{ fontSize: 13 }}>Dr. {i.doctor?.name}</span> },
    { key: 'diagnosis', label: 'Diagnosis', render: i => <span style={{ fontSize: 12 }}>{i.diagnosis?.slice(0, 2).join(', ')}</span> },
    { key: 'medicines', label: 'Medicines', render: i => <span style={{ fontSize: 12 }}>{i.medicines?.length} prescribed</span> },
    { key: 'isValid', label: 'Valid', render: i => <StatusBadge status={i.isValid ? 'active' : 'inactive'} /> },
    { key: 'createdAt', label: 'Date', render: i => <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(i.createdAt).toLocaleDateString('en-IN')}</span> },
  ],
});

// ─── Specialities ──────────────────────────────────────────────────────────────
export const Specialities = () => {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', icon: '' });
  const [confirm, setConfirm] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['specialities', page],
    queryFn: () => specialitiesAPI.getAll({ page, limit: 12 }).then(r => r.data),
  });

  const saveMutation = useMutation({
    mutationFn: (d) => editItem ? specialitiesAPI.update(editItem._id, d) : specialitiesAPI.create(d),
    onSuccess: () => { toast.success('Saved!'); qc.invalidateQueries(['specialities']); setShowModal(false); setEditItem(null); setForm({ name: '', description: '', icon: '' }); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => specialitiesAPI.delete(id),
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries(['specialities']); setConfirm(null); },
  });

  const openEdit = (s) => { setEditItem(s); setForm({ name: s.name, description: s.description || '', icon: s.icon || '' }); setShowModal(true); };

  return (
    <div className="fade-in">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Specialities ({data?.total || 0})</h3>
          <button className="btn btn-primary btn-sm" onClick={() => { setEditItem(null); setForm({ name: '', description: '', icon: '' }); setShowModal(true); }}>+ Add Speciality</button>
        </div>
        {isLoading ? <PageSpinner /> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
            {data?.data?.map(s => (
              <div key={s._id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 16, background: 'var(--surface-2)', transition: 'var(--transition)' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
              >
                <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon || '🏥'}</div>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{s.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>{s.totalDoctors} doctors</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-secondary btn-sm" style={{ fontSize: 12 }} onClick={() => openEdit(s)}>Edit</button>
                  <button className="btn btn-danger btn-sm" style={{ fontSize: 12 }} onClick={() => setConfirm(s)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
        <Pagination currentPage={page} totalPages={data?.totalPages} onPageChange={setPage} />
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Edit Speciality' : 'Add Speciality'} size={400}>
        <div className="form-group"><label className="form-label">Name</label><input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
        <div className="form-group"><label className="form-label">Icon (emoji)</label><input className="form-input" value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} placeholder="e.g. 🫀" /></div>
        <div className="form-group"><label className="form-label">Description</label><textarea className="form-input" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={() => saveMutation.mutate(form)} disabled={saveMutation.isPending || !form.name}>
            {saveMutation.isPending ? <Spinner size={16} color="white" /> : 'Save'}
          </button>
        </div>
      </Modal>
      <ConfirmDialog isOpen={!!confirm} onClose={() => setConfirm(null)} onConfirm={() => deleteMutation.mutate(confirm._id)} title="Delete Speciality" message={`Delete "${confirm?.name}"? This may affect existing doctor profiles.`} loading={deleteMutation.isPending} />
    </div>
  );
};

// ─── Users Page ───────────────────────────────────────────────────────────────
export const Users = () => {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'support', phone: '', department: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page],
    queryFn: () => usersAPI.getAll({ page, limit: 10 }).then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (d) => usersAPI.create(d),
    onSuccess: () => { toast.success('Admin user created!'); qc.invalidateQueries(['admin-users']); setShowModal(false); setForm({ name: '', email: '', password: '', role: 'support', phone: '', department: '' }); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const ROLE_COLORS = { superadmin: 'badge-danger', admin: 'badge-primary', manager: 'badge-warning', support: 'badge-info', finance: 'badge-success' };

  return (
    <div className="fade-in">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Admin Users ({data?.total || 0})</h3>
          <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>+ Add User</button>
        </div>
        {isLoading ? <PageSpinner /> : !data?.data?.length ? <EmptyState icon="👥" title="No admin users" /> : (
          <>
            <div className="table-container">
              <table className="table">
                <thead><tr><th>User</th><th>Role</th><th>Department</th><th>Phone</th><th>Status</th><th>Last Login</th></tr></thead>
                <tbody>
                  {data.data.map(u => (
                    <tr key={u._id}>
                      <td><AvatarName name={u.name} subtitle={u.email} /></td>
                      <td><span className={`badge ${ROLE_COLORS[u.role] || 'badge-gray'}`}>{u.role}</span></td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{u.department || '—'}</td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{u.phone || '—'}</td>
                      <td><StatusBadge status={u.isActive ? 'active' : 'inactive'} /></td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{u.lastLogin ? new Date(u.lastLogin).toLocaleDateString('en-IN') : 'Never'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination currentPage={page} totalPages={data.totalPages} onPageChange={setPage} />
          </>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Admin User" size={520}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {[{ label: 'Full Name', field: 'name' }, { label: 'Email', field: 'email', type: 'email' }, { label: 'Password', field: 'password', type: 'password' }, { label: 'Phone', field: 'phone' }, { label: 'Department', field: 'department' }].map(({ label, field, type = 'text' }) => (
            <div key={field} className="form-group">
              <label className="form-label">{label}</label>
              <input className="form-input" type={type} value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} />
            </div>
          ))}
          <div className="form-group">
            <label className="form-label">Role</label>
            <select className="form-select" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
              {['superadmin', 'admin', 'manager', 'support', 'finance'].map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
          <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={() => createMutation.mutate(form)} disabled={createMutation.isPending}>
            {createMutation.isPending ? <Spinner size={16} color="white" /> : 'Create User'}
          </button>
        </div>
      </Modal>
    </div>
  );
};

// ─── Reports Page ──────────────────────────────────────────────────────────────
export const Reports = () => {
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['revenue-report', dateRange],
    queryFn: () => reportsAPI.getRevenue(dateRange).then(r => r.data.data),
    enabled: false,
  });

  const chartData = {
    labels: (data || []).map(d => d._id),
    datasets: [{
      label: 'Revenue (₹)',
      data: (data || []).map(d => d.revenue),
      backgroundColor: 'rgba(0,181,173,0.3)',
      borderColor: '#00B5AD',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
    }],
  };

  const totalRev = (data || []).reduce((s, d) => s + d.revenue, 0);

  return (
    <div className="fade-in">
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <h3 className="card-title">Revenue Report</h3>
        </div>
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Start Date</label>
            <input className="form-input" type="date" value={dateRange.startDate} onChange={e => setDateRange(d => ({ ...d, startDate: e.target.value }))} style={{ width: 180 }} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">End Date</label>
            <input className="form-input" type="date" value={dateRange.endDate} onChange={e => setDateRange(d => ({ ...d, endDate: e.target.value }))} style={{ width: 180 }} />
          </div>
          <button className="btn btn-primary" onClick={() => refetch()} disabled={isLoading || !dateRange.startDate || !dateRange.endDate}>
            {isLoading ? <Spinner size={16} color="white" /> : 'Generate Report'}
          </button>
        </div>
      </div>

      {data && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
            {[
              { label: 'Total Revenue', value: `₹${totalRev.toLocaleString()}` },
              { label: 'Total Transactions', value: (data || []).reduce((s, d) => s + d.count, 0) },
              { label: 'Avg Daily Revenue', value: `₹${data.length ? Math.round(totalRev / data.length).toLocaleString() : 0}` },
            ].map((s, i) => (
              <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius)', padding: '18px 22px' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>{s.label}</div>
                <div style={{ fontSize: 26, fontWeight: 800, fontFamily: 'var(--font-display)' }}>{s.value}</div>
              </div>
            ))}
          </div>
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: 20 }}>Daily Revenue Trend</h3>
            <div style={{ height: 300 }}>
              <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { grid: { color: '#F0F4F8' } } } }} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// ─── Notifications Page ────────────────────────────────────────────────────────
export const Notifications = () => {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', message: '', type: 'info', isGlobal: true });

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', page],
    queryFn: () => notificationsAPI.getAll({ page, limit: 15 }).then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (d) => notificationsAPI.create(d),
    onSuccess: () => { toast.success('Notification sent!'); qc.invalidateQueries(['notifications']); setShowModal(false); setForm({ title: '', message: '', type: 'info', isGlobal: true }); },
  });

  const TYPE_ICONS = { info: '💬', success: '✅', warning: '⚠️', error: '❌', appointment: '📅', payment: '💳', system: '⚙️' };

  return (
    <div className="fade-in">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Notifications ({data?.total || 0})</h3>
          <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>+ Send Notification</button>
        </div>
        {isLoading ? <PageSpinner /> : !data?.data?.length ? <EmptyState icon="🔔" title="No notifications" /> : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {data.data.map(n => (
                <div key={n._id} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 0', borderBottom: '1px solid var(--border-light)' }}>
                  <span style={{ fontSize: 20, marginTop: 2 }}>{TYPE_ICONS[n.type] || '💬'}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{n.title}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{n.message}</div>
                    <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                      <span className={`badge badge-${n.type === 'error' ? 'danger' : n.type === 'warning' ? 'warning' : n.type === 'success' ? 'success' : 'info'}`}>{n.type}</span>
                      {n.isGlobal && <span className="badge badge-primary">Global</span>}
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(n.createdAt).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Pagination currentPage={page} totalPages={data.totalPages} onPageChange={setPage} />
          </>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Send Notification" size={480}>
        <div className="form-group"><label className="form-label">Title</label><input className="form-input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
        <div className="form-group"><label className="form-label">Message</label><textarea className="form-input" rows={4} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Type</label>
            <select className="form-select" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
              {['info', 'success', 'warning', 'error', 'appointment', 'payment', 'system'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 22 }}>
            <input type="checkbox" id="global" checked={form.isGlobal} onChange={e => setForm(f => ({ ...f, isGlobal: e.target.checked }))} style={{ width: 16, height: 16 }} />
            <label htmlFor="global" style={{ fontSize: 14, cursor: 'pointer' }}>Send to all users</label>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={() => createMutation.mutate(form)} disabled={createMutation.isPending || !form.title || !form.message}>
            {createMutation.isPending ? <Spinner size={16} color="white" /> : 'Send'}
          </button>
        </div>
      </Modal>
    </div>
  );
};

// ─── Settings Page ─────────────────────────────────────────────────────────────
export const Settings = () => (
  <div className="fade-in">
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
      {[
        { title: 'General Settings', icon: '⚙️', items: ['Platform Name', 'Support Email', 'Default Currency', 'Timezone'] },
        { title: 'Notification Settings', icon: '🔔', items: ['Email Notifications', 'SMS Alerts', 'Push Notifications', 'Admin Alerts'] },
        { title: 'Payment Settings', icon: '💳', items: ['Payment Gateway', 'Refund Policy', 'Commission Rate', 'Tax Settings'] },
        { title: 'Security Settings', icon: '🔒', items: ['Two-Factor Auth', 'Session Timeout', 'Password Policy', 'IP Whitelist'] },
      ].map((section, i) => (
        <div key={i} className="card">
          <div className="card-header">
            <h3 className="card-title"><span style={{ marginRight: 8 }}>{section.icon}</span>{section.title}</h3>
          </div>
          {section.items.map((item, j) => (
            <div key={j} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: j < section.items.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
              <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{item}</span>
              <button className="btn btn-secondary btn-sm">Configure</button>
            </div>
          ))}
        </div>
      ))}
    </div>
  </div>
);

// ─── Profile Page ──────────────────────────────────────────────────────────────
export const Profile = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', department: user?.department || '' });
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const { authAPI } = require('../utils/api.js');

  const saveMutation = useMutation({
    mutationFn: (d) => authAPI.updateProfile(d),
    onSuccess: (res) => { updateUser(res.data.data); toast.success('Profile updated!'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const pwdMutation = useMutation({
    mutationFn: (d) => authAPI.changePassword(d),
    onSuccess: () => { toast.success('Password changed!'); setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const handlePwd = (e) => {
    e.preventDefault();
    if (pwdForm.newPassword !== pwdForm.confirmPassword) return toast.error('Passwords do not match');
    pwdMutation.mutate({ currentPassword: pwdForm.currentPassword, newPassword: pwdForm.newPassword });
  };

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'A';

  return (
    <div className="fade-in" style={{ maxWidth: 760 }}>
      {/* Profile Header */}
      <div className="card" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 24 }}>
        <div className="avatar" style={{ width: 72, height: 72, fontSize: 24, background: 'var(--primary-light)', color: 'var(--primary)', fontFamily: 'var(--font-display)', fontWeight: 800, flexShrink: 0 }}>
          {getInitials(user?.name)}
        </div>
        <div>
          <h2 style={{ fontSize: 22, marginBottom: 4 }}>{user?.name}</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 6 }}>{user?.email}</p>
          <span className="badge badge-primary" style={{ textTransform: 'capitalize' }}>{user?.role}</span>
        </div>
      </div>

      {/* Edit Profile */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h3 className="card-title" style={{ marginBottom: 20 }}>Edit Profile</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {[{ label: 'Full Name', field: 'name' }, { label: 'Phone', field: 'phone' }, { label: 'Department', field: 'department' }].map(({ label, field }) => (
            <div key={field} className="form-group">
              <label className="form-label">{label}</label>
              <input className="form-input" value={form[field] || ''} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
          <button className="btn btn-primary" onClick={() => saveMutation.mutate(form)} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? <Spinner size={16} color="white" /> : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Change Password */}
      <div className="card">
        <h3 className="card-title" style={{ marginBottom: 20 }}>Change Password</h3>
        <form onSubmit={handlePwd}>
          {[{ label: 'Current Password', field: 'currentPassword' }, { label: 'New Password', field: 'newPassword' }, { label: 'Confirm New Password', field: 'confirmPassword' }].map(({ label, field }) => (
            <div key={field} className="form-group">
              <label className="form-label">{label}</label>
              <input className="form-input" type="password" value={pwdForm[field]} onChange={e => setPwdForm(f => ({ ...f, [field]: e.target.value }))} />
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" disabled={pwdMutation.isPending}>
              {pwdMutation.isPending ? <Spinner size={16} color="white" /> : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Doctor Detail ─────────────────────────────────────────────────────────────
export const DoctorDetail = () => {
  const { id } = require('react-router-dom').useParams();
  const navigate = require('react-router-dom').useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ['doctor', id],
    queryFn: () => require('../utils/api.js').doctorsAPI.getOne(id).then(r => r.data.data),
  });

  if (isLoading) return <PageSpinner />;
  const d = data;
  if (!d) return <EmptyState title="Doctor not found" />;

  return (
    <div className="fade-in">
      <button className="btn btn-ghost btn-sm" onClick={() => navigate('/doctors')} style={{ marginBottom: 20 }}>← Back to Doctors</button>
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20 }}>
        {/* Profile Card */}
        <div className="card" style={{ textAlign: 'center' }}>
          <div className="avatar" style={{ width: 80, height: 80, fontSize: 28, margin: '0 auto 16px', background: 'var(--primary-light)', color: 'var(--primary)', fontFamily: 'var(--font-display)', fontWeight: 800 }}>
            {d.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
          </div>
          <h2 style={{ fontSize: 18, marginBottom: 4 }}>Dr. {d.name}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 12 }}>{d.speciality?.name}</p>
          <StatusBadge status={d.status} />
          {d.isVerified && <span className="badge badge-success" style={{ marginLeft: 8 }}>✓ Verified</span>}
          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left' }}>
            {[['Email', d.email], ['Phone', d.phone], ['Experience', `${d.experience} years`], ['Reg. No.', d.registrationNumber], ['Rating', `⭐ ${d.rating?.toFixed(1)}`], ['Total Consults', d.totalConsultations]].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-light)', fontSize: 13 }}>
                <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                <span style={{ fontWeight: 500 }}>{v || '—'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: 16 }}>Consultation Fees</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
              {Object.entries(d.consultationFee || {}).map(([type, fee]) => (
                <div key={type} style={{ background: 'var(--primary-light)', borderRadius: 'var(--radius)', padding: 16, textAlign: 'center' }}>
                  <div style={{ fontSize: 12, color: 'var(--primary)', textTransform: 'capitalize', marginBottom: 6 }}>{type}</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--primary-dark)', fontFamily: 'var(--font-display)' }}>₹{fee}</div>
                </div>
              ))}
            </div>
          </div>
          {d.qualifications?.length > 0 && (
            <div className="card">
              <h3 className="card-title" style={{ marginBottom: 16 }}>Qualifications</h3>
              {d.qualifications.map((q, i) => (
                <div key={i} style={{ display: 'flex', gap: 14, padding: '10px 0', borderBottom: '1px solid var(--border-light)' }}>
                  <span style={{ fontSize: 20 }}>🎓</span>
                  <div>
                    <div style={{ fontWeight: 600 }}>{q.degree}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{q.institution} — {q.year}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {d.bio && (
            <div className="card">
              <h3 className="card-title" style={{ marginBottom: 12 }}>About</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 14 }}>{d.bio}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Patient Detail ────────────────────────────────────────────────────────────
export const PatientDetail = () => {
  const { id } = require('react-router-dom').useParams();
  const navigate = require('react-router-dom').useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ['patient', id],
    queryFn: () => require('../utils/api.js').patientsAPI.getOne(id).then(r => r.data.data),
  });

  if (isLoading) return <PageSpinner />;
  const p = data;
  if (!p) return <EmptyState title="Patient not found" />;

  return (
    <div className="fade-in">
      <button className="btn btn-ghost btn-sm" onClick={() => navigate('/patients')} style={{ marginBottom: 20 }}>← Back to Patients</button>
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20 }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div className="avatar" style={{ width: 72, height: 72, fontSize: 24, margin: '0 auto 14px', background: 'var(--info-light)', color: 'var(--info)', fontFamily: 'var(--font-display)', fontWeight: 800 }}>
            {p.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
          </div>
          <h2 style={{ fontSize: 17, marginBottom: 4 }}>{p.name}</h2>
          <StatusBadge status={p.status} />
          <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'left' }}>
            {[['Email', p.email], ['Phone', p.phone], ['Gender', p.gender], ['Blood Group', p.bloodGroup], ['Wallet', `₹${p.wallet?.toLocaleString() || 0}`], ['Appointments', p.totalAppointments], ['Total Spent', `₹${p.totalSpent?.toLocaleString() || 0}`]].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border-light)', fontSize: 13 }}>
                <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                <span style={{ fontWeight: 500 }}>{v || '—'}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {p.address?.city && (
            <div className="card">
              <h3 className="card-title" style={{ marginBottom: 12 }}>Address</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{[p.address.line1, p.address.line2, p.address.city, p.address.state, p.address.pincode].filter(Boolean).join(', ')}</p>
            </div>
          )}
          {p.medicalHistory?.length > 0 && (
            <div className="card">
              <h3 className="card-title" style={{ marginBottom: 12 }}>Medical History</h3>
              {p.medicalHistory.map((m, i) => (
                <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid var(--border-light)', fontSize: 14 }}>
                  <span style={{ fontWeight: 600 }}>{m.condition}</span>
                  {m.notes && <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>— {m.notes}</span>}
                </div>
              ))}
            </div>
          )}
          {p.allergies?.length > 0 && (
            <div className="card">
              <h3 className="card-title" style={{ marginBottom: 12 }}>Allergies</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {p.allergies.map((a, i) => <span key={i} className="badge badge-danger">{a}</span>)}
              </div>
            </div>
          )}
          {p.insuranceDetails?.provider && (
            <div className="card">
              <h3 className="card-title" style={{ marginBottom: 12 }}>Insurance</h3>
              {[['Provider', p.insuranceDetails.provider], ['Policy No.', p.insuranceDetails.policyNumber], ['Valid Until', p.insuranceDetails.validUntil ? new Date(p.insuranceDetails.validUntil).toLocaleDateString('en-IN') : '—']].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border-light)', fontSize: 13 }}>
                  <span style={{ color: 'var(--text-muted)' }}>{k}</span><span style={{ fontWeight: 500 }}>{v}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
