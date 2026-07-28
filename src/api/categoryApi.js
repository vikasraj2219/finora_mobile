import axiosInstance from './axiosInstance';

export const listCategories = (params) => axiosInstance.get('/categories', { params });
export const createCategory = (payload) => axiosInstance.post('/categories', payload);
export const updateCategory = (id, payload) => axiosInstance.patch(`/categories/${id}`, payload);
export const deleteCategory = (id) => axiosInstance.delete(`/categories/${id}`);
