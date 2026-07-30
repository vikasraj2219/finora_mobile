import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { loginRequest, registerRequest, meRequest, logoutRequest } from '../api/authApi';
import { setOnAuthFailure } from '../api/axiosInstance';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);

  const forceLogout = useCallback(() => {
    setUser(null);
  }, []);

  useEffect(() => {
    // If the refresh token turns out to be invalid mid-session (axiosInstance
    // interceptor), drop back to the Login screen the same way the web app redirects.
    setOnAuthFailure(forceLogout);
  }, [forceLogout]);

  useEffect(() => {
    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    const bootstrap = async () => {
      const token = await SecureStore.getItemAsync('pf_accessToken');
      if (!token) {
        setLoading(false);
        return;
      }

      // Retry non-auth failures a few times with backoff before giving up — this
      // rides out a Render free-tier cold start (which can take 30-50s to wake up
      // and may 502/503 in the meantime) instead of visibly bouncing the person to
      // the Login screen for what is actually still a valid, logged-in session.
      const delaysMs = [3000, 6000, 12000, 20000];
      for (let attempt = 0; attempt <= delaysMs.length; attempt += 1) {
        try {
          const { data } = await meRequest();
          setUser(data.data.user);
          setLoading(false);
          setRetrying(false);
          return;
        } catch (err) {
          if (err.response?.status === 401) {
            // Genuine invalid session — axiosInstance's interceptor already tried
            // a silent refresh before this rejected, so the refresh token itself
            // is expired/revoked. No point retrying; sign out for real.
            await SecureStore.deleteItemAsync('pf_accessToken');
            await SecureStore.deleteItemAsync('pf_refreshToken');
            setLoading(false);
            setRetrying(false);
            return;
          }
          if (attempt < delaysMs.length) {
            setRetrying(true);
            await wait(delaysMs[attempt]);
          }
          // else: exhausted retries — fall through and show Login, but keep the
          // tokens so the next app open can succeed once the backend responds.
        }
      }
      setLoading(false);
      setRetrying(false);
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
    () => ({ user, loading, retrying, login, register, logout, isAdmin: user?.role === 'admin' }),
    [user, loading, retrying]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
