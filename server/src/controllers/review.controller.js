import { asyncHandler } from '../middlewares/asyncHandler.js';
import { reviewService } from '../services/review.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { HTTP_STATUS } from '../constants/index.js';

export const createReview = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const review = await reviewService.createReview(req.user._id, productId, req.body);
  ApiResponse.success(res, review, 'Đánh giá thành công', HTTP_STATUS.CREATED);
});

export const getProductReviews = asyncHandler(async (req, res) => {
  const result = await reviewService.getProductReviews(req.params.productId, req.query);
  ApiResponse.success(res, result, 'Lấy danh sách đánh giá thành công');
});

export const updateReview = asyncHandler(async (req, res) => {
  const review = await reviewService.updateReview(req.params.reviewId, req.user._id, req.body);
  ApiResponse.success(res, review, 'Cập nhật đánh giá thành công');
});

export const deleteReview = asyncHandler(async (req, res) => {
  await reviewService.deleteReview(req.params.reviewId, req.user._id, req.user.role);
  ApiResponse.success(res, null, 'Xóa đánh giá thành công');
});

export const getUserReviews = asyncHandler(async (req, res) => {
  const result = await reviewService.getUserReviews(req.user._id, req.query);
  ApiResponse.success(res, result, 'Lấy danh sách đánh giá của bạn thành công');
});
