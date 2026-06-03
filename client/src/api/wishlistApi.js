
import { axiosInstance } from './axiosInstance';




export const wishlistApi = {
 getWishList: () => axiosInstance.get('/wishlist'),
 addToWishlist: (productId) => axiosInstance.post(`/wishlist/${productId}`),
 removeFromWishlist: (productId) => axiosInstance.delete(`/wishlist/${productId}`),
 toggleWishlist: (productId) => axiosInstance.put(`/wishlist/${productId}/toggle`),
};
