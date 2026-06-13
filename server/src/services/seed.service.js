import mongoose from 'mongoose';
import { Product, Category } from '../models/index.js';
import {
  SEASONS,
  MATERIALS,
  PRODUCT_TAGS,
} from '../constants/index.js';

// ====== DATA POOL ĐỂ SINH SẢN PHẨM ĐA DẠNG ======

const COLORS = [
  'Đen', 'Trắng', 'Xám', 'Be', 'Xanh navy', 'Xanh rêu', 'Nâu',
  'Cam', 'Đỏ', 'Vàng', 'Xanh dương', 'Xanh lá', 'Hồng', 'Tím', 'Kem',
];

const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

const ALL_SEASONS = Object.values(SEASONS);
const ALL_MATERIALS = Object.values(MATERIALS);
const ALL_TAGS = Object.values(PRODUCT_TAGS);

// Mỗi nhóm style gồm: tên category cần map, mẫu tên sản phẩm, khoảng giá
const PRODUCT_TEMPLATES = [
  {
    categorySlug: 'ao-thun',
    names: [
      'Áo thun nam basic', 'Áo thun oversize unisex', 'Áo thun thể thao co giãn',
      'Áo thun in graphic streetwear', 'Áo thun cổ tròn trơn', 'Áo thun vintage washed',
    ],
    priceRange: [120000, 350000],
  },
  {
    categorySlug: 'ao-polo',
    names: [
      'Áo polo nam pique', 'Áo polo regular fit công sở', 'Áo polo phối màu thể thao',
      'Áo polo cotton cao cấp', 'Áo polo slim fit basic',
    ],
    priceRange: [250000, 550000],
  },
  {
    categorySlug: 'ao-so-mi',
    names: [
      'Áo sơ mi tay dài công sở', 'Áo sơ mi linen mùa hè', 'Áo sơ mi caro flannel',
      'Áo sơ mi oxford slim fit', 'Áo sơ mi denim phong cách', 'Áo sơ mi lụa cao cấp',
    ],
    priceRange: [300000, 750000],
  },
  {
    categorySlug: 'quan-short',
    names: [
      'Quần short kaki nam', 'Quần short thể thao lưới', 'Quần short jean rách phong cách',
      'Quần short jogger nỉ', 'Quần short denim basic',
    ],
    priceRange: [180000, 450000],
  },
  {
    categorySlug: 'quan-au',
    names: [
      'Quần âu nam slim fit', 'Quần âu kẻ sọc công sở', 'Quần âu vải tuyết mưa cao cấp',
      'Quần âu ống suông classic', 'Quần âu phối cạp chun',
    ],
    priceRange: [350000, 850000],
  },
  {
    categorySlug: 'phu-kien',
    names: [
      'Thắt lưng da nam cao cấp', 'Mũ lưỡi trai streetwear', 'Khăn len mùa đông',
      'Cà vạt lụa công sở', 'Túi đeo chéo canvas', 'Vớ cotton cao cổ',
    ],
    priceRange: [80000, 400000],
  },
];

// Sinh ngẫu nhiên một phần tử trong mảng
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomItems = (arr, count) => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

class SeedService {
  /**
   * Seed dữ liệu sản phẩm mẫu để test hiệu năng AI chatbot / visual search
   * @param {number} count - số lượng sản phẩm cần tạo (mặc định 200)
   */
  async seedData(count = 200) {
    // 1. Lấy danh sách category lá (không có children) để gán cho sản phẩm
    const categories = await Category.find({ isActive: true }).lean();
    const categoryMap = {};
    categories.forEach((c) => {
      categoryMap[c.slug] = c._id;
    });

    const productsToInsert = [];

    for (let i = 0; i < count; i++) {
      // Chọn ngẫu nhiên 1 template (nhóm phong cách)
      const template = randomItem(PRODUCT_TEMPLATES);
      const categoryId = categoryMap[template.categorySlug];

      // Bỏ qua nếu category chưa tồn tại trong DB
      if (!categoryId) continue;

      const baseName = randomItem(template.names);
      const name = `${baseName} #${i + 1}`;

      const [minPrice, maxPrice] = template.priceRange;
      const basePrice = randomInt(minPrice, maxPrice);

      // 30% sản phẩm có giảm giá
      const hasDiscount = Math.random() < 0.3;
      const discountPrice = hasDiscount
        ? Math.round(basePrice * (0.7 + Math.random() * 0.2) / 1000) * 1000
        : null;

      // Tạo 2-4 variants (màu + size khác nhau)
      const colorCount = randomInt(2, 4);
      const chosenColors = randomItems(COLORS, colorCount);
      const variants = [];

      chosenColors.forEach((color) => {
        // Mỗi màu sinh ra 2-3 size
        const sizeCount = randomInt(2, 3);
        const chosenSizes = randomItems(SIZES, sizeCount);
        chosenSizes.forEach((size) => {
          variants.push({
            sku: `SP${String(i + 1).padStart(4, '0')}-${color.slice(0, 2).toUpperCase()}-${size}`,
            color,
            size,
            stock: randomInt(0, 100),
            image: {
              url: `https://picsum.photos/seed/${i}-${color}-${size}/600/800`,
              public_id: `seed/${i}-${color}-${size}`,
            },
            isActive: true,
          });
        });
      });

      // Random material, season, tags
      const material = randomItem(ALL_MATERIALS);
      const seasonCount = randomInt(1, 2);
      const season = randomItems(ALL_SEASONS, seasonCount);
      const tagCount = randomInt(1, 3);
      const tags = randomItems(ALL_TAGS, tagCount);

      // Random images chính của sản phẩm (1-3 ảnh)
      const imageCount = randomInt(1, 3);
      const images = Array.from({ length: imageCount }, (_, idx) => ({
        url: `https://picsum.photos/seed/${i}-main-${idx}/800/1000`,
        public_id: `seed/${i}-main-${idx}`,
      }));

      // Random rating & sold để có dữ liệu thống kê đa dạng
      const rating = Math.round((Math.random() * 5) * 10) / 10;
      const ratingCount = randomInt(0, 200);
      const sold = randomInt(0, 500);

      productsToInsert.push({
        name,
        description: `${baseName} chất liệu ${material}, phù hợp phong cách ${tags.join(', ')}. Thiết kế hiện đại, dễ phối đồ, phù hợp đi làm và đi chơi.`,
        basePrice,
        discountPrice,
        images,
        category_id: categoryId,
        tags,
        material,
        season,
        variants,
        rating,
        ratingCount,
        sold,
        isActive: true,
      });
    }

    // 2. Insert song song nhưng vẫn chạy qua middleware pre('save') để tạo slug & totalStock
    //    -> dùng create() theo từng document (Promise.all theo batch để tránh quá tải)
    const BATCH_SIZE = 20;
    const inserted = [];

    for (let i = 0; i < productsToInsert.length; i += BATCH_SIZE) {
      const batch = productsToInsert.slice(i, i + BATCH_SIZE);
      const docs = await Promise.all(
        batch.map((data) => new Product(data).save())
      );
      inserted.push(...docs);
      console.log(`Đã seed ${inserted.length}/${productsToInsert.length} sản phẩm...`);
    }

    return {
      success: true,
      message: `Seed thành công ${inserted.length} sản phẩm`,
      count: inserted.length,
    };
  }
}

export const seedService = new SeedService();