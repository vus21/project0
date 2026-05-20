import { Router } from 'express';
import * as productController from '../controllers/product.controller.js';
import * as reviewController from '../controllers/review.controller.js';
import { protect, restrictTo, optionalAuth } from '../middlewares/auth.middleware.js';
import { uploadProductImages } from '../config/multer.js';
import { USER_ROLES } from '../constants/index.js';
import { createProductValidation, updateProductValidation } from '../validations/product.validation.js';
import { validate } from '../validations/auth.validation.js';

const router = Router();

// Public routes (có thể lấy user ID qua optionalAuth nếu user đang đăng nhập)
router.get('/', optionalAuth, productController.getProducts);
router.get('/:slug', optionalAuth, productController.getProductBySlug);
router.get('/:id/related', productController.getRelatedProducts);

// Reviews routes (gắn liền với 1 product cụ thể)
router.get('/:productId/reviews', reviewController.getProductReviews);
router.post('/:productId/reviews', protect, reviewController.createReview);

// Admin routes
// Tạm thời bỏ chặn để test bằng Postman
// router.use(protect);
// router.use(restrictTo(USER_ROLES.ADMIN));

router.post('/', uploadProductImages, createProductValidation, validate, productController.createProduct);
router.put('/:id', uploadProductImages, updateProductValidation, validate, productController.updateProduct);
router.delete('/:id', productController.deleteProduct);
router.delete('/:id/images', productController.deleteProductImage);
router.post('/:id/variants', productController.manageVariant);

export default router;
