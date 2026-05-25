// src/api/cartApi.js

import { axiosInstance } from './axiosInstance';

export const cartApi = {
  // Get current user's cart
  getCart: () => axiosInstance.get('/cart'),

  // Add item to cart
  addItem: (data) => axiosInstance.post('/cart/add', data),
  /*
    data = {
      productId,
      sku,
      quantity
    }
  */
  // Update quantity
  updateItem: (data) => axiosInstance.put('/cart/update', data),
  /*
    data = {
      productId,
      sku,
      quantity
    }
  */

  // Remove item
  removeItem: (data) => axiosInstance.delete('/cart/remove', { data }),
  /*
    data = {
      productId,
      sku
    }
  */

  // Clear all cart
  clear: () => axiosInstance.delete('/cart/clear'),

  // Merge guest cart after login
  mergeGuestCart: (items) => axiosInstance.post('/cart/merge', { items }),

  // Sync latest product prices
  syncPrices: () => axiosInstance.post('/cart/sync-prices'),
};