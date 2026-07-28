import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Fetch current user on mount if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data && res.data.success) {
            setUser(res.data.user);
          }
        } catch (error) {
          console.error('Failed to load user session', error);
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  // Login handler
  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data && res.data.success) {
      const { token: userToken, user: userData } = res.data;
      localStorage.setItem('token', userToken);
      setToken(userToken);
      setUser(userData);
      return res.data;
    } else {
      throw new Error(res.data?.message || 'Login failed');
    }
  };

  // Register handler
  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    if (res.data && res.data.success) {
      const { token: userToken, user: userData } = res.data;
      localStorage.setItem('token', userToken);
      setToken(userToken);
      setUser(userData);
      return res.data;
    } else {
      throw new Error(res.data?.message || 'Registration failed');
    }
  };

  // Profile update handler
  const updateUserProfile = async (name) => {
    const res = await api.put('/auth/profile', { name });
    if (res.data && res.data.success) {
      setUser(res.data.user);
      return res.data;
    } else {
      throw new Error(res.data?.message || 'Failed to update profile');
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Ignore API logout error
    } finally {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, updateUserProfile, logout }}
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
