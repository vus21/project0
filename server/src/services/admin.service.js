import { User, Order, Product, Category } from '../models/index.js';
import { ORDER_STATUS } from '../constants/index.js';

class AdminService {
  async getDashboardStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Parallel queries to maximize performance
    const [
      totalUsers,
      totalOrders,
      totalProducts,
      totalCategories,
      revenueData,
      orderStatusData,
      todayData
    ] = await Promise.all([
      User.countDocuments({ role: 'user', isActive: true }),
      Order.countDocuments(),
      Product.countDocuments({ isActive: true }),
      Category.countDocuments({ isActive: true }),
      Order.aggregate([
        { $match: { orderStatus: ORDER_STATUS.DELIVERED } },
        { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' }, count: { $sum: 1 } } }
      ]),
      Order.aggregate([
        { $group: { _id: '$orderStatus', count: { $sum: 1 } } }
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: today } } },
        { 
          $group: { 
            _id: null, 
            revenue: { 
              $sum: { $cond: [{ $eq: ['$orderStatus', ORDER_STATUS.DELIVERED] }, '$totalPrice', 0] } 
            }, 
            orders: { $sum: 1 } 
          } 
        }
      ])
    ]);

    const ordersByStatus = {};
    orderStatusData.forEach(item => {
      ordersByStatus[item._id] = item.count;
    });

    return {
      totalUsers,
      totalOrders,
      totalProducts,
      totalCategories,
      totalRevenue: revenueData[0]?.totalRevenue || 0,
      deliveredOrders: revenueData[0]?.count || 0,
      ordersByStatus,
      today: {
        orders: todayData[0]?.orders || 0,
        revenue: todayData[0]?.revenue || 0
      }
    };
  }

  async getRevenueChart(year) {
    const targetYear = Number(year) || new Date().getFullYear();
    const startDate = new Date(`${targetYear}-01-01T00:00:00.000Z`);
    const endDate = new Date(`${targetYear}-12-31T23:59:59.999Z`);

    const data = await Order.aggregate([
      { 
        $match: { 
          orderStatus: ORDER_STATUS.DELIVERED,
          createdAt: { $gte: startDate, $lte: endDate }
        } 
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          revenue: { $sum: '$totalPrice' },
          orders: { $sum: 1 }
        }
      }
    ]);

    const result = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      monthName: `Tháng ${i + 1}`,
      revenue: 0,
      orders: 0
    }));

    data.forEach(item => {
      const index = item._id - 1;
      result[index].revenue = item.revenue;
      result[index].orders = item.orders;
    });

    return result;
  }

  async getTopSellingProducts(limit = 10) {
    const topProducts = await Order.aggregate([
      { $match: { orderStatus: ORDER_STATUS.DELIVERED } },
      { $unwind: '$orderItems' },
      {
        $group: {
          _id: '$orderItems.product',
          totalSold: { $sum: '$orderItems.quantity' },
          totalRevenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: Number(limit) },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: '$productInfo' },
      {
        $project: {
          _id: 1,
          totalSold: 1,
          totalRevenue: 1,
          name: '$productInfo.name',
          images: '$productInfo.images',
          basePrice: '$productInfo.basePrice',
          slug: '$productInfo.slug'
        }
      }
    ]);

    return topProducts;
  }

  async getRecentOrders(limit = 10) {
    return Order.find()
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .populate('user', 'name email');
  }

  async getLowStockAlert(threshold = 10) {
    return Product.find({ 
      totalStock: { $lte: Number(threshold) },
      isActive: true 
    }).select('name variants category_id totalStock images slug').sort({ totalStock: 1 });
  }

  async getSalesByCategory() {
    const sales = await Order.aggregate([
      { $match: { orderStatus: ORDER_STATUS.DELIVERED } },
      { $unwind: '$orderItems' },
      {
        $lookup: {
          from: 'products',
          localField: 'orderItems.product',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $lookup: {
          from: 'categories',
          localField: 'product.category_id',
          foreignField: '_id',
          as: 'category'
        }
      },
      { $unwind: '$category' },
      {
        $group: {
          _id: '$category._id',
          categoryName: { $first: '$category.name' },
          totalRevenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } },
          totalOrders: { $sum: 1 } 
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    return sales;
  }
}

export const adminService = new AdminService();
