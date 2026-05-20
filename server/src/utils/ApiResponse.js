import { HTTP_STATUS } from '../constants/index.js';

// Lớp tiện ích để chuẩn hóa định dạng trả về của API
export class ApiResponse {
  constructor(statusCode, message, data = null, pagination = undefined) {
    this.success = statusCode < 400;
    this.message = message;
    this.data = data;
    if (pagination) {
      this.pagination = pagination;
    }
  }

  static success(res, data, message = 'Thành công', statusCode = HTTP_STATUS.OK, pagination = undefined) {
    const response = new ApiResponse(statusCode, message, data, pagination);
    return res.status(statusCode).json(response);
  }

  static error(res, message = 'Thất bại', statusCode = HTTP_STATUS.BAD_REQUEST) {
    const response = new ApiResponse(statusCode, message);
    return res.status(statusCode).json(response);
  }
}
