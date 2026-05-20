import { asyncHandler } from '../middlewares/asyncHandler.js';
import { inventoryService } from '../services/inventory.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export const getLowStock = asyncHandler(async (req, res) => {
  const { threshold } = req.query;
  const products = await inventoryService.getLowStockProducts(threshold);
  ApiResponse.success(res, products, 'Lấy danh sách sắp hết hàng thành công');
});

export const getOutOfStock = asyncHandler(async (req, res) => {
  const products = await inventoryService.getOutOfStockProducts();
  ApiResponse.success(res, products, 'Lấy danh sách hết hàng thành công');
});

export const updateStock = asyncHandler(async (req, res) => {
  const { productId, sku } = req.params;
  const { newStock } = req.body;
  const product = await inventoryService.updateVariantStock(productId, sku, newStock);
  ApiResponse.success(res, product, 'Cập nhật tồn kho thành công');
});
