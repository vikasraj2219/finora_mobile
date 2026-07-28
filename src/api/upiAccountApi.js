import axiosInstance from './axiosInstance';

export const listUpiAccounts = (params) => axiosInstance.get('/upi-accounts', { params });
export const createUpiAccount = (payload) => axiosInstance.post('/upi-accounts', payload);
export const updateUpiAccount = (id, payload) => axiosInstance.patch(`/upi-accounts/${id}`, payload);
export const toggleUpiAccountActive = (id) =>
  axiosInstance.patch(`/upi-accounts/${id}/toggle-active`);
export const deleteUpiAccount = (id) => axiosInstance.delete(`/upi-accounts/${id}`);
