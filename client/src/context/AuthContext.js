import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../utils/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mfine_user')); } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    const token = localStorage.getItem('mfine_token');
    if (!token) { setLoading(false); return; }
    try {
      const { data } = await authAPI.me();
      setUser(data.data);
      localStorage.setItem('mfine_user', JSON.stringify(data.data));
    } catch {
      localStorage.removeItem('mfine_token');
      localStorage.removeItem('mfine_user');
      setUser(null);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchMe(); }, [fetchMe]);

  const login = async (credentials) => {
    const { data } = await authAPI.login(credentials);
    localStorage.setItem('mfine_token', data.token);
    localStorage.setItem('mfine_user', JSON.stringify(data.data));
    setUser(data.data);
    return data;
  };

  const registerCustomer = async (details) => {
    const { data } = await authAPI.registerCustomer(details);
    localStorage.setItem('mfine_token', data.token);
    localStorage.setItem('mfine_user', JSON.stringify(data.data));
    setUser(data.data);
    return data;
  };

  const logout = async () => {
    try { await authAPI.logout(); } catch {}
    localStorage.removeItem('mfine_token');
    localStorage.removeItem('mfine_user');
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('mfine_user', JSON.stringify(updatedUser));
  };

  const hasRole = (...roles) => roles.includes(user?.role);
  const isAdmin = () => hasRole('superadmin', 'admin');
  const isSuperAdmin = () => hasRole('superadmin');
  const isCustomer = () => hasRole('user');

  return (
    <AuthContext.Provider value={{ user, loading, login, registerCustomer, logout, updateUser, hasRole, isAdmin, isSuperAdmin, isCustomer }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
