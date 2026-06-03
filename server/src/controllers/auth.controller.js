import { asyncHandler } from '../middlewares/asyncHandler.js';
import { authService } from '../services/auth.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { HTTP_STATUS } from '../constants/index.js';

// Cấu hình cookie bảo mật
const cookieOptions = {
  httpOnly: true, // XSS protection: Javascript client không đọc được cookie
  secure: process.env.NODE_ENV === 'production', // Gửi cookie qua HTTPS ở production
  sameSite: 'lax', // CSRF protection
  maxAge: 30 * 24 * 60 * 60 * 1000 // 30 ngày
};

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;
  const result = await authService.register(name, email, password, phone);
  ApiResponse.success(res, result, result.message, HTTP_STATUS.CREATED);
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.query;
  if (!token) {
    return ApiResponse.error(res, 'Token xác thực không được cung cấp', HTTP_STATUS.BAD_REQUEST);
  }
  const result = await authService.verifyEmail(token);
  ApiResponse.success(res, result, result.message);
});

export const resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return ApiResponse.error(res, 'Vui lòng cung cấp email', HTTP_STATUS.BAD_REQUEST);
  }
  const result = await authService.resendVerification(email);
  ApiResponse.success(res, result, result.message);
});

export const seedUser = asyncHandler(async (req, res) => {
  const result = await authService.seedUser();
  ApiResponse.success(res, result, 'Hoàn tất quá trình seed database');
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { user, accessToken, refreshToken } = await authService.login(email, password);

  res.cookie('refreshToken', refreshToken, cookieOptions);
  ApiResponse.success(res, { user, accessToken }, 'Đăng nhập thành công');
});

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie('refreshToken');
  ApiResponse.success(res, null, 'Đăng xuất thành công');
});

export const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) {
    return ApiResponse.error(res, 'Vui lòng đăng nhập', HTTP_STATUS.UNAUTHORIZED);
  }

  const { accessToken } = await authService.refreshToken(token);
  ApiResponse.success(res, { accessToken }, 'Làm mới token thành công');
});

export const getProfile = asyncHandler(async (req, res) => {
  const user = await authService.getProfile(req.user._id);
  ApiResponse.success(res, user, 'Lấy thông tin thành công');
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;
  const user = await authService.updateProfile(req.user._id, { name, phone });
  ApiResponse.success(res, user, 'Cập nhật thông tin thành công');
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await authService.changePassword(req.user._id, currentPassword, newPassword);
  ApiResponse.success(res, null, 'Đổi mật khẩu thành công');
});

export const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    return ApiResponse.error(res, 'Vui lòng chọn file', HTTP_STATUS.BAD_REQUEST);
  }
  const user = await authService.uploadAvatar(req.user._id, req.file);
  ApiResponse.success(res, user, 'Cập nhật avatar thành công');
});
