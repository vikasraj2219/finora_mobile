import axiosInstance from './axiosInstance';

export const listBankAccounts = (params) => axiosInstance.get('/bank-accounts', { params });
export const createBankAccount = (payload) => axiosInstance.post('/bank-accounts', payload);
export const updateBankAccount = (id, payload) => axiosInstance.patch(`/bank-accounts/${id}`, payload);
export const adjustBankAccountBalance = (id, payload) =>
  axiosInstance.patch(`/bank-accounts/${id}/adjust-balance`, payload);
export const recalculateBankAccountBalance = (id) =>
  axiosInstance.post(`/bank-accounts/${id}/recalculate`);
export const toggleBankAccountActive = (id) =>
  axiosInstance.patch(`/bank-accounts/${id}/toggle-active`);
export const deleteBankAccount = (id) => axiosInstance.delete(`/bank-accounts/${id}`);
