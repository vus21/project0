import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    ward: { type: String, required: true, trim: true },
    detail: { type: String, required: true, trim: true },
    isDefault: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// Tối ưu truy vấn tìm địa chỉ theo user
addressSchema.index({ user_id: 1 });

export default mongoose.model('Address', addressSchema);
