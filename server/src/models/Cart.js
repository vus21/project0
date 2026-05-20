import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  sku: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1, default: 1 },
  price: { type: Number, required: true }, // Giá chốt tại lúc thêm vào giỏ
  color: String,
  size: String
});

const cartSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
    items: [cartItemSchema]
  },
  { timestamps: true }
);

// Tính tổng giá trị giỏ hàng
cartSchema.methods.calculateTotal = function () {
  return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
};

// Tìm xem item có trong giỏ chưa
cartSchema.methods.findItem = function (productId, sku) {
  return this.items.find(
    item => item.product.toString() === productId.toString() && item.sku === sku
  );
};

// Lấy giỏ hàng kèm thông tin chi tiết Product
cartSchema.statics.getCartWithProducts = function (userId) {
  return this.findOne({ user_id: userId }).populate({
    path: 'items.product',
    select: 'name slug images isActive'
  });
};

export default mongoose.model('Cart', cartSchema);
