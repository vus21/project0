import { Router } from 'express';
import * as paymentController from '../controllers/payment.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router();

// Webhook endpoint (không qua auth middleware vì được gọi từ PayOS)
router.post('/webhook', paymentController.handleWebhook);

// Các route yêu cầu người dùng đăng nhập
router.use(protect);
router.post('/create-payment-link', paymentController.createPaymentLink);
router.get('/:orderId/status', paymentController.getPaymentStatus);

export default router;
