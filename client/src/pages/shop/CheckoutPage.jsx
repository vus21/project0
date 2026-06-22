import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom'; 
import { useAuth } from '../../context/AuthContext';
import { addressApi } from '../../api/addressApi';
import { orderApi } from '../../api/orderApi';
import { cartApi } from '../../api/cartApi.js';
import { voucherApi } from '../../api/voucherApi'; // ◄ 1. THÊM IMPORT VOUCHER API
import { paymentApi } from '../../api/paymentApi';
import { ArrowLeft, MapPin, CreditCard, Ticket, NotepadText, ShieldCheck } from 'lucide-react';

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // --- States Quản lý dữ liệu ---
  const [cartItems, setCartItems] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Form tạo địa chỉ mới (Nếu chưa có địa chỉ nào)
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: '',
    phone: '',
    city: '',
    ward: '',
    detail: ''
  });

  // Không gian xử lý Voucher
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [voucherError, setVoucherError] = useState('');

  // Ghi chú đơn hàng & Phương thức thanh toán
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD'); 
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Fetch Dữ liệu ban đầu từ API ---
  useEffect(() => {
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để tiến hành thanh toán.');
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const cartRes = await cartApi.getCart();
        const items = cartRes.data?.items || cartRes.data?.data?.items || [];
        setCartItems(items);

        const addressRes = await addressApi.getMyAddresses();
        const addrList = addressRes.data?.data || addressRes.data || [];
        setAddresses(addrList);

        if (addrList.length > 0) {
          const defaultAddr = addrList.find(a => a.isDefault);
          setSelectedAddressId(defaultAddr ? defaultAddr._id : addrList[0]._id);
        } else {
          setShowAddressForm(true);
        }
      } catch (error) {
        console.error('Lỗi khi tải thông tin thanh toán:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, navigate]);

  const handleUpdateQuantity = async (item, newQty) => {
    if (newQty < 1) return;
    const matchedVariant = item.product?.variants?.find(v => v.sku === item.sku);
    const availableStock = matchedVariant ? matchedVariant.stock : (item.product?.totalStock || 99);

    if (newQty > availableStock) {
      alert(`Sản phẩm này trong kho hiện tại chỉ còn tối đa ${availableStock} sản phẩm.`);
      return;
    }

    try {
      await cartApi.updateItem({
        productId: item.product?._id || item.product,
        sku: item.sku,
        quantity: newQty
      });
      setCartItems(prev => prev.map(i => i.sku === item.sku ? { ...i, quantity: newQty } : i));
      
      // Hủy voucher đã áp dụng nếu số lượng thay đổi để ép user áp dụng lại (tránh lỗi tổng tiền tối thiểu)
      if (appliedVoucher) {
        setAppliedVoucher(null);
        setVoucherCode('');
        setVoucherError('Giỏ hàng đã thay đổi, vui lòng áp dụng lại mã voucher nếu có.');
      }
    } catch (error) {
      alert('Không thể cập nhật số lượng sản phẩm. Vui lòng thử lại.');
    }
  };

  const handleRemoveItem = async (product, sku) => {
    if (!window.confirm('Bạn có chắc muốn bỏ sản phẩm này khỏi đơn hàng?')) return;
    try {
      const productId = product?._id || product;
      await cartApi.removeItem({ productId, sku });
      setCartItems(prev => prev.filter(i => i.sku !== sku));
      
      if (appliedVoucher) {
        setAppliedVoucher(null);
        setVoucherCode('');
      }
    } catch (error) {
      alert('Lỗi khi xóa sản phẩm.');
    }
  };

  const handleCreateAddress = async (e) => {
    e.preventDefault();
    if (!newAddress.fullName || !newAddress.phone || !newAddress.city || !newAddress.ward || !newAddress.detail) {
      alert('Vui lòng điền đầy đủ thông tin địa chỉ.');
      return;
    }
    try {
      const res = await addressApi.create(newAddress);
      const createdAddr = res.data?.data || res.data;
      setAddresses(prev => [...prev, createdAddr]);
      setSelectedAddressId(createdAddr._id);
      setShowAddressForm(false);
      setNewAddress({ fullName: '', phone: '', city: '', ward: '', detail: '' });
    } catch (error) {
      alert('Không thể thêm địa chỉ mới.');
    }
  };

  // --- 2. THAY ĐỔI LOGIC ÁP DỤNG VOUCHER QUA API BIẾN ĐỘNG ---
  const handleApplyVoucher = async (e) => {
    e.preventDefault();
    setVoucherError('');

    if (!voucherCode.trim()) {
      setVoucherError('Vui lòng nhập mã ưu đãi');
      return;
    }

    try {
      // Gọi API applyVoucher lên backend
      const res = await voucherApi.applyVoucher({
        code: voucherCode.trim(),
        orderAmount: itemPrice
      });
      
      // Lấy data voucher từ phản hồi thành công của API
      const voucherData = res.data?.voucher || res.data;
      // Lưu thông tin voucher vào state
      setAppliedVoucher(voucherData);
    } catch (error) {
      console.error('Lỗi áp dụng mã voucher:', error);
      const msgError = error.response?.data?.message || 'Mã giảm giá không hợp lệ hoặc đã hết hạn.';
      setVoucherError(msgError);
      setAppliedVoucher(null);
    }
  };

  // --- 3. ĐỊNH NGHĨA PHƯƠNG THỨC TÍNH TOÁN THEO CẤU TRÚC BACKEND ---
  const itemPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingPrice = itemPrice > 500000 ? 0 : 30000;

  // Tính toán số tiền được giảm theo logic schema của Backend: FIXED hoặc PERCENT
  const getDiscountAmount = () => {
    if (!appliedVoucher) return 0;
    
    const { discountType, discountValue, maxDiscount } = appliedVoucher;
    
    if (discountType === 'FIXED') {
      return Math.min(discountValue, itemPrice);
    } 
    
    if (discountType === 'PERCENT') {
      const calculatedDiscount = (itemPrice * discountValue) / 100;
      return maxDiscount ? Math.min(calculatedDiscount, maxDiscount) : calculatedDiscount;
    }
    
    return 0;
  };

  const discountPrice = getDiscountAmount();
  const totalPrice = itemPrice + shippingPrice - discountPrice;

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      alert('Giỏ hàng trống. Vui lòng thêm sản phẩm trước khi thanh toán.');
      return;
    }

    const currentAddress = addresses.find(a => a._id === selectedAddressId);
    if (!currentAddress) {
      alert('Vui lòng chọn hoặc thêm địa chỉ nhận hàng.');
      return;
    }

    setIsSubmitting(true);

    const orderPayload = {
      orderItems: cartItems.map(item => ({
        product: item.product?._id || item.product,
        name: item.product?.name || 'Sản phẩm quý ông',
        sku: item.sku,
        image: item.product?.images?.[0]?.url || item.image,
        color: item.color,
        size: item.size,
        price: item.price,
        quantity: item.quantity
      })),
      shippingAddress: {
        fullName: currentAddress.fullName,
        phone: currentAddress.phone,
        city: currentAddress.city,
        ward: currentAddress.ward,
        detail: currentAddress.detail
      },
      note: note,
      paymentMethod: paymentMethod,
      // Gửi mã voucher và thông tin giảm giá đi kèm sang API Đặt hàng
      voucher: appliedVoucher ? {
        code: appliedVoucher.code,
        discountType: appliedVoucher.discountType,
        discountValue: appliedVoucher.discountValue
      } : undefined,
      itemPrice: itemPrice,
      shippingPrice: shippingPrice,
      discountPrice: discountPrice,
      totalPrice: totalPrice,
      voucherCode: appliedVoucher ? appliedVoucher.code : undefined
    };

    try {
      const res = await orderApi.placeOrder(orderPayload);
      const createdOrder = res.data || res;
      
      if (paymentMethod === 'PAYOS') {
        const linkRes = await paymentApi.createPaymentLink({
          orderId: createdOrder._id,
          amount: createdOrder.totalPrice
        });
        
        const checkoutUrl = linkRes.data?.checkoutUrl || linkRes.checkoutUrl;
        if (checkoutUrl) {
          window.location.href = checkoutUrl;
          return;
        } else {
          throw new Error('Không lấy được link thanh toán từ hệ thống PayOS.');
        }
      }

      alert('Đặt hàng thành công! Cảm ơn quý khách đã lựa chọn OLDMAN.');
      navigate('/profile', { state: { activeTab: 'orders' } });
    } catch (error) {
      console.error('Lỗi đặt hàng:', error);
      alert(error.message || 'Đặt hàng thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8f5ef] flex items-center justify-center font-serif text-center px-4">
        <p className="text-[#7b6753] tracking-[0.1em] text-xs uppercase font-medium animate-pulse">
          Đang tải thông tin thanh toán...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f5ef] font-serif text-[#5e4a36] pb-24 selection:bg-[#b8935f]/10">
      
      {/* Header Điều Hướng Breadcrumb */}
      <div className="py-6">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 text-[11px] tracking-widest uppercase text-[#7b6753] flex items-center gap-2">
          <Link to="/" className="hover:text-[#b8935f] transition-colors">Cửa hàng</Link>
          <span>/</span>
          <span className="text-[#1f1a14] font-medium">Thanh toán</span>
        </div>
      </div>

      {/* Grid Bố Cục Trang */}
      <div className="max-w-6xl mx-auto px-6 sm:px-8 mt-2 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

        {/* KHỐI TRÁI (7 cột): Địa chỉ & Phương thức thanh toán */}
        <div className="lg:col-span-7 flex flex-col gap-6">

          {/* Section 1: Thông tin giao hàng */}
          <div className="bg-white border border-[#e7dccb] rounded-2xl p-6 sm:p-8 shadow-sm">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-normal text-[#1f1a14] tracking-wide flex items-center gap-2">
                <MapPin size={18} className="text-[#b8935f]" /> Thông tin nhận hàng
              </h2>
              <button
                onClick={() => setShowAddressForm(!showAddressForm)}
                className="bg-transparent border-none text-[#b8935f] hover:text-[#a57f4c] cursor-pointer text-xs font-sans underline transition-colors"
              >
                {showAddressForm ? 'Chọn địa chỉ có sẵn' : '+ Thêm địa chỉ mới'}
              </button>
            </div>

            {/* Render Danh sách địa chỉ có sẵn từ DB */}
            {!showAddressForm && (
              <div className="flex flex-col gap-3">
                {addresses.length === 0 ? (
                  <p className="text-sm text-[#7b6753] font-sans italic">Bạn chưa có địa chỉ lưu trữ nào. Vui lòng tạo mới.</p>
                ) : (
                  addresses.map(addr => (
                    <div
                      key={addr._id}
                      className={`border rounded-xl p-4 bg-white cursor-pointer transition-all relative ${
                        selectedAddressId === addr._id 
                          ? 'border-[#b8935f] bg-[#f5efe6]/40 shadow-sm' 
                          : 'border-[#e7dccb] hover:border-[#b8935f]'
                      }`}
                      onClick={() => setSelectedAddressId(addr._id)}
                    >
                      <div className="flex justify-between items-baseline mb-1.5">
                        <span className="font-semibold text-[#1f1a14] font-sans text-sm">{addr.fullName}</span>
                        <span className="text-[#7b6753] font-sans text-xs">{addr.phone}</span>
                      </div>
                      <div className="text-xs text-[#5e4a36] font-sans leading-relaxed pr-20">
                        {addr.detail}, {addr.ward}, {addr.city}
                      </div>
                      {addr.isDefault && (
                        <span className="absolute right-4 bottom-4 text-[9px] bg-[#b8935f] text-white px-2 py-0.5 rounded tracking-wide uppercase font-sans font-medium">
                          Mặc định
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Form tạo địa chỉ mới */}
            {showAddressForm && (
              <form onSubmit={handleCreateAddress} className="flex flex-col gap-4 font-sans text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text" 
                    placeholder="Họ và tên người nhận" 
                    className="w-full px-4 py-3 border border-[#e7dccb] bg-white rounded-lg text-[#1f1a14] placeholder-gray-400 outline-none focus:border-[#b8935f] transition-colors"
                    value={newAddress.fullName} 
                    onChange={e => setNewAddress({ ...newAddress, fullName: e.target.value })}
                  />
                  <input
                    type="text" 
                    placeholder="Số điện thoại liên hệ" 
                    className="w-full px-4 py-3 border border-[#e7dccb] bg-white rounded-lg text-[#1f1a14] placeholder-gray-400 outline-none focus:border-[#b8935f] transition-colors"
                    value={newAddress.phone} 
                    onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text" 
                    placeholder="Tỉnh / Thành phố" 
                    className="w-full px-4 py-3 border border-[#e7dccb] bg-white rounded-lg text-[#1f1a14] placeholder-gray-400 outline-none focus:border-[#b8935f] transition-colors"
                    value={newAddress.city} 
                    onChange={e => setNewAddress({ ...newAddress, city: e.target.value })}
                  />
                  <input
                    type="text" 
                    placeholder="Xã / Phường" 
                    className="w-full px-4 py-3 border border-[#e7dccb] bg-white rounded-lg text-[#1f1a14] placeholder-gray-400 outline-none focus:border-[#b8935f] transition-colors"
                    value={newAddress.ward} 
                    onChange={e => setNewAddress({ ...newAddress, ward: e.target.value })}
                  />
                </div>

                <input
                  type="text" 
                  placeholder="Số nhà, tên đường, tòa nhà cụ thể" 
                  className="w-full px-4 py-3 border border-[#e7dccb] bg-white rounded-lg text-[#1f1a14] placeholder-gray-400 outline-none focus:border-[#b8935f] transition-colors"
                  value={newAddress.detail} 
                  onChange={e => setNewAddress({ ...newAddress, detail: e.target.value })}
                />

                <div className="flex gap-3 justify-end mt-2 font-serif text-xs">
                  {addresses.length > 0 && (
                    <button
                      type="button" 
                      onClick={() => setShowAddressForm(false)}
                      className="px-5 h-10 border border-[#e7dccb] bg-transparent text-[#7b6753] rounded-lg cursor-pointer transition-colors hover:border-gray-400"
                    >
                      Hủy bỏ
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-5 h-10 bg-[#b8935f] text-white border-none font-semibold rounded-lg cursor-pointer transition-all hover:bg-[#a57f4c]"
                  >
                    Lưu địa chỉ nhận hàng
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Section 2: Phương thức thanh toán */}
          <div className="bg-white border border-[#e7dccb] rounded-2xl p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-normal text-[#1f1a14] mb-5 tracking-wide flex items-center gap-2">
              <CreditCard size={18} className="text-[#b8935f]" /> Phương thức thanh toán
            </h2>
            <div className="flex flex-col gap-3 font-sans">
              
              <label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${
                paymentMethod === 'COD' ? 'bg-[#f5efe6]/40 border-[#b8935f]' : 'border-[#e7dccb] bg-transparent'
              }`}>
                <input 
                  type="radio" 
                  name="payMethod" 
                  value="COD" 
                  checked={paymentMethod === 'COD'} 
                  onChange={() => setPaymentMethod('COD')} 
                  className="accent-[#b8935f] w-4 h-4" 
                />
                <div>
                  <div className="font-semibold text-sm text-[#1f1a14]">Thanh toán khi nhận hàng (COD)</div>
                  <div className="text-xs text-[#7b6753] mt-0.5">Thanh toán bằng tiền mặt khi shipper giao hàng tận nơi.</div>
                </div>
              </label>

              <label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${
                paymentMethod === 'PAYOS' ? 'bg-[#f5efe6]/40 border-[#b8935f]' : 'border-[#e7dccb] bg-transparent'
              }`}>
                <input 
                  type="radio" 
                  name="payMethod" 
                  value="PAYOS" 
                  checked={paymentMethod === 'PAYOS'} 
                  onChange={() => setPaymentMethod('PAYOS')} 
                  className="accent-[#b8935f] w-4 h-4" 
                />
                <div>
                  <div className="font-semibold text-sm text-[#1f1a14]">Thanh toán qua PayOS (ATM/Visa/Mastercard/QR)</div>
                  <div className="text-xs text-[#7b6753] mt-0.5">Hệ thống thanh toán nhanh, an toàn và bảo mật cao thông qua cổng PayOS.</div>
                </div>
              </label>
            </div>
          </div>

          {/* Section 3: Ghi chú */}
          <div className="bg-white border border-[#e7dccb] rounded-2xl p-6 sm:p-8 shadow-sm">
            <h2 className="text-lg font-normal text-[#1f1a14] mb-3.5 tracking-wide flex items-center gap-2">
              <NotepadText size={18} className="text-[#b8935f]" /> Ghi chú đơn hàng
            </h2>
            <textarea
              rows="3" 
              placeholder="Lưu ý đặc biệt về thời gian giao hàng, chỉ dẫn vị trí nhận hàng..." 
              className="w-full px-4 py-3 border border-[#e7dccb] bg-white rounded-lg text-[#1f1a14] placeholder-gray-400 font-sans text-sm outline-none focus:border-[#b8935f] transition-colors resize-none"
              value={note} 
              onChange={e => setNote(e.target.value)}
            />
          </div>
        </div>

        {/* KHỐI PHẢI (5 cột): Tóm tắt đơn hàng */}
        <div className="lg:col-span-5 w-full lg:sticky lg:top-6">
          <div className="bg-white border border-[#e7dccb] rounded-2xl p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-normal text-[#1f1a14] mb-5 pb-4 border-b border-[#e7dccb] tracking-wide">
              Tóm tắt đơn hàng
            </h2>

            {/* Danh sách Item hiển thị thu gọn */}
            <div className="flex flex-col gap-5 max-h-[280px] overflow-y-auto mb-6 pr-1 scrollbar-thin">
              {cartItems.length === 0 ? (
                <p className="text-sm text-[#7b6753] font-sans italic">Chưa có sản phẩm nào trong đơn hàng.</p>
              ) : (
                cartItems.map(item => (
                  <div key={item.sku} className="flex gap-3.5 items-center">
                    {/* Thumbnail sản phẩm */}
                    <div className="w-16 h-20 rounded-lg overflow-hidden border border-[#e7dccb] flex-shrink-0 bg-[#f8f5ef]">
                      <img 
                        src={item.product?.images?.[0]?.url || item.image || 'https://via.placeholder.com/60x80'} 
                        alt={item.product?.name} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    {/* Thông tin & Tăng giảm số lượng nhanh */}
                    <div className="flex-1 min-w-0">
                      <h4 className="margin-0 text-sm font-medium text-[#1f1a14] font-sans truncate capitalize">
                        {item.product?.name || 'Sản phẩm'}
                      </h4>
                      <p className="text-[11px] text-[#7b6753] font-sans mt-0.5 mb-1.5">
                        Phân loại: {item.color} / {item.size}
                      </p>

                      <div className="flex items-center gap-2">
                        <button 
                          type="button" 
                          onClick={() => handleUpdateQuantity(item, item.quantity - 1)}
                          className="w-6 h-6 border border-[#e7dccb] bg-white rounded flex items-center justify-center font-sans text-xs text-[#1f1a14] hover:border-[#b8935f] hover:text-[#b8935f] transition-colors cursor-pointer shadow-sm"
                        >-</button>
                        <span className="text-xs font-semibold text-[#1f1a14] font-sans w-5 text-center">{item.quantity}</span>
                        <button 
                          type="button" 
                          onClick={() => handleUpdateQuantity(item, item.quantity + 1)}
                          className="w-6 h-6 border border-[#e7dccb] bg-white rounded flex items-center justify-center font-sans text-xs text-[#1f1a14] hover:border-[#b8935f] hover:text-[#b8935f] transition-colors cursor-pointer shadow-sm"
                        >+</button>
                      </div>
                    </div>
                    {/* Thành tiền item & Nút xóa bỏ áo */}
                    <div className="text-right flex-shrink-0 pl-1">
                      <div className="text-sm font-medium text-[#b8935f]">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.product, item.sku)}
                        className="bg-transparent border-none text-[#7b6753] hover:text-red-500 text-[11px] cursor-pointer mt-1.5 underline font-sans block ml-auto transition-colors"
                      >
                        Bỏ chọn
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Mã Voucher ưu đãi */}
            <form onSubmit={handleApplyVoucher} className="mb-6 pt-2 border-t border-dashed border-[#e7dccb]">
              <span className="text-[11px] tracking-widest uppercase text-[#7b6753] block mb-2 flex items-center gap-1">
                <Ticket size={12} /> Mã giảm giá / Voucher:
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ví dụ: QUYONG2026"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value)}
                  className="flex-1 px-3 py-2 border border-[#e7dccb] rounded-lg text-sm font-sans outline-none uppercase tracking-wider focus:border-[#b8935f]"
                />
                <button
                  type="submit"
                  className="px-4 bg-[#b8935f] text-white text-xs tracking-wider uppercase font-semibold rounded-lg hover:bg-[#a57f4c] transition-colors cursor-pointer"
                >
                  Áp dụng
                </button>
              </div>
              {voucherError && <p className="text-xs text-red-500 font-sans mt-1.5">{voucherError}</p>}
              {appliedVoucher && (
                <p className="text-xs text-emerald-600 font-sans mt-1.5 flex items-center gap-1 font-medium">
                  <ShieldCheck size={14} /> Đã kích hoạt mã ưu đãi {appliedVoucher.code} ({appliedVoucher.discountType === 'PERCENT' ? `-${appliedVoucher.discountValue}%` : `-${formatPrice(appliedVoucher.discountValue)}`})
                </p>
              )}
            </form>

            {/* Khối hiển thị chi tiết tài chính tổng quan */}
            <div className="flex flex-col gap-3 mb-6 font-sans text-sm border-t border-[#e7dccb] pt-4">
              <div className="flex justify-between">
                <span className="text-[#7b6753]">Tạm tính sản phẩm</span>
                <span className="text-[#1f1a14] font-medium">{formatPrice(itemPrice)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#7b6753]">Phí vận chuyển toàn quốc</span>
                <span className="text-[#1f1a14] font-medium">
                  {shippingPrice === 0 ? 'Miễn phí (Đơn trên 500k)' : formatPrice(shippingPrice)}
                </span>
              </div>

              {discountPrice > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Giảm giá ưu đãi Voucher</span>
                  <span className="font-medium">-{formatPrice(discountPrice)}</span>
                </div>
              )}

              <hr className="border-none border-t border-[#e7dccb] my-2" />

              <div className="flex justify-between items-baseline">
                <span className="text-base text-[#1f1a14] font-medium">Tổng thanh toán chốt</span>
                <span className="text-2xl font-serif text-[#b8935f] font-semibold tracking-wide">
                  {formatPrice(totalPrice)}
                </span>
              </div>
            </div>

            {/* Nút hành động chốt đơn */}
            <div className="flex flex-col gap-3">
              <button
                onClick={handlePlaceOrder}
                disabled={isSubmitting || cartItems.length === 0 || !selectedAddressId}
                className="w-full h-12 border-none bg-[#b8935f] text-white font-serif text-xs font-semibold tracking-widest uppercase rounded-xl transition-all duration-300 shadow-md shadow-[#b8935f]/15 flex items-center justify-center cursor-pointer enabled:hover:bg-[#a57f4c] enabled:hover:-translate-y-0.5 disabled:bg-[#e7dccb] disabled:text-[#7b6753] disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'ĐANG XỬ LÝ ĐƠN HÀNG...' : 'XÁC NHẬN ĐẶT HÀNG NGAY'}
              </button>
              
              <Link 
                to="/cart" 
                className="w-full h-12 border border-[#e7dccb] bg-transparent text-[#7b6753] font-serif text-xs font-semibold tracking-widest uppercase rounded-xl flex items-center justify-center hover:border-gray-400 hover:text-[#1f1a14] transition-colors"
              >
                <ArrowLeft size={14} className="mr-2" /> Quay lại giỏ hàng
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}