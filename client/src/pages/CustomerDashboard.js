import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerAPI, authAPI } from '../utils/api.js';
import { useAuth } from '../context/AuthContext.js';
import { StatusBadge, Pagination, PageSpinner, EmptyState, Modal, Spinner } from '../components/common/index.js';
import toast from 'react-hot-toast';

// ─── helpers ─────────────────────────────────────────────────────────────────
const Tab = ({ active, onClick, icon, label, count }) => (
  <button onClick={onClick} style={{
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '10px 18px', borderRadius: 10, border: 'none', cursor: 'pointer',
    background: active ? 'var(--primary)' : 'var(--surface)',
    color: active ? 'white' : 'var(--text-secondary)',
    fontWeight: active ? 700 : 400, fontSize: 14,
    transition: 'all 0.2s', boxShadow: active ? '0 4px 12px rgba(0,181,173,0.3)' : 'none',
  }}>
    <span style={{ fontSize: 16 }}>{icon}</span>
    <span>{label}</span>
    {count !== undefined && (
      <span style={{ background: active ? 'rgba(255,255,255,0.25)' : 'var(--border)', color: active ? 'white' : 'var(--text-muted)', borderRadius: 20, padding: '1px 8px', fontSize: 12, fontWeight: 700 }}>{count}</span>
    )}
  </button>
);

const StatCard = ({ icon, label, value, color, onClick }) => (
  <div onClick={onClick} style={{
    background: 'var(--surface)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius)',
    padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16,
    cursor: onClick ? 'pointer' : 'default', transition: 'var(--transition)', boxShadow: 'var(--shadow-sm)',
  }}
    onMouseEnter={e => onClick && (e.currentTarget.style.boxShadow = 'var(--shadow-md)')}
    onMouseLeave={e => onClick && (e.currentTarget.style.boxShadow = 'var(--shadow-sm)')}
  >
    <div style={{ width: 52, height: 52, borderRadius: 14, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>{icon}</div>
    <div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, fontFamily: 'var(--font-display)' }}>{value}</div>
    </div>
  </div>
);

// ─── Book Appointment Modal ───────────────────────────────────────────────────
const BookAppointmentModal = ({ isOpen, onClose, onSuccess }) => {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [step, setStep] = useState(1); // 1=choose doctor, 2=fill details
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [form, setForm] = useState({ type: 'video', scheduledAt: '', chiefComplaint: '', symptoms: '' });

  const { data: doctorsData, isLoading: docLoading } = useQuery({
    queryKey: ['customer-doctors', search],
    queryFn: () => customerAPI.getDoctors({ search, limit: 12 }).then(r => r.data.data),
    enabled: isOpen,
  });

  const mutation = useMutation({
    mutationFn: (d) => customerAPI.bookAppointment(d),
    onSuccess: () => {
      toast.success('Appointment booked successfully! 🎉');
      qc.invalidateQueries(['my-appointments']); qc.invalidateQueries(['customer-stats']);
      onSuccess(); onClose(); setStep(1); setSelectedDoctor(null);
      setForm({ type: 'video', scheduledAt: '', chiefComplaint: '', symptoms: '' });
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Booking failed'),
  });

  const fee = selectedDoctor?.consultationFee?.[form.type] || 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Book an Appointment" size={560}>
      {step === 1 ? (
        <div>
          <input className="form-input" placeholder="Search doctors by name..." value={search} onChange={e => setSearch(e.target.value)} style={{ marginBottom: 16 }} />
          {docLoading ? <PageSpinner /> : !doctorsData?.data?.length ? <EmptyState icon="⚕" title="No doctors available" description="Try a different search" /> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 340, overflowY: 'auto' }}>
              {doctorsData.data.map(doc => (
                <div key={doc._id} onClick={() => { setSelectedDoctor(doc); setStep(2); }} style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
                  background: 'var(--bg)', borderRadius: 'var(--radius)', cursor: 'pointer',
                  border: '2px solid transparent', transition: 'var(--transition)',
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
                >
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, flexShrink: 0 }}>
                    {doc.name?.charAt(0)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>Dr. {doc.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{doc.speciality?.name} · {doc.experience} yrs exp</div>
                    <div style={{ fontSize: 12, color: 'var(--success)', fontWeight: 600, marginTop: 2 }}>⭐ {doc.rating?.toFixed(1)}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    {doc.consultationFee?.video && <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: 15 }}>₹{doc.consultationFee.video}</div>}
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Video</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--primary-light)', borderRadius: 'var(--radius)', marginBottom: 20 }}>
            <span style={{ fontSize: 28 }}>⚕</span>
            <div>
              <div style={{ fontWeight: 700 }}>Dr. {selectedDoctor?.name}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{selectedDoctor?.speciality?.name}</div>
            </div>
            <button onClick={() => setStep(1)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: 13 }}>← Change</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Consultation Type</label>
              <select className="form-select" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                {['chat', 'audio', 'video'].filter(t => selectedDoctor?.consultationFee?.[t]).map(t => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)} — ₹{selectedDoctor.consultationFee[t]}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Date & Time</label>
              <input className="form-input" type="datetime-local" value={form.scheduledAt} min={new Date().toISOString().slice(0, 16)} onChange={e => setForm(f => ({ ...f, scheduledAt: e.target.value }))} />
            </div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label className="form-label">Chief Complaint</label>
              <input className="form-input" placeholder="e.g. Fever, headache for 3 days" value={form.chiefComplaint} onChange={e => setForm(f => ({ ...f, chiefComplaint: e.target.value }))} />
            </div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label className="form-label">Symptoms (comma-separated)</label>
              <input className="form-input" placeholder="e.g. fever, cough, fatigue" value={form.symptoms} onChange={e => setForm(f => ({ ...f, symptoms: e.target.value }))} />
            </div>
          </div>
          {fee > 0 && <div style={{ padding: '12px 16px', background: 'var(--bg)', borderRadius: 8, display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ color: 'var(--text-secondary)' }}>Consultation Fee</span>
            <strong style={{ color: 'var(--primary)', fontSize: 18 }}>₹{fee}</strong>
          </div>}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" disabled={!form.scheduledAt || mutation.isPending}
              onClick={() => mutation.mutate({ doctorId: selectedDoctor._id, ...form, symptoms: form.symptoms.split(',').map(s => s.trim()).filter(Boolean) })}>
              {mutation.isPending ? <Spinner size={16} color="white" /> : '📅 Confirm Booking'}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};

// ─── Order Lab Test Modal ─────────────────────────────────────────────────────
const COMMON_TESTS = [
  { name: 'Complete Blood Count (CBC)', code: 'CBC', price: 350 },
  { name: 'Blood Sugar Fasting', code: 'BSF', price: 120 },
  { name: 'HbA1c', code: 'HBA1C', price: 450 },
  { name: 'Lipid Profile', code: 'LP', price: 600 },
  { name: 'Thyroid Profile (TSH)', code: 'TSH', price: 380 },
  { name: 'Liver Function Test (LFT)', code: 'LFT', price: 750 },
  { name: 'Kidney Function Test (KFT)', code: 'KFT', price: 700 },
  { name: 'Urine Routine', code: 'UR', price: 150 },
  { name: 'Vitamin D', code: 'VITD', price: 900 },
  { name: 'Vitamin B12', code: 'B12', price: 650 },
];

const OrderLabTestModal = ({ isOpen, onClose, onSuccess }) => {
  const qc = useQueryClient();
  const [selected, setSelected] = useState([]);
  const [form, setForm] = useState({ labName: '', scheduledAt: '', collectionAddress: '' });
  const [customTest, setCustomTest] = useState({ name: '', price: '' });

  const toggleTest = (t) => setSelected(prev => prev.find(x => x.code === t.code) ? prev.filter(x => x.code !== t.code) : [...prev, t]);
  const total = selected.reduce((s, t) => s + t.price, 0);

  const mutation = useMutation({
    mutationFn: (d) => customerAPI.orderLabTest(d),
    onSuccess: () => {
      toast.success('Lab test ordered! 🧪'); qc.invalidateQueries(['my-lab-tests']); qc.invalidateQueries(['customer-stats']);
      onSuccess(); onClose(); setSelected([]); setForm({ labName: '', scheduledAt: '', collectionAddress: '' });
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Order failed'),
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Order Lab Tests 🧪" size={580}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10 }}>Select Tests:</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, maxHeight: 260, overflowY: 'auto' }}>
          {COMMON_TESTS.map(t => {
            const isSelected = !!selected.find(x => x.code === t.code);
            return (
              <div key={t.code} onClick={() => toggleTest(t)} style={{
                padding: '10px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13,
                border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border-light)'}`,
                background: isSelected ? 'var(--primary-light)' : 'var(--bg)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'var(--transition)',
              }}>
                <div>
                  <div style={{ fontWeight: isSelected ? 700 : 400 }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.code}</div>
                </div>
                <span style={{ fontWeight: 700, color: isSelected ? 'var(--primary)' : 'var(--text-secondary)', flexShrink: 0, marginLeft: 8 }}>₹{t.price}</span>
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <input className="form-input" placeholder="Custom test name" value={customTest.name} onChange={e => setCustomTest(f => ({ ...f, name: e.target.value }))} style={{ flex: 2 }} />
          <input className="form-input" placeholder="Price ₹" type="number" value={customTest.price} onChange={e => setCustomTest(f => ({ ...f, price: e.target.value }))} style={{ flex: 1 }} />
          <button className="btn btn-secondary btn-sm" onClick={() => { if (customTest.name && customTest.price) { setSelected(p => [...p, { name: customTest.name, code: 'CUSTOM_' + Date.now(), price: Number(customTest.price) }]); setCustomTest({ name: '', price: '' }); } }}>+ Add</button>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div className="form-group">
          <label className="form-label">Preferred Lab</label>
          <input className="form-input" placeholder="e.g. Thyrocare, Metropolis" value={form.labName} onChange={e => setForm(f => ({ ...f, labName: e.target.value }))} />
        </div>
        <div className="form-group">
          <label className="form-label">Scheduled Date</label>
          <input className="form-input" type="date" min={new Date().toISOString().slice(0, 10)} value={form.scheduledAt} onChange={e => setForm(f => ({ ...f, scheduledAt: e.target.value }))} />
        </div>
        <div className="form-group" style={{ gridColumn: '1/-1' }}>
          <label className="form-label">Home Collection Address</label>
          <input className="form-input" placeholder="Full address for sample collection" value={form.collectionAddress} onChange={e => setForm(f => ({ ...f, collectionAddress: e.target.value }))} />
        </div>
      </div>
      {selected.length > 0 && (
        <div style={{ padding: '12px 16px', background: 'var(--bg)', borderRadius: 8, display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ color: 'var(--text-secondary)' }}>{selected.length} test(s) selected</span>
          <strong style={{ color: 'var(--primary)', fontSize: 18 }}>₹{total}</strong>
        </div>
      )}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" disabled={!selected.length || mutation.isPending}
          onClick={() => mutation.mutate({ tests: selected, ...form })}>
          {mutation.isPending ? <Spinner size={16} color="white" /> : '🧪 Place Order'}
        </button>
      </div>
    </Modal>
  );
};

// ─── Order Medicine Modal ─────────────────────────────────────────────────────
const OrderMedicineModal = ({ isOpen, onClose, onSuccess }) => {
  const qc = useQueryClient();
  const [items, setItems] = useState([{ name: '', quantity: 1, price: '', manufacturer: '' }]);
  const [address, setAddress] = useState({ line1: '', city: '', state: '', pincode: '' });

  const addItem = () => setItems(p => [...p, { name: '', quantity: 1, price: '', manufacturer: '' }]);
  const removeItem = (i) => setItems(p => p.filter((_, idx) => idx !== i));
  const updateItem = (i, field, val) => setItems(p => p.map((it, idx) => idx === i ? { ...it, [field]: val } : it));
  const total = items.reduce((s, m) => s + (Number(m.price) || 0) * (Number(m.quantity) || 1), 0);

  const mutation = useMutation({
    mutationFn: (d) => customerAPI.orderMedicine(d),
    onSuccess: () => {
      toast.success('Medicine order placed! 💊'); qc.invalidateQueries(['my-medicines']); qc.invalidateQueries(['customer-stats']);
      onSuccess(); onClose(); setItems([{ name: '', quantity: 1, price: '', manufacturer: '' }]); setAddress({ line1: '', city: '', state: '', pincode: '' });
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Order failed'),
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Order Medicines 💊" size={580}>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10 }}>Medicines:</div>
        {items.map((item, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 0.6fr 0.8fr 1.5fr auto', gap: 8, marginBottom: 8, alignItems: 'center' }}>
            <input className="form-input" placeholder="Medicine name*" value={item.name} onChange={e => updateItem(i, 'name', e.target.value)} />
            <input className="form-input" placeholder="Qty" type="number" min={1} value={item.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)} />
            <input className="form-input" placeholder="₹Price" type="number" value={item.price} onChange={e => updateItem(i, 'price', e.target.value)} />
            <input className="form-input" placeholder="Manufacturer" value={item.manufacturer} onChange={e => updateItem(i, 'manufacturer', e.target.value)} />
            {items.length > 1 && <button onClick={() => removeItem(i)} style={{ background: 'var(--danger-light)', border: 'none', borderRadius: 8, padding: '8px', cursor: 'pointer', color: 'var(--danger)', fontSize: 16 }}>✕</button>}
          </div>
        ))}
        <button className="btn btn-secondary btn-sm" onClick={addItem} style={{ marginTop: 4 }}>+ Add Medicine</button>
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10 }}>Delivery Address:</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group" style={{ gridColumn: '1/-1' }}>
            <input className="form-input" placeholder="Street address*" value={address.line1} onChange={e => setAddress(a => ({ ...a, line1: e.target.value }))} />
          </div>
          <input className="form-input" placeholder="City" value={address.city} onChange={e => setAddress(a => ({ ...a, city: e.target.value }))} />
          <input className="form-input" placeholder="State" value={address.state} onChange={e => setAddress(a => ({ ...a, state: e.target.value }))} />
          <input className="form-input" placeholder="Pincode" value={address.pincode} onChange={e => setAddress(a => ({ ...a, pincode: e.target.value }))} style={{ gridColumn: '1/-1' }} />
        </div>
      </div>
      {total > 0 && <div style={{ padding: '12px 16px', background: 'var(--bg)', borderRadius: 8, display: 'flex', justifyContent: 'space-between', margin: '12px 0' }}>
        <span style={{ color: 'var(--text-secondary)' }}>Total Amount</span>
        <strong style={{ color: 'var(--success)', fontSize: 18 }}>₹{total}</strong>
      </div>}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" disabled={!items.some(m => m.name) || !address.line1 || mutation.isPending}
          onClick={() => mutation.mutate({ items, deliveryAddress: address })}>
          {mutation.isPending ? <Spinner size={16} color="white" /> : '💊 Place Order'}
        </button>
      </div>
    </Modal>
  );
};

// ─── Make Payment Modal ───────────────────────────────────────────────────────
const MakePaymentModal = ({ isOpen, onClose, onSuccess, prefill }) => {
  const qc = useQueryClient();
  const [form, setForm] = useState({ type: prefill?.type || 'appointment', amount: prefill?.amount || '', method: 'upi', notes: '' });

  const mutation = useMutation({
    mutationFn: (d) => customerAPI.makePayment(d),
    onSuccess: () => {
      toast.success('Payment successful! ✅'); qc.invalidateQueries(['my-payments']); qc.invalidateQueries(['customer-stats']);
      onSuccess(); onClose();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Payment failed'),
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Make Payment 💳" size={440}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="form-group">
          <label className="form-label">Payment For</label>
          <select className="form-select" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
            {[['appointment', 'Appointment'], ['lab-test', 'Lab Test'], ['medicine', 'Medicine Order'], ['wallet-topup', 'Wallet Top-Up']].map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Amount (₹)</label>
          <input className="form-input" type="number" placeholder="Enter amount" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
        </div>
        <div className="form-group">
          <label className="form-label">Payment Method</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {[['upi', '📱 UPI'], ['card', '💳 Card'], ['netbanking', '🏦 Net Banking'], ['wallet', '👛 Wallet']].map(([val, label]) => (
              <button key={val} type="button" onClick={() => setForm(f => ({ ...f, method: val }))} style={{
                padding: '10px 6px', borderRadius: 8, border: `2px solid ${form.method === val ? 'var(--primary)' : 'var(--border-light)'}`,
                background: form.method === val ? 'var(--primary-light)' : 'var(--bg)',
                cursor: 'pointer', fontSize: 12, fontWeight: form.method === val ? 700 : 400, color: 'var(--text-secondary)',
                transition: 'var(--transition)',
              }}>{label}</button>
            ))}
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Notes (optional)</label>
          <input className="form-input" placeholder="Payment note" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
        </div>
        {form.amount && (
          <div style={{ padding: '14px 16px', background: 'linear-gradient(135deg,var(--primary)22,var(--success)11)', border: '1px solid var(--primary)44', borderRadius: 10, display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>You will pay</span>
            <strong style={{ color: 'var(--primary)', fontSize: 20 }}>₹{Number(form.amount).toLocaleString()}</strong>
          </div>
        )}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={!form.amount || mutation.isPending}
            onClick={() => mutation.mutate({ ...form, referenceId: prefill?.referenceId, referenceModel: prefill?.referenceModel })}>
            {mutation.isPending ? <Spinner size={16} color="white" /> : '💳 Pay Now'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

// ─── My Appointments ──────────────────────────────────────────────────────────
const MyAppointments = ({ onBook, onPay }) => {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({ queryKey: ['my-appointments', page], queryFn: () => customerAPI.getAppointments({ page, limit: 8 }).then(r => r.data.data) });

  const cancelMutation = useMutation({
    mutationFn: (id) => customerAPI.cancelAppointment(id, {}),
    onSuccess: () => { toast.success('Appointment cancelled'); qc.invalidateQueries(['my-appointments']); },
    onError: (e) => toast.error(e.response?.data?.message || 'Cancel failed'),
  });

  if (isLoading) return <PageSpinner />;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button className="btn btn-primary" onClick={onBook}>📅 Book Appointment</button>
      </div>
      {!data?.data?.length ? <EmptyState icon="📅" title="No appointments yet" description="Book your first appointment with a doctor" /> : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {data.data.map(apt => (
              <div key={apt._id} style={{ background: 'var(--surface)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius)', padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>📅</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>Dr. {apt.doctor?.name || 'Doctor'}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                        <span style={{ textTransform: 'capitalize', marginRight: 8 }}>{apt.type}</span>
                        {apt.scheduledAt && new Date(apt.scheduledAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                      </div>
                      {apt.chiefComplaint && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>📋 {apt.chiefComplaint}</div>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                    {apt.fee > 0 && <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: 16 }}>₹{apt.fee}</span>}
                    <StatusBadge status={apt.status} />
                    <StatusBadge status={apt.paymentStatus} />
                  </div>
                </div>
                {(apt.status === 'scheduled' || apt.paymentStatus === 'pending') && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'flex-end' }}>
                    {apt.paymentStatus === 'pending' && apt.fee > 0 && (
                      <button className="btn btn-primary btn-sm" onClick={() => onPay({ type: 'appointment', amount: apt.fee, referenceId: apt._id, referenceModel: 'Appointment' })}>
                        💳 Pay ₹{apt.fee}
                      </button>
                    )}
                    {apt.status === 'scheduled' && (
                      <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={() => cancelMutation.mutate(apt._id)}>
                        {cancelMutation.isPending ? <Spinner size={14} /> : 'Cancel'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          <Pagination currentPage={page} totalPages={data.totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
};

// ─── My Payments ──────────────────────────────────────────────────────────────
const MyPayments = ({ onPay }) => {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({ queryKey: ['my-payments', page], queryFn: () => customerAPI.getPayments({ page, limit: 8 }).then(r => r.data.data) });

  if (isLoading) return <PageSpinner />;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button className="btn btn-primary" onClick={() => onPay({})}>💳 Make Payment</button>
      </div>
      {!data?.data?.length ? <EmptyState icon="💳" title="No transactions yet" description="Your payment history will appear here" /> : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {data.data.map(p => (
              <div key={p._id} style={{ background: 'var(--surface)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius)', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: '#ECFDF518', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>💳</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15, textTransform: 'capitalize' }}>{p.type?.replace(/-/g, ' ')}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.method?.toUpperCase()} · {new Date(p.createdAt).toLocaleDateString('en-IN')}</div>
                    {p.notes && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.notes}</div>}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontWeight: 800, fontSize: 18, color: p.status === 'success' ? 'var(--success)' : 'var(--text-primary)' }}>₹{p.amount?.toLocaleString()}</span>
                  <StatusBadge status={p.status} />
                </div>
              </div>
            ))}
          </div>
          <Pagination currentPage={page} totalPages={data.totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
};

// ─── My Lab Tests ─────────────────────────────────────────────────────────────
const MyLabTests = ({ onOrder, onPay }) => {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({ queryKey: ['my-lab-tests', page], queryFn: () => customerAPI.getLabTests({ page, limit: 8 }).then(r => r.data.data) });

  if (isLoading) return <PageSpinner />;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button className="btn btn-primary" onClick={onOrder}>🧪 Order Lab Test</button>
      </div>
      {!data?.data?.length ? <EmptyState icon="🧪" title="No lab tests ordered" description="Order your first lab test for home collection" /> : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {data.data.map(lt => (
              <div key={lt._id} style={{ background: 'var(--surface)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius)', padding: '16px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🧪</div>
                    <div>
                      <div style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: 13, color: 'var(--text-muted)' }}>{lt.orderId}</div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{lt.labName || 'Lab Order'}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: 16 }}>₹{lt.totalAmount}</span>
                    <StatusBadge status={lt.status} />
                    <StatusBadge status={lt.paymentStatus} />
                  </div>
                </div>
                {lt.tests?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                    {lt.tests.map((t, i) => <span key={i} style={{ background: 'var(--bg)', border: '1px solid var(--border-light)', borderRadius: 6, padding: '3px 10px', fontSize: 12 }}>{t.name} — ₹{t.price}</span>)}
                  </div>
                )}
                {lt.paymentStatus === 'pending' && lt.totalAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button className="btn btn-primary btn-sm" onClick={() => onPay({ type: 'lab-test', amount: lt.totalAmount, referenceId: lt._id, referenceModel: 'LabTest' })}>
                      💳 Pay ₹{lt.totalAmount}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
          <Pagination currentPage={page} totalPages={data.totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
};

// ─── My Medicines ─────────────────────────────────────────────────────────────
const MyMedicines = ({ onOrder, onPay }) => {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({ queryKey: ['my-medicines', page], queryFn: () => customerAPI.getMedicines({ page, limit: 8 }).then(r => r.data.data) });

  if (isLoading) return <PageSpinner />;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button className="btn btn-primary" onClick={onOrder}>💊 Order Medicines</button>
      </div>
      {!data?.data?.length ? <EmptyState icon="💊" title="No medicine orders" description="Order medicines with home delivery" /> : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {data.data.map(med => (
              <div key={med._id} style={{ background: 'var(--surface)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius)', padding: '16px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>💊</div>
                    <div>
                      <div style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: 13, color: 'var(--text-muted)' }}>{med.orderId}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{med.items?.length} item(s){med.expectedDelivery ? ` · Delivery: ${new Date(med.expectedDelivery).toLocaleDateString('en-IN')}` : ''}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontWeight: 700, color: 'var(--success)', fontSize: 16 }}>₹{med.totalAmount}</span>
                    <StatusBadge status={med.status} />
                    <StatusBadge status={med.paymentStatus} />
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: med.paymentStatus === 'pending' ? 10 : 0 }}>
                  {med.items?.map((m, i) => <span key={i} style={{ background: 'var(--bg)', border: '1px solid var(--border-light)', borderRadius: 6, padding: '3px 10px', fontSize: 12 }}>{m.name} × {m.quantity}</span>)}
                </div>
                {med.trackingId && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>🚚 Tracking: <strong>{med.trackingId}</strong></div>}
                {med.paymentStatus === 'pending' && med.totalAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                    <button className="btn btn-primary btn-sm" onClick={() => onPay({ type: 'medicine', amount: med.totalAmount, referenceId: med._id, referenceModel: 'Medicine' })}>
                      💳 Pay ₹{med.totalAmount}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
          <Pagination currentPage={page} totalPages={data.totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
};

// ─── My Profile ───────────────────────────────────────────────────────────────
const MyProfile = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

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

  return (
    <div style={{ maxWidth: 640 }}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius)', padding: 24, marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Personal Information</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
          <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
          <div className="form-group" style={{ gridColumn: '1/-1' }}><label className="form-label">Email (cannot change)</label><input className="form-input" value={user?.email || ''} disabled style={{ opacity: 0.6 }} /></div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary" onClick={() => saveMutation.mutate(form)} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? <Spinner size={16} color="white" /> : 'Save Changes'}
          </button>
        </div>
      </div>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius)', padding: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Change Password</h3>
        {[{ label: 'Current Password', field: 'currentPassword' }, { label: 'New Password', field: 'newPassword' }, { label: 'Confirm Password', field: 'confirmPassword' }].map(({ label, field }) => (
          <div key={field} className="form-group"><label className="form-label">{label}</label><input className="form-input" type="password" value={pwdForm[field]} onChange={e => setPwdForm(f => ({ ...f, [field]: e.target.value }))} /></div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary" onClick={() => { if (pwdForm.newPassword !== pwdForm.confirmPassword) return toast.error('Passwords do not match'); pwdMutation.mutate({ currentPassword: pwdForm.currentPassword, newPassword: pwdForm.newPassword }); }} disabled={pwdMutation.isPending}>
            {pwdMutation.isPending ? <Spinner size={16} color="white" /> : 'Update Password'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Customer Dashboard ──────────────────────────────────────────────────
const CustomerDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [showBookApt, setShowBookApt] = useState(false);
  const [showOrderLab, setShowOrderLab] = useState(false);
  const [showOrderMed, setShowOrderMed] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentPrefill, setPaymentPrefill] = useState({});
  const qc = useQueryClient();

  const { data: stats } = useQuery({
    queryKey: ['customer-stats'],
    queryFn: () => customerAPI.getStats().then(r => r.data.data),
  });

  const openPay = (prefill) => { setPaymentPrefill(prefill); setShowPayment(true); };
  const refresh = () => qc.invalidateQueries(['customer-stats']);

  const TABS = [
    { key: 'overview', icon: '🏠', label: 'Overview' },
    { key: 'appointments', icon: '📅', label: 'Appointments', count: stats?.appointments },
    { key: 'payments', icon: '💳', label: 'Payments' },
    { key: 'lab-tests', icon: '🧪', label: 'Lab Tests', count: stats?.labTests },
    { key: 'medicines', icon: '💊', label: 'Medicines', count: stats?.medicines },
    { key: 'profile', icon: '👤', label: 'Profile' },
  ];

  return (
    <div className="fade-in">
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
        borderRadius: 'var(--radius-lg)', padding: '28px 32px', marginBottom: 28,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 8px 32px rgba(0,181,173,0.3)',
      }}>
        <div>
          <h1 style={{ color: 'white', fontSize: 26, fontFamily: 'var(--font-display)', marginBottom: 6, fontWeight: 800 }}>
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>
            Book appointments, order medicines, and track your health — all in one place.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn" style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', backdropFilter: 'blur(8px)' }} onClick={() => setShowBookApt(true)}>📅 Book Appointment</button>
          <button className="btn" style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', backdropFilter: 'blur(8px)' }} onClick={() => setShowOrderLab(true)}>🧪 Order Lab Test</button>
          <button className="btn" style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', backdropFilter: 'blur(8px)' }} onClick={() => setShowOrderMed(true)}>💊 Order Medicine</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
        {TABS.map(tab => (
          <Tab key={tab.key} active={activeTab === tab.key} onClick={() => setActiveTab(tab.key)} icon={tab.icon} label={tab.label} count={tab.count} />
        ))}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
            <StatCard icon="📅" label="Total Appointments" value={stats?.appointments ?? '—'} color="var(--primary)" onClick={() => setActiveTab('appointments')} />
            <StatCard icon="💰" label="Total Spent" value={stats?.totalSpent ? `₹${stats.totalSpent.toLocaleString()}` : '₹0'} color="var(--success)" onClick={() => setActiveTab('payments')} />
            <StatCard icon="🧪" label="Lab Tests Ordered" value={stats?.labTests ?? '—'} color="var(--info)" onClick={() => setActiveTab('lab-tests')} />
            <StatCard icon="💊" label="Medicine Orders" value={stats?.medicines ?? '—'} color="var(--warning)" onClick={() => setActiveTab('medicines')} />
          </div>

          <div style={{ background: 'var(--surface)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius)', padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Quick Actions</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
              {[
                { icon: '📅', label: 'Book Appointment', action: () => setShowBookApt(true), color: 'var(--primary)' },
                { icon: '🧪', label: 'Order Lab Test', action: () => setShowOrderLab(true), color: '#6366F1' },
                { icon: '💊', label: 'Order Medicine', action: () => setShowOrderMed(true), color: 'var(--success)' },
                { icon: '💳', label: 'Make Payment', action: () => openPay({}), color: 'var(--warning)' },
                { icon: '📋', label: 'My Appointments', action: () => setActiveTab('appointments'), color: 'var(--info)' },
                { icon: '👤', label: 'Edit Profile', action: () => setActiveTab('profile'), color: 'var(--danger)' },
              ].map(a => (
                <button key={a.label} onClick={a.action} style={{
                  background: 'var(--bg)', border: '1px solid var(--border-light)', borderRadius: 12,
                  padding: '16px 12px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                  transition: 'var(--transition)', textAlign: 'center',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = a.color; e.currentTarget.style.background = a.color + '11'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.background = 'var(--bg)'; }}
                >
                  <span style={{ fontSize: 28 }}>{a.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>{a.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'appointments' && <MyAppointments onBook={() => setShowBookApt(true)} onPay={openPay} />}
      {activeTab === 'payments' && <MyPayments onPay={openPay} />}
      {activeTab === 'lab-tests' && <MyLabTests onOrder={() => setShowOrderLab(true)} onPay={openPay} />}
      {activeTab === 'medicines' && <MyMedicines onOrder={() => setShowOrderMed(true)} onPay={openPay} />}
      {activeTab === 'profile' && <MyProfile />}

      {/* Modals */}
      <BookAppointmentModal isOpen={showBookApt} onClose={() => setShowBookApt(false)} onSuccess={refresh} />
      <OrderLabTestModal isOpen={showOrderLab} onClose={() => setShowOrderLab(false)} onSuccess={refresh} />
      <OrderMedicineModal isOpen={showOrderMed} onClose={() => setShowOrderMed(false)} onSuccess={refresh} />
      <MakePaymentModal isOpen={showPayment} onClose={() => setShowPayment(false)} onSuccess={refresh} prefill={paymentPrefill} />
    </div>
  );
};

export default CustomerDashboard;
