import { Order, Product, Cart } from '../models/index.js';
import { cartService } from './cart.service.js';
import { voucherService } from './voucher.service.js';
import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS, ORDER_STATUS, PAYMENT_STATUS, PAYMENT_METHOD, SHIPPING_THRESHOLD, SHIPPING_FEE } from '../constants/index.js';

const STATUS_TRANSITIONS = {
  [ORDER_STATUS.PENDING]: [ORDER_STATUS.CONFIRMED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.CONFIRMED]: [ORDER_STATUS.PROCESSING, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.PROCESSING]: [ORDER_STATUS.SHIPPING],
  [ORDER_STATUS.SHIPPING]: [ORDER_STATUS.DELIVERED, ORDER_STATUS.REFUNDED],
  [ORDER_STATUS.DELIVERED]: [], 
  [ORDER_STATUS.CANCELLED]: [],
  [ORDER_STATUS.REFUNDED]: []
};

class OrderService {
  async placeOrder(userId, orderData) {
    const { shippingAddress, paymentMethod, voucherCode, idempotencyKey } = orderData;

    // 1. Idempotency Check (Chống tạo đơn trùng khi network chập chờn)
    if (idempotencyKey) {
      const existingOrder = await Order.findOne({ user: userId, idempotencyKey });
      if (existingOrder) return existingOrder;
    }

    // 2. Lấy Cart để build Order
    const cartData = await cartService.getCart(userId);
    if (!cartData.items || cartData.items.length === 0) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Giỏ hàng đang trống');
    }

    // 3. Validate Stock & Active Status (Atomic Mindset)
    if (!cartData.summary.isValid) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Một số sản phẩm trong giỏ không hợp lệ, vui lòng kiểm tra lại');
    }

    // 4. Tính toán giá
    const itemPrice = cartData.summary.subtotal;
    const shippingPrice = itemPrice > SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
    let discountPrice = 0;
    let voucherData = null;

    // 5. Áp dụng Voucher (nếu có)
    if (voucherCode) {
      const vResult = await voucherService.validateVoucher(voucherCode, userId, itemPrice);
      discountPrice = vResult.discountAmount;
      voucherData = {
        code: vResult.voucher.code,
        discountType: vResult.voucher.discountType,
        discountValue: vResult.voucher.discountValue
      };
    }

    const totalPrice = Math.max(0, itemPrice + shippingPrice - discountPrice);

    // 6. Build mảng OrderItems
    const orderItems = cartData.items.map(item => {
      const p = item.product;
      const v = p.variants.find(v => v.sku === item.sku);
      return {
        product: p._id,
        name: p.name,
        sku: item.sku,
        image: v.image?.url || p.images[0]?.url || '',
        color: v.color,
        size: v.size,
        price: item.currentPrice,
        quantity: item.quantity
      };
    });

    // 7. Tạo Order Document
    let order = new Order({
      user: userId,
      orderItems,
      shippingAddress,
      paymentMethod: paymentMethod || PAYMENT_METHOD.COD,
      paymentStatus: PAYMENT_STATUS.PENDING,
      orderStatus: ORDER_STATUS.PENDING,
      voucher: voucherData,
      itemPrice,
      shippingPrice,
      discountPrice,
      totalPrice,
      idempotencyKey
    });

    await order.save();

    // 8. Deduct Stock an toàn
    try {
      for (const item of orderItems) {
        const product = await Product.findById(item.product);
        await product.updateStock(item.sku, item.quantity, 'decrease');
      }
    } catch (error) {
      // Bị lỗi trừ stock -> Rollback sạch sẽ
      await this.rollbackOrder(order._id);
      await order.deleteOne();
      throw new ApiError(HTTP_STATUS.CONFLICT, `Lỗi tồn kho: ${error.message}`);
    }

    // 9. Dọn dẹp sau khi chốt đơn
    await cartService.clearCart(userId);
    if (voucherCode) {
      await voucherService.useVoucher(voucherCode);
    }

    return order;
  }

  async rollbackOrder(orderId) {
    const order = await Order.findById(orderId);
    if (!order) return;

    for (const item of order.orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        await product.updateStock(item.sku, item.quantity, 'increase');
      }
    }

    if (order.voucher && order.voucher.code) {
      await voucherService.rollbackVoucher(order.voucher.code);
    }
  }

  async getUserOrders(userId, query) {
    const { orderStatus, paymentStatus, page = 1, limit = 10 } = query;
    const filter = { user: userId };
    if (orderStatus) filter.orderStatus = orderStatus;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    const skip = (Number(page) - 1) * Number(limit);
    
    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('orderItems.product', 'name images slug'),
      Order.countDocuments(filter)
    ]);

    return {
      orders,
      pagination: {
        total,
        page: Number(page),
        totalPages: Math.ceil(total / Number(limit))
      }
    };
  }

  async getOrderDetail(orderId, userId) {
    const order = await Order.findOne({ _id: orderId, user: userId })
      .populate('orderItems.product', 'name images slug');
    if (!order) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Đơn hàng không tồn tại');
    }
    return order;
  }

  async cancelOrder(orderId, userId, reason) {
    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Đơn hàng không tồn tại');

    if (!Order.canUserCancel(order.orderStatus)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Không thể hủy đơn hàng ở trạng thái này');
    }

    order.orderStatus = ORDER_STATUS.CANCELLED;
    order.cancelledAt = new Date();
    order.cancelReason = reason || 'Người dùng hủy đơn';
    await order.save();

    await this.rollbackOrder(orderId);

    return order;
  }

  // --- ADMIN METHODS ---
  async getAllOrders(query) {
    const { orderStatus, paymentStatus, userId, dateFrom, dateTo, search, page = 1, limit = 20 } = query;
    
    const filter = {};
    if (orderStatus) filter.orderStatus = orderStatus;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (userId) filter.user = userId;
    if (search) filter.orderCode = { $regex: search, $options: 'i' };
    
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    const skip = (Number(page) - 1) * Number(limit);
    
    const [orders, total, stats] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1, totalPrice: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('user', 'name email'),
      Order.countDocuments(filter),
      Order.aggregate([
        { $match: filter },
        { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } }
      ])
    ]);

    return {
      orders,
      summary: {
        totalOrders: total,
        totalRevenue: stats[0]?.totalRevenue || 0
      },
      pagination: {
        total,
        page: Number(page),
        totalPages: Math.ceil(total / Number(limit))
      }
    };
  }

  async updateOrderStatus(orderId, newStatus, adminNote) {
    const order = await Order.findById(orderId);
    if (!order) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Đơn hàng không tồn tại');

    const allowedTransitions = STATUS_TRANSITIONS[order.orderStatus] || [];
    if (!allowedTransitions.includes(newStatus) && newStatus !== ORDER_STATUS.CANCELLED) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, `Không thể chuyển trạng thái từ ${order.orderStatus} sang ${newStatus}`);
    }

    order.orderStatus = newStatus;

    if (newStatus === ORDER_STATUS.DELIVERED) {
      order.deliveredAt = new Date();
      if (order.paymentMethod === PAYMENT_METHOD.COD) {
        order.paymentStatus = PAYMENT_STATUS.PAID;
      }
    }

    if (newStatus === ORDER_STATUS.CANCELLED) {
      order.cancelledAt = new Date();
      order.cancelReason = adminNote || 'Admin hủy đơn';
      await this.rollbackOrder(orderId);
    }

    await order.save();
    return order;
  }

  async getOrderStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [statusStats, todayStats, revenueStats] = await Promise.all([
      Order.aggregate([
        { $group: { _id: '$orderStatus', count: { $sum: 1 } } }
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: today } } },
        { $group: { _id: null, count: { $sum: 1 }, revenue: { $sum: '$totalPrice' } } }
      ]),
      Order.aggregate([
        { $match: { orderStatus: ORDER_STATUS.DELIVERED } },
        { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } }
      ])
    ]);

    return {
      ordersByStatus: statusStats,
      today: {
        orders: todayStats[0]?.count || 0,
        revenue: todayStats[0]?.revenue || 0
      },
      totalRevenue: revenueStats[0]?.totalRevenue || 0
    };
  }
}

export const orderService = new OrderService();
