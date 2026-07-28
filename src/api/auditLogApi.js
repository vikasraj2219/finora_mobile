import axiosInstance from './axiosInstance';

export const listAuditLogs = (params) => axiosInstance.get('/audit-logs', { params });
