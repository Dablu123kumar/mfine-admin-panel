import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { doctorsAPI, specialitiesAPI } from '../../utils/api.js';
import { Modal, Spinner } from './index.js';
import toast from 'react-hot-toast';

const DoctorFormModal = ({ doctor, onClose, onSaved }) => {
  const isEdit = !!doctor;
  const [form, setForm] = useState({
    name: '', email: '', phone: '', gender: '', experience: '',
    registrationNumber: '', bio: '', speciality: '',
    consultationFee: { chat: 0, audio: 0, video: 0 },
    languages: '',
    ...doctor,
    languages: doctor?.languages?.join(', ') || '',
  });

  const { data: specialities } = useQuery({
    queryKey: ['specialities-list'],
    queryFn: () => specialitiesAPI.getAll({ limit: 100 }).then(r => r.data.data),
  });

  const mutation = useMutation({
    mutationFn: (data) => isEdit ? doctorsAPI.update(doctor._id, data) : doctorsAPI.create(data),
    onSuccess: () => { toast.success(isEdit ? 'Doctor updated!' : 'Doctor created!'); onSaved(); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to save doctor'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...form, languages: form.languages.split(',').map(l => l.trim()).filter(Boolean) };
    mutation.mutate(payload);
  };

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));
  const setFee = (type, value) => setForm(f => ({ ...f, consultationFee: { ...f.consultationFee, [type]: Number(value) } }));

  return (
    <Modal isOpen title={isEdit ? 'Edit Doctor' : 'Add New Doctor'} onClose={onClose} size={640}>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {[
            { label: 'Full Name', field: 'name', type: 'text', required: true },
            { label: 'Email', field: 'email', type: 'email', required: true },
            { label: 'Phone', field: 'phone', type: 'tel', required: true },
            { label: 'Registration No.', field: 'registrationNumber', type: 'text' },
            { label: 'Experience (Years)', field: 'experience', type: 'number' },
            { label: 'Languages (comma separated)', field: 'languages', type: 'text' },
          ].map(({ label, field, type, required }) => (
            <div key={field} className="form-group">
              <label className="form-label">{label}</label>
              <input className="form-input" type={type} value={form[field] || ''} onChange={e => set(field, e.target.value)} required={required} />
            </div>
          ))}

          <div className="form-group">
            <label className="form-label">Gender</label>
            <select className="form-select" value={form.gender || ''} onChange={e => set('gender', e.target.value)}>
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Speciality</label>
            <select className="form-select" value={form.speciality?._id || form.speciality || ''} onChange={e => set('speciality', e.target.value)} required>
              <option value="">Select Speciality</option>
              {(specialities || []).map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
          </div>
        </div>

        {/* Consultation Fees */}
        <div className="form-group">
          <label className="form-label">Consultation Fees (₹)</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            {['chat', 'audio', 'video'].map(type => (
              <div key={type}>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize', display: 'block', marginBottom: 4 }}>{type}</label>
                <input className="form-input" type="number" value={form.consultationFee?.[type] || 0} onChange={e => setFee(type, e.target.value)} min="0" />
              </div>
            ))}
          </div>
        </div>

        {/* Bio */}
        <div className="form-group">
          <label className="form-label">Bio</label>
          <textarea className="form-input" value={form.bio || ''} onChange={e => set('bio', e.target.value)} rows={3} style={{ resize: 'vertical' }} />
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={mutation.isPending}>
            {mutation.isPending ? <Spinner size={16} color="white" /> : isEdit ? 'Update Doctor' : 'Add Doctor'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default DoctorFormModal;
