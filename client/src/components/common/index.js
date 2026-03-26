import React from 'react';
import { Search, X, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';

// ─── Spinner ──────────────────────────────────────────────────────────────────
export const Spinner = ({ size = 24, color = 'var(--primary)' }) => (
  <div style={{
    width: size, height: size,
    border: `2px solid var(--border)`,
    borderTopColor: color,
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
    display: 'inline-block',
  }} />
);

export const PageSpinner = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
    <Spinner size={36} />
  </div>
);

// ─── Search Bar ───────────────────────────────────────────────────────────────
export const SearchBar = ({ value, onChange, placeholder = 'Search...' }) => (
  <div className="search-bar">
    <Search size={15} color="var(--text-muted)" />
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
    {value && (
      <button onClick={() => onChange('')} style={{ background: 'none', border: 'none', padding: 0, display: 'flex', color: 'var(--text-muted)', cursor: 'pointer' }}>
        <X size={14} />
      </button>
    )}
  </div>
);

// ─── Modal ────────────────────────────────────────────────────────────────────
export const Modal = ({ isOpen, onClose, title, children, size = 560 }) => {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: size }}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
};

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
export const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, variant = 'danger', loading }) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title} size={440}>
    <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
      <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--danger-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <AlertTriangle size={20} color="var(--danger)" />
      </div>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>{message}</p>
    </div>
    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
      <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
      <button className={`btn btn-${variant}`} onClick={onConfirm} disabled={loading}>
        {loading ? <Spinner size={16} color="white" /> : 'Confirm'}
      </button>
    </div>
  </Modal>
);

// ─── Pagination ───────────────────────────────────────────────────────────────
export const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = [];
  let start = Math.max(1, currentPage - 2);
  let end = Math.min(totalPages, start + 4);
  if (end - start < 4) start = Math.max(1, end - 4);
  for (let i = start; i <= end; i++) pages.push(i);

  if (totalPages <= 1) return null;
  return (
    <div className="pagination">
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}><ChevronLeft size={14} /></button>
      {start > 1 && <><button onClick={() => onPageChange(1)}>1</button>{start > 2 && <span style={{ padding: '0 4px', color: 'var(--text-muted)' }}>…</span>}</>}
      {pages.map(p => <button key={p} className={currentPage === p ? 'active' : ''} onClick={() => onPageChange(p)}>{p}</button>)}
      {end < totalPages && <><span style={{ padding: '0 4px', color: 'var(--text-muted)' }}>…</span><button onClick={() => onPageChange(totalPages)}>{totalPages}</button></>}
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}><ChevronRight size={14} /></button>
    </div>
  );
};

// ─── Status Badge ─────────────────────────────────────────────────────────────
const STATUS_MAP = {
  active: 'badge-success', completed: 'badge-success', paid: 'badge-success',
  success: 'badge-success', delivered: 'badge-success', verified: 'badge-success',
  pending: 'badge-warning', scheduled: 'badge-warning', processing: 'badge-warning',
  'sample-collected': 'badge-warning', shipped: 'badge-warning', placed: 'badge-warning',
  cancelled: 'badge-danger', failed: 'badge-danger', blocked: 'badge-danger',
  suspended: 'badge-danger', 'no-show': 'badge-danger', returned: 'badge-danger',
  inactive: 'badge-gray', refunded: 'badge-info', 'in-progress': 'badge-info',
};

export const StatusBadge = ({ status }) => (
  <span className={`badge ${STATUS_MAP[status] || 'badge-gray'}`}>
    {status?.replace(/-/g, ' ')}
  </span>
);

// ─── Empty State ──────────────────────────────────────────────────────────────
export const EmptyState = ({ title = 'No data found', description = 'Try adjusting your search or filters', icon = '📭' }) => (
  <div className="empty-state">
    <div style={{ fontSize: 48, marginBottom: 16 }}>{icon}</div>
    <h3>{title}</h3>
    <p style={{ fontSize: 14 }}>{description}</p>
  </div>
);

// ─── Stats Card ───────────────────────────────────────────────────────────────
export const StatCard = ({ label, value, change, changeLabel, icon, color = 'var(--primary)', loading }) => (
  <div className="stat-card">
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
      <div>
        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{label}</p>
        {loading
          ? <div style={{ height: 32, width: 80, background: 'var(--border)', borderRadius: 6, animation: 'pulse 1.5s infinite' }} />
          : <h3 style={{ fontSize: 28, fontFamily: 'var(--font-display)', fontWeight: 800 }}>{value}</h3>}
      </div>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{icon}</div>
    </div>
    {change !== undefined && (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: change >= 0 ? 'var(--success)' : 'var(--danger)' }}>
          {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
        </span>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{changeLabel || 'vs last month'}</span>
      </div>
    )}
  </div>
);

// ─── Select Filter ────────────────────────────────────────────────────────────
export const SelectFilter = ({ value, onChange, options, placeholder = 'All' }) => (
  <select className="form-select" value={value} onChange={e => onChange(e.target.value)} style={{ width: 'auto', minWidth: 140 }}>
    <option value="">{placeholder}</option>
    {options.map(opt => (
      <option key={opt.value} value={opt.value}>{opt.label}</option>
    ))}
  </select>
);

// ─── Avatar with name ─────────────────────────────────────────────────────────
export const AvatarName = ({ name, subtitle, avatar, size = 36 }) => {
  const initials = name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div className="avatar" style={{ width: size, height: size, fontSize: size * 0.35, flexShrink: 0 }}>
        {avatar ? <img src={avatar} alt={name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : initials}
      </div>
      <div>
        <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{name}</div>
        {subtitle && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{subtitle}</div>}
      </div>
    </div>
  );
};
