import axiosInstance from './axiosInstance';

export const exportTransactions = (format, params) =>
  axiosInstance.get('/reports/transactions/export', {
    params: { ...params, format },
    responseType: 'blob',
  });

export const exportSummary = () =>
  axiosInstance.get('/reports/summary/export', {
    params: { format: 'pdf' },
    responseType: 'blob',
  });
