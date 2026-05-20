import { body } from 'express-validator';

export const createProductValidation = [
  body('name').notEmpty().withMessage('Tên sản phẩm không được trống').trim(),
  body('description').notEmpty().withMessage('Mô tả không được trống'),
  body('basePrice').isNumeric().withMessage('Giá cơ bản phải là số').custom(v => v >= 0),
  body('category_id').notEmpty().withMessage('Danh mục không được để trống')
];

export const updateProductValidation = [
  body('name').optional().trim().notEmpty(),
  body('basePrice').optional().isNumeric(),
];
