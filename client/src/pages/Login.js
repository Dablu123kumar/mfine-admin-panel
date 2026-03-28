import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import toast from 'react-hot-toast';
import { Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
import { Spinner } from '../components/common/index.js';

const Login = () => {
  const [mode, setMode] = useState('admin'); // 'admin' | 'customer'
  const [subMode, setSubMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, registerCustomer } = useAuth();
  const navigate = useNavigate();

  const handleTab = (newMode) => { setMode(newMode); setSubMode('login'); setForm({ name: '', email: '', phone: '', password: '' }); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (subMode === 'login') {
        const data = await login({ email: form.email, password: form.password });
        toast.success('Welcome back!');
        navigate(mode === 'customer' || data.data.role === 'user' ? '/customer' : '/');
      } else {
        await registerCustomer(form);
        toast.success('Account created! Welcome 🎉');
        navigate('/customer');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'linear-gradient(135deg, #0F1923 0%, #1A2D3F 50%, #0F1923 100%)' }}>
      {/* Left Panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '40px 80px', maxWidth: 600 }}>
        
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 36 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, fontWeight: 800, color: 'white', fontFamily: 'var(--font-display)',
            boxShadow: '0 8px 24px rgba(0,181,173,0.4)',
          }}>M</div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'white', fontSize: 24 }}>mfine</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Integrated Health</div>
          </div>
        </div>

        {/* Portal Switching Tabs */}
        <div style={{ display: 'flex', gap: 8, background: 'rgba(255,255,255,0.05)', padding: 6, borderRadius: 14, marginBottom: 32 }}>
          <button onClick={() => handleTab('customer')} style={{
            flex: 1, padding: '12px', border: 'none', borderRadius: 10, cursor: 'pointer',
            background: mode === 'customer' ? 'var(--primary)' : 'transparent',
            color: mode === 'customer' ? 'white' : 'rgba(255,255,255,0.5)',
            fontWeight: 700, fontSize: 14, transition: 'var(--transition)',
            boxShadow: mode === 'customer' ? '0 4px 12px rgba(0,181,173,0.3)' : 'none'
          }}>🧑 Customer Portal</button>
          <button onClick={() => handleTab('admin')} style={{
            flex: 1, padding: '12px', border: 'none', borderRadius: 10, cursor: 'pointer',
            background: mode === 'admin' ? '#3B82F6' : 'transparent',
            color: mode === 'admin' ? 'white' : 'rgba(255,255,255,0.5)',
            fontWeight: 700, fontSize: 14, transition: 'var(--transition)',
            boxShadow: mode === 'admin' ? '0 4px 12px rgba(59,130,246,0.3)' : 'none'
          }}>💼 Staff / Admin</button>
        </div>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color: 'white', lineHeight: 1.2, marginBottom: 8 }}>
            {mode === 'admin' ? 'Sign in to Admin Console' : (subMode === 'login' ? 'Welcome back to MFine' : 'Create your MFine account')}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15 }}>
            {mode === 'admin' ? 'Access patient records, manage doctors, and handle operations.' :
              (subMode === 'login' ? 'Book appointments, order medicines, and track your health.' : 'Join MFine to get access to top doctors and health services.')}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {mode === 'customer' && subMode === 'register' && (
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
               <div className="form-group" style={{ marginBottom: 20 }}>
                 <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 6, textTransform: 'uppercase' }}>Full Name</label>
                 <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required
                   style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(255,255,255,0.12)', borderRadius: 'var(--radius)', color: 'white', outline: 'none' }} />
               </div>
               <div className="form-group" style={{ marginBottom: 20 }}>
                 <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 6, textTransform: 'uppercase' }}>Phone Number</label>
                 <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required
                   style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(255,255,255,0.12)', borderRadius: 'var(--radius)', color: 'white', outline: 'none' }} />
               </div>
             </div>
          )}

          <div className="form-group" style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 6, textTransform: 'uppercase' }}>Email Address</label>
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required placeholder="name@example.com"
              style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(255,255,255,0.12)', borderRadius: 'var(--radius)', color: 'white', outline: 'none' }} />
          </div>

          <div className="form-group" style={{ position: 'relative', marginBottom: 28 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 6, textTransform: 'uppercase' }}>Password</label>
            <input type={showPwd ? 'text' : 'password'} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required placeholder="••••••••"
              style={{ width: '100%', padding: '12px 44px 12px 16px', background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(255,255,255,0.12)', borderRadius: 'var(--radius)', color: 'white', outline: 'none' }} />
            <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: 14, bottom: 12, background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
              {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '14px', borderRadius: 'var(--radius)', border: 'none', color: 'white', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
            background: mode === 'customer' ? 'linear-gradient(135deg, var(--primary), var(--primary-dark))' : 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'var(--transition)',
            boxShadow: mode === 'customer' ? '0 4px 16px rgba(0,181,173,0.3)' : '0 4px 16px rgba(59,130,246,0.3)', opacity: loading ? 0.7 : 1,
          }}>
            {loading ? <Spinner size={18} color="white" /> : (subMode === 'login' ? <><LogIn size={18} /> Sign In</> : <><UserPlus size={18} /> Create Account</>)}
          </button>
        </form>

        {mode === 'customer' && (
          <div style={{ marginTop: 24, textAlign: 'center' }}>
            {subMode === 'login' ? (
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>
                Don't have an account? <button onClick={() => setSubMode('register')} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }}>Register here</button>
              </p>
            ) : (
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>
                Already have an account? <button onClick={() => setSubMode('login')} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }}>Sign in here</button>
              </p>
            )}
          </div>
        )}

        <p style={{ marginTop: 'auto', paddingTop: 30, fontSize: 12, color: 'rgba(255,255,255,0.2)', textAlign: 'center' }}>
          © {new Date().getFullYear()} MFine Health Technologies
        </p>
      </div>

      {/* Right Panel (Graphic) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 60, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '10%', right: '10%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,181,173,0.1) 0%, transparent 70%)' }}></div>
        <div style={{ position: 'absolute', bottom: '15%', left: '5%', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)' }}></div>
        
        <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 420 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'white', marginBottom: 12, textAlign: 'center' }}>
            {mode === 'customer' ? 'Your Health in Your Hands' : 'Healthcare at Scale'}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginBottom: 36, fontSize: 15 }}>
            {mode === 'customer' ? 'Access India\'s top doctors, order medicines, and track your health vitals easily.' : 'Manage millions of health interactions and coordinate operations from one dashboard.'}
          </p>
          
          {[
            mode === 'customer' ? { label: 'Top Specialists', icon: '⚕', color: '#00B5AD' } : { label: 'Active Doctors', icon: '⚕', color: '#00B5AD' },
            mode === 'customer' ? { label: 'Video Consultations', icon: '💻', color: '#3B82F6' } : { label: 'Patients Served', icon: '👤', color: '#3B82F6' },
            mode === 'customer' ? { label: 'Home Lab Tests', icon: '🧪', color: '#8B5CF6' } : { label: 'Daily Consultations', icon: '📅', color: '#22C55E' },
            mode === 'customer' ? { label: 'Medicines Delivered', icon: '💊', color: '#F59E0B' } : { label: 'Specialities', icon: '🏥', color: '#F59E0B' }
          ].map((s, i) => (
             <div key={i} style={{
               display: 'flex', alignItems: 'center', gap: 16, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
               borderRadius: 14, padding: '16px 20px', marginBottom: 12, backdropFilter: 'blur(8px)', animation: `fadeIn 0.4s ease ${i * 0.1}s both`
             }}>
               <div style={{ width: 44, height: 44, borderRadius: 12, background: s.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{s.icon}</div>
               <div style={{ flex: 1, fontSize: 15, fontWeight: 600, color: 'white' }}>{s.label}</div>
               <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, boxShadow: `0 0 12px ${s.color}` }} />
             </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Login;
