import { Product } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/index.js';

class InventoryService {
  async getLowStockProducts(threshold = 10) {
    const products = await Product.find({ 
      totalStock: { $lte: Number(threshold), $gt: 0 },
      isActive: true
    }).select('name variants category_id totalStock images slug');
    
    return products;
  }

  async getOutOfStockProducts() {
    const products = await Product.find({ 
      totalStock: 0,
      isActive: true
    }).select('name variants category_id totalStock images slug');
    
    return products;
  }

  async updateVariantStock(productId, sku, newStock) {
    if (newStock < 0) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Tồn kho không được là số âm');
    }

    const product = await Product.findById(productId);
    if (!product) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Sản phẩm không tồn tại');

    const variant = product.variants.find(v => v.sku === sku);
    if (!variant) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Mã SKU không tồn tại');

    variant.stock = Number(newStock);
    
    // totalStock sẽ được pre-save hook tính toán lại
    await product.save();
    return product;
  }
}

export const inventoryService = new InventoryService();
