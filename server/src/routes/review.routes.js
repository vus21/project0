import { Router } from 'express';
import * as reviewController from '../controllers/review.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import { USER_ROLES } from '../constants/index.js';

const router = Router();

router.get('/my', protect, reviewController.getUserReviews);
router.put('/:reviewId', protect, reviewController.updateReview);
router.delete('/:reviewId', protect, restrictTo(USER_ROLES.USER, USER_ROLES.ADMIN), reviewController.deleteReview);

export default router;
