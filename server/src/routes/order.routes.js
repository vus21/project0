import { Router } from 'express';
import * as orderController from '../controllers/order.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import { USER_ROLES } from '../constants/index.js';

const router = Router();

router.use(protect); // Yêu cầu đăng nhập

// User routes
router.post('/', orderController.placeOrder);
router.get('/', orderController.getUserOrders);
router.get('/:id', orderController.getOrderDetail);
router.put('/:id/cancel', orderController.cancelOrder);

// Admin routes
router.use('/admin', restrictTo(USER_ROLES.ADMIN));
router.get('/admin/stats', orderController.getOrderStats);
router.get('/admin/all', orderController.getAllOrders);
router.put('/admin/:id/status', orderController.updateOrderStatus);

export default router;
