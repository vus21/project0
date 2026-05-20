import { asyncHandler } from '../middlewares/asyncHandler.js';
import { adminUserService } from '../services/adminUser.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { HTTP_STATUS } from '../constants/index.js';

export const getUsers = asyncHandler(async (req, res) => {
  const result = await adminUserService.getAllUsers(req.query);
  ApiResponse.success(res, result.users, 'Lấy danh sách người dùng thành công', HTTP_STATUS.OK, result.pagination);
});

export const getUserDetail = asyncHandler(async (req, res) => {
  const user = await adminUserService.getUserDetail(req.params.id);
  ApiResponse.success(res, user, 'Lấy thông tin người dùng thành công');
});

export const updateUser = asyncHandler(async (req, res) => {
  const user = await adminUserService.updateUser(req.params.id, req.body);
  ApiResponse.success(res, user, 'Cập nhật người dùng thành công');
});

export const deleteUser = asyncHandler(async (req, res) => {
  await adminUserService.deleteUser(req.params.id, req.user._id);
  ApiResponse.success(res, null, 'Khóa người dùng thành công');
});

export const createAdmin = asyncHandler(async (req, res) => {
  const admin = await adminUserService.createAdmin(req.body);
  ApiResponse.success(res, admin, 'Tạo tài khoản Admin thành công', HTTP_STATUS.CREATED);
});
