import { Router } from 'express';
import * as addressController from '../controllers/address.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(protect); // Yêu cầu đăng nhập

router.get('/', addressController.getUserAddresses);
router.post('/', addressController.createAddress);
router.put('/:id', addressController.updateAddress);
router.delete('/:id', addressController.deleteAddress);
router.put('/:id/set-default', addressController.setDefaultAddress);

export default router;
