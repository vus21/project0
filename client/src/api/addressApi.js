// src/api/addressApi.js

import { axiosInstance } from './axiosInstance';

export const addressApi = {
  // User addresses
  getMyAddresses: () => axiosInstance.get('/addresses'),

  create: (data) => axiosInstance.post('/addresses', data),

  update: (id, data) => axiosInstance.put(`/addresses/${id}`, data),

  delete: (id) => axiosInstance.delete(`/addresses/${id}`),

  setDefault: (id) => axiosInstance.put(`/addresses/${id}/default`),
};