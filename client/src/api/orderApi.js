import { axiosInstance } from './axiosInstance';

export const orderApi = {
  // --- USER API ---



  placeOrder: (orderData) => axiosInstance.post('/orders', orderData),
  getUserOrders: (params) => axiosInstance.get('/orders', { params }),

  getOrderDetail: (id) => axiosInstance.get(`/orders/${id}`),

  cancelOrder: (id, reason) => axiosInstance.put(`/orders/${id}/cancel`, { reason }),
  // --- ADMIN API ---
  getAllOrders: (params) => axiosInstance.get('/orders/admin/all', { params }),

  updateStatus: (id, newStatus, adminNote) =>
    axiosInstance.put(`/orders/admin/${id}/status`, { newStatus, adminNote }),

  getStats: () => axiosInstance.get('/orders/admin/stats'),
};