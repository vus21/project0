import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate as useRouteNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { wishlistApi } from '../../api/wishlistApi';
import { cartApi } from '../../api/cartApi'; // Dùng để thêm nhanh vào giỏ hàng nếu cần
import { productApi } from '../../api/productApi';
import { Heart, Trash2, ShoppingBag, ArrowLeft, Eye } from 'lucide-react';

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
}

export default function WishListPage() {
  const navigate = useRouteNavigate();
  const { isAuthenticated } = useAuth();
  
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- 1. Tải danh sách yêu thích từ API ---
  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    const fetchWishlist = async () => {
      try {
        setIsLoading(true);
        const res = await wishlistApi.getWishList();
        // Áp dụng đúng cấu trúc dữ liệu: res.data.data.wishlist
        const items = res.data?.wishlist || [];
        setWishlistItems(items);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách yêu thích:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWishlist();
  }, [isAuthenticated]);

  // --- 2. Xóa sản phẩm khỏi danh sách yêu thích ---
  const handleRemoveFromWishlist = async (productId) => {
    if (!window.confirm('Quý khách muốn bỏ sản phẩm này khỏi danh sách yêu thích?')) return;
    try {
      await wishlistApi.removeFromWishlist(productId);
      setWishlistItems(prev => prev.filter(item => item._id !== productId));
    } catch (error) {
      alert('Lỗi khi xóa sản phẩm khỏi danh sách yêu thích.');
    }
  };

  // --- 3. Thêm nhanh vào giỏ hàng (Tính năng mở rộng tinh tế) ---
  const handleAddToCart = async (product) => {
    try {
      console.log('Điều hướng đến trang chi tiết sản phẩm:', product.slug);
      
      const response = await productApi.getBySlug(product.slug);
      
      const detailedProduct = response.data?.data || response.data || response;
      
      navigate(`/products/${product.slug}`, { state: { product: detailedProduct } });
      
    } catch (error) {
      console.error('Lỗi khi điều hướng:', error);
      alert('Không thể mở trang chi tiết sản phẩm.');
    }
  };

  // Màn hình chờ tải dữ liệu (Đồng bộ với CartPage)
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8f5ef] flex flex-col items-center justify-center font-serif text-center px-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#b8935f] mb-4"></div>
        <p className="text-[#7b6753] tracking-[0.15em] text-xs uppercase font-medium">
          Đang kết nối không gian lưu trữ cá nhân...
        </p>
      </div>
    );
  }

  // Trường hợp chưa đăng nhập tài khoản hội viên
  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] bg-[#f8f5ef] flex flex-col items-center justify-center px-6 text-center font-serif">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border border-[#e7dccb] text-[#b8935f] mb-6 shadow-sm">
          <Heart size={24} />
        </div>
        <h2 className="text-[#1f1a14] font-normal text-2xl mb-3 tracking-wide">
          Danh sách ước nguyện
        </h2>
        <p className="text-[#7b6753] text-sm max-w-sm font-sans mb-8 leading-relaxed">
          Vui lòng đăng nhập tài khoản hội viên để lưu giữ những tuyệt tác thiết kế mà quý khách đang lưu tâm.
        </p>
        <button 
          onClick={() => navigate('/login')} 
          className="px-8 py-3.5 bg-[#b8935f] text-white rounded-xl font-semibold tracking-widest uppercase text-xs hover:bg-[#a57f4c] transition-all duration-300 shadow-md shadow-[#b8935f]/10"
        >
          Đăng nhập ngay
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f5ef] text-[#5e4a36] font-serif pb-24 selection:bg-[#b8935f]/10">
      
      {/* Thanh Breadcrumb Điều hướng */}
      <div className="py-6">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 text-[11px] tracking-widest uppercase text-[#7b6753] flex items-center gap-2">
          <RouterLink to="/" className="hover:text-[#b8935f] transition-colors">Trang chủ</RouterLink>
          <span>/</span>
          <span className="text-[#1f1a14] font-medium">Danh sách yêu thích</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-6 sm:px-8 mt-4">
        <h1 className="text-3xl font-normal text-[#1f1a14] mb-8 tracking-wide">
          Sản phẩm quý khách quan tâm
        </h1>

        {wishlistItems.length === 0 ? (
          /* TRẠNG THÁI DANH SÁCH TRỐNG */
          <div className="bg-white border border-[#e7dccb] rounded-2xl p-12 md:p-16 text-center shadow-sm max-w-2xl mx-auto">
            <p className="text-[#7b6753] font-sans text-sm mb-8 leading-relaxed">
              Hiện tại danh mục lưu trữ này chưa có sản phẩm nào được chọn.
            </p>
            <RouterLink 
              to="/" 
              className="inline-flex items-center justify-center h-12 px-8 bg-[#b8935f] text-white rounded-xl tracking-widest uppercase text-xs font-semibold hover:bg-[#a57f4c] transition-all duration-300 shadow-sm"
            >
              Khám phá bộ sưu tập mới nhất
            </RouterLink>
          </div>
        ) : (
          /* BỐ CỤC LƯỚI SẢN PHẨM YÊU THÍCH */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlistItems.map((product) => (
              <div 
                key={product._id} 
                className="bg-white border border-[#e7dccb] rounded-2xl overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-all duration-300 group"
              >
                {/* Khung ảnh sản phẩm & Nút hành động nhanh */}
                <div className="relative aspect-[3/4] bg-[#f8f5ef] overflow-hidden border-b border-[#e7dccb]/60">
                  <img 
                    src={product.images?.[0]?.url || 'https://via.placeholder.com/300x400'} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Tag trạng thái kho hàng */}
                  {product.totalStock === 0 && (
                    <div className="absolute top-3 left-3 bg-[#1f1a14]/80 backdrop-blur-sm text-white px-2.5 py-1 rounded text-[10px] uppercase tracking-wider font-sans">
                      Hết hàng
                    </div>
                  )}

                  {/* Nút xóa nhanh khỏi Wishlist ở góc phải trên ảnh */}
                  <button
                    onClick={() => handleRemoveFromWishlist(product._id)}
                    className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-[#7b6753] hover:text-red-600 border border-[#e7dccb] transition-colors cursor-pointer shadow-sm"
                    title="Xóa khỏi danh sách"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* Phần thông tin chi tiết */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-[#1f1a14] font-sans truncate capitalize mb-1">
                      <RouterLink to={`/product/${product.slug}`} className="hover:text-[#b8935f] transition-colors">
                        {product.name}
                      </RouterLink>
                    </h3>
                    
                    {/* Hiển thị giá: Ưu tiên discountPrice nếu có */}
                    <div className="flex items-center gap-2 mt-2 font-sans">
                      {product.discountPrice && product.discountPrice < product.basePrice ? (
                        <>
                          <span className="text-sm text-[#b8935f] font-medium">
                            {formatPrice(product.discountPrice)}
                          </span>
                          <span className="text-xs text-gray-400 line-through">
                            {formatPrice(product.basePrice)}
                          </span>
                        </>
                      ) : (
                        <span className="text-sm text-[#1f1a14] font-medium">
                          {formatPrice(product.basePrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Nút hành động cuối Card */}
                  <div className="mt-5 pt-3 border-t border-[#f8f5ef] flex gap-2">
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="flex-1 h-9 bg-[#b8935f] hover:bg-[#a57f4c] text-white font-serif text-[10px] font-semibold tracking-widest uppercase rounded-lg transition-colors duration-300 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Eye size={12} />
                      Xem chi tiết
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}