import { asyncHandler } from '../middlewares/asyncHandler.js';
import { cartService } from '../services/cart.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export const getCart = asyncHandler(async (req, res) => {
  const cart = await cartService.getCart(req.user._id);
  ApiResponse.success(res, cart, 'Lấy giỏ hàng thành công');
});

export const addToCart = asyncHandler(async (req, res) => {
  const { productId, sku, quantity } = req.body;
  const cart = await cartService.addToCart(req.user._id, { productId, sku, quantity });
  ApiResponse.success(res, cart, 'Thêm vào giỏ hàng thành công');
});

export const updateCartItem = asyncHandler(async (req, res) => {
  const { productId, sku, quantity } = req.body;
  const cart = await cartService.updateCartItem(req.user._id, { productId, sku, quantity });
  ApiResponse.success(res, cart, 'Cập nhật giỏ hàng thành công');
});

export const removeCartItem = asyncHandler(async (req, res) => {
  const { productId, sku } = req.body;
  const cart = await cartService.removeCartItem(req.user._id, { productId, sku });
  ApiResponse.success(res, cart, 'Xóa sản phẩm khỏi giỏ hàng thành công');
});

export const clearCart = asyncHandler(async (req, res) => {
  await cartService.clearCart(req.user._id);
  ApiResponse.success(res, null, 'Xóa toàn bộ giỏ hàng thành công');
});

export const mergeGuestCart = asyncHandler(async (req, res) => {
  const cart = await cartService.mergeGuestCart(req.user._id, req.body.items);
  ApiResponse.success(res, cart, 'Đồng bộ giỏ hàng thành công');
});

export const syncCartPrices = asyncHandler(async (req, res) => {
  const cart = await cartService.syncCartPrices(req.user._id);
  ApiResponse.success(res, cart, 'Đồng bộ giá mới nhất thành công');
});
