import { axiosInstance } from './axiosInstance';

export const productApi = {
  getAll: (params) => axiosInstance.get('/products', { params }),
  getBySlug: (slug) => axiosInstance.get(`/products/${slug}`),
  getRelated: (id) => axiosInstance.get(`/products/${id}/related`),
  
  // Admin
  create: (formData) => axiosInstance.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, formData) => axiosInstance.put(`/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => axiosInstance.delete(`/products/${id}`),
  manageVariant: (id, action, variantData) =>  axiosInstance.post(`/products/${id}/variants`, { action, variantData }),
  
  // Inventory management
  updateStock: (productId, sku, stockData) => axiosInstance.put(`/inventory/${productId}/sku/${sku}`, stockData),
};
