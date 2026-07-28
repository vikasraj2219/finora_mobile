import axiosInstance from './axiosInstance';

export const listNotifications = (params) => axiosInstance.get('/notifications', { params });
export const markNotificationRead = (id) => axiosInstance.patch(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => axiosInstance.patch('/notifications/read-all');
export const deleteNotification = (id) => axiosInstance.delete(`/notifications/${id}`);
