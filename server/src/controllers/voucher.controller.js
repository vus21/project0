import { asyncHandler } from '../middlewares/asyncHandler.js';
import { voucherService } from '../services/voucher.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { HTTP_STATUS } from '../constants/index.js';

export const applyVoucher = asyncHandler(async (req, res) => {
  const { code, orderAmount } = req.body;
  const result = await voucherService.applyVoucher(code, req.user._id, orderAmount);
  ApiResponse.success(res, result, 'Áp dụng mã giảm giá thành công');
});

export const getAllVouchers = asyncHandler(async (req, res) => {
  const vouchers = await voucherService.getAllVouchers(req.query);
  ApiResponse.success(res, vouchers, 'Lấy danh sách mã giảm giá thành công');
});

export const createVoucher = asyncHandler(async (req, res) => {
  const voucher = await voucherService.createVoucher(req.body);
  ApiResponse.success(res, voucher, 'Tạo mã giảm giá thành công', HTTP_STATUS.CREATED);
});

export const updateVoucher = asyncHandler(async (req, res) => {
  const voucher = await voucherService.updateVoucher(req.params.id, req.body);
  ApiResponse.success(res, voucher, 'Cập nhật mã giảm giá thành công');
});

export const deleteVoucher = asyncHandler(async (req, res) => {
  await voucherService.deleteVoucher(req.params.id);
  ApiResponse.success(res, null, 'Xóa mã giảm giá thành công');
});
