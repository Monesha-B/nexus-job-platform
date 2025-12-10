import { createContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const response = await api.get('/auth/me');
      setUser(response.data.data.user);
    } catch (err) {
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = useCallback(async (email, password) => {
    try {
      setError(null);
      const response = await api.post('/auth/login', { email, password });
      console.log('Login response:', response.data); // Debug log
      
      // Handle both response structures
      const token = response.data.token || response.data.data?.token;
      const userData = response.data.data?.user || response.data.user;
      
      if (token) {
        localStorage.setItem('token', token);
        setUser(userData);
        return { success: true };
      } else {
        return { success: false, error: 'No token received' };
      }
    } catch (err) {
      console.log('Login error:', err.response?.data); // Debug log
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  const register = useCallback(async (userData) => {
    try {
      setError(null);
      const response = await api.post('/auth/register', userData);
      console.log('Register response:', response.data); // Debug log
      
      const token = response.data.token || response.data.data?.token;
      const user = response.data.data?.user || response.data.user;
      
      if (token) {
        localStorage.setItem('token', token);
        setUser(user);
        return { success: true };
      } else {
        return { success: false, error: 'No token received' };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  const googleLogin = useCallback(async (credential) => {
    try {
      setError(null);
      const payload = JSON.parse(atob(credential.split('.')[1]));
      
      const response = await api.post('/auth/google', {
        credential,
        clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        profile: {
          googleId: payload.sub,
          email: payload.email,
          firstName: payload.given_name,
          lastName: payload.family_name,
          avatar: payload.picture,
        },
      });
      
      console.log('Google login response:', response.data); // Debug log
      
      const token = response.data.token || response.data.data?.token;
      const userData = response.data.data?.user || response.data.user;
      
      if (token) {
        localStorage.setItem('token', token);
        setUser(userData);
        return { success: true };
      } else {
        return { success: false, error: 'No token received' };
      }
    } catch (err) {
      console.log('Google login error:', err.response?.data); // Debug log
      const message = err.response?.data?.message || 'Google login failed';
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
    }
  }, []);

  const updateUser = useCallback((userData) => {
    setUser(prev => ({ ...prev, ...userData }));
  }, []);

  const value = {
    user,
    loading,
    error,
    login,
    register,
    googleLogin,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isRecruiter: user?.role === 'recruiter' || user?.role === 'admin',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
