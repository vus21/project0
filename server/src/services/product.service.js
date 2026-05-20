import { Product, Category } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS, DEFAULT_PAGE_SIZE } from '../constants/index.js';
import { uploadBufferToCloudinary } from '../utils/cloudinaryHelper.js';
import { cloudinaryConfig } from '../config/cloudinary.js';

class ProductService {
  async getProducts(queryParams) {
    const { 
      q, category, minPrice, maxPrice, rating, color, size, inStock, 
      sort, page = 1, limit = DEFAULT_PAGE_SIZE 
    } = queryParams;

    const filter = { isActive: true };

    if (q) {
      filter.name = { $regex: q, $options: 'i' };
    }

    if (category) {
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        filter.category_id = category;
      } else {
        const cat = await Category.findOne({ slug: category });
        if (cat) filter.category_id = cat._id;
      }
    }

    if (minPrice || maxPrice) {
      filter.basePrice = {};
      if (minPrice) filter.basePrice.$gte = Number(minPrice);
      if (maxPrice) filter.basePrice.$lte = Number(maxPrice);
    }

    if (rating) filter.rating = { $gte: Number(rating) };
    if (inStock === 'true') filter.totalStock = { $gt: 0 };
    if (color) filter['variants.color'] = color;
    if (size) filter['variants.size'] = size;

    let sortObj = { createdAt: -1 };
    if (sort === 'price_asc') sortObj = { basePrice: 1 };
    else if (sort === 'price_desc') sortObj = { basePrice: -1 };
    else if (sort === 'best_seller') sortObj = { sold: -1 };
    else if (sort === 'top_rated') sortObj = { rating: -1 };

    const skip = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('category_id', 'name slug')
        .sort(sortObj)
        .skip(skip)
        .limit(Number(limit)),
      Product.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / Number(limit));

    return {
      products,
      pagination: {
        total,
        page: Number(page),
        totalPages,
        hasNext: Number(page) < totalPages,
        hasPrev: Number(page) > 1
      }
    };
  }

  async getProductBySlug(slug) {
    const product = await Product.findBySlug(slug);
    if (!product || !product.isActive) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Sản phẩm không tồn tại');
    }
    return product;
  }

  async createProduct(data, files) {
    const { category_id, variants } = data;

    const category = await Category.findById(category_id);
    if (!category) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Danh mục không tồn tại');

    let parsedVariants = [];
    if (variants) {
      parsedVariants = typeof variants === 'string' ? JSON.parse(variants) : variants;
      const skus = parsedVariants.map(v => v.sku);
      if (new Set(skus).size !== skus.length) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Mã SKU của các biến thể bị trùng lặp');
      }
    }

    let uploadedImages = [];
    if (files && files.length > 0) {
      try {
        const uploadPromises = files.map(file => uploadBufferToCloudinary(file.buffer, 'products'));
        const results = await Promise.all(uploadPromises);
        uploadedImages = results.map(res => ({ url: res.secure_url, public_id: res.public_id }));
      } catch (error) {
        throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Lỗi khi upload hình ảnh');
      }
    }

    try {
      const product = new Product({
        ...data,
        variants: parsedVariants,
        images: uploadedImages
      });
      await product.save();
      return product;
    } catch (error) {
      if (uploadedImages.length > 0) {
        await Promise.all(uploadedImages.map(img => cloudinaryConfig.uploader.destroy(img.public_id)));
      }
      throw error;
    }
  }

  async updateProduct(id, data, files) {
    const product = await Product.findById(id);
    if (!product) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Sản phẩm không tồn tại');

    let parsedVariants = product.variants;
    if (data.variants) {
      parsedVariants = typeof data.variants === 'string' ? JSON.parse(data.variants) : data.variants;
    }

    let uploadedImages = product.images || [];
    let newImages = [];
    if (files && files.length > 0) {
      try {
        const uploadPromises = files.map(file => uploadBufferToCloudinary(file.buffer, 'products'));
        const results = await Promise.all(uploadPromises);
        newImages = results.map(res => ({ url: res.secure_url, public_id: res.public_id }));
        uploadedImages = [...uploadedImages, ...newImages];
      } catch (error) {
        throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Lỗi khi upload hình ảnh');
      }
    }

    try {
      product.name = data.name || product.name;
      product.description = data.description || product.description;
      product.basePrice = data.basePrice || product.basePrice;
      if (data.discountPrice !== undefined) product.discountPrice = data.discountPrice;
      product.category_id = data.category_id || product.category_id;
      product.isActive = data.isActive !== undefined ? data.isActive : product.isActive;
      product.variants = parsedVariants;
      product.images = uploadedImages;
      
      await product.save();
      return product;
    } catch (error) {
      if (newImages.length > 0) {
        await Promise.all(newImages.map(img => cloudinaryConfig.uploader.destroy(img.public_id)));
      }
      throw error;
    }
  }

  async deleteProduct(id) {
    const product = await Product.findById(id);
    if (!product) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Sản phẩm không tồn tại');
    
    product.isActive = false;
    if (product.images && product.images.length > 0) {
      await Promise.all(product.images.map(img => cloudinaryConfig.uploader.destroy(img.public_id).catch(() => {})));
      product.images = [];
    }
    await product.save();
    return true;
  }

  async deleteProductImage(productId, public_id) {
    const product = await Product.findById(productId);
    if (!product) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Sản phẩm không tồn tại');

    const imageIndex = product.images.findIndex(img => img.public_id === public_id);
    if (imageIndex === -1) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Ảnh không tồn tại');

    await cloudinaryConfig.uploader.destroy(public_id);
    product.images.splice(imageIndex, 1);
    await product.save();

    return product;
  }

  async manageVariant(productId, action, variantData) {
    const product = await Product.findById(productId);
    if (!product) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Sản phẩm không tồn tại');

    if (action === 'add') {
      const existingSku = product.variants.find(v => v.sku === variantData.sku);
      if (existingSku) throw new ApiError(HTTP_STATUS.CONFLICT, 'SsssKU đã tồn tại');
      product.variants.push(variantData);
    } else if (action === 'update') {
      const variant = product.variants.find(v => v.sku === variantData.sku);
      if (!variant) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Biến thể không tồn tại');
      Object.assign(variant, variantData);
    } else if (action === 'delete') {
      const initLen = product.variants.length;
      product.variants = product.variants.filter(v => v.sku !== variantData.sku);
      if (product.variants.length === initLen) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Biến thể không tồn tại');
    } else {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Action không hợp lệ');
    }

    await product.save(); 
    return product;
  }

  async getRelatedProducts(productId, limit = 8) {
    const product = await Product.findById(productId);
    if (!product) return [];

    return Product.find({
      category_id: product.category_id,
      _id: { $ne: productId },
      isActive: true
    })
      .sort({ sold: -1, rating: -1 })
      .limit(Number(limit));
  }
}

export const productService = new ProductService();
