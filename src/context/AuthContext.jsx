import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { loginRequest, registerRequest, meRequest, logoutRequest } from '../api/authApi';
import { setOnAuthFailure } from '../api/axiosInstance';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const forceLogout = useCallback(() => {
    setUser(null);
  }, []);

  useEffect(() => {
    // If the refresh token turns out to be invalid mid-session (axiosInstance
    // interceptor), drop back to the Login screen the same way the web app redirects.
    setOnAuthFailure(forceLogout);
  }, [forceLogout]);

  useEffect(() => {
    const bootstrap = async () => {
      const token = await SecureStore.getItemAsync('pf_accessToken');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await meRequest();
        setUser(data.data.user);
      } catch (err) {
        await SecureStore.deleteItemAsync('pf_accessToken');
        await SecureStore.deleteItemAsync('pf_refreshToken');
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, []);

  const login = async (payload) => {
    const { data } = await loginRequest(payload);
    await SecureStore.setItemAsync('pf_accessToken', data.data.accessToken);
    await SecureStore.setItemAsync('pf_refreshToken', data.data.refreshToken);
    setUser(data.data.user);
    return data.data.user;
  };

  const register = async (payload) => {
    const { data } = await registerRequest(payload);
    await SecureStore.setItemAsync('pf_accessToken', data.data.accessToken);
    await SecureStore.setItemAsync('pf_refreshToken', data.data.refreshToken);
    setUser(data.data.user);
    return data.data.user;
  };

  const logout = async () => {
    try {
      await logoutRequest();
    } catch (err) {
      // ignore — we clear local state regardless
    }
    await SecureStore.deleteItemAsync('pf_accessToken');
    await SecureStore.deleteItemAsync('pf_refreshToken');
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, loading, login, register, logout, isAdmin: user?.role === 'admin' }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
