import { Router } from 'express';
import * as adminController from '../controllers/admin.controller.js';
import * as adminUserController from '../controllers/adminUser.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import { USER_ROLES } from '../constants/index.js';

const router = Router();

// Yêu cầu quyền admin tuyệt đối cho toàn bộ API bên trong
router.use(protect);
router.use(restrictTo(USER_ROLES.ADMIN));

// Dashboard Analytics
router.get('/seed-data', adminController.seedData);
router.get('/dashboard', adminController.getDashboard);
router.get('/revenue-chart', adminController.getRevenueChart);
router.get('/top-products', adminController.getTopProducts);
router.get('/recent-orders', adminController.getRecentOrders);
router.get('/low-stock', adminController.getLowStock);
router.get('/sales-by-category', adminController.getSalesByCategory);

// User Management
router.get('/users', adminUserController.getUsers);
router.get('/users/:id', adminUserController.getUserDetail);
router.post('/users/create-admin', adminUserController.createAdmin);
router.put('/users/:id', adminUserController.updateUser);
router.delete('/users/:id', adminUserController.deleteUser);

export default router;
