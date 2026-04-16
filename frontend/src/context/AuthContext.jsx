import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI, setToken } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount: restore session if token exists
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      authAPI
        .getMe()
        .then(({ data }) => setUser(data))
        .catch(() => {
          setToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    const { data } = await authAPI.login(credentials);
    setToken(data.accessToken);
    setUser(data.user);
    return data;
  };

  const register = async (credentials) => {
    const { data } = await authAPI.register(credentials);
    setToken(data.accessToken);
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch {
      // ignore errors on logout
    }
    setToken(null);
    setUser(null);
  };

  const refreshUser = useCallback(async () => {
    const { data } = await authAPI.getMe();
    setUser(data);
  }, []);

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    refreshUser,
    isAdmin: user?.role === 'admin',
    isManager: user?.role === 'manager',
    isUser: user?.role === 'user',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
