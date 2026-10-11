import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { disconnectSocket } from '../services/socket';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('serviceman_token') || '');
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('serviceman_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
          }
        } catch (err) {
          console.warn('[Auth] Session invalid or expired');
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (emailOrPhone, password) => {
    const res = await api.post('/auth/login', { emailOrPhone, password });
    if (res.data.success) {
      const { token: authToken, user: authUser } = res.data;
      setToken(authToken);
      setUser(authUser);
      localStorage.setItem('serviceman_token', authToken);
      localStorage.setItem('serviceman_user', JSON.stringify(authUser));
      return authUser;
    }
    throw new Error(res.data.message || 'Login failed');
  };

  const register = async (formData) => {
    const res = await api.post('/auth/register', formData);
    if (res.data.success) {
      const { token: authToken, user: authUser } = res.data;
      setToken(authToken);
      setUser(authUser);
      localStorage.setItem('serviceman_token', authToken);
      localStorage.setItem('serviceman_user', JSON.stringify(authUser));
      return authUser;
    }
    throw new Error(res.data.message || 'Registration failed');
  };

  const logout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('serviceman_token');
    localStorage.removeItem('serviceman_user');
    disconnectSocket();
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.user);
        localStorage.setItem('serviceman_user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      console.warn('[Auth] Failed to refresh user profile');
    }
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    isCustomer: user?.role === 'customer',
    isProvider: user?.role === 'provider',
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    refreshUser,
    setUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
