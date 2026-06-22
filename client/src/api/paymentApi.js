import { axiosInstance } from './axiosInstance';

export const paymentApi = {
  createPaymentLink: (paymentData) => axiosInstance.post('/payments/create-payment-link', paymentData),
  getPaymentStatus: (orderId) => axiosInstance.get(`/payments/${orderId}/status`),
};
