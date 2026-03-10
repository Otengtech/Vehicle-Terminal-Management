import axiosInstance from './axios';

export const usersApi = {
  // Superadmin only
  createAdmin: (data) => axiosInstance.post('/users', data),
  getAdmins: (params) => axiosInstance.get('/users', { params }),
  getAdminById: (id) => axiosInstance.get(`/users/${id}`),
  updateAdmin: (id, data) => axiosInstance.patch(`/users/${id}`, data),
  deleteAdmin: (id) => axiosInstance.delete(`/users/${id}`),
};