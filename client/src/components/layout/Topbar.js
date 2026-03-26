import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { Bell, Search, ChevronDown, User, Settings, LogOut } from 'lucide-react';

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/doctors': 'Doctors',
  '/patients': 'Patients',
  '/appointments': 'Appointments',
  '/payments': 'Payments',
  '/lab-tests': 'Lab Tests',
  '/medicines': 'Medicines',
  '/prescriptions': 'Prescriptions',
  '/specialities': 'Specialities',
  '/users': 'Admin Users',
  '/reports': 'Reports',
  '/notifications': 'Notifications',
  '/settings': 'Settings',
  '/profile': 'My Profile',
};

const Topbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const title = PAGE_TITLES[location.pathname] || 'MFine Admin';
  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'A';
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header style={{
      height: 64,
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border-light)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    }}>
      {/* Left */}
      <div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h2>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>{today}</p>
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Search */}
        <button
          className="btn btn-ghost btn-icon"
          onClick={() => setSearchOpen(!searchOpen)}
          style={{ color: 'var(--text-secondary)' }}
        >
          <Search size={18} />
        </button>

        {/* Notifications */}
        <button
          className="btn btn-ghost btn-icon"
          onClick={() => navigate('/notifications')}
          style={{ color: 'var(--text-secondary)', position: 'relative' }}
        >
          <Bell size={18} />
          <span style={{
            position: 'absolute', top: 6, right: 6,
            width: 8, height: 8, background: 'var(--accent)',
            borderRadius: '50%', border: '2px solid white',
          }} />
        </button>

        {/* Divider */}
        <div style={{ width: 1, height: 32, background: 'var(--border)', margin: '0 4px' }} />

        {/* User dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '6px 12px', borderRadius: 'var(--radius)',
              background: 'none', border: 'none', cursor: 'pointer',
              transition: 'var(--transition)',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            <div className="avatar" style={{ width: 32, height: 32, fontSize: 12, background: 'var(--primary-light)', color: 'var(--primary)' }}>
              {user?.avatar
                ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                : getInitials(user?.name)}
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{user?.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user?.role}</div>
            </div>
            <ChevronDown size={14} color="var(--text-muted)" style={{ transition: 'var(--transition)', transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0)' }} />
          </button>

          {dropdownOpen && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 98 }} onClick={() => setDropdownOpen(false)} />
              <div style={{
                position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                background: 'var(--surface)', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)',
                minWidth: 200, zIndex: 99, overflow: 'hidden',
                animation: 'fadeIn 0.15s ease',
              }}>
                <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-light)' }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{user?.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{user?.email}</div>
                </div>
                {[
                  { icon: <User size={14} />, label: 'My Profile', path: '/profile' },
                  { icon: <Settings size={14} />, label: 'Settings', path: '/settings' },
                ].map(item => (
                  <button
                    key={item.path}
                    onClick={() => { navigate(item.path); setDropdownOpen(false); }}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 16px', background: 'none', border: 'none',
                      cursor: 'pointer', fontSize: 14, color: 'var(--text-primary)',
                      transition: 'var(--transition)', textAlign: 'left',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <span style={{ color: 'var(--text-muted)' }}>{item.icon}</span>
                    {item.label}
                  </button>
                ))}
                <div style={{ borderTop: '1px solid var(--border-light)' }}>
                  <button
                    onClick={handleLogout}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 16px', background: 'none', border: 'none',
                      cursor: 'pointer', fontSize: 14, color: 'var(--danger)',
                      transition: 'var(--transition)', textAlign: 'left',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--danger-light)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <LogOut size={14} />
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
