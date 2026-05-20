import { Category, Product } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/index.js';
import { uploadBufferToCloudinary } from '../utils/cloudinaryHelper.js';
import { cloudinaryConfig } from '../config/cloudinary.js';

class CategoryService {
  async createCategory(data, file) {
    const { name, parent_id } = data;
    
    const existing = await Category.findOne({ name });
    if (existing) {
      throw new ApiError(HTTP_STATUS.CONFLICT, 'Tên danh mục đã tồn tại');
    }

    if (parent_id) {
      const parent = await Category.findById(parent_id);
      if (!parent) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Danh mục cha không tồn tại');
      }
    }

    let image = null;
    if (file) {
      const result = await uploadBufferToCloudinary(file.buffer, 'categories');
      image = { url: result.secure_url, public_id: result.public_id };
    }

    try {
      const category = await Category.create({ ...data, image });
      return category;
    } catch (error) {
      if (image?.public_id) {
        await cloudinaryConfig.uploader.destroy(image.public_id);
      }
      throw error;
    }
  }

  async getAllCategories(query) {
    const { includeInactive, parentOnly } = query;
  
    const filter = {};
  
    // if (!includeInactive) {
    //   filter.isActive = true;
    // }
  
    if (parentOnly === 'true') {
      filter.parent_id = null;
    }
  
    const categories = await Category.find(filter)
      .populate('children')
      .populate('parent_id', 'name slug')
      .lean();
  
    return categories;
  }
  async getCategoryBySlug(slug) {
    const category = await Category.findOne({ slug, isActive: true })
      .populate('parent_id')
      .populate('children');
      
    if (!category) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Danh mục không tồn tại');
    }
    return category;
  }

  async updateCategory(id, data, file) {
    const category = await Category.findById(id);
    if (!category) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Danh mục không tồn tại');
    }

    let newImage = category.image;
    if (file) {
      if (category.image && category.image.public_id) {
        try {
          await cloudinaryConfig.uploader.destroy(category.image.public_id);
        } catch (err) {}
      }
      const result = await uploadBufferToCloudinary(file.buffer, 'categories');
      newImage = { url: result.secure_url, public_id: result.public_id };
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { ...data, image: newImage },
      { new: true, runValidators: true }
    );
    return updatedCategory;
  }

  async deleteCategory(id) {
    const category = await Category.findById(id);
    if (!category) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Danh mục không tồn tại');
    }

    const productsCount = await Product.countDocuments({ category_id: id });
    if (productsCount > 0) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Không thể xóa category đang chứa sản phẩm');
    }

    const subCount = await Category.countDocuments({ parent_id: id });
    if (subCount > 0) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Không thể xóa category đang chứa danh mục con');
    }

    if (category.image && category.image.public_id) {
      try {
        await cloudinaryConfig.uploader.destroy(category.image.public_id);
      } catch (err) {}
    }

    await category.deleteOne();
    return true;
  }
}

export const categoryService = new CategoryService();
