import axiosInstance from './axiosInstance';

export const previewImport = (file, bankAccount) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('bankAccount', bankAccount);
  // Don't set Content-Type manually — React Native's networking layer needs to
  // generate its own multipart boundary and append it to the header. Setting
  // 'multipart/form-data' explicitly (without a boundary) breaks the upload:
  // the server can't parse the body and sees no file at all.
  return axiosInstance.post('/imports/preview', formData);
};

export const confirmImport = (payload) => axiosInstance.post('/imports/confirm', payload);
