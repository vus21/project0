import { User, Order } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/index.js';

class AdminUserService {
  async getAllUsers(query) {
    const { role, isActive, search, page = 1, limit = 10 } = query;
    const filter = {};
    
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    
    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort({ createdAt: -1, name: 1 })
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments(filter)
    ]);

    return {
      users,
      pagination: {
        total,
        page: Number(page),
        totalPages: Math.ceil(total / Number(limit))
      }
    };
  }

  async getUserDetail(userId) {
    const user = await User.findById(userId).select('-password');
    if (!user) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User không tồn tại');

    // Thống kê nhanh đơn hàng và wishlist của user
    const [orderStats, wishlistCount] = await Promise.all([
      Order.aggregate([
        { $match: { user: user._id } },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalSpent: { $sum: '$totalPrice' }
          }
        }
      ]),
      User.aggregate([
        { $match: { _id: user._id } },
        { $project: { wishlistCount: { $size: { $ifNull: ['$wishlist', []] } } } }
      ])
    ]);

    return {
      ...user.toObject(),
      stats: {
        totalOrders: orderStats[0]?.totalOrders || 0,
        totalSpent: orderStats[0]?.totalSpent || 0,
        wishlistCount: wishlistCount[0]?.wishlistCount || 0
      }
    };
  }

  async updateUser(userId, data) {
    // Ngăn update password qua API này
    const { password, ...updateData } = data;
    
    const user = await User.findByIdAndUpdate(userId, updateData, { 
      new: true, 
      runValidators: true 
    }).select('-password');
    
    if (!user) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User không tồn tại');
    return user;
  }

  async deleteUser(userId, currentAdminId) {
    if (userId.toString() === currentAdminId.toString()) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Không thể khóa chính tài khoản admin đang đăng nhập');
    }

    const user = await User.findById(userId);
    if (!user) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User không tồn tại');

    // Soft delete
    user.isActive = false;
    await user.save();
    return true;
  }

  async createAdmin(data) {
    const { email, password, name, phone } = data;
    
    const existing = await User.findOne({ email });
    if (existing) {
      throw new ApiError(HTTP_STATUS.CONFLICT, 'Email đã tồn tại');
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: 'admin'
    });

    const userObj = user.toObject();
    delete userObj.password;
    return userObj;
  }
}

export const adminUserService = new AdminUserService();
