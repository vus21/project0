import { Router } from 'express';
import * as wishlistController from '../controllers/wishlist.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(protect); // Yêu cầu đăng nhập

router.get('/', wishlistController.getWishlist);
router.post('/:productId', wishlistController.addToWishlist);
router.delete('/:productId', wishlistController.removeFromWishlist);
router.put('/:productId/toggle', wishlistController.toggleWishlist);

export default router;
