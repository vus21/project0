import mongoose from 'mongoose';
import slugify from 'slugify';

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, unique: true, lowercase: true },
    parent_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    image: { url: String, public_id: String },
    isActive: { type: Boolean, default: true }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Tạo slug tự động từ tên category
categorySchema.pre('save', async function (next) {
  if (this.isModified('name')) {
    let baseSlug = slugify(this.name, { lower: true, strict: true });
    let existingSlug = await this.constructor.findOne({ slug: baseSlug });
    // Nếu trùng slug với category khác, append số random
    if (existingSlug && existingSlug._id.toString() !== this._id.toString()) {
      baseSlug = `${baseSlug}-${Math.floor(Math.random() * 10000)}`;
    }
    this.slug = baseSlug;
  }
  next();
});

// Virtual populate cho các danh mục con
categorySchema.virtual('children', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent_id'
});

export default mongoose.model('Category', categorySchema);
