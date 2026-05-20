import { axiosInstance } from './axiosInstance';

export const inventoryApi = {
  // Get low stock products
  getLowStock: () => axiosInstance.get('/inventory/low-stock'),
  
  // Get out of stock products
  getOutOfStock: () => axiosInstance.get('/inventory/out-of-stock'),
  
  // Update stock for specific SKU
  updateStock: (productId, sku, stockData) => 
    axiosInstance.put(`/inventory/${productId}/sku/${sku}`, stockData),
};
