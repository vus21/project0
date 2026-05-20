import { HTTP_STATUS } from '../constants/index.js';
import { ApiError } from '../utils/ApiError.js';

// Middleware xử lý lỗi 404 (Không tìm thấy route)
export const notFound = (req, res, next) => {
  const error = new ApiError(HTTP_STATUS.NOT_FOUND, `Không tìm thấy - ${req.originalUrl}`);
  next(error);
};
