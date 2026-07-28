import axiosInstance from './axiosInstance';

export const getDashboardSummary = () => axiosInstance.get('/dashboard/summary');
export const getDashboardTrends = (months = 6) =>
  axiosInstance.get('/dashboard/trends', { params: { months } });
export const getCategoryBreakdown = (params) =>
  axiosInstance.get('/dashboard/category-breakdown', { params });
export const getPaymentMethodDistribution = () =>
  axiosInstance.get('/dashboard/payment-method-distribution');
export const getAccountUsage = () => axiosInstance.get('/dashboard/account-usage');
export const getYearlySummary = (year) => axiosInstance.get('/dashboard/yearly-summary', { params: { year } });
