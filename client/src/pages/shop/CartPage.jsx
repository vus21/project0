import React, { useState, useEffect } from 'react';

import { Link as RouterLink, useNavigate as useRouteNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { axiosInstance } from '../../api/axiosInstance';
import { cartApi } from '../../api/cartApi';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, ShieldCheck } from 'lucide-react';

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
}

export default function CartPage() {
  const navigate = useRouteNavigate();
  const { isAuthenticated } = useAuth();
  
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- 1. Tải dữ liệu giỏ hàng từ API ---
  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    const fetchCart = async () => {
      try {
        setIsLoading(true);
        const res = await axiosInstance.get('/cart');
        const items = res.data?.items || res.data?.data?.items || [];
        setCartItems(items);
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu giỏ hàng:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCart();
  }, [isAuthenticated]);

  // --- 2. Cập nhật số lượng sản phẩm (Có kiểm tra Stock) ---
  const handleUpdateQuantity = async (item, newQty) => {
    if (newQty < 1) return;

    const matchedVariant = item.product?.variants?.find(v => v.sku === item.sku);
    const availableStock = matchedVariant ? matchedVariant.stock : (item.product?.totalStock || 99);

    if (newQty > availableStock) {
      alert(`Mẫu thiết kế này trong kho hiện tại chỉ còn đúng ${availableStock} sản phẩm.`);
      return;
    }

    try {
      const productId = item.product?._id || item.product;
      await cartApi.updateItem({
        productId,
        sku: item.sku,
        quantity: newQty
      });
      
      setCartItems(prev => prev.map(i => i.sku === item.sku ? { ...i, quantity: newQty } : i));
    } catch (error) {
      alert('Không thể cập nhật số lượng. Vui lòng thử lại sau.');
    }
  };

  // --- 3. Xóa một sản phẩm ra khỏi giỏ ---
  const handleRemoveItem = async (product, sku) => {
    if (!window.confirm('Quý khách muốn bỏ sản phẩm này khỏi giỏ hàng?')) return;
    try {
      const productId = product?._id || product;
      await cartApi.removeItem({ productId, sku });
      setCartItems(prev => prev.filter(i => i.sku !== sku));
    } catch (error) {
      alert('Lỗi khi xóa sản phẩm.');
    }
  };

  // --- 4. Tính toán tài chính tổng hợp ---
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const isFreeShip = subtotal > 500000;
  const shippingFee = isFreeShip ? 0 : 30000;
  const totalAmount = subtotal + shippingFee;

  // Màn hình chờ tải dữ liệu
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8f5ef] flex flex-col items-center justify-center font-serif text-center px-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#b8935f] mb-4"></div>
        <p className="text-[#7b6753] tracking-[0.15em] text-xs uppercase font-medium">
          Đang khởi tạo không gian giỏ hàng...
        </p>
      </div>
    );
  }

  // Trường hợp chưa đăng nhập tài khoản hội viên
  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] bg-[#f8f5ef] flex flex-col items-center justify-center px-6 text-center font-serif">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border border-[#e7dccb] text-[#b8935f] mb-6 shadow-sm">
          <ShoppingBag size={24} />
        </div>
        <h2 className="text-[#1f1a14] font-normal text-2xl mb-3 tracking-wide">
          Giỏ hàng của quý ông
        </h2>
        <p className="text-[#7b6753] text-sm max-w-sm font-sans mb-8 leading-relaxed">
          Vui lòng đăng nhập tài khoản hội viên để xem, lưu trữ và quản lý túi sắm cá nhân của bạn.
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
          <span className="text-[#1f1a14] font-medium">Giỏ hàng túi sắm</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-6 sm:px-8 mt-4">
        <h1 className="text-3xl font-normal text-[#1f1a14] mb-8 tracking-wide">
          Giỏ hàng của bạn
        </h1>

        {cartItems.length === 0 ? (
          /* TRẠNG THÁI GIỎ HÀNG TRỐNG */
          <div className="bg-white border border-[#e7dccb] rounded-2xl p-12 md:p-16 text-center shadow-sm max-w-2xl mx-auto">
            <p className="text-[#7b6753] font-sans text-sm mb-8 leading-relaxed">
              Hiện tại quý khách chưa lựa chọn sản phẩm nào cho túi mua sắm của mình.
            </p>
            <RouterLink 
              to="/" 
              className="inline-flex items-center justify-center h-12 px-8 bg-[#b8935f] text-white rounded-xl tracking-widest uppercase text-xs font-semibold hover:bg-[#a57f4c] transition-all duration-300 shadow-sm"
            >
              Tiếp tục khám phá bộ sưu tập
            </RouterLink>
          </div>
        ) : (
          /* BỐ CỤC DANH SÁCH SẢN PHẨM & TỔNG KẾT */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Cột trái (8 cột): Danh sách sản phẩm */}
            <div className="lg:col-span-8 flex flex-col gap-4">
              {cartItems.map((item) => (
                <div 
                  key={item.sku} 
                  className="bg-white border border-[#e7dccb] rounded-2xl p-5 sm:p-6 flex gap-4 sm:gap-6 items-center shadow-sm hover:shadow-md/5 transition-shadow duration-300 relative"
                >
                  {/* Ảnh sản phẩm */}
                  <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-lg overflow-hidden border border-[#e7dccb] flex-shrink-0 bg-[#f8f5ef]">
                    <img 
                      src={item.product?.images?.[0]?.url || item.image} 
                      alt={item.product?.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Chi tiết thông tin cấu hình sản phẩm */}
                  <div className="flex-1 min-w-0">
                    <h3 className="margin-0 text-base font-medium text-[#1f1a14] font-sans truncate capitalize mb-1">
                      {item.product?.name}
                    </h3>
                    <p className="text-xs text-[#7b6753] font-sans mb-3">
                      Phân loại: <span className="text-[#1f1a14]">{item.color}</span> / <span className="text-[#1f1a14]">{item.size}</span>
                    </p>
                    
                    {/* Cụm chỉnh số lượng tăng giảm */}
                    <div className="inline-flex items-center bg-[#f8f5ef] border border-[#e7dccb] rounded-lg p-0.5 shadow-inner">
                      <button 
                        type="button" 
                        onClick={() => handleUpdateQuantity(item, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center border border-transparent bg-white rounded-md font-sans text-sm text-[#1f1a14] hover:border-[#b8935f] hover:text-[#b8935f] transition-all cursor-pointer shadow-sm"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-xs font-semibold text-[#1f1a14] w-8 text-center font-sans">
                        {item.quantity}
                      </span>
                      <button 
                        type="button" 
                        onClick={() => handleUpdateQuantity(item, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center border border-transparent bg-white rounded-md font-sans text-sm text-[#1f1a14] hover:border-[#b8935f] hover:text-[#b8935f] transition-all cursor-pointer shadow-sm"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Khối giá tiền & Nút xóa vĩnh viễn ở góc phải */}
                  <div className="text-right flex flex-col justify-between items-end h-24 sm:h-28 flex-shrink-0 pl-2">
                    <div className="text-base sm:text-lg text-[#b8935f] font-medium tracking-wide">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                    
                    <button 
                      onClick={() => handleRemoveItem(item.product, item.sku)}
                      className="text-xs text-[#7b6753] hover:text-red-600 transition-colors bg-transparent border-none p-1 font-sans flex items-center gap-1 cursor-pointer group"
                    >
                      <Trash2 size={13} className="text-gray-400 group-hover:text-red-500 transition-colors" />
                      <span className="underline hidden sm:inline">Loại bỏ</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Cột phải (4 cột): Khối hóa đơn tạm tính & Điều hướng thanh toán */}
            <div className="lg:col-span-4 w-full">
              <div className="bg-white border border-[#e7dccb] rounded-2xl p-6 sm:p-8 shadow-sm">
                <h2 className="text-lg font-normal text-[#1f1a14] mb-5 pb-3 border-b border-[#e7dccb] tracking-wide">
                  Giá trị đơn hàng
                </h2>

                {/* Các dòng tổng số tiền */}
                <div className="flex flex-col gap-4 mb-6">
                  <div className="flex justify-between text-sm font-sans">
                    <span className="text-[#7b6753]">Tổng tạm tính</span>
                    <span className="text-[#1f1a14] font-semibold">{formatPrice(subtotal)}</span>
                  </div>
                  
                  <div className="flex flex-col gap-2 font-sans border-t border-dashed border-[#e7dccb] pt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#7b6753]">Dự kiến giao hàng</span>
                      <span className={`font-medium ${isFreeShip ? 'text-[#b8935f]' : 'text-[#1f1a14]'}`}>
                        {isFreeShip ? 'Miễn phí vận chuyển' : formatPrice(shippingFee)}
                      </span>
                    </div>

                    {/* Thanh thông báo điều kiện Tinh tế cải tiến */}
                    {!isFreeShip ? (
                      <div className="mt-1 bg-[#f5efe6]/50 rounded-lg p-3 border border-[#e7dccb]/60">
                        <p className="text-[12px] text-[#7b6753] font-sans leading-relaxed italic">
                          Mua thêm <strong className="text-[#b8935f] font-medium">{formatPrice(500000 - subtotal)}</strong> để được áp dụng chính sách ưu đãi miễn phí vận chuyển toàn quốc.
                        </p>
                      </div>
                    ) : (
                      <div className="mt-1 bg-emerald-50/60 rounded-lg p-2.5 border border-emerald-100 flex items-center gap-1.5 text-[11px] text-emerald-800 font-sans">
                        <ShieldCheck size={14} className="text-emerald-600" />
                        Đơn hàng của quý khách đã đủ điều kiện FreeShip.
                      </div>
                    )}
                  </div>

                  {/* Thành tiền tổng cuối cùng */}
                  <div className="flex justify-between items-center text-sm font-sans border-t border-[#e7dccb] pt-4 mt-1">
                    <span className="text-[#1f1a14] font-medium">Tổng số tiền thanh toán</span>
                    <span className="text-xl font-serif text-[#b8935f] font-semibold tracking-wide">{formatPrice(totalAmount)}</span>
                  </div>
                </div>

                {/* Khối Button hành động */}
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => navigate('/checkout')}
                    className="w-full h-12 border-none bg-[#b8935f] text-white font-serif text-xs font-semibold tracking-widest uppercase rounded-xl transition-all duration-300 flex items-center justify-center shadow-md shadow-[#b8935f]/15 hover:bg-[#a57f4c] hover:-translate-y-0.5 cursor-pointer"
                  >
                    Tiến hành đặt hàng
                  </button>
                  
                  <button 
                    onClick={() => navigate('/')}
                    className="w-full h-12 border border-[#b8935f] bg-transparent text-[#6f5433] font-serif text-xs font-semibold tracking-widest uppercase rounded-xl transition-all duration-300 flex items-center justify-center hover:bg-[#b8935f] hover:text-white cursor-pointer"
                  >
                    <ArrowLeft size={14} className="mr-2" />
                    Tiếp tục mua sắm
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}