import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentsAPI } from '../utils/api.js';
import { SearchBar, StatusBadge, Pagination, SelectFilter, AvatarName, PageSpinner, EmptyState, Modal, Spinner } from '../components/common/index.js';
import toast from 'react-hot-toast';
import { RefreshCw } from 'lucide-react';

const Payments = () => {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [refundModal, setRefundModal] = useState(null);
  const [refundData, setRefundData] = useState({ amount: '', reason: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['payments', page, status],
    queryFn: () => paymentsAPI.getAll({ page, limit: 10, status }).then(r => r.data),
    keepPreviousData: true,
  });

  const { data: stats } = useQuery({
    queryKey: ['payment-stats'],
    queryFn: () => paymentsAPI.getStats().then(r => r.data.data),
  });

  const refundMutation = useMutation({
    mutationFn: ({ id, ...body }) => paymentsAPI.refund(id, body),
    onSuccess: () => { toast.success('Refund processed!'); qc.invalidateQueries(['payments']); setRefundModal(null); setRefundData({ amount: '', reason: '' }); },
    onError: (e) => toast.error(e.response?.data?.message || 'Refund failed'),
  });

  const totalRevenue = stats?.find(s => s._id === 'success')?.total || 0;
  const totalRefunded = stats?.find(s => s._id === 'refunded')?.total || 0;
  const pendingCount = stats?.find(s => s._id === 'pending')?.count || 0;

  return (
    <div className="fade-in">
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Revenue', value: `₹${(totalRevenue / 100000).toFixed(2)}L`, icon: '💰', color: 'var(--success)' },
          { label: 'Total Refunded', value: `₹${totalRefunded?.toLocaleString()}`, icon: '↩️', color: 'var(--warning)' },
          { label: 'Pending Payments', value: pendingCount, icon: '⏳', color: 'var(--info)' },
          { label: 'Success Count', value: stats?.find(s => s._id === 'success')?.count || 0, icon: '✅', color: 'var(--success)' },
        ].map((s, i) => (
          <div key={i} style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: '18px 20px', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'var(--font-display)' }}>{s.value}</div>
            </div>
            <span style={{ fontSize: 28 }}>{s.icon}</span>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">All Transactions ({data?.total || 0})</h3>
          <div style={{ display: 'flex', gap: 10 }}>
            <SelectFilter value={status} onChange={v => { setStatus(v); setPage(1); }} options={[
              { value: 'success', label: 'Success' }, { value: 'pending', label: 'Pending' },
              { value: 'failed', label: 'Failed' }, { value: 'refunded', label: 'Refunded' },
            ]} placeholder="All Status" />
          </div>
        </div>

        {isLoading ? <PageSpinner /> : !data?.data?.length ? <EmptyState icon="💳" title="No transactions found" /> : (
          <>
            <div className="table-container">
              <table className="table">
                <thead><tr><th>Transaction ID</th><th>Patient</th><th>Type</th><th>Method</th><th>Amount</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
                <tbody>
                  {data.data.map(p => (
                    <tr key={p._id}>
                      <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-muted)' }}>{p.transactionId}</td>
                      <td><AvatarName name={p.patient?.name} subtitle={p.patient?.email} size={30} /></td>
                      <td><span className="badge badge-primary">{p.type}</span></td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{p.method || '—'}</td>
                      <td style={{ fontWeight: 700, fontSize: 15 }}>₹{p.amount?.toLocaleString()}</td>
                      <td><StatusBadge status={p.status} /></td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{new Date(p.createdAt).toLocaleDateString('en-IN')}</td>
                      <td>
                        {p.status === 'success' && (
                          <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--warning)' }} title="Refund" onClick={() => setRefundModal(p)}>
                            <RefreshCw size={14} />
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

      {/* Refund Modal */}
      <Modal isOpen={!!refundModal} onClose={() => setRefundModal(null)} title="Process Refund" size={420}>
        <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius)', padding: 14, marginBottom: 20, fontSize: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ color: 'var(--text-muted)' }}>Transaction</span>
            <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{refundModal?.transactionId}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Original Amount</span>
            <span style={{ fontWeight: 700, color: 'var(--success)' }}>₹{refundModal?.amount?.toLocaleString()}</span>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Refund Amount (₹)</label>
          <input className="form-input" type="number" max={refundModal?.amount} value={refundData.amount} onChange={e => setRefundData(d => ({ ...d, amount: e.target.value }))} />
        </div>
        <div className="form-group">
          <label className="form-label">Reason</label>
          <textarea className="form-input" rows={3} value={refundData.reason} onChange={e => setRefundData(d => ({ ...d, reason: e.target.value }))} placeholder="Reason for refund..." />
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={() => setRefundModal(null)}>Cancel</button>
          <button className="btn btn-primary" onClick={() => refundMutation.mutate({ id: refundModal._id, ...refundData })} disabled={refundMutation.isPending || !refundData.amount || !refundData.reason}>
            {refundMutation.isPending ? <Spinner size={16} color="white" /> : 'Process Refund'}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Payments;
