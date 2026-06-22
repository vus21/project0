import { asyncHandler } from '../middlewares/asyncHandler.js';
import { paymentService } from '../services/payment.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { HTTP_STATUS } from '../constants/index.js';

export const createPaymentLink = asyncHandler(async (req, res) => {
  const { orderId, amount } = req.body;
  const userId = req.user._id;

  const result = await paymentService.createPaymentLink(orderId, amount, userId);
  return ApiResponse.success(res, result, 'Khởi tạo link thanh toán thành công', HTTP_STATUS.OK);
});

export const getPaymentStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const userId = req.user._id;

  const result = await paymentService.getPaymentStatus(orderId, userId);
  return ApiResponse.success(res, result, 'Lấy trạng thái thanh toán thành công', HTTP_STATUS.OK);
});

export const handleWebhook = asyncHandler(async (req, res) => {
  const result = await paymentService.processWebhook(req.body);
  return res.status(HTTP_STATUS.OK).json(result);
});
