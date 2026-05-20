import { asyncHandler } from '../middlewares/asyncHandler.js';
import { categoryService } from '../services/category.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { HTTP_STATUS } from '../constants/index.js';

export const createCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.createCategory(req.body, req.file);
  ApiResponse.success(res, category, 'Tạo danh mục thành công', HTTP_STATUS.CREATED);
});

export const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await categoryService.getAllCategories(req.query);
  ApiResponse.success(res, categories, 'Lấy danh sách danh mục thành công');
});

export const getCategoryBySlug = asyncHandler(async (req, res) => {
  const category = await categoryService.getCategoryBySlug(req.params.slug);
  ApiResponse.success(res, category, 'Lấy chi tiết danh mục thành công');
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.updateCategory(req.params.id, req.body, req.file);
  ApiResponse.success(res, category, 'Cập nhật danh mục thành công');
});

export const deleteCategory = asyncHandler(async (req, res) => {
  await categoryService.deleteCategory(req.params.id);
  ApiResponse.success(res, null, 'Xóa danh mục thành công');
});
