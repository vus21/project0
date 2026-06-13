import mongoose from 'mongoose';
import slugify from 'slugify';
import {
  SEASONS,
  MATERIALS,
  PRODUCT_TAGS
} from '../constants/index.js';
const variantSchema = new mongoose.Schema({
  sku: { type: String, required: true, unique: true, sparse: true },
  color: {
    type: String,
    required: true,
    trim: true,
    set: (value) => {
      if (!value) return value;
  
      const normalized = value.trim().toLowerCase();
  
      return normalized.charAt(0).toUpperCase() + normalized.slice(1);
    }
  },
  size: {
    type: String,
    required: true,
    enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'Free Size']
  },
  stock: { type: Number, default: 0, min: 0 },
  image: { url: String, public_id: String },
  isActive: { type: Boolean, default: true }
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, unique: true, lowercase: true },
    description: { type: String, required: true },
    basePrice: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, default: null, min: 0 },
    images: [{ url: String, public_id: String }],
    category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    tags: [{
      type: String,
      enum: Object.values(PRODUCT_TAGS),
      default: []
    }],

    material: {
      type: String,
      enum: Object.values(MATERIALS)
    },

    season: [{
      type: String,
      enum: Object.values(SEASONS),
      default: SEASONS.ALL_SEASON
    }],
    variants: [variantSchema],
    totalStock: { type: Number, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0 },
    sold: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

// Đánh Index cho mục đích Search và Lọc
productSchema.index({ name: 'text' });
productSchema.index({ category_id: 1, isActive: 1, basePrice: 1, rating: -1, sold: -1 });

// Tự động tạo slug và tính toán tổng số lượng tồn kho
productSchema.pre('save', async function (next) {
  if (this.isModified('name')) {
    let baseSlug = slugify(this.name, { lower: true, strict: true });
    let existingSlug = await this.constructor.findOne({ slug: baseSlug });
    if (existingSlug && existingSlug._id.toString() !== this._id.toString()) {
      baseSlug = `${baseSlug}-${Math.floor(Math.random() * 10000)}`;
    }
    this.slug = baseSlug;
  }

  // Chỉ tính stock những biến thể đang active
  if (this.isModified('variants')) {
    this.totalStock = this.variants.reduce((total, variant) => {
      return variant.isActive ? total + variant.stock : total;
    }, 0);
  }
  next();
});

// Cập nhật tồn kho theo SKU
productSchema.methods.updateStock = async function (sku, quantity, operation) {
  const variant = this.variants.find(v => v.sku === sku);
  if (!variant) throw new Error('Không tìm thấy SKU');

  if (operation === 'decrease') {
    if (variant.stock < quantity) throw new Error('Số lượng tồn kho không đủ');
    variant.stock -= quantity;
    this.sold += quantity;
  } else if (operation === 'increase') {
    variant.stock += quantity;
    this.sold = Math.max(0, this.sold - quantity);
  } else {
    throw new Error('Operation không hợp lệ');
  }

  this.totalStock = this.variants.reduce((total, v) => (v.isActive ? total + v.stock : total), 0);
  return this.save();
};

productSchema.statics.findBySlug = function (slug) {
  return this.findOne({ slug }).populate('category_id');
};

export default mongoose.model('Product', productSchema);
