import mongoose from 'mongoose';
import payOS from '../config/payos.js';
import Order from '../models/Order.js';
import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS, PAYMENT_STATUS, ORDER_STATUS, PAYMENT_METHOD } from '../constants/index.js';

class PaymentService {
  /**
   * Tạo link thanh toán PayOS cho đơn hàng
   * @param {string} orderId 
   * @param {number} amount 
   * @param {string} userId 
   */
  async createPaymentLink(orderId, amount, userId) {
    // 1. Kiểm tra đơn hàng tồn tại
    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Đơn hàng không tồn tại hoặc không thuộc quyền sở hữu của bạn.');
    }

    // 2. Chỉ cho phép thanh toán đơn chưa thanh toán
    if (order.paymentStatus === PAYMENT_STATUS.PAID) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Đơn hàng này đã được thanh toán thành công trước đó.');
    }

    // 3. Validate số tiền thanh toán
    if (amount <= 0) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Số tiền thanh toán phải lớn hơn 0.');
    }

    if (order.totalPrice !== amount) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Số tiền yêu cầu thanh toán không khớp với giá trị đơn hàng.');
    }

    // 4. Tạo payment link từ PayOS
    const orderCode = order.orderCode; // số nguyên duy nhất đã sinh
    const description = `OLDMAN ${orderCode}`.slice(0, 25); // Mô tả tối đa 25 ký tự

    const paymentData = {
      orderCode: orderCode,
      amount: order.totalPrice,
      description: description,
      returnUrl: process.env.PAYOS_RETURN_URL,
      cancelUrl: process.env.PAYOS_CANCEL_URL,
    };

    try {
      const paymentLinkRes = await payOS.paymentRequests.create(paymentData);

      // 5. Lưu thông tin vào đơn hàng
      order.paymentLinkId = paymentLinkRes.paymentLinkId;
      order.paymentMethod = PAYMENT_METHOD.PAYOS;
      await order.save();

      return {
        checkoutUrl: paymentLinkRes.checkoutUrl,
      };
    } catch (error) {
      console.error('[PayOS Error] Lỗi khi tạo link thanh toán:', error);
      throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, `Lỗi khởi tạo cổng thanh toán: ${error.message}`);
    }
  }

  /**
   * Lấy trạng thái thanh toán từ PayOS hoặc database
   * @param {string} orderId 
   * @param {string} userId 
   */
  async getPaymentStatus(orderIdOrCode, userId) {
    const isObjectId = mongoose.Types.ObjectId.isValid(orderIdOrCode);
    const query = isObjectId 
      ? { _id: orderIdOrCode, user: userId } 
      : { orderCode: Number(orderIdOrCode), user: userId };

    const order = await Order.findOne(query);
    if (!order) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Đơn hàng không tồn tại hoặc không thuộc quyền sở hữu của bạn.');
    }

    // Nếu đã đánh dấu PAID trong DB thì trả về ngay
    if (order.paymentStatus === PAYMENT_STATUS.PAID) {
      return { paymentStatus: PAYMENT_STATUS.PAID, orderId: order._id };
    }

    try {
      // Đồng bộ trạng thái mới nhất từ PayOS
      const paymentLinkInfo = await payOS.paymentRequests.get(order.orderCode);

      if (paymentLinkInfo.status === 'PAID') {
        order.paymentStatus = PAYMENT_STATUS.PAID;
        order.orderStatus = ORDER_STATUS.CONFIRMED;
        order.paidAt = new Date();
        await order.save();
        return { paymentStatus: PAYMENT_STATUS.PAID, orderId: order._id };
      } else if (paymentLinkInfo.status === 'CANCELLED') {
        order.paymentStatus = PAYMENT_STATUS.FAILED;
        await order.save();
        return { paymentStatus: PAYMENT_STATUS.FAILED, orderId: order._id };
      }
    } catch (error) {
      // Bỏ qua lỗi kết nối PayOS (ví dụ link thanh toán chưa được tạo trên PayOS)
      // và dùng trạng thái hiện tại trong database
      console.warn(`[PayOS Sync Warning] Không thể đồng bộ trạng thái đơn hàng ${order.orderCode}: ${error.message}`);
    }

    return { paymentStatus: order.paymentStatus, orderId: order._id };
  }

  /**
   * Xử lý Webhook gọi từ PayOS
   * @param {object} webhookBody 
   */
  async processWebhook(webhookBody) {
    try {
      // 1. Verify chữ ký webhook bằng PayOS SDK
      const verifiedData = await payOS.webhooks.verify(webhookBody);

      // 2. Kiểm tra nếu giao dịch thanh toán thành công
      if (verifiedData.status === 'PAID') {
        const order = await Order.findOne({ orderCode: verifiedData.orderCode });
        if (!order) {
          console.error(`[Webhook PayOS Error] Không tìm thấy đơn hàng với mã code ${verifiedData.orderCode}`);
          return { success: false, message: 'Order not found' };
        }

        // 3. Không cập nhật trùng lặp nếu đơn đã thanh toán
        if (order.paymentStatus !== PAYMENT_STATUS.PAID) {
          order.paymentStatus = PAYMENT_STATUS.PAID;
          order.orderStatus = ORDER_STATUS.CONFIRMED;
          order.paidAt = new Date();
          await order.save();
          console.log(`[Webhook PayOS Success] Đơn hàng ${order.orderCode} đã cập nhật trạng thái PAID.`);
        } else {
          console.log(`[Webhook PayOS Skip] Đơn hàng ${order.orderCode} đã thanh toán từ trước.`);
        }
      }
      return { success: true };
    } catch (error) {
      console.error('[Webhook PayOS Error] Lỗi xử lý webhook:', error);
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, `Webhook verification failed: ${error.message}`);
    }
  }
}

export const paymentService = new PaymentService();
