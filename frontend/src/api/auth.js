import axiosInstance from './axios';

export const authApi = {
  login: (credentials) => axiosInstance.post('/auth/login', credentials),
  logout: () => axiosInstance.post('/auth/logout'),
  changePassword: (data) => axiosInstance.post('/auth/change-password', data),
  getProfile: () => axiosInstance.get('/users/profile'),
  updateProfile: (data) => axiosInstance.patch('/users/profile', data),
};