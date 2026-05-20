import mongoose from 'mongoose';
import { ORDER_STATUS, PAYMENT_STATUS, PAYMENT_METHOD, SHIPPING_THRESHOLD, SHIPPING_FEE } from '../constants/index.js';

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name: { type: String, required: true },
  sku: { type: String, required: true },
  image: String,
  color: String,
  size: String,
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 }
});

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderCode: { type: String, unique: true },
    
    orderItems: [orderItemSchema],
    
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      city: { type: String, required: true },
      ward: { type: String, required: true },
      detail: { type: String, required: true },
      note: String
    },
    
    paymentMethod: { type: String, enum: Object.values(PAYMENT_METHOD), default: PAYMENT_METHOD.COD },
    paymentStatus: { type: String, enum: Object.values(PAYMENT_STATUS), default: PAYMENT_STATUS.PENDING },
    orderStatus: { type: String, enum: Object.values(ORDER_STATUS), default: ORDER_STATUS.PENDING },
    
    voucher: {
      code: String,
      discountType: String,
      discountValue: Number
    },
    
    itemPrice: { type: Number, required: true },
    shippingPrice: { type: Number, default: 0, required: true },
    discountPrice: { type: Number, default: 0 },
    totalPrice: { type: Number, required: true },
    
    idempotencyKey: { type: String, unique: true, sparse: true },
    
    paidAt: Date,
    deliveredAt: Date,
    cancelledAt: Date,
    cancelReason: String
  },
  { timestamps: true }
);

// Indexes phục vụ list orders cho User/Admin
orderSchema.index({ user: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });

// Tự sinh mã Đơn hàng (OrderCode) và tính toán chi phí trước khi lưu
orderSchema.pre('save', function (next) {
  if (!this.orderCode) {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.orderCode = `ORD-${timestamp}-${random}`;
  }
  
  if (this.isModified('itemPrice')) {
    this.shippingPrice = this.itemPrice > SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
    this.totalPrice = this.itemPrice + this.shippingPrice - (this.discountPrice || 0);
  }
  next();
});

// Chỉ duyệt hủy nếu trạng thái đang là Pending hoặc Confirmed
orderSchema.statics.canUserCancel = function (status) {
  return [ORDER_STATUS.PENDING, ORDER_STATUS.CONFIRMED].includes(status);
};

export default mongoose.model('Order', orderSchema);
