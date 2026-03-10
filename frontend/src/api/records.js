import axiosInstance from './axios';

export const recordsApi = {
  getAll: (params) => axiosInstance.get('/records', { params }),
  getVehicleHistory: (vehicleId, limit) => 
    axiosInstance.get(`/records/vehicle/${vehicleId}`, { params: { limit } }),
  getTerminalSummary: (terminalId) => 
    axiosInstance.get(`/records/terminal/${terminalId}/summary`),
  getDailyReport: (terminalId, date) => 
    axiosInstance.get(`/records/terminal/${terminalId}/daily`, { params: { date } }),
  getUserActivity: (userId, limit) => 
    axiosInstance.get(`/records/user/${userId}/activity`, { params: { limit } }),
};