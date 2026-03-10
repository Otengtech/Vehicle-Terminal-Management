import axiosInstance from './axios';

export const terminalsApi = {
  create: (data) => axiosInstance.post('/terminals', data),
  getAll: (params) => axiosInstance.get('/terminals', { params }),
  getById: (id) => axiosInstance.get(`/terminals/${id}`),
  update: (id, data) => axiosInstance.patch(`/terminals/${id}`, data),
  delete: (id) => axiosInstance.delete(`/terminals/${id}`),
  getStats: () => axiosInstance.get('/terminals/stats'),
};