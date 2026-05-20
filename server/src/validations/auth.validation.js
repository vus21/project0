import { body, validationResult } from 'express-validator';
import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/index.js';

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const extractedErrors = errors.array().map(err => err.msg);
  next(new ApiError(HTTP_STATUS.UNPROCESSABLE_ENTITY, `Lỗi xác thực: ${extractedErrors.join(', ')}`));
};

export const registerValidation = [
  body('name')
    .notEmpty().withMessage('Tên không được để trống')
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Tên phải từ 2 đến 50 ký tự'),
  body('email')
    .isEmail().withMessage('Email không hợp lệ')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/)
    .withMessage('Mật khẩu phải chứa ít nhất 1 chữ cái và 1 chữ số'),
  body('phone')
    .optional()
    .isMobilePhone('vi-VN').withMessage('Số điện thoại không hợp lệ')
];

export const loginValidation = [
  body('email').isEmail().withMessage('Email không hợp lệ'),
  body('password').notEmpty().withMessage('Vui lòng nhập mật khẩu')
];

export const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Vui lòng nhập mật khẩu hiện tại'),
  body('newPassword')
    .isLength({ min: 6 }).withMessage('Mật khẩu mới phải có ít nhất 6 ký tự'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Xác nhận mật khẩu không khớp');
      }
      return true;
    })
];

export const updateProfileValidation = [
  body('name')
    .optional()
    .isLength({ min: 2, max: 50 }).withMessage('Tên phải từ 2 đến 50 ký tự'),
  body('phone')
    .optional()
    .isMobilePhone('vi-VN').withMessage('Số điện thoại không hợp lệ')
];
