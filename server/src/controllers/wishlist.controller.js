import { asyncHandler } from '../middlewares/asyncHandler.js';
import { wishlistService } from '../services/wishlist.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export const getWishlist = asyncHandler(async (req, res) => {
  const result = await wishlistService.getWishlist(req.user._id);
  ApiResponse.success(res, result, 'Lấy danh sách yêu thích thành công');
});

export const addToWishlist = asyncHandler(async (req, res) => {
  const result = await wishlistService.addToWishlist(req.user._id, req.params.productId);
  ApiResponse.success(res, result, result.message);
});

export const removeFromWishlist = asyncHandler(async (req, res) => {
  const result = await wishlistService.removeFromWishlist(req.user._id, req.params.productId);
  ApiResponse.success(res, result, result.message);
});

export const toggleWishlist = asyncHandler(async (req, res) => {
  const result = await wishlistService.toggleWishlist(req.user._id, req.params.productId);
  ApiResponse.success(res, result, result.added ? 'Đã thêm vào yêu thích' : 'Đã xóa khỏi yêu thích');
});
