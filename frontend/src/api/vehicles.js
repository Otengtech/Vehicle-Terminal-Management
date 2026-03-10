import axiosInstance from './axios';

export const vehiclesApi = {
  create: (data) => axiosInstance.post('/vehicles', data),
  getAll: (params) => axiosInstance.get('/vehicles', { params }),
  getById: (id) => axiosInstance.get(`/vehicles/${id}`),
  update: (id, data) => axiosInstance.patch(`/vehicles/${id}`, data),
  delete: (id) => axiosInstance.delete(`/vehicles/${id}`),
  search: (params) => axiosInstance.get('/vehicles/search', { params }),
  getByStatus: (status) => axiosInstance.get(`/vehicles/status/${status}`),
  getByTerminal: (terminalId) => axiosInstance.get(`/vehicles/terminal/${terminalId}`),
  checkIn: (id) => axiosInstance.post(`/vehicles/${id}/check-in`),
  checkOut: (id) => axiosInstance.post(`/vehicles/${id}/check-out`),
  reportDamage: (id, data) => axiosInstance.post(`/vehicles/${id}/damage`, data),
  updateLocation: (id, data) => axiosInstance.patch(`/vehicles/${id}/location`, data),
};