import { verifyAccessToken } from '../utils/generateToken.js';
import { User } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/index.js';
import { asyncHandler } from './asyncHandler.js';

export const protect = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Vui lòng đăng nhập để truy cập');
  }

  const decoded = verifyAccessToken(token);

  const user = await User.findById(decoded.id).select('-password');
  if (!user) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Người dùng không tồn tại');
  }

  if (!user.isActive) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Tài khoản đã bị khóa');
  }

  req.user = user;
  next();
});

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Bạn không có quyền thực hiện hành động này');
    }
    next();
  };
};

export const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.id).select('-password');
      if (user && user.isActive) {
        req.user = user;
      }
    } catch (error) {
      // Bỏ qua lỗi token ở route optional (chỉ đánh dấu user = null)
    }
  } else {
    req.user = null;
  }
  next();
});
