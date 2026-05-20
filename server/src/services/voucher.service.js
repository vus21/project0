import { Voucher } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/index.js';

class VoucherService {
  async validateVoucher(code, userId, orderAmount) {
    const voucher = await Voucher.findOne({ code: code.toUpperCase() });
    
    if (!voucher) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Mã giảm giá không tồn tại');
    }

    if (!voucher.isActive) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Mã giảm giá không hợp lệ');
    }

    if (new Date() > new Date(voucher.expiredAt)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Mã giảm giá đã hết hạn');
    }

    if (voucher.usedCount >= voucher.usageLimit) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Mã giảm giá đã hết lượt sử dụng');
    }

    if (orderAmount < voucher.minOrderValue) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, `Đơn hàng tối thiểu ${voucher.minOrderValue}đ để dùng mã này`);
    }

    const discountAmount = voucher.calculateDiscount(orderAmount);
    // Bảo vệ không để giảm giá lố tiền đơn hàng dẫn tới totalPrice âm
    const safeDiscount = Math.min(discountAmount, orderAmount);

    return { 
      voucher, 
      discountAmount: safeDiscount, 
      finalAmount: Math.max(0, orderAmount - safeDiscount) 
    };
  }

  async applyVoucher(code, userId, orderAmount) {
    return this.validateVoucher(code, userId, orderAmount);
  }

  async useVoucher(code) {
    return Voucher.findOneAndUpdate(
      { code: code.toUpperCase() },
      { $inc: { usedCount: 1 } },
      { new: true }
    );
  }

  async rollbackVoucher(code) {
    const voucher = await Voucher.findOne({ code: code.toUpperCase() });
    if (voucher && voucher.usedCount > 0) {
      voucher.usedCount -= 1;
      await voucher.save();
    }
  }

  async createVoucher(data) {
    if (data.code) {
      data.code = data.code.toUpperCase().trim();
      const existing = await Voucher.findOne({ code: data.code });
      if (existing) {
        throw new ApiError(HTTP_STATUS.CONFLICT, 'Mã code này đã tồn tại');
      }
    }
    const voucher = await Voucher.create(data);
    return voucher;
  }

  async getAllVouchers(query) {
    const filter = {};
    if (query.isActive !== undefined) filter.isActive = query.isActive === 'true';
    if (query.discountType) filter.discountType = query.discountType;

    const vouchers = await Voucher.find(filter).sort({ createdAt: -1 });
    return vouchers;
  }

  async updateVoucher(id, data) {
    if (data.code) data.code = data.code.toUpperCase().trim();
    const voucher = await Voucher.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!voucher) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Không tìm thấy voucher');
    return voucher;
  }

  async deleteVoucher(id) {
    const voucher = await Voucher.findById(id);
    if (!voucher) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Không tìm thấy voucher');
    
    // Soft delete
    voucher.isActive = false;
    await voucher.save();
    return true;
  }
}

export const voucherService = new VoucherService();
