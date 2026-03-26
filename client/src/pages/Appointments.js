import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentsAPI } from '../utils/api.js';
import { SearchBar, StatusBadge, Pagination, ConfirmDialog, SelectFilter, AvatarName, PageSpinner, EmptyState, Modal, Spinner } from '../components/common/index.js';
import toast from 'react-hot-toast';
import { XCircle } from 'lucide-react';

const TYPE_BADGE = { chat: { bg: '#DCFCE7', color: '#166534' }, audio: { bg: '#DBEAFE', color: '#1e40af' }, video: { bg: '#EDE9FE', color: '#5b21b6' } };

const Appointments = () => {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [cancelModal, setCancelModal] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['appointments', page, search, status, type],
    queryFn: () => appointmentsAPI.getAll({ page, limit: 10, search, status, type }).then(r => r.data),
    keepPreviousData: true,
  });

  const { data: stats } = useQuery({
    queryKey: ['appointment-stats'],
    queryFn: () => appointmentsAPI.getStats().then(r => r.data.data),
  });

  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }) => appointmentsAPI.cancel(id, { reason }),
    onSuccess: () => { toast.success('Appointment cancelled'); qc.invalidateQueries(['appointments']); qc.invalidateQueries(['appointment-stats']); setCancelModal(null); setCancelReason(''); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  });

  return (
    <div className="fade-in">
      {/* Stats */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 24 }}>
          {[
            { label: 'Total', value: stats.total, icon: '📊' },
            { label: "Today's", value: stats.today, icon: '📅' },
            { label: 'Pending', value: stats.pending, icon: '⏳' },
            { label: 'Completed', value: stats.completed, icon: '✅' },
            { label: 'Cancelled', value: stats.cancelled, icon: '❌' },
          ].map((s, i) => (
            <div key={i} style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: '14px 18px', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 22 }}>{s.icon}</span>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
                <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-display)' }}>{s.value?.toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">All Appointments ({data?.total || 0})</h3>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <SearchBar value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search..." />
            <SelectFilter value={status} onChange={v => { setStatus(v); setPage(1); }} options={[
              { value: 'scheduled', label: 'Scheduled' }, { value: 'completed', label: 'Completed' },
              { value: 'cancelled', label: 'Cancelled' }, { value: 'in-progress', label: 'In Progress' },
            ]} placeholder="All Status" />
            <SelectFilter value={type} onChange={v => { setType(v); setPage(1); }} options={[
              { value: 'chat', label: 'Chat' }, { value: 'audio', label: 'Audio' }, { value: 'video', label: 'Video' },
            ]} placeholder="All Types" />
          </div>
        </div>

        {isLoading ? <PageSpinner /> : !data?.data?.length ? <EmptyState icon="📅" title="No appointments found" /> : (
          <>
            <div className="table-container">
              <table className="table">
                <thead><tr><th>ID</th><th>Patient</th><th>Doctor</th><th>Type</th><th>Scheduled At</th><th>Fee</th><th>Payment</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {data.data.map(apt => (
                    <tr key={apt._id}>
                      <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-muted)' }}>{apt.appointmentId}</td>
                      <td><AvatarName name={apt.patient?.name} size={30} /></td>
                      <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Dr. {apt.doctor?.name}</td>
                      <td>
                        <span style={{ padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: 12, fontWeight: 600, background: TYPE_BADGE[apt.type]?.bg, color: TYPE_BADGE[apt.type]?.color }}>
                          {apt.type}
                        </span>
                      </td>
                      <td style={{ fontSize: 13 }}>{new Date(apt.scheduledAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</td>
                      <td style={{ fontWeight: 600 }}>₹{apt.fee}</td>
                      <td><StatusBadge status={apt.paymentStatus} /></td>
                      <td><StatusBadge status={apt.status} /></td>
                      <td>
                        {!['cancelled', 'completed'].includes(apt.status) && (
                          <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--danger)' }} title="Cancel" onClick={() => setCancelModal(apt)}>
                            <XCircle size={14} />
                          </button>
                        )}
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

      {/* Cancel Modal */}
      <Modal isOpen={!!cancelModal} onClose={() => { setCancelModal(null); setCancelReason(''); }} title="Cancel Appointment" size={420}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 16, fontSize: 14 }}>
          Cancel appointment <strong>{cancelModal?.appointmentId}</strong>?
        </p>
        <div className="form-group">
          <label className="form-label">Cancellation Reason</label>
          <textarea className="form-input" value={cancelReason} onChange={e => setCancelReason(e.target.value)} rows={3} placeholder="Provide a reason..." />
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={() => setCancelModal(null)}>Back</button>
          <button className="btn btn-danger" onClick={() => cancelMutation.mutate({ id: cancelModal._id, reason: cancelReason })} disabled={cancelMutation.isPending || !cancelReason}>
            {cancelMutation.isPending ? <Spinner size={16} color="white" /> : 'Cancel Appointment'}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Appointments;
