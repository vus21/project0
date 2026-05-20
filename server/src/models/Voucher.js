import mongoose from 'mongoose';
import { DISCOUNT_TYPE } from '../constants/index.js';

const voucherSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    discountType: { type: String, enum: Object.values(DISCOUNT_TYPE), required: true },
    discountValue: { type: Number, required: true, min: 0 },
    minOrderValue: { type: Number, default: 0 },
    maxDiscount: { type: Number, default: null },
    usageLimit: { type: Number, required: true, min: 1 },
    usedCount: { type: Number, default: 0 },
    expiredAt: { type: Date, required: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

// Kiểm tra Voucher còn hiệu lực hay không
voucherSchema.methods.isValid = function () {
  return (
    this.isActive &&
    this.usedCount < this.usageLimit &&
    new Date() <= new Date(this.expiredAt)
  );
};

// Tính toán số tiền được giảm
voucherSchema.methods.calculateDiscount = function (orderAmount) {
  if (!this.isValid() || orderAmount < this.minOrderValue) return 0;
  
  if (this.discountType === DISCOUNT_TYPE.FIXED) {
    return Math.min(this.discountValue, orderAmount);
  } else if (this.discountType === DISCOUNT_TYPE.PERCENT) {
    const calculatedDiscount = (orderAmount * this.discountValue) / 100;
    return this.maxDiscount ? Math.min(calculatedDiscount, this.maxDiscount) : calculatedDiscount;
  }
  return 0;
};

export default mongoose.model('Voucher', voucherSchema);
