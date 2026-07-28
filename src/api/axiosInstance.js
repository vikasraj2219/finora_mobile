import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Deployed backend — no LAN IP / same-Wi-Fi requirement needed since this is a
// public URL, so the app works from anywhere (mobile data, different networks, etc).
export const API_BASE_URL = 'https://finora-backend-d7rl.onrender.com/api/v1';

const axiosInstance = axios.create({ baseURL: API_BASE_URL });

axiosInstance.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('pf_accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let queue = [];
let onAuthFailure = null;

// AuthContext registers itself here so a failed refresh can log the user out
// and drop them back on the Login screen, same as the web app's redirect.
export const setOnAuthFailure = (fn) => {
  onAuthFailure = fn;
};

const processQueue = (error, token = null) => {
  queue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  queue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = await SecureStore.getItemAsync('pf_refreshToken');
      if (!refreshToken) {
        isRefreshing = false;
        await SecureStore.deleteItemAsync('pf_accessToken');
        await SecureStore.deleteItemAsync('pf_refreshToken');
        onAuthFailure?.();
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
        const newAccessToken = data.data.accessToken;
        await SecureStore.setItemAsync('pf_accessToken', newAccessToken);
        await SecureStore.setItemAsync('pf_refreshToken', data.data.refreshToken);
        processQueue(null, newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        await SecureStore.deleteItemAsync('pf_accessToken');
        await SecureStore.deleteItemAsync('pf_refreshToken');
        onAuthFailure?.();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
