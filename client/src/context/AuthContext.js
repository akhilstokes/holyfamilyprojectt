import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const applyRoleClass = useCallback((u) => {
    try {
      const el = document && document.body;
      if (!el) return;
      const roleClasses = ['role-admin','role-manager','role-accountant','role-delivery_staff','role-field_staff','role-user','role-lab','role-lab_manager','role-lab_staff'];
      roleClasses.forEach(c => el.classList.remove(c));
      const r = u && u.role ? `role-${u.role}` : null;
      if (r) el.classList.add(r);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('auth');
      if (saved) {
        const parsed = JSON.parse(saved);
        setUser(parsed.user || null);
        setToken(parsed.token || null);
        applyRoleClass(parsed.user || null);
      }
    } finally {
      setLoading(false);
    }
  }, [applyRoleClass]);

  const saveAuth = useCallback((next) => {
    if (next && next.token) {
      localStorage.setItem('auth', JSON.stringify(next));
      // Also persist raw token for legacy parts of the app
      localStorage.setItem('token', next.token);
      applyRoleClass(next.user || null);
    } else {
      localStorage.removeItem('auth');
      localStorage.removeItem('token');
      applyRoleClass(null);
    }
  }, [applyRoleClass]);

  const login = useCallback(async (email, password) => {
    const { data } = await axios.post(`${apiBase}/api/auth/login`, { email, password });
    setUser(data.user);
    setToken(data.token);
    saveAuth({ user: data.user, token: data.token });
    return data;
  }, [apiBase, saveAuth]);

  // Staff login using Staff ID (e.g., HFA42 or HFP-S-0002)
  const staffLogin = useCallback(async (staffId) => {
    const { data } = await axios.post(`${apiBase}/api/auth/staff-login`, { staffId });
    setUser(data.user);
    setToken(data.token);
    saveAuth({ user: data.user, token: data.token });
    return data;
  }, [apiBase, saveAuth]);

  const register = useCallback(async (payload) => {
    const { data } = await axios.post(`${apiBase}/api/auth/register`, payload);
    // Don't auto-login - let user login manually after registration
    return data;
  }, [apiBase]);

  const googleSignIn = useCallback(async (credential) => {
    try {
      // Backend expects POST /api/auth/google-signin with body { token }
      const { data } = await axios.post(`${apiBase}/api/auth/google-signin`, { token: credential });
      setUser(data.user);
      setToken(data.token);
      saveAuth({ user: data.user, token: data.token });
      return data;
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      throw error;
    }
  }, [apiBase, saveAuth]);

  const logout = useCallback(async () => {
    const ok = window.confirm('Are you sure you want to log out?');
    if (!ok) return;
    setUser(null);
    setToken(null);
    saveAuth(null);
  }, [saveAuth]);

  // Validate token and refresh user object from backend
  const validateToken = useCallback(async () => {
    if (!token) return null;
    try {
      const { data } = await axios.get(`${apiBase}/api/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data) {
        setUser(data);
        // Persist merged user info
        saveAuth({ user: data, token });
      }
      return data;
    } catch (e) {
      // if token is invalid, clear auth
      setUser(null);
      setToken(null);
      saveAuth(null);
      return null;
    }
  }, [apiBase, token, saveAuth]);

  const value = useMemo(() => ({
    user,
    token,
    isAuthenticated: Boolean(token && user),
    loading,
    login,
    logout,
    register,
    googleSignIn,
    staffLogin,
    validateToken,
  }), [user, token, loading, login, logout, register, googleSignIn, staffLogin, validateToken]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
