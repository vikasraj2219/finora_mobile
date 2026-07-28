import axiosInstance from './axiosInstance';

export const registerRequest = (payload) => axiosInstance.post('/auth/register', payload);
export const loginRequest = (payload) => axiosInstance.post('/auth/login', payload);
export const meRequest = () => axiosInstance.get('/auth/me');
export const logoutRequest = () => axiosInstance.post('/auth/logout');
export const updatePasswordRequest = (payload) =>
  axiosInstance.patch('/auth/update-password', payload);
export const updateProfileRequest = (payload) => axiosInstance.patch('/auth/profile', payload);
