import axiosInstance from './axios';

export const driversApi = {
  create: (data) => axiosInstance.post('/drivers', data),
  getAll: (params) => axiosInstance.get('/drivers', { params }),
  getById: (id) => axiosInstance.get(`/drivers/${id}`),
  update: (id, data) => axiosInstance.patch(`/drivers/${id}`, data),
  delete: (id) => axiosInstance.delete(`/drivers/${id}`),
  search: (params) => axiosInstance.get('/drivers/search', { params }),
  getAvailable: (params) => axiosInstance.get('/drivers/available', { params }),
  assignVehicle: (driverId, vehicleId) => 
    axiosInstance.post(`/drivers/${driverId}/assign/${vehicleId}`),
  unassignVehicle: (driverId) => 
    axiosInstance.post(`/drivers/${driverId}/unassign`),
};