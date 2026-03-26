// ─── Patients Page ────────────────────────────────────────────────────────────
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { patientsAPI, appointmentsAPI, paymentsAPI } from '../utils/api.js';
import { SearchBar, StatusBadge, Pagination, ConfirmDialog, SelectFilter, AvatarName, PageSpinner, EmptyState, Modal, Spinner } from '../components/common/index.js';
import toast from 'react-hot-toast';
import { Plus, Eye, Ban, Wallet } from 'lucide-react';

export const Patients = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [walletModal, setWalletModal] = useState(null);
  const [walletAmount, setWalletAmount] = useState('');
  const [confirm, setConfirm] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['patients', page, search, status],
    queryFn: () => patientsAPI.getAll({ page, limit: 10, search, status }).then(r => r.data),
    keepPreviousData: true,
  });

  const blockMutation = useMutation({
    mutationFn: (id) => patientsAPI.block(id),
    onSuccess: () => { toast.success('Patient blocked'); qc.invalidateQueries(['patients']); setConfirm(null); },
  });

  const walletMutation = useMutation({
    mutationFn: ({ id, amount }) => patientsAPI.addWallet(id, { amount: Number(amount) }),
    onSuccess: () => { toast.success('Wallet updated!'); qc.invalidateQueries(['patients']); setWalletModal(null); setWalletAmount(''); },
  });

  return (
    <div className="fade-in">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">All Patients ({data?.total || 0})</h3>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <SearchBar value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search patients..." />
            <SelectFilter value={status} onChange={v => { setStatus(v); setPage(1); }} options={[{ value: 'active', label: 'Active' }, { value: 'blocked', label: 'Blocked' }]} placeholder="All Status" />
          </div>
        </div>
        {isLoading ? <PageSpinner /> : !data?.data?.length ? <EmptyState icon="👤" title="No patients found" /> : (
          <>
            <div className="table-container">
              <table className="table">
                <thead><tr><th>Patient</th><th>Phone</th><th>Blood Group</th><th>Wallet</th><th>Total Appointments</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
                <tbody>
                  {data.data.map(p => (
                    <tr key={p._id}>
                      <td><AvatarName name={p.name} subtitle={p.email} /></td>
                      <td style={{ color: 'var(--text-secondary)' }}>{p.phone}</td>
                      <td><span className="badge badge-info">{p.bloodGroup || '—'}</span></td>
                      <td style={{ fontWeight: 600, color: 'var(--success)' }}>₹{p.wallet?.toLocaleString() || 0}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{p.totalAppointments}</td>
                      <td><StatusBadge status={p.status} /></td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{new Date(p.createdAt).toLocaleDateString('en-IN')}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="btn btn-ghost btn-icon btn-sm" onClick={() => navigate(`/patients/${p._id}`)}><Eye size={14} /></button>
                          <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--success)' }} onClick={() => setWalletModal(p)} title="Add Wallet"><Wallet size={14} /></button>
                          {p.status !== 'blocked' && <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--danger)' }} onClick={() => setConfirm(p)}><Ban size={14} /></button>}
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

      {/* Wallet Modal */}
      <Modal isOpen={!!walletModal} onClose={() => setWalletModal(null)} title={`Add Wallet Balance — ${walletModal?.name}`} size={400}>
        <div className="form-group">
          <label className="form-label">Amount (₹)</label>
          <input className="form-input" type="number" value={walletAmount} onChange={e => setWalletAmount(e.target.value)} placeholder="Enter amount" min="1" />
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={() => setWalletModal(null)}>Cancel</button>
          <button className="btn btn-primary" onClick={() => walletMutation.mutate({ id: walletModal._id, amount: walletAmount })} disabled={walletMutation.isPending || !walletAmount}>
            {walletMutation.isPending ? <Spinner size={16} color="white" /> : 'Add Balance'}
          </button>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!confirm} onClose={() => setConfirm(null)} onConfirm={() => blockMutation.mutate(confirm._id)} title="Block Patient" message={`Block ${confirm?.name}? They will not be able to use the platform.`} loading={blockMutation.isPending} />
    </div>
  );
};

export default Patients;
