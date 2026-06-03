import { axiosInstance } from './axiosInstance';

export const voucherApi = {

  applyVoucher: (data) => axiosInstance.post('/vouchers/apply', data),


  getAllVouchers: (params) => axiosInstance.get('/vouchers', { params }),



  createVoucher: (data) => axiosInstance.post('/vouchers', data),

  updateVoucher: (id, data) => axiosInstance.put(`/vouchers/${id}`, data),


  deleteVoucher: (id) => axiosInstance.delete(`/vouchers/${id}`),
};