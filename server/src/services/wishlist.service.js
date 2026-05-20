import { User, Product } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/index.js';

class WishlistService {
  async getWishlist(userId) {
    const user = await User.findById(userId).populate({
      path: 'wishlist',
      select: 'name slug images basePrice discountPrice rating totalStock isActive'
    });

    const activeWishlist = user.wishlist.filter(product => product.isActive);

    return {
      wishlist: activeWishlist,
      count: activeWishlist.length
    };
  }

  async addToWishlist(userId, productId) {
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Sản phẩm không tồn tại hoặc ngừng kinh doanh');
    }

    const user = await User.findById(userId);
    if (user.wishlist.includes(productId)) {
      throw new ApiError(HTTP_STATUS.CONFLICT, 'Sản phẩm đã có trong danh sách yêu thích');
    }

    await User.findByIdAndUpdate(userId, {
      $addToSet: { wishlist: productId }
    });

    return { message: 'Đã thêm vào danh sách yêu thích', count: user.wishlist.length + 1 };
  }

  async removeFromWishlist(userId, productId) {
    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { wishlist: productId } },
      { new: true }
    );
    return { message: 'Đã xóa khỏi danh sách yêu thích', count: user.wishlist.length };
  }

  async toggleWishlist(userId, productId) {
    const user = await User.findById(userId);
    const hasProduct = user.wishlist.includes(productId);

    if (hasProduct) {
      await this.removeFromWishlist(userId, productId);
      return { added: false, count: user.wishlist.length - 1 };
    } else {
      const product = await Product.findById(productId);
      if (!product || !product.isActive) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Sản phẩm không tồn tại');
      
      await User.findByIdAndUpdate(userId, { $addToSet: { wishlist: productId } });
      return { added: true, count: user.wishlist.length + 1 };
    }
  }
}

export const wishlistService = new WishlistService();
