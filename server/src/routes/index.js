import { Router } from 'express';
import authRoutes from './auth.routes.js';
import categoryRoutes from './category.routes.js';
import productRoutes from './product.routes.js';
import cartRoutes from './cart.routes.js';
import voucherRoutes from './voucher.routes.js';
import orderRoutes from './order.routes.js';
import inventoryRoutes from './inventory.routes.js';
import reviewRoutes from './review.routes.js';
import wishlistRoutes from './wishlist.routes.js';
import addressRoutes from './address.routes.js';
import adminRoutes from './admin.routes.js';
import chatbotRoutes from './chatbot.js';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// Mount các child routes
router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/vouchers', voucherRoutes);
router.use('/orders', orderRoutes);
router.use('/inventory', inventoryRoutes);
// router.use('/reviews', reviewRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/addresses', addressRoutes);
router.use('/admin', adminRoutes);
router.use('/chatbot', chatbotRoutes);

export default router;
