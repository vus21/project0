import { User, Cart } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/index.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/generateToken.js';
import { cloudinaryConfig } from '../config/cloudinary.js';
import { uploadBufferToCloudinary } from '../utils/cloudinaryHelper.js';
import { sendVerificationEmail } from '../utils/emailService.js';
import jwt from 'jsonwebtoken';

class AuthService {
  
  async seedUser() {
    // ==============================
    // 1. Seed Admin
    // ==============================
    let admin = await User.findOne({ role: USER_ROLES.ADMIN });

    if (!admin) {
      admin = await User.create({
        name: 'Super Admin',
        email: 'admin@gmail.com',
        password: 'password123',
        phone: '0987654321',
        role: USER_ROLES.ADMIN
      });
    }

    // ==============================
    // 2. Seed Category
    // ==============================
    let fashionCategory = await Category.findOne({
      name: 'Thời Trang'
    });

    if (!fashionCategory) {
      fashionCategory = await Category.create({
        name: 'Thời Trang'
      });
    }

    // ==============================
    // 3. Check Products
    // ==============================
    const existingProducts = await Product.countDocuments();

    if (existingProducts > 0) {
      return {
        message: 'Dữ liệu đã tồn tại',
        admin
      };
    }

    // ==============================
    // 4. Seed Products
    // ==============================
    const products = [
      {
        name: 'Áo Thun Basic Nam',
        description: 'Áo thun cotton form regular fit',
        basePrice: 250000,
        discountPrice: 199000,

        images: [
          {
            url: 'https://example.com/ao-thun.jpg',
            public_id: 'ao-thun'
          }
        ],

        category_id: fashionCategory._id,

        variants: [
          {
            sku: 'ATB-DEN-M',
            color: 'Đen',
            size: 'M',
            stock: 20,
            image: {
              url: 'https://example.com/ao-den.jpg',
              public_id: 'ao-den'
            }
          },
          {
            sku: 'ATB-DEN-L',
            color: 'Đen',
            size: 'L',
            stock: 15,
            image: {
              url: 'https://example.com/ao-den.jpg',
              public_id: 'ao-den'
            }
          },
          {
            sku: 'ATB-TRANG-M',
            color: 'Trắng',
            size: 'M',
            stock: 18,
            image: {
              url: 'https://example.com/ao-trang.jpg',
              public_id: 'ao-trang'
            }
          },
          {
            sku: 'ATB-TRANG-L',
            color: 'Trắng',
            size: 'L',
            stock: 12,
            image: {
              url: 'https://example.com/ao-trang.jpg',
              public_id: 'ao-trang'
            }
          }
        ]
      },

      {
        name: 'Quần Jeans Slim Fit',
        description: 'Quần jeans co giãn slim fit cao cấp',
        basePrice: 550000,
        discountPrice: 499000,

        images: [
          {
            url: 'https://example.com/quan-jeans.jpg',
            public_id: 'quan-jeans'
          }
        ],

        category_id: fashionCategory._id,

        variants: [
          {
            sku: 'QJ-XANH-30',
            color: 'Xanh',
            size: 'M',
            stock: 10,
            image: {
              url: 'https://example.com/jeans-xanh.jpg',
              public_id: 'jeans-xanh'
            }
          },
          {
            sku: 'QJ-XANH-32',
            color: 'Xanh',
            size: 'L',
            stock: 8,
            image: {
              url: 'https://example.com/jeans-xanh.jpg',
              public_id: 'jeans-xanh'
            }
          },
          {
            sku: 'QJ-DEN-30',
            color: 'Đen',
            size: 'M',
            stock: 14,
            image: {
              url: 'https://example.com/jeans-den.jpg',
              public_id: 'jeans-den'
            }
          },
          {
            sku: 'QJ-DEN-32',
            color: 'Đen',
            size: 'L',
            stock: 9,
            image: {
              url: 'https://example.com/jeans-den.jpg',
              public_id: 'jeans-den'
            }
          }
        ]
      }
    ];

    const createdProducts = await Product.insertMany(products);

    return {
      message: 'Seed dữ liệu thành công',
      admin,
      products: createdProducts
    };
  

    // 3. Tạo giỏ hàng cho Admin
    await Cart.create({ user_id: adminUser._id });

    // Lưu ý: MongoDB sẽ tự động tạo các collection ngay khi bạn insert dữ liệu đầu tiên.
    return { message: process.env.MONGODB_URI + 'Admin created successfully!', admin: adminUser };
  }
  async register(name, email, password, phone) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ApiError(HTTP_STATUS.CONFLICT, 'Email đã được sử dụng');
    }

    // Tạo verification token (JWT, hết hạn sau 24h)
    const verificationToken = jwt.sign(
      { email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const user = await User.create({
      name,
      email,
      password,
      phone,
      verificationToken,
      isVerified: false
    });

    await Cart.create({ user_id: user._id }); // Tạo giỏ hàng rỗng

    // Gửi email xác thực (không throw lỗi nếu email fail, chỉ log)
    try {
      await sendVerificationEmail(email, name, verificationToken);
    } catch (err) {
      console.error('⚠️ Lỗi gửi email xác thực:', err.message);
    }

    return { message: 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.' };
  }

  async login(email, password) {
    const user = await User.findByEmail(email);
    if (!user) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Email hoặc mật khẩu không đúng');
    }

    if (!user.isActive) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Tài khoản của bạn đã bị khóa');
    }

    if (!user.isVerified) {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Email chưa được xác thực. Vui lòng kiểm tra hộp thư và xác thực tài khoản.');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Email hoặc mật khẩu không đúng');
    }

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    const userObject = user.toJSON();
    return { user: userObject, accessToken, refreshToken };
  }

  async verifyEmail(token) {
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Link xác thực không hợp lệ hoặc đã hết hạn');
    }

    const user = await User.findOne({ email: decoded.email }).select('+verificationToken');
    if (!user) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Không tìm thấy tài khoản');
    }

    if (user.isVerified) {
      return { message: 'Email đã được xác thực trước đó. Bạn có thể đăng nhập.' };
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save({ validateBeforeSave: false });

    return { message: 'Xác thực email thành công! Bạn có thể đăng nhập ngay.' };
  }

  async resendVerification(email) {
    const user = await User.findOne({ email }).select('+verificationToken');
    if (!user) {
      // Không tiết lộ email có tồn tại hay không
      return { message: 'Nếu email tồn tại trong hệ thống, chúng tôi sẽ gửi lại email xác thực.' };
    }

    if (user.isVerified) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Tài khoản đã được xác thực rồi. Bạn có thể đăng nhập.');
    }

    const verificationToken = jwt.sign(
      { email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    user.verificationToken = verificationToken;
    await user.save({ validateBeforeSave: false });

    try {
      await sendVerificationEmail(email, user.name, verificationToken);
    } catch (err) {
      console.error('⚠️ Lỗi gửi lại email xác thực:', err.message);
      throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Không thể gửi email. Vui lòng thử lại sau.');
    }

    return { message: 'Đã gửi lại email xác thực. Vui lòng kiểm tra hộp thư.' };
  }


  async refreshToken(token) {
    const decoded = verifyRefreshToken(token);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Tài khoản không hợp lệ hoặc đã bị khóa');
    }

    const accessToken = generateAccessToken(user._id, user.role);
    return { accessToken };
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select('+password');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Mật khẩu hiện tại không đúng');
    }

    if (currentPassword === newPassword) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Mật khẩu mới phải khác mật khẩu hiện tại');
    }

    user.password = newPassword;
    await user.save(); // Pre-save hook sẽ hash password mới
    return true;
  }

  async getProfile(userId) {
    const user = await User.findById(userId).populate({
      path: 'wishlist',
      select: 'name images basePrice discountPrice slug isActive'
    });
    return user;
  }

  async updateProfile(userId, updateData) {
    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true
    });
    return user;
  }

  async uploadAvatar(userId, file) {
    const user = await User.findById(userId);

    // Nếu có avatar cũ thì xóa trên Cloudinary
    if (user.avatar && user.avatar.public_id) {
      try {
        await cloudinaryConfig.uploader.destroy(user.avatar.public_id);
      } catch (err) {
        console.error('Lỗi khi xóa avatar cũ trên Cloudinary', err);
      }
    }

    // Upload file buffer (RAM) lên Cloudinary
    const result = await uploadBufferToCloudinary(file.buffer, 'avatars');

    user.avatar = {
      url: result.secure_url,
      public_id: result.public_id
    };

    await user.save();
    return user;
  }
}

export const authService = new AuthService();
