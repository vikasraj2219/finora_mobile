import axiosInstance from './axiosInstance';

export const listTypes = (params) => axiosInstance.get('/types', { params });
export const createType = (payload) => axiosInstance.post('/types', payload);
export const updateType = (id, payload) => axiosInstance.patch(`/types/${id}`, payload);
export const deleteType = (id) => axiosInstance.delete(`/types/${id}`);
