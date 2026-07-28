import axiosInstance from './axiosInstance';

export const listSubcategories = (params) => axiosInstance.get('/subcategories', { params });
export const createSubcategory = (payload) => axiosInstance.post('/subcategories', payload);
export const updateSubcategory = (id, payload) => axiosInstance.patch(`/subcategories/${id}`, payload);
export const deleteSubcategory = (id) => axiosInstance.delete(`/subcategories/${id}`);
