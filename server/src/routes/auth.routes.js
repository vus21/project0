import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import {
  validate,
  registerValidation,
  loginValidation,
  changePasswordValidation,
  updateProfileValidation
} from '../validations/auth.validation.js';
import { uploadAvatar } from '../config/multer.js';

const router = Router();

// ========================
// PUBLIC ROUTES
// ========================
router.post('/register', registerValidation, validate, authController.register);
router.post('/login', loginValidation, validate, authController.login);
router.post('/logout', authController.logout);
router.post('/refresh-token', authController.refreshToken);
router.get('/verify-email', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerification);
router.get('/seed', authController.seedUser);
// ========================
// PROTECTED ROUTES (Yêu cầu đăng nhập)
// ========================
router.use(protect);
// Middleware bảo vệ tất cả routes bên dưới

router.get('/profile', authController.getProfile);
router.put('/profile', updateProfileValidation, validate, authController.updateProfile);
router.put('/change-password', changePasswordValidation, validate, authController.changePassword);
router.post('/avatar', uploadAvatar, authController.uploadAvatar);

export default router;
