import { HTTP_STATUS } from '../constants/index.js';
import { logger } from '../utils/logger.js';

// Global error handler (4 tham số: err, req, res, next)
export const errorHandler = (err, req, res, next) => {
  logger.error(err);

  let statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message = err.message || 'Lỗi máy chủ nội bộ';

  // Lỗi Mongoose duplicate key (trùng lặp dữ liệu, code 11000)
  if (err.code === 11000) {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = `Trùng lặp dữ liệu: ${Object.keys(err.keyValue)} đã tồn tại`;
  }

  // Lỗi Mongoose Validation
  if (err.name === 'ValidationError') {
    statusCode = HTTP_STATUS.UNPROCESSABLE_ENTITY;
    const errors = Object.values(err.errors).map((val) => val.message);
    message = `Lỗi xác thực dữ liệu: ${errors.join(', ')}`;
  }

  // Lỗi Mongoose CastError (sai định dạng ObjectID)
  if (err.name === 'CastError') {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = `Định dạng ID không hợp lệ cho trường ${err.path}`;
  }

  // Lỗi JWT (Token không hợp lệ)
  if (err.name === 'JsonWebTokenError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    message = 'Token không hợp lệ, vui lòng đăng nhập lại';
  }

  // Lỗi JWT Token hết hạn
  if (err.name === 'TokenExpiredError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    message = 'Token đã hết hạn, vui lòng đăng nhập lại';
  }

  // Format chuẩn ApiResponse
  const response = {
    success: false,
    message,
    data: null
  };

  // Chỉ trả về stack trace khi đang ở môi trường dev
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};
