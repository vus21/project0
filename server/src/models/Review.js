import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true, maxlength: 1000 },
    isVerifiedPurchase: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// Mỗi user chỉ được rate 1 sản phẩm đúng 1 lần
reviewSchema.index({ user: 1, product_id: 1 }, { unique: true });

// Hàm tính toán và cập nhật rating trung bình cho Product
reviewSchema.statics.calculateAverageRating = async function (productId) {
  const obj = await this.aggregate([
    { $match: { product_id: productId } },
    { $group: { _id: '$product_id', avgRating: { $avg: '$rating' }, numOfReviews: { $sum: 1 } } }
  ]);

  try {
    await mongoose.model('Product').findByIdAndUpdate(productId, {
      rating: obj.length > 0 ? Math.round(obj[0].avgRating * 10) / 10 : 0,
      ratingCount: obj.length > 0 ? obj[0].numOfReviews : 0
    });
  } catch (error) {
    console.error('Lỗi tính rating trung bình:', error);
  }
};

// Hook sau khi lưu hoặc update review
reviewSchema.post('save', function () {
  this.constructor.calculateAverageRating(this.product_id);
});

// Hook sau khi xoá review
reviewSchema.post('deleteOne', { document: true, query: false }, function () {
  this.constructor.calculateAverageRating(this.product_id);
});

export default mongoose.model('Review', reviewSchema);
