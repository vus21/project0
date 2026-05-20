import { asyncHandler } from '../middlewares/asyncHandler.js';
import { orderService } from '../services/order.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { HTTP_STATUS } from '../constants/index.js';

export const placeOrder = asyncHandler(async (req, res) => {
  const order = await orderService.placeOrder(req.user._id, req.body);
  ApiResponse.success(res, order, 'Đặt hàng thành công', HTTP_STATUS.CREATED);
});

export const getUserOrders = asyncHandler(async (req, res) => {
  const result = await orderService.getUserOrders(req.user._id, req.query);
  ApiResponse.success(res, result.orders, 'Lấy lịch sử đơn hàng thành công', HTTP_STATUS.OK, result.pagination);
});

export const getOrderDetail = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderDetail(req.params.id, req.user._id);
  ApiResponse.success(res, order, 'Lấy chi tiết đơn hàng thành công');
});

export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await orderService.cancelOrder(req.params.id, req.user._id, req.body.reason);
  ApiResponse.success(res, order, 'Hủy đơn hàng thành công');
});

// Admin Controllers
export const getAllOrders = asyncHandler(async (req, res) => {
  const result = await orderService.getAllOrders(req.query);
  ApiResponse.success(res, { orders: result.orders, summary: result.summary }, 'Lấy danh sách đơn hàng thành công', HTTP_STATUS.OK, result.pagination);
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { newStatus, adminNote } = req.body;
  const order = await orderService.updateOrderStatus(req.params.id, newStatus, adminNote);
  ApiResponse.success(res, order, 'Cập nhật trạng thái thành công');
});

export const getOrderStats = asyncHandler(async (req, res) => {
  const stats = await orderService.getOrderStats();
  ApiResponse.success(res, stats, 'Lấy thống kê thành công');
});
