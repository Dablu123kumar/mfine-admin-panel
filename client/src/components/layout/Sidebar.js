import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: '▦', exact: true },
  { path: '/doctors', label: 'Doctors', icon: '⚕', badge: null },
  { path: '/patients', label: 'Patients', icon: '👤' },
  { path: '/appointments', label: 'Appointments', icon: '📅' },
  { path: '/payments', label: 'Payments', icon: '💳' },
  { path: '/lab-tests', label: 'Lab Tests', icon: '🧪' },
  { path: '/medicines', label: 'Medicines', icon: '💊' },
  { path: '/prescriptions', label: 'Prescriptions', icon: '📋' },
  { path: '/specialities', label: 'Specialities', icon: '🏥' },
  { divider: true },
  { path: '/reports', label: 'Reports', icon: '📊' },
  { path: '/notifications', label: 'Notifications', icon: '🔔' },
  { path: '/users', label: 'Admin Users', icon: '👥', roles: ['superadmin', 'admin'] },
  { divider: true },
  { path: '/settings', label: 'Settings', icon: '⚙' },
];

const Sidebar = ({ collapsed, setCollapsed }) => {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'A';

  return (
    <aside style={{
      position: 'fixed', top: 0, left: 0, bottom: 0,
      width: collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)',
      background: 'var(--sidebar-bg)',
      display: 'flex', flexDirection: 'column',
      transition: 'var(--transition-slow)',
      zIndex: 100,
      borderRight: '1px solid rgba(255,255,255,0.05)',
    }}>
      {/* Logo */}
      <div style={{ padding: collapsed ? '20px 0' : '20px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid rgba(255,255,255,0.06)', minHeight: 70, justifyContent: collapsed ? 'center' : 'flex-start' }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: 'white', fontFamily: 'var(--font-display)', flexShrink: 0 }}>M</div>
        {!collapsed && (
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'white', fontSize: 18, letterSpacing: '-0.02em' }}>mfine</div>
            <div style={{ fontSize: 11, color: 'var(--sidebar-text)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Admin Panel</div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 0' }}>
        {NAV_ITEMS.map((item, i) => {
          if (item.divider) return <div key={i} style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '8px 16px' }} />;
          if (item.roles && !hasRole(...item.roles)) return null;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 12,
                padding: collapsed ? '11px 0' : '11px 16px',
                margin: '2px 8px',
                borderRadius: 'var(--radius)',
                color: isActive ? 'white' : 'var(--sidebar-text)',
                background: isActive ? 'rgba(0,181,173,0.18)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                fontSize: 14, fontWeight: isActive ? 600 : 400,
                transition: 'var(--transition)',
                textDecoration: 'none',
                justifyContent: collapsed ? 'center' : 'flex-start',
                position: 'relative',
              })}
            >
              <span style={{ fontSize: 16, lineHeight: 1, flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* User Profile */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: collapsed ? '16px 0' : '16px', display: 'flex', alignItems: 'center', gap: 12, justifyContent: collapsed ? 'center' : 'flex-start' }}>
        <div
          className="avatar"
          style={{ width: 36, height: 36, fontSize: 13, cursor: 'pointer', flexShrink: 0, background: 'rgba(0,181,173,0.2)', color: 'var(--primary)' }}
          onClick={() => navigate('/profile')}
        >
          {user?.avatar ? <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', borderRadius: '50%' }} /> : getInitials(user?.name)}
        </div>
        {!collapsed && (
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: 'white', fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
            <div style={{ color: 'var(--sidebar-text)', fontSize: 11, textTransform: 'capitalize' }}>{user?.role}</div>
          </div>
        )}
        {!collapsed && (
          <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'var(--sidebar-text)', cursor: 'pointer', padding: 4, borderRadius: 'var(--radius-sm)', transition: 'var(--transition)' }} title="Logout">
            ⬡
          </button>
        )}
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          position: 'absolute', top: '50%', right: -12, transform: 'translateY(-50%)',
          width: 24, height: 24, borderRadius: '50%',
          background: 'var(--primary)', border: '2px solid var(--sidebar-bg)',
          color: 'white', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'var(--transition)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        }}
      >
        {collapsed ? '›' : '‹'}
      </button>
    </aside>
  );
};

export default Sidebar;
