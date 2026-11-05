import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'

  // Refresh or check session on initial load
  const checkSession = async () => {
    try {
      const data = await authApi.getCurrentUser();
      if (data?.success && data?.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  const login = async (email, password) => {
    const data = await authApi.login({ email, password });
    if (data?.success && data?.user) {
      setUser(data.user);
      setAuthModalOpen(false);
      return data.user;
    }
    throw new Error(data?.error || 'Login failed.');
  };

  const register = async (payload) => {
    const data = await authApi.register(payload);
    if (data?.success && data?.user) {
      setUser(data.user);
      setAuthModalOpen(false);
      return data.user;
    }
    throw new Error(data?.error || 'Registration failed.');
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.warn('Logout error:', err.message);
    } finally {
      setUser(null);
    }
  };

  const openAuth = (mode = 'login') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const closeAuth = () => {
    setAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        refreshUser: checkSession,
        authModalOpen,
        authMode,
        openAuth,
        closeAuth,
        setAuthMode
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
