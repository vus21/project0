import { asyncHandler } from '../middlewares/asyncHandler.js';
import { productService } from '../services/product.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { HTTP_STATUS } from '../constants/index.js';

export const getProducts = asyncHandler(async (req, res) => {
  const result = await productService.getProducts(req.query);
  ApiResponse.success(res, result.products, 'Lấy danh sách sản phẩm thành công', HTTP_STATUS.OK, result.pagination);
});
export const getAllProducts = asyncHandler(async (req, res) => {
  const result = await productService.getAllProducts(req.query);
  ApiResponse.success(res, result.products, 'Lấy danh sách sản phẩm thành công', HTTP_STATUS.OK, result.pagination);
});


export const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await productService.getProductBySlug(req.params.slug);
  ApiResponse.success(res, product, 'Lấy chi tiết sản phẩm thành công');
});

export const getRelatedProducts = asyncHandler(async (req, res) => {
  const products = await productService.getRelatedProducts(req.params.id, req.query.limit);
  ApiResponse.success(res, products, 'Lấy sản phẩm liên quan thành công');
});

export const createProduct = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.body, req.files);
  ApiResponse.success(res, product, 'Tạo sản phẩm thành công', HTTP_STATUS.CREATED);
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await productService.updateProduct(req.params.id, req.body, req.files);
  ApiResponse.success(res, product, 'Cập nhật sản phẩm thành công');
});

export const deleteProduct = asyncHandler(async (req, res) => {
  await productService.deleteProduct(req.params.id);
  ApiResponse.success(res, null, 'Xóa sản phẩm thành công');
});

export const deleteProductImage = asyncHandler(async (req, res) => {
  const { public_id } = req.body;
  const product = await productService.deleteProductImage(req.params.id, public_id);
  ApiResponse.success(res, product, 'Xóa ảnh thành công');
});

export const manageVariant = asyncHandler(async (req, res) => {
  const { action, variantData } = req.body;
  const product = await productService.manageVariant(req.params.id, action, variantData);
  ApiResponse.success(res, product, 'Quản lý biến thể thành công');
});
