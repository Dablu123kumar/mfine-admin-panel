import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { doctorsAPI } from '../utils/api.js';
import { SearchBar, StatusBadge, Pagination, ConfirmDialog, SelectFilter, AvatarName, PageSpinner, EmptyState } from '../components/common/index.js';
import toast from 'react-hot-toast';
import { Plus, Eye, CheckCircle, Ban, Star } from 'lucide-react';
import DoctorFormModal from '../components/common/DoctorFormModal.js';

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' }, { value: 'pending', label: 'Pending' },
  { value: 'inactive', label: 'Inactive' }, { value: 'suspended', label: 'Suspended' },
];

const Doctors = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editDoctor, setEditDoctor] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['doctors', page, search, status],
    queryFn: () => doctorsAPI.getAll({ page, limit: 10, search, status }).then(r => r.data),
    keepPreviousData: true,
  });

  const { data: statsData } = useQuery({
    queryKey: ['doctor-stats'],
    queryFn: () => doctorsAPI.getStats().then(r => r.data.data),
  });

  const verifyMutation = useMutation({
    mutationFn: (id) => doctorsAPI.verify(id),
    onSuccess: () => { toast.success('Doctor verified!'); qc.invalidateQueries(['doctors']); qc.invalidateQueries(['doctor-stats']); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const suspendMutation = useMutation({
    mutationFn: (id) => doctorsAPI.suspend(id),
    onSuccess: () => { toast.success('Doctor suspended'); qc.invalidateQueries(['doctors']); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => doctorsAPI.delete(id),
    onSuccess: () => { toast.success('Doctor deleted'); qc.invalidateQueries(['doctors']); setConfirm(null); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  });

  return (
    <div className="fade-in">
      {/* Stats Row */}
      {statsData && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          {[
            { label: 'Total', value: statsData.total, color: 'var(--primary)', bg: 'var(--primary-light)' },
            { label: 'Active', value: statsData.active, color: 'var(--success)', bg: 'var(--success-light)' },
            { label: 'Pending', value: statsData.pending, color: 'var(--warning)', bg: 'var(--warning-light)' },
            { label: 'Suspended', value: statsData.suspended, color: 'var(--danger)', bg: 'var(--danger-light)' },
          ].map((s, i) => (
            <div key={i} style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: '16px 20px', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
                <div style={{ fontSize: 26, fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>{s.value}</div>
              </div>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>⚕</div>
            </div>
          ))}
        </div>
      )}

      {/* Main Card */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">All Doctors ({data?.total || 0})</h3>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <SearchBar value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search doctors..." />
            <SelectFilter value={status} onChange={v => { setStatus(v); setPage(1); }} options={STATUS_OPTIONS} placeholder="All Status" />
            <button className="btn btn-primary btn-sm" onClick={() => { setEditDoctor(null); setShowForm(true); }}>
              <Plus size={15} /> Add Doctor
            </button>
          </div>
        </div>

        {isLoading ? <PageSpinner /> : !data?.data?.length ? <EmptyState icon="⚕" title="No doctors found" /> : (
          <>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Doctor</th><th>Speciality</th><th>Experience</th><th>Rating</th><th>Fee (Video)</th><th>Status</th><th>Verified</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((doc) => (
                    <tr key={doc._id}>
                      <td><AvatarName name={doc.name} subtitle={doc.email} avatar={doc.avatar} /></td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{doc.speciality?.name || '—'}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{doc.experience} yrs</td>
                      <td>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600, color: 'var(--warning)' }}>
                          <Star size={13} fill="currentColor" /> {doc.rating?.toFixed(1) || '0.0'}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>₹{doc.consultationFee?.video || 0}</td>
                      <td><StatusBadge status={doc.status} /></td>
                      <td>
                        {doc.isVerified
                          ? <span className="badge badge-success">✓ Verified</span>
                          : <span className="badge badge-warning">Pending</span>}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="btn btn-ghost btn-icon btn-sm" title="View" onClick={() => navigate(`/doctors/${doc._id}`)}><Eye size={14} /></button>
                          {!doc.isVerified && <button className="btn btn-ghost btn-icon btn-sm" title="Verify" style={{ color: 'var(--success)' }} onClick={() => verifyMutation.mutate(doc._id)}><CheckCircle size={14} /></button>}
                          {doc.status !== 'suspended' && <button className="btn btn-ghost btn-icon btn-sm" title="Suspend" style={{ color: 'var(--danger)' }} onClick={() => setConfirm({ id: doc._id, type: 'suspend', name: doc.name })}><Ban size={14} /></button>}
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

      {showForm && <DoctorFormModal doctor={editDoctor} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); qc.invalidateQueries(['doctors']); }} />}

      <ConfirmDialog
        isOpen={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={() => confirm?.type === 'suspend' ? suspendMutation.mutate(confirm.id) : deleteMutation.mutate(confirm.id)}
        title={confirm?.type === 'suspend' ? 'Suspend Doctor' : 'Delete Doctor'}
        message={`Are you sure you want to ${confirm?.type} Dr. ${confirm?.name}? This action cannot be undone.`}
        loading={suspendMutation.isPending || deleteMutation.isPending}
      />
    </div>
  );
};

export default Doctors;
