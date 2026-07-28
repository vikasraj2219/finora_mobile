import axiosInstance from './axiosInstance';

export const listMerchants = (params) => axiosInstance.get('/merchants', { params });
export const createMerchant = (payload) => axiosInstance.post('/merchants', payload);
export const updateMerchant = (id, payload) => axiosInstance.patch(`/merchants/${id}`, payload);
export const deleteMerchant = (id) => axiosInstance.delete(`/merchants/${id}`);
