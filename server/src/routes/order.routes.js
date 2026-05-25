// order.routes.js
import { Router } from 'express';
import * as orderController from '../controllers/order.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import { USER_ROLES } from '../constants/index.js';

const router = Router();

router.use(protect); // Yêu cầu đăng nhập

// --- Admin routes (Đưa lên trước các route dynamic của User) ---
router.use('/admin', restrictTo(USER_ROLES.ADMIN));
router.get('/admin/stats', orderController.getOrderStats);
router.get('/admin/all', orderController.getAllOrders);
router.put('/admin/:id/status', orderController.updateOrderStatus);

// --- User routes ---
router.post('/', orderController.placeOrder);
router.get('/', orderController.getUserOrders);
router.get('/:id', orderController.getOrderDetail); // Chuyển xuống dưới cùng
router.put('/:id/cancel', orderController.cancelOrder);

export default router;