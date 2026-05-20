import { Router } from 'express';
import * as categoryController from '../controllers/category.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import { uploadCategoryImage } from '../config/multer.js';
import { USER_ROLES } from '../constants/index.js';

const router = Router();

// Public routes
router.get('/', categoryController.getAllCategories);
router.get('/:slug', categoryController.getCategoryBySlug);

// Admin routes
// Tạm thời bỏ chặn để test bằng Postman
router.use(protect);
router.use(restrictTo(USER_ROLES.ADMIN));

router.post('/', uploadCategoryImage, categoryController.createCategory);
router.put('/:id', uploadCategoryImage, categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

export default router;
