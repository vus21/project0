import { asyncHandler } from '../middlewares/asyncHandler.js';
import { addressService } from '../services/address.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { HTTP_STATUS } from '../constants/index.js';

export const getUserAddresses = asyncHandler(async (req, res) => {
  const addresses = await addressService.getUserAddresses(req.user._id);
  ApiResponse.success(res, addresses, 'Lấy danh sách địa chỉ thành công');
});

export const createAddress = asyncHandler(async (req, res) => {
  const address = await addressService.createAddress(req.user._id, req.body);
  ApiResponse.success(res, address, 'Thêm địa chỉ thành công', HTTP_STATUS.CREATED);
});

export const updateAddress = asyncHandler(async (req, res) => {
  const address = await addressService.updateAddress(req.params.id, req.user._id, req.body);
  ApiResponse.success(res, address, 'Cập nhật địa chỉ thành công');
});

export const deleteAddress = asyncHandler(async (req, res) => {
  await addressService.deleteAddress(req.params.id, req.user._id);
  ApiResponse.success(res, null, 'Xóa địa chỉ thành công');
});

export const setDefaultAddress = asyncHandler(async (req, res) => {
  const address = await addressService.setDefaultAddress(req.params.id, req.user._id);
  ApiResponse.success(res, address, 'Đặt địa chỉ mặc định thành công');
});
