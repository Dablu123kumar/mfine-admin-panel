import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import toast from 'react-hot-toast';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { Spinner } from '../components/common/index.js';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: 'linear-gradient(135deg, #0F1923 0%, #1A2D3F 50%, #0F1923 100%)',
    }}>
      {/* Left Panel */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '60px 80px', maxWidth: 560,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 48 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, fontWeight: 800, color: 'white', fontFamily: 'var(--font-display)',
            boxShadow: '0 8px 24px rgba(0,181,173,0.4)',
          }}>M</div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'white', fontSize: 24 }}>mfine</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Admin Console</div>
          </div>
        </div>

        {/* Heading */}
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 38, fontWeight: 800, color: 'white', lineHeight: 1.1, marginBottom: 12 }}>
          Welcome<br /><span style={{ color: 'var(--primary)' }}>back.</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 16, marginBottom: 40, lineHeight: 1.6 }}>
          Sign in to your admin panel to manage doctors, patients, and more.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Email Address
            </label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="admin@mfine.com"
              required
              style={{
                width: '100%', padding: '13px 16px',
                background: 'rgba(255,255,255,0.07)',
                border: '1.5px solid rgba(255,255,255,0.12)',
                borderRadius: 'var(--radius)',
                color: 'white', fontSize: 14,
                transition: 'var(--transition)',
                outline: 'none',
              }}
              onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(0,181,173,0.15)'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          <div className="form-group" style={{ position: 'relative' }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Password
            </label>
            <input
              type={showPwd ? 'text' : 'password'}
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              required
              style={{
                width: '100%', padding: '13px 44px 13px 16px',
                background: 'rgba(255,255,255,0.07)',
                border: '1.5px solid rgba(255,255,255,0.12)',
                borderRadius: 'var(--radius)',
                color: 'white', fontSize: 14,
                transition: 'var(--transition)',
                outline: 'none',
              }}
              onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(0,181,173,0.15)'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; e.target.style.boxShadow = 'none'; }}
            />
            <button
              type="button"
              onClick={() => setShowPwd(!showPwd)}
              style={{ position: 'absolute', right: 14, bottom: 13, background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', display: 'flex' }}
            >
              {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 28 }}>
            <a href="/forgot-password" style={{ fontSize: 13, color: 'var(--primary)', textDecoration: 'none' }}>Forgot password?</a>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '14px',
              background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
              border: 'none', borderRadius: 'var(--radius)',
              color: 'white', fontSize: 15, fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              transition: 'var(--transition)',
              boxShadow: '0 4px 16px rgba(0,181,173,0.3)',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? <Spinner size={18} color="white" /> : <><LogIn size={18} /> Sign In</>}
          </button>
        </form>

        <p style={{ marginTop: 32, fontSize: 12, color: 'rgba(255,255,255,0.25)', textAlign: 'center' }}>
          © {new Date().getFullYear()} MFine Health Technologies. All rights reserved.
        </p>
      </div>

      {/* Right Panel */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: 60, position: 'relative', overflow: 'hidden',
      }}>
        {/* Background decoration */}
        <div style={{ position: 'absolute', top: '10%', right: '10%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,181,173,0.15) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '15%', left: '5%', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,181,173,0.08) 0%, transparent 70%)' }} />

        {/* Stats preview */}
        <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 420 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'white', marginBottom: 8, textAlign: 'center' }}>
            Healthcare at Scale
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginBottom: 36, fontSize: 14 }}>
            Manage millions of health interactions from one dashboard
          </p>

          {/* Mini stat cards */}
          {[
            { label: 'Active Doctors', value: '5,200+', icon: '⚕', color: '#00B5AD' },
            { label: 'Patients Served', value: '2.8M+', icon: '👤', color: '#3B82F6' },
            { label: 'Daily Consultations', value: '12,400+', icon: '📅', color: '#22C55E' },
            { label: 'Specialities', value: '35+', icon: '🏥', color: '#F59E0B' },
          ].map((s, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 16,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 14, padding: '16px 20px', marginBottom: 12,
              backdropFilter: 'blur(8px)',
              animation: `fadeIn 0.4s ease ${i * 0.1}s both`,
            }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: s.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{s.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{s.label}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'white', fontFamily: 'var(--font-display)' }}>{s.value}</div>
              </div>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, boxShadow: `0 0 12px ${s.color}` }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Login;
