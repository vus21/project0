import { Cart, Product } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/index.js';

class CartService {
  async getCart(userId) {
    let cart = await Cart.findOne({ user_id: userId }).populate({
      path: 'items.product',
      select: 'name images basePrice discountPrice variants isActive slug'
    });

    if (!cart) {
      cart = await Cart.create({ user_id: userId, items: [] });
      cart = await Cart.findOne({ user_id: userId }).populate('items.product');
    }

    let subtotal = 0;
    let itemCount = 0;
    const invalidItems = [];

    const enrichedItems = cart.items.map(item => {
      const product = item.product;
      
      if (!product || !product.isActive) {
        invalidItems.push(item._id);
        return { ...item.toObject(), isValid: false, reason: 'Sản phẩm ngừng bán' };
      }

      const variant = product.variants.find(v => v.sku === item.sku);
      if (!variant || !variant.isActive) {
        invalidItems.push(item._id);
        return { ...item.toObject(), isValid: false, reason: 'Biến thể ngừng bán' };
      }

      if (variant.stock < item.quantity) {
        return { ...item.toObject(), isValid: false, reason: `Chỉ còn ${variant.stock} sản phẩm` };
      }

      const currentPrice = product.discountPrice || product.basePrice;
      subtotal += currentPrice * item.quantity;
      itemCount += item.quantity;

      return {
        ...item.toObject(),
        currentPrice,
        isValid: true
      };
    });

    return {
      items: enrichedItems,
      summary: {
        itemCount,
        subtotal,
        isValid: invalidItems.length === 0,
        invalidItems
      }
    };
  }

  async addToCart(userId, { productId, sku, quantity }) {
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Sản phẩm không tồn tại hoặc ngừng kinh doanh');
    }

    const variant = product.variants.find(v => v.sku === sku);
    if (!variant || !variant.isActive) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Phân loại hàng không tồn tại');
    }

    if (variant.stock < quantity) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, `Số lượng tồn kho không đủ (còn ${variant.stock})`);
    }

    const currentPrice = product.discountPrice || product.basePrice;

    let cart = await Cart.findOne({ user_id: userId });
    if (!cart) {
      cart = await Cart.create({ user_id: userId, items: [] });
    }

    const itemIndex = cart.items.findIndex(
      item => item.product.toString() === productId && item.sku === sku
    );

    if (itemIndex > -1) {
      const newQty = cart.items[itemIndex].quantity + quantity;
      if (variant.stock < newQty) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, `Số lượng tồn kho không đủ (còn ${variant.stock})`);
      }
      cart.items[itemIndex].quantity = newQty;
    } else {
      cart.items.push({
        product: productId,
        sku,
        quantity,
        price: currentPrice, // lưu giá tại thời điểm thêm
        color: variant.color,
        size: variant.size
      });
    }

    await cart.save();
    return this.getCart(userId);
  }

  async updateCartItem(userId, { productId, sku, quantity }) {
    if (quantity === 0) {
      return this.removeCartItem(userId, { productId, sku });
    }

    const cart = await Cart.findOne({ user_id: userId });
    if (!cart) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Giỏ hàng trống');

    const itemIndex = cart.items.findIndex(
      item => item.product.toString() === productId && item.sku === sku
    );
    if (itemIndex === -1) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Không tìm thấy sản phẩm trong giỏ hàng');
    }

    const product = await Product.findById(productId);
    const variant = product.variants.find(v => v.sku === sku);

    if (variant.stock < quantity) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, `Số lượng tồn kho không đủ (còn ${variant.stock})`);
    }

    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].price = product.discountPrice || product.basePrice;

    await cart.save();
    return this.getCart(userId);
  }

  async removeCartItem(userId, { productId, sku }) {
    const cart = await Cart.findOne({ user_id: userId });
    if (!cart) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Giỏ hàng trống');

    cart.items = cart.items.filter(
      item => !(item.product.toString() === productId && item.sku === sku)
    );

    await cart.save();
    return this.getCart(userId);
  }

  async clearCart(userId) {
    const cart = await Cart.findOne({ user_id: userId });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    return true;
  }

  async mergeGuestCart(userId, guestItems) {
    if (!guestItems || guestItems.length === 0) return this.getCart(userId);

    let cart = await Cart.findOne({ user_id: userId });
    if (!cart) {
      cart = new Cart({ user_id: userId, items: [] });
    }

    for (const guestItem of guestItems) {
      const product = await Product.findById(guestItem.productId);
      if (!product || !product.isActive) continue;

      const variant = product.variants.find(v => v.sku === guestItem.sku);
      if (!variant || !variant.isActive) continue;

      const itemIndex = cart.items.findIndex(
        item => item.product.toString() === guestItem.productId && item.sku === guestItem.sku
      );

      const targetQty = itemIndex > -1 ? Math.max(cart.items[itemIndex].quantity, guestItem.quantity) : guestItem.quantity;
      const finalQty = Math.min(targetQty, variant.stock);
      if (finalQty === 0) continue;

      const currentPrice = product.discountPrice || product.basePrice;

      if (itemIndex > -1) {
        cart.items[itemIndex].quantity = finalQty;
        cart.items[itemIndex].price = currentPrice;
      } else {
        cart.items.push({
          product: guestItem.productId,
          sku: guestItem.sku,
          quantity: finalQty,
          price: currentPrice,
          color: variant.color,
          size: variant.size
        });
      }
    }

    await cart.save();
    return this.getCart(userId);
  }

  async syncCartPrices(userId) {
    const cart = await Cart.findOne({ user_id: userId }).populate('items.product');
    if (!cart || cart.items.length === 0) return this.getCart(userId);

    let updated = false;
    for (const item of cart.items) {
      const product = item.product;
      if (product) {
        const newPrice = product.discountPrice || product.basePrice;
        if (item.price !== newPrice) {
          item.price = newPrice;
          updated = true;
        }
      }
    }

    if (updated) {
      await cart.save();
    }
    return this.getCart(userId);
  }
}

export const cartService = new CartService();
