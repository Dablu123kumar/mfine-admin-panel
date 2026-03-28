import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import toast from 'react-hot-toast';

const CustomerLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: 'var(--font-body)' }}>
      {/* Top Navigation Bar */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'var(--sidebar-bg)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        padding: '0 24px',
        height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 2px 20px rgba(0,0,0,0.3)',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 800, color: 'white',
          }}>M</div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'white', fontSize: 18, letterSpacing: '-0.02em' }}>mfine</div>
            <div style={{ fontSize: 10, color: 'var(--sidebar-text)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>My Health Portal</div>
          </div>
        </div>

        {/* Nav Links */}
        <nav style={{ display: 'flex', gap: 4 }}>
          {[
            { to: '/customer', label: 'Overview', icon: '🏠', exact: true },
          ].map(item => (
            <NavLink key={item.to} to={item.to} end={item.exact}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 14px', borderRadius: 8,
                color: isActive ? 'white' : 'var(--sidebar-text)',
                background: isActive ? 'rgba(0,181,173,0.18)' : 'transparent',
                fontSize: 14, fontWeight: isActive ? 600 : 400,
                textDecoration: 'none', transition: 'var(--transition)',
              })}
            >
              <span>{item.icon}</span> <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'rgba(0,181,173,0.2)', color: 'var(--primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700,
            }}>{getInitials(user?.name)}</div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ color: 'white', fontSize: 13, fontWeight: 600 }}>{user?.name}</span>
              <span style={{ color: 'var(--sidebar-text)', fontSize: 11 }}>Customer</span>
            </div>
          </div>
          <button onClick={handleLogout} style={{
            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
            color: 'var(--sidebar-text)', cursor: 'pointer', padding: '7px 14px',
            borderRadius: 8, fontSize: 13, transition: 'var(--transition)',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = 'white'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'var(--sidebar-text)'; }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Page Content */}
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default CustomerLayout;
