import mongoose from 'mongoose';
import { Review, Order, Product } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS, USER_ROLES, ORDER_STATUS } from '../constants/index.js';

class ReviewService {
  async createReview(userId, productId, { rating, comment }) {
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Sản phẩm không tồn tại hoặc đã ngừng kinh doanh');
    }

    const hasPurchased = await Order.findOne({
      user: userId,
      'orderItems.product': productId,
      orderStatus: ORDER_STATUS.DELIVERED
    });

    if (!hasPurchased) {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Bạn cần mua sản phẩm này trước khi đánh giá');
    }

    const existingReview = await Review.findOne({ user: userId, product_id: productId });
    if (existingReview) {
      throw new ApiError(HTTP_STATUS.CONFLICT, 'Bạn đã đánh giá sản phẩm này rồi');
    }

    let review = await Review.create({
      user: userId,
      product_id: productId,
      rating: Number(rating),
      comment,
      isVerifiedPurchase: true
    });

    review = await review.populate('user', 'name avatar');
    return review;
  }

  async getProductReviews(productId, query) {
    const { rating, page = 1, limit = 10, sort = 'newest' } = query;
    const filter = { product_id: productId };
    if (rating) filter.rating = Number(rating);

    const sortObj = sort === 'newest' ? { createdAt: -1 } : { createdAt: -1 };
    const skip = (Number(page) - 1) * Number(limit);

    const [reviews, total, stats] = await Promise.all([
      Review.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(Number(limit))
        .populate('user', 'name avatar'),
      Review.countDocuments(filter),
      Review.aggregate([
        { $match: { product_id: new mongoose.Types.ObjectId(productId) } },
        { $group: { _id: '$rating', count: { $sum: 1 } } }
      ])
    ]);

    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalRatingSum = 0;
    let totalReviewsForAvg = 0;

    stats.forEach(stat => {
      ratingDistribution[stat._id] = stat.count;
      totalRatingSum += stat._id * stat.count;
      totalReviewsForAvg += stat.count;
    });

    const averageRating = totalReviewsForAvg > 0 ? (totalRatingSum / totalReviewsForAvg).toFixed(1) : 0;

    return {
      reviews,
      total,
      averageRating: Number(averageRating),
      ratingDistribution,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit))
    };
  }

  async updateReview(reviewId, userId, { rating, comment }) {
    const review = await Review.findOne({ _id: reviewId, user: userId });
    if (!review) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Đánh giá không tồn tại hoặc bạn không có quyền sửa');

    review.rating = rating;
    review.comment = comment;
    await review.save(); // Kích hoạt pre-save/post-save hook

    return review;
  }

  async deleteReview(reviewId, userId, role) {
    const review = await Review.findById(reviewId);
    if (!review) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Đánh giá không tồn tại');

    if (review.user.toString() !== userId.toString() && role !== USER_ROLES.ADMIN) {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Bạn không có quyền xóa đánh giá này');
    }

    await review.deleteOne(); // Kích hoạt pre-remove/post-remove hook
    return true;
  }

  async getUserReviews(userId, query) {
    const { page = 1, limit = 10 } = query;
    const skip = (Number(page) - 1) * Number(limit);

    const [reviews, total] = await Promise.all([
      Review.find({ user: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('product_id', 'name images slug'),
      Review.countDocuments({ user: userId })
    ]);

    return {
      reviews,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit))
    };
  }
}

export const reviewService = new ReviewService();
