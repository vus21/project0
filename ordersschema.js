module.exports = {
  // Mô tả schema cho một đơn hàng (Order)
  Order: {
    _id: 'ObjectId', // Mongoose ObjectId (chuỗi)
    orderCode: 'String',
    user: {
      _id: 'ObjectId',
      name: 'String',
      email: 'String'
    },
    paymentMethod: 'String', // ví dụ: 'COD', 'VNPAY', ...
    paymentStatus: 'String', // expected: 'pending'|'paid'|'failed'|'refunded'
    orderStatus: 'String', // expected: 'pending'|'confirmed'|'processing'|'shipping'|'delivered'|'cancelled'|'refunded'
    createdAt: 'Date',
    updatedAt: 'Date',
    shippingAddress: {
      fullName: 'String',
      phone: 'String',
      detail: 'String',
      ward: 'String',
      city: 'String'
    },
    note: 'String',
    orderItems: [
      {
        sku: 'String',
        name: 'String',
        image: 'String',
        price: 'Number',
        quantity: 'Number',
        color: 'String',
        size: 'String'
      }
    ],
    itemPrice: 'Number',
    shippingPrice: 'Number',
    discountPrice: 'Number',
    totalPrice: 'Number',
    voucher: {
      code: 'String',
      amount: 'Number'
    },
    adminNote: 'String'
  },

  // Mô tả schema cho thống kê (Stats) mà client dùng để hiển thị dashboard
  Stats: {
    totalRevenue: 'Number',
    today: {
      orders: 'Number',
      revenue: 'Number'
    },
    // mảng trả về từ server: [{ _id: '<status>', count: <number> }, ...]
    ordersByStatus: [
      {
        _id: 'String', // status key
        count: 'Number'
      }
    ]
  }
};
