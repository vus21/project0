import { Router } from 'express';
import * as voucherController from '../controllers/voucher.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import { USER_ROLES } from '../constants/index.js';

const router = Router();

router.use(protect); // Yêu cầu đăng nhập cho tất cả routes

// Cho user sử dụng
router.post('/apply', voucherController.applyVoucher);

// Cho admin quản lý
router.use(restrictTo(USER_ROLES.ADMIN));
router.get('/', voucherController.getAllVouchers);
router.post('/', voucherController.createVoucher);
router.put('/:id', voucherController.updateVoucher);
router.delete('/:id', voucherController.deleteVoucher);

export default router;
