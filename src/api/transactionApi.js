import axiosInstance from './axiosInstance';

export const listTransactions = (params) => axiosInstance.get('/transactions', { params });
export const createTransaction = (payload) => axiosInstance.post('/transactions', payload);
export const updateTransaction = (id, payload) => axiosInstance.patch(`/transactions/${id}`, payload);
export const deleteTransaction = (id) => axiosInstance.delete(`/transactions/${id}`);

export const uploadTransactionReceipt = (id, file) => {
  const formData = new FormData();
  formData.append('receipt', file);
  // See importApi.js — no manual Content-Type here either, same reason.
  return axiosInstance.post(`/transactions/${id}/receipt`, formData);
};
export const removeTransactionReceipt = (id) => axiosInstance.delete(`/transactions/${id}/receipt`);

export const bulkAllocateTransactions = (payload) => axiosInstance.post('/transactions/bulk-allocate', payload);
export const bulkDeleteTransactions = (transactionIds) =>
  axiosInstance.post('/transactions/bulk-delete', { transactionIds });
export const getAllocationSummary = () => axiosInstance.get('/transactions/allocation-summary');
export const getAccountLedger = (params) => axiosInstance.get('/transactions/account-ledger', { params });
export const getAccountStats = (params) => axiosInstance.get('/transactions/account-stats', { params });
export const getAccountsAllocationSummary = () => axiosInstance.get('/transactions/accounts-allocation-summary');
export const getAllocationTrend = (months) => axiosInstance.get('/transactions/allocation-trend', { params: { months } });
export const getEntrySourceSummary = () => axiosInstance.get('/transactions/entry-source-summary');
