import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useLocation, Link, useNavigate, useParams } from 'react-router-dom'; // Thêm useParams
import { cartApi } from '../../api/cartApi';
import { Minus, Plus, ShoppingBag, CreditCard, ArrowLeft, Heart } from 'lucide-react';
import { wishlistApi } from '../../api/wishlistApi';
import { productApi } from '../../api/productApi';

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
}

export default function ProductDetailPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { slug } = useParams(); // Lấy slug từ URL dựa trên route khai báo ở thẻ Link trong ProductCard

  const [product, setProduct] = useState(state?.product || null);
  const [isLoading, setIsLoading] = useState(!state?.product); // Cờ loading nếu phải gọi API

  const [isWishlist, setIsWishlist] = useState(false);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedSku, setSelectedSku] = useState('');

  // Thay đổi quan trọng: Gọi API lấy chi tiết sản phẩm nếu không có dữ liệu truyền từ Card
  useEffect(() => {
    if (product) {
      setIsLoading(false);
      console.log("data product", product);
      return;
    }
    const fetchProduct = async () => {
      try {

        const response = await productApi.getBySlug(slug);

        const data = response?.data || response?.data?.product || response;

        setProduct(data);
        console.log("data product", product);
      } catch (error) {
        console.error("Lỗi khi tải thông tin sản phẩm:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      fetchProduct();
    } else {
      setIsLoading(false);
    }
  }, [slug, product]);

  // Khởi tạo thuộc tính (Màu & Size) mặc định dựa theo cấu trúc variants (Giữ nguyên)
  useEffect(() => {
    if (product?.variants && product.variants.length > 0) {
      const defaultVariant = product.variants.find(v => v.stock > 0 && v.isActive) || product.variants[0];
      if (defaultVariant) {
        setSelectedColor(defaultVariant.color);
        setSelectedSize(defaultVariant.size);
        setSelectedSku(defaultVariant.sku || '');
      }
    }
  }, [product]);

  // Cập nhật lại SKU khi người dùng thay đổi tổ hợp Màu sắc / Kích cỡ (Giữ nguyên)
  useEffect(() => {
    if (product?.variants && selectedColor && selectedSize) {
      const matchVariant = product.variants.find(v => v.color === selectedColor && v.size === selectedSize);
      if (matchVariant) {
        setSelectedSku(matchVariant.sku || '');
      }
    }
  }, [selectedColor, selectedSize, product]);

  // Kiểm tra trạng thái wishlist (Giữ nguyên)
  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (!product?._id) return;
      try {
        const res = await wishlistApi.getWishList();
        const wishlist = res.data?.wishlist || [];
        const isLiked = wishlist.some(item => item._id === product._id);
        setIsWishlist(isLiked);
      } catch (error) {
        console.error('Lỗi khi kiểm tra trạng thái yêu thích:', error);
      }
    };

    checkWishlistStatus();
  }, [product]);

  // Thêm màn hình Loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8f5ef] flex items-center justify-center font-serif text-[#b8935f]">
        Đang tải thông tin sản phẩm...
      </div>
    );
  }

  // Fallback phòng trường hợp user reload trang làm mất state của React Router (Giữ nguyên)
  if (!product) {
    console.log("data product", slug);
    return (
      <div className="min-h-screen bg-[#f8f5ef] flex flex-col items-center justify-center font-serif px-4 text-center">
        <h2 className="text-[#1f1a14] text-xl mb-4 tracking-wide font-normal">
          Không tìm thấy thông tin sản phẩm
        </h2>
        <button
          onClick={() => navigate('/')}
          className="px-7 py-3 bg-[#b8935f] text-white rounded-lg cursor-pointer tracking-widest uppercase text-xs font-semibold hover:bg-[#a57f4c] transition"
        >
          Quay lại trang chủ
        </button>
      </div>
    );
  }

  // Trích xuất danh sách Màu sắc và Kích cỡ duy nhất từ product.variants
  // ... (Giữ nguyên từ đây trở xuống) ...

  // Trích xuất danh sách Màu sắc và Kích cỡ duy nhất từ product.variants
  const availableColors = product.variants ? [...new Set(product.variants.map(v => v.color).filter(Boolean))] : [];
  const availableSizes = product.variants ? [...new Set(product.variants.map(v => v.size).filter(Boolean))] : [];

  // Tìm thông tin chi tiết của variant đang được chọn
  const currentVariant = product.variants?.find(v => v.color === selectedColor && v.size === selectedSize);

  // Xác định trạng thái kho hàng
  const isOutOfStock = product.variants && product.variants.length > 0
    ? (!currentVariant || currentVariant.stock === 0 || !currentVariant.isActive)
    : (product.totalStock === 0);

  // Hàm xử lý tăng giảm số lượng mua hàng
  const handleQuantityChange = (type) => {
    if (type === 'minus' && quantity > 1) {
      setQuantity(prev => prev - 1);
    }
    if (type === 'plus') {
      if (product.variants && product.variants.length > 0 && currentVariant) {
        if (quantity >= currentVariant.stock) {
          toast.error(`Sản phẩm này trong kho chỉ còn đúng ${currentVariant.stock} sản phẩm.`);
          return;
        }
      }
      setQuantity(prev => prev + 1);
    }
  };
  const handleToggleWishlist = async () => {
    if (!product?._id) return;
    try {
      // Gọi API toggle của bạn
      await wishlistApi.toggleWishlist(product._id);

      // Cập nhật trạng thái giao diện và thông báo
      setIsWishlist(prev => {
        const nextState = !prev;
        if (nextState) {
          toast.success('Đã thêm vào danh sách yêu thích');
        } else {
          toast.success('Đã xóa khỏi danh sách yêu thích');
        }
        return nextState;
      });
    } catch (error) {
      console.error('Lỗi khi cập nhật danh sách yêu thích:', error);
      toast.error('Vui lòng đăng nhập để sử dụng tính năng này');
    }
  };
  // Hàm xử lý chung khi nhấn nút thêm/mua hàng nhằm kiểm tra thuộc tính hợp lệ
  const validateAndGetItem = () => {
    if ((availableColors.length > 0 && !selectedColor) || (availableSizes.length > 0 && !selectedSize)) {
      toast.error('Vui lòng chọn đầy đủ thuộc tính sản phẩm');
      return null;
    }
    if (!selectedSku) {
      toast.error('Tổ hợp mẫu mã này hiện không khả dụng');
      return null;
    }
    return {
      productId: product._id,
      sku: selectedSku,
      quantity: quantity,
      color: selectedColor,
      size: selectedSize,
    };
  };

  const handleAddToCart = async () => {
    const itemData = validateAndGetItem();
    if (!itemData) return;

    try {
      await cartApi.addItem(itemData);
      toast.success('Đã thêm vào giỏ hàng thành công');
    } catch (error) {
      console.error('Error adding item to cart:', error);
      toast.error('Có lỗi xảy ra khi thêm vào giỏ hàng');
    }
  };

  const handleBuyNow = async () => {
    const itemData = validateAndGetItem();
    if (!itemData) return;

    try {
      await cartApi.addItem(itemData);
      navigate('/cart');
    } catch (error) {
      console.error('Error buying now:', error);
      toast.error('Có lỗi xảy ra khi tiến hành thanh toán');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f5ef] font-serif text-[#5e4a36] pb-20 selection:bg-[#b8935f]/20">

      {/* Thanh Breadcrumb Điều hướng */}
      <div className="pt-6">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 text-[11px] tracking-widest uppercase text-[#7b6753] flex items-center gap-2">
          <Link to="/" className="hover:text-[#b8935f] transition-colors">Trang chủ</Link>
          <span>/</span>
          <span className="text-[#1f1a14] font-medium">{product.category_id?.name || 'Sản phẩm'}</span>
        </div>
      </div>

      {/* Container Nội dung Chính */}
      <div className="max-w-6xl mx-auto mt-10 px-6 sm:px-8 grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-14">

        {/* Khối bên trái: Thư viện hình ảnh sản phẩm (Phân bổ 5 cột trên màn hình lớn) */}
        <div className="md:col-span-6 lg:col-span-5 w-full max-w-lg mx-auto md:max-w-none">
          {/* Ảnh lớn chính */}
          <div className="bg-white w-full aspect-[4/5] rounded-2xl overflow-hidden border border-[#e7dccb] flex items-center justify-center shadow-sm">
            <img
              src={product.images?.[selectedImageIdx]?.url || 'https://via.placeholder.com/600x700?text=OLDMAN'}
              alt={product.name}
              className="w-full h-full object-cover transition-all duration-300"
            />
          </div>

          {/* Danh sách ảnh thumbnails phụ bên dưới */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 mt-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-200">
              {product.images.map((img, idx) => (
                <button
                  key={img._id || idx}
                  onClick={() => setSelectedImageIdx(idx)}
                  className={`w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-white p-0.5 transition-all ${idx === selectedImageIdx
                    ? 'border-2 border-[#b8935f] shadow-sm'
                    : 'border border-[#e7dccb] hover:border-[#b8935f]'
                    }`}
                >
                  <img src={img.url} alt="thumbnail" className="w-full h-full object-cover rounded-md" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Khối bên phải: Chi tiết thông tin cấu hình sản phẩm (Phân bổ 6-7 cột) */}
        <div className="md:col-span-6 lg:col-span-7 flex flex-col">

          {/* Tên sản phẩm */}
          <div className="flex items-start justify-between gap-4 mb-3">
            <h1 className="text-3xl md:text-4xl font-normal text-[#1f1a14] tracking-wide capitalize leading-tight flex-1">
              {product.name}
            </h1>

            <button
              onClick={handleToggleWishlist}
              className="mt-1 flex-shrink-0 w-10 h-10 border border-[#e7dccb] rounded-full flex items-center justify-center bg-white cursor-pointer transition-all hover:border-[#b8935f] hover:shadow-sm"
              title={isWishlist ? "Xóa khỏi danh sách yêu thích" : "Thêm vào danh sách yêu thích"}
            >
              <Heart
                size={20}
                className={`transition-colors ${isWishlist
                  ? 'fill-[#b8935f] text-[#b8935f]'
                  : 'text-[#7b6753]'
                  }`}
              />
            </button>
          </div>

          {/* Trạng thái kho hàng */}
          <div className="text-[11px] tracking-widest uppercase text-[#7b6753] mb-5">
            Trạng thái:
            <span className={`ml-1.5 font-bold ${isOutOfStock ? 'text-red-500' : 'text-[#b8935f]'}`}>
              {isOutOfStock ? 'Hết hàng' : 'Còn hàng'}
            </span>
            
          </div>
          {typeof product.sold === 'number' && (
              <span className="text-base font-semibold text-[#b8935f] font-['Cormorant_Garamond'] tracking-[0.02em]">
                Đã bán {product.sold}
              </span>
            )}

          <hr className="border-t border-[#e7dccb] mb-6" />

          {/* Khối hiển thị Giá */}
          <div className="bg-[#f5efe6] p-5 rounded-2xl mb-6 border border-[#e7dccb]">
            <div className="flex items-baseline gap-4">
              <span className="text-2xl md:text-3xl font-medium text-[#b8935f] tracking-wide">
                {formatPrice(product.discountPrice || product.basePrice)}
              </span>
              {product.discountPrice < product.basePrice && (
                <span className="text-base text-[#7b6753] line-through">
                  {formatPrice(product.basePrice)}
                </span>
              )}
            </div>
          </div>

          {/* Bộ chọn Màu Sắc */}
          {availableColors.length > 0 && (
            <div className="mb-6">
              <span className="text-[11px] tracking-widest uppercase text-[#7b6753] block mb-2.5">
                Màu sắc: 
              </span>
              <div className="flex flex-wrap gap-2.5">
                {availableColors.map(color => (
                  <button
                    key={color}
                    onClick={() => { setSelectedColor(color); setQuantity(1); }}
                    className={`h-10 px-5 border text-xs tracking-wider rounded-lg transition-all font-sans ${selectedColor === color
                      ? 'border-[#b8935f] bg-[#f5efe6] text-[#1f1a14] font-semibold shadow-sm'
                      : 'border-[#e7dccb] bg-white text-[#5e4a36] hover:border-[#b8935f]'
                      }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Bộ chọn Kích Thước (Tự động mờ/disabled tổ hợp hết hàng) */}
          {availableSizes.length > 0 && (
            <div className="mb-6">
              <span className="text-[11px] tracking-widest uppercase text-[#7b6753] block mb-2.5">
                Kích thước:
              </span>
              <div className="flex flex-wrap gap-2.5">
                {availableSizes.map(size => {
                  const matchVariant = product.variants?.find(v => v.color === selectedColor && v.size === size);
                  const disabled = !matchVariant || matchVariant.stock === 0 || !matchVariant.isActive;

                  return (
                    <button
                      key={size}
                      disabled={disabled}
                      onClick={() => { setSelectedSize(size); setQuantity(1); }}
                      className={`h-10 px-5 border text-xs tracking-wider rounded-lg transition-all font-sans ${selectedSize === size
                        ? 'border-[#b8935f] bg-[#f5efe6] text-[#1f1a14] font-semibold shadow-sm'
                        : disabled
                          ? 'border-dashed border-[#e7dccb] text-[#7b6753] opacity-40 cursor-not-allowed'
                          : 'border-[#e7dccb] bg-white text-[#5e4a36] hover:border-[#b8935f]'
                        }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Khối chọn Số lượng */}
          <div className="mb-8">
            <span className="text-[11px] tracking-widest uppercase text-[#7b6753] block mb-2.5">
              Số lượng:
            </span>
            <div className="inline-flex items-center bg-white border border-[#e7dccb] rounded-lg p-0.5 shadow-sm">
              <button
                onClick={() => handleQuantityChange('minus')}
                className="w-9 h-9 flex items-center justify-center border-none bg-transparent cursor-pointer text-[#1f1a14] hover:text-[#b8935f] transition-colors"
              >
                <Minus size={14} />
              </button>
              <div className="w-12 text-center font-sans text-sm font-medium text-[#1f1a14]">
                {quantity}
              </div>
              <button
                onClick={() => handleQuantityChange('plus')}
                className="w-9 h-9 flex items-center justify-center border-none bg-transparent cursor-pointer text-[#1f1a14] hover:text-[#b8935f] transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* Nhóm Nút Hành Động Mua Hàng */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="flex-1 h-12 border border-[#b8935f] bg-transparent text-[#6f5433] text-xs font-semibold tracking-widest uppercase rounded-xl transition-all duration-300 flex items-center justify-center gap-2 enabled:hover:bg-[#b8935f] enabled:hover:text-white enabled:hover:-translate-y-0.5 disabled:border-[#e7dccb] disabled:text-[#7b6753] disabled:cursor-not-allowed"
            >
              <ShoppingBag size={16} />
              Thêm vào giỏ
            </button>

            <button
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className="flex-1 h-12 border-none bg-[#b8935f] text-white text-xs font-semibold tracking-widest uppercase rounded-xl transition-all duration-300 shadow-md shadow-[#b8935f]/15 flex items-center justify-center gap-2 enabled:hover:bg-[#a57f4c] enabled:hover:-translate-y-0.5 disabled:bg-[#e7dccb] disabled:text-[#7b6753] disabled:cursor-not-allowed disabled:shadow-none"
            >
              <CreditCard size={16} />
              Mua ngay
            </button>
          </div>

          {/* Khối Mô tả chi tiết sản phẩm */}
          {product.description && (
            <div className="mt-10 border-t border-[#e7dccb] pt-6">
              <h3 className="text-xs tracking-widest uppercase text-[#1f1a14] font-semibold mb-3">
                Mô tả sản phẩm
              </h3>
              <p className="text-sm font-sans text-[#5e4a36] leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}