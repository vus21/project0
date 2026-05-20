import { axiosInstance } from './axiosInstance';

export const adminApi = {
  getDashboardStats: () => axiosInstance.get('/admin/dashboard'),
  getRevenueChart: (year) => axiosInstance.get('/admin/revenue-chart', { params: { year } }),
  getTopProducts: (limit) => axiosInstance.get('/admin/top-products', { params: { limit } }),
  getRecentOrders: (limit) => axiosInstance.get('/admin/recent-orders', { params: { limit } }),
  getLowStock: (threshold) => axiosInstance.get('/admin/low-stock', { params: { threshold } }),
  getSalesByCategory: () => axiosInstance.get('/admin/sales-by-category'),
  getUsers: (params) => axiosInstance.get('/admin/users', { params }),
  getUserDetail: (id) => axiosInstance.get(`/admin/users/${id}`),
  updateUser: (id, data) => axiosInstance.put(`/admin/users/${id}`, data),
  deleteUser: (id) => axiosInstance.delete(`/admin/users/${id}`),
  createAdmin: (data) => axiosInstance.post('/admin/users/create-admin', data),
};
