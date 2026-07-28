import axiosInstance from './axiosInstance';

export const previewImport = (file, bankAccount) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('bankAccount', bankAccount);
  return axiosInstance.post('/imports/preview', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const confirmImport = (payload) => axiosInstance.post('/imports/confirm', payload);
