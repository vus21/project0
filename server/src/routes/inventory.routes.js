import { Router } from 'express';
import * as inventoryController from '../controllers/inventory.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import { USER_ROLES } from '../constants/index.js';

const router = Router();

router.use(protect);
router.use(restrictTo(USER_ROLES.ADMIN));

router.get('/low-stock', inventoryController.getLowStock);
router.get('/out-of-stock', inventoryController.getOutOfStock);
router.put('/:productId/sku/:sku', inventoryController.updateStock);

export default router;
