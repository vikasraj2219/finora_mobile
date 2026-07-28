import axiosInstance from './axiosInstance';

export const getCashBalance = () => axiosInstance.get('/cash');
export const adjustCashBalance = (payload) => axiosInstance.patch('/cash/adjust', payload);
