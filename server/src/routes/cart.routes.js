import { Router } from 'express';
import * as cartController from '../controllers/cart.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(protect); // Yêu cầu đăng nhập

router.get('/', cartController.getCart);
router.post('/add', cartController.addToCart);
router.put('/update', cartController.updateCartItem);
router.delete('/remove', cartController.removeCartItem);
router.delete('/clear', cartController.clearCart);
router.post('/merge', cartController.mergeGuestCart);
router.post('/sync-prices', cartController.syncCartPrices);

export default router;
