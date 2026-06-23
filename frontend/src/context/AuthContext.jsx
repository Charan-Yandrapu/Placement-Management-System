import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  // Load user details if token exists
  const loadUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.user);
      } else {
        localStorage.removeItem('token');
        setUser(null);
      }
    } catch (err) {
      console.error('Error loading user:', err);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Login User
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.post('/auth/login', { email, password });
      
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        return { success: true, role: res.data.user.role };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please check credentials.';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Register User
  const register = async (name, email, password, role) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.post('/auth/register', { name, email, password, role });

      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        return { success: true, role: res.data.user.role };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed.';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Logout User
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        loadUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
